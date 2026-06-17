import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService, TransactionPourScoring } from '../scoring/scoring.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private scoringService: ScoringService,
  ) {}

  // Profil utilisateur (sans le mot de passe)
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nom: true,
        telephone: true,
        email: true,
        entreprise: true,
        ville: true,
        pays: true,
        scoreBcx: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  /**
   * Endpoint dashboard allégé (< 3 Ko) :
   * solde, recettes/dépenses du mois, score BCX calculé en temps réel,
   * 5 dernières transactions.
   *
   * Le score n'est plus lu depuis la colonne `scoreBcx` (qui n'est mise à
   * jour qu'à la génération d'un rapport mensuel) : il est recalculé à
   * chaque appel via ScoringService, à partir des transactions réelles du
   * mois en cours et des 3 mois précédents. Ainsi le score affiché reflète
   * toujours l'activité actuelle, sans attendre la génération d'un rapport.
   */
  async getDashboard(userId: string) {
    const now = new Date();
    const mois = now.getMonth() + 1;
    const annee = now.getFullYear();
    const debutMois = new Date(annee, mois - 1, 1);
    const finMois = new Date(annee, mois, 0);

    const [user, transactionsMois, dernieresTransactions, recettesMoisPrecedents] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true, nom: true, entreprise: true },
      }),
      this.prisma.transaction.findMany({
        where: { userId, dateTransaction: { gte: debutMois, lte: finMois } },
        select: { type: true, montant: true, dateTransaction: true },
      }),
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { dateTransaction: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          montant: true,
          description: true,
          dateTransaction: true,
          categorie: { select: { nom: true, emoji: true } },
        },
      }),
      this.recettesDes3MoisPrecedents(userId, mois, annee),
    ]);

    if (!user) throw new NotFoundException('Utilisateur introuvable');

    let totalRecettes = 0;
    let totalDepenses = 0;
    for (const t of transactionsMois) {
      const montant = Number(t.montant);
      if (t.type === 'recette') totalRecettes += montant;
      else totalDepenses += montant;
    }

    const transactionsScoring: TransactionPourScoring[] = transactionsMois.map((t) => ({
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

    return {
      nom: user.nom,
      entreprise: user.entreprise,
      solde: totalRecettes - totalDepenses,
      recettesMois: totalRecettes,
      depensesMois: totalDepenses,
      scoreBcx: score.total,
      dernieresTransactions,
    };
  }

  /**
   * Recettes totales pour chacun des 3 mois précédant (mois, annee),
   * du plus ancien au plus récent. Utilisé par le calcul du score
   * (critère de stabilité des revenus).
   */
  private async recettesDes3MoisPrecedents(userId: string, mois: number, annee: number): Promise<number[]> {
    const recettes: number[] = [];

    for (let i = 3; i >= 1; i--) {
      let m = mois - i;
      let a = annee;
      if (m <= 0) {
        m += 12;
        a -= 1;
      }
      const debut = new Date(a, m - 1, 1);
      const fin = new Date(a, m, 0);

      const total = await this.prisma.transaction.aggregate({
        where: { userId, type: 'recette', dateTransaction: { gte: debut, lte: fin } },
        _sum: { montant: true },
      });

      recettes.push(Number(total._sum.montant ?? 0));
    }

    return recettes;
  }
}
