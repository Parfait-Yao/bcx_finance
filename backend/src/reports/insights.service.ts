import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

interface ContexteInsights {
  reportId: string;
  userId: string;
  joursSaisie: number;
  joursDansLeMois: number;
  totalRecettes: number;
  totalDepenses: number;
  soldeNet: number;
  // Dépenses du mois groupées par catégorie : [{ nom, montant }]
  depensesParCategorie: { nom: string; montant: number }[];
  // Moyenne des dépenses par catégorie sur les 3 derniers mois : { nomCategorie: moyenne }
  moyennesDepensesParCategorie: Record<string, number>;
  scoreActuel: number;
  scorePrecedent: number | null;
}

/**
 * Service d'alertes automatiques (IA simple basée sur des règles).
 * Génère les `report_insights` et `notifications` après chaque calcul de rapport.
 */
@Injectable()
export class InsightsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async genererInsightsEtNotifications(ctx: ContexteInsights) {
    const insights: { type: string; niveau: 'bon' | 'attention' | 'critique'; message: string }[] = [];

    // Règle 1 : régularité des saisies insuffisante (< 20 jours)
    if (ctx.joursSaisie < 20) {
      insights.push({
        type: 'regularite',
        niveau: 'attention',
        message: `Vous avez saisi des transactions sur seulement ${ctx.joursSaisie} jour(s) ce mois-ci. Une saisie quotidienne améliore votre Score BCX.`,
      });
    } else {
      insights.push({
        type: 'regularite',
        niveau: 'bon',
        message: `Bonne régularité : ${ctx.joursSaisie} jour(s) de saisie sur ${ctx.joursDansLeMois}.`,
      });
    }

    // Règle 2 : une catégorie de dépense représente plus de 35% du total
    if (ctx.totalDepenses > 0) {
      for (const cat of ctx.depensesParCategorie) {
        const pourcentage = (cat.montant / ctx.totalDepenses) * 100;
        if (pourcentage > 35) {
          insights.push({
            type: 'tresorerie',
            niveau: 'attention',
            message: `La catégorie "${cat.nom}" représente ${pourcentage.toFixed(1)}% de vos dépenses totales ce mois-ci.`,
          });
        }
      }
    }

    // Limite à 3 insights pour le rapport (le plus pertinent prime)
    const insightsFinaux = insights.slice(0, 3);

    // Enregistrement des insights en base
    if (insightsFinaux.length > 0) {
      await this.prisma.reportInsight.createMany({
        data: insightsFinaux.map((i) => ({
          reportId: ctx.reportId,
          type: i.type,
          niveau: i.niveau,
          message: i.message,
        })),
      });
    }

    // --- Notifications (alertes séparées des insights du rapport) ---

    // Règle 3 : solde net couvre moins de 15 jours de dépenses moyennes
    const depenseMoyenneJournaliere = ctx.totalDepenses / ctx.joursDansLeMois;
    if (depenseMoyenneJournaliere > 0) {
      const joursCouverts = ctx.soldeNet / depenseMoyenneJournaliere;
      if (joursCouverts < 15) {
        await this.notificationsService.create(
          ctx.userId,
          'tresorerie_faible',
          `Votre trésorerie ne couvre que ${Math.max(0, Math.floor(joursCouverts))} jour(s) de dépenses moyennes. Pensez à reconstituer votre solde.`,
        );
      }
    }

    // Règle 4 : une dépense de catégorie dépasse de 40% sa moyenne sur 3 mois
    for (const cat of ctx.depensesParCategorie) {
      const moyenne = ctx.moyennesDepensesParCategorie[cat.nom];
      if (moyenne && moyenne > 0 && cat.montant > moyenne * 1.4) {
        const hausse = (((cat.montant - moyenne) / moyenne) * 100).toFixed(0);
        await this.notificationsService.create(
          ctx.userId,
          'depense_anormale',
          `Vos dépenses en "${cat.nom}" (${cat.montant.toFixed(0)} F CFA) dépassent de ${hausse}% votre moyenne habituelle.`,
        );
      }
    }

    // Règle 5 : le score augmente par rapport au mois précédent
    if (ctx.scorePrecedent !== null && ctx.scoreActuel > ctx.scorePrecedent) {
      await this.notificationsService.create(
        ctx.userId,
        'score_hausse',
        `Votre Score BCX est passé de ${ctx.scorePrecedent} à ${ctx.scoreActuel} points. Continuez ainsi !`,
      );
    }

    return insightsFinaux;
  }
}
