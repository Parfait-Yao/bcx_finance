import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService, TransactionPourScoring } from '../scoring/scoring.service';
import { InsightsService } from './insights.service';
import { AiAdviceService } from './ai-advice.service';
import { PdfService } from './pdf.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private scoringService: ScoringService,
    private insightsService: InsightsService,
    private aiAdviceService: AiAdviceService,
    private pdfService: PdfService,
  ) {}

  /**
   * Génère ou retourne (depuis le cache) le rapport mensuel d'un utilisateur.
   * Cache 24h : un rapport déjà généré pour ce mois n'est recalculé que si
   * `forceRecalcul` est vrai ou si le rapport a plus de 24h.
   */
  async getOrGenerate(userId: string, mois: number, annee: number) {
    const rapportExistant = await this.prisma.report.findUnique({
      where: { userId_mois_annee: { userId, mois, annee } },
      include: { insights: true },
    });

    const ageMs = rapportExistant
      ? Date.now() - rapportExistant.createdAt.getTime()
      : Infinity;
    const CACHE_24H = 24 * 60 * 60 * 1000;

    if (rapportExistant && ageMs < CACHE_24H) {
      return rapportExistant;
    }

    return this.genererRapport(userId, mois, annee, rapportExistant?.id);
  }

  /**
   * Recalcule immédiatement le rapport d'un mois donné (sans tenir compte
   * du cache 24h). Utilisé lorsqu'une transaction de ce mois est créée,
   * modifiée ou supprimée, afin que le rapport et les alertes restent à jour.
   */
  async recalculer(userId: string, mois: number, annee: number) {
    const rapportExistant = await this.prisma.report.findUnique({
      where: { userId_mois_annee: { userId, mois, annee } },
    });
    return this.genererRapport(userId, mois, annee, rapportExistant?.id);
  }

  // Calcule entièrement le rapport (transactions, score, insights, notifications)
  private async genererRapport(
    userId: string,
    mois: number,
    annee: number,
    reportIdExistant?: string,
  ) {
    const debutMois = new Date(annee, mois - 1, 1);
    const finMois = new Date(annee, mois, 0);

    const [user, transactions] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.transaction.findMany({
        where: { userId, dateTransaction: { gte: debutMois, lte: finMois } },
        include: { categorie: true },
      }),
    ]);
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    let totalRecettes = 0;
    let totalDepenses = 0;
    const depensesParCategorieMap = new Map<string, number>();
    const joursAvecSaisie = new Set<number>();

    for (const t of transactions) {
      const montant = Number(t.montant);
      const jour = new Date(t.dateTransaction).getDate();
      joursAvecSaisie.add(jour);

      if (t.type === 'recette') {
        totalRecettes += montant;
      } else {
        totalDepenses += montant;
        const nomCat = t.categorie?.nom || 'Autre';
        depensesParCategorieMap.set(nomCat, (depensesParCategorieMap.get(nomCat) || 0) + montant);
      }
    }
    const soldeNet = totalRecettes - totalDepenses;
    const joursSaisie = joursAvecSaisie.size;

    // Récupération des 3 derniers mois pour la stabilité des revenus et les moyennes de dépenses
    const { recettesMoisPrecedents, moyennesDepensesParCategorie } =
      await this.calculerHistorique3Mois(userId, mois, annee);

    const transactionsScoring: TransactionPourScoring[] = transactions.map((t) => ({
      type: t.type as 'recette' | 'depense',
      montant: Number(t.montant),
      dateTransaction: t.dateTransaction,
    }));

    const score = this.scoringService.calculerScore({
      transactionsMois: transactionsScoring,
      recettesMoisPrecedents,
      dateCreationCompte: user.createdAt,
      mois,
      annee,
    });

    // Récupère le score du mois précédent (pour détecter une hausse)
    const moisPrecedent = mois === 1 ? 12 : mois - 1;
    const anneePrecedente = mois === 1 ? annee - 1 : annee;
    const rapportPrecedent = await this.prisma.report.findUnique({
      where: { userId_mois_annee: { userId, mois: moisPrecedent, annee: anneePrecedente } },
    });

    // Création ou mise à jour du rapport (transaction pour cohérence)
    const report = await this.prisma.$transaction(async (tx) => {
      // Supprime les anciens insights si on régénère un rapport existant
      if (reportIdExistant) {
        await tx.reportInsight.deleteMany({ where: { reportId: reportIdExistant } });
      }

      const data = {
        userId,
        mois,
        annee,
        totalRecettes,
        totalDepenses,
        soldeNet,
        scoreBcx: score.total,
        joursSaisie,
      };

      if (reportIdExistant) {
        return tx.report.update({ where: { id: reportIdExistant }, data });
      }
      return tx.report.create({ data });
    });

    // Mise à jour du score BCX courant de l'utilisateur
    await this.prisma.user.update({ where: { id: userId }, data: { scoreBcx: score.total } });

    // Génération des insights et notifications automatiques
    const joursDansLeMois = new Date(annee, mois, 0).getDate();
    const depensesParCategorie = Array.from(depensesParCategorieMap.entries()).map(
      ([nom, montant]) => ({ nom, montant }),
    );

    await this.insightsService.genererInsightsEtNotifications({
      reportId: report.id,
      userId,
      joursSaisie,
      joursDansLeMois,
      totalRecettes,
      totalDepenses,
      soldeNet,
      depensesParCategorie,
      moyennesDepensesParCategorie,
      scoreActuel: score.total,
      scorePrecedent: rapportPrecedent ? rapportPrecedent.scoreBcx : null,
    });

    // Conseil/alerte IA contextuel basé sur l'évolution du score et la situation du mois
    await this.aiAdviceService.genererConseil({
      userId,
      mois,
      annee,
      scoreActuel: score.total,
      scorePrecedent: rapportPrecedent ? rapportPrecedent.scoreBcx : null,
      totalRecettes,
      totalDepenses,
      soldeNet,
      joursSaisie,
      joursDansLeMois,
    });

    return this.prisma.report.findUnique({
      where: { id: report.id },
      include: { insights: true },
    });
  }

  /**
   * Historique des 3 derniers mois (hors mois courant) :
   * - recettes totales par mois (pour la stabilité des revenus)
   * - moyenne des dépenses par catégorie (pour détecter une dépense anormale)
   */
  private async calculerHistorique3Mois(userId: string, mois: number, annee: number) {
    const recettesMoisPrecedents: number[] = [];
    const sommesDepensesParCategorie = new Map<string, number[]>();

    for (let i = 3; i >= 1; i--) {
      let m = mois - i;
      let a = annee;
      if (m <= 0) {
        m += 12;
        a -= 1;
      }
      const debut = new Date(a, m - 1, 1);
      const fin = new Date(a, m, 0);

      const transactions = await this.prisma.transaction.findMany({
        where: { userId, dateTransaction: { gte: debut, lte: fin } },
        include: { categorie: true },
      });

      let recettesMois = 0;
      const depensesCatMois = new Map<string, number>();
      for (const t of transactions) {
        const montant = Number(t.montant);
        if (t.type === 'recette') {
          recettesMois += montant;
        } else {
          const nomCat = t.categorie?.nom || 'Autre';
          depensesCatMois.set(nomCat, (depensesCatMois.get(nomCat) || 0) + montant);
        }
      }
      recettesMoisPrecedents.push(recettesMois);

      for (const [nom, montant] of depensesCatMois.entries()) {
        if (!sommesDepensesParCategorie.has(nom)) sommesDepensesParCategorie.set(nom, []);
        sommesDepensesParCategorie.get(nom)!.push(montant);
      }
    }

    const moyennesDepensesParCategorie: Record<string, number> = {};
    for (const [nom, valeurs] of sommesDepensesParCategorie.entries()) {
      moyennesDepensesParCategorie[nom] = valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
    }

    return { recettesMoisPrecedents, moyennesDepensesParCategorie };
  }

  // Génère (ou régénère) le fichier PDF du rapport et retourne son chemin absolu
  async genererPdf(reportId: string, userId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: { insights: true, user: true },
    });
    if (!report) throw new NotFoundException('Rapport introuvable');
    if (report.userId !== userId) throw new ForbiddenException('Accès interdit à ce rapport');

    const debutMois = new Date(report.annee, report.mois - 1, 1);
    const finMois = new Date(report.annee, report.mois, 0);

    const transactions = await this.prisma.transaction.findMany({
      where: { userId, dateTransaction: { gte: debutMois, lte: finMois } },
      include: { categorie: true },
      orderBy: { dateTransaction: 'asc' },
    });

    const cheminRelatif = await this.pdfService.genererPdfRapport(report.id, {
      user: {
        nom: report.user.nom,
        telephone: report.user.telephone,
        entreprise: report.user.entreprise,
        ville: report.user.ville,
      },
      mois: report.mois,
      annee: report.annee,
      totalRecettes: Number(report.totalRecettes),
      totalDepenses: Number(report.totalDepenses),
      soldeNet: Number(report.soldeNet),
      scoreBcx: report.scoreBcx,
      transactions: transactions.map((t) => ({
        date: new Date(t.dateTransaction).toLocaleDateString('fr-FR'),
        type: t.type as 'recette' | 'depense',
        categorie: t.categorie?.nom || 'Autre',
        description: t.description || '',
        montant: Number(t.montant),
      })),
      insights: report.insights.map((i) => ({ niveau: i.niveau, message: i.message })),
    });

    await this.prisma.report.update({ where: { id: report.id }, data: { fichierPdf: cheminRelatif } });

    return this.pdfService.cheminAbsoluDepuisRelatif(cheminRelatif);
  }
}
