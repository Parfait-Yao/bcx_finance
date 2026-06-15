import { Injectable } from '@nestjs/common';

// Transaction simplifiée utilisée par le moteur de scoring
export interface TransactionPourScoring {
  type: 'recette' | 'depense';
  montant: number;
  dateTransaction: Date;
}

export interface DonneesScoring {
  /** Transactions du mois en cours (mois évalué) */
  transactionsMois: TransactionPourScoring[];
  /** Total des recettes pour chacun des 3 derniers mois (du plus ancien au plus récent) */
  recettesMoisPrecedents: number[];
  /** Date de création du compte utilisateur */
  dateCreationCompte: Date;
  /** Mois et année évalués */
  mois: number;
  annee: number;
}

export interface DetailScore {
  regularite: number;
  soldePositif: number;
  stabiliteRevenus: number;
  anciennete: number;
  total: number;
}

/**
 * Service dédié au calcul du Score BCX (0-100).
 * Logique isolée et testable indépendamment du reste de l'application.
 */
@Injectable()
export class ScoringService {
  /**
   * Calcule le score global et le détail par critère.
   */
  calculerScore(donnees: DonneesScoring): DetailScore {
    const regularite = this.calculerRegulariteSaisies(donnees.transactionsMois, donnees.mois, donnees.annee);
    const soldePositif = this.calculerSoldePositif(donnees.transactionsMois);
    const stabiliteRevenus = this.calculerStabiliteRevenus(donnees.recettesMoisPrecedents);
    const anciennete = this.calculerAnciennete(donnees.dateCreationCompte, donnees.mois, donnees.annee);

    const total = Math.round(regularite + soldePositif + stabiliteRevenus + anciennete);

    return {
      regularite: Math.round(regularite),
      soldePositif: Math.round(soldePositif),
      stabiliteRevenus: Math.round(stabiliteRevenus),
      anciennete: Math.round(anciennete),
      total: Math.min(100, Math.max(0, total)),
    };
  }

  /**
   * Critère 1 — Régularité des saisies (30 pts)
   * Formule : (jours avec au moins une transaction / jours du mois) × 30
   */
  calculerRegulariteSaisies(transactions: TransactionPourScoring[], mois: number, annee: number): number {
    const joursDansLeMois = new Date(annee, mois, 0).getDate();
    const joursAvecSaisie = new Set(
      transactions.map((t) => new Date(t.dateTransaction).getDate()),
    ).size;

    return (joursAvecSaisie / joursDansLeMois) * 30;
  }

  /**
   * Critère 2 — Solde net positif (30 pts)
   * Si solde_net > 0 : points proportionnels au ratio solde/recettes.
   * Si solde_net <= 0 : 0 point.
   */
  calculerSoldePositif(transactions: TransactionPourScoring[]): number {
    let totalRecettes = 0;
    let totalDepenses = 0;
    for (const t of transactions) {
      if (t.type === 'recette') totalRecettes += t.montant;
      else totalDepenses += t.montant;
    }

    const soldeNet = totalRecettes - totalDepenses;
    if (soldeNet <= 0 || totalRecettes <= 0) return 0;

    // Ratio borné à 1 (un solde >= recettes donne le maximum de points)
    const ratio = Math.min(soldeNet / totalRecettes, 1);
    return ratio * 30;
  }

  /**
   * Critère 3 — Stabilité des revenus (25 pts)
   * Compare l'écart-type des recettes des 3 derniers mois :
   * moins de variation (coefficient de variation faible) = plus de points.
   */
  calculerStabiliteRevenus(recettesMoisPrecedents: number[]): number {
    const valeurs = recettesMoisPrecedents.filter((v) => v > 0);

    // Aucun historique de recettes (compte tout juste créé, encore aucune
    // transaction) : pas de bonus neutre, le score doit refléter une
    // activité réelle, pas une supposition.
    if (valeurs.length === 0) return 0;

    // Un seul mois de recettes : pas assez pour calculer un écart-type,
    // mais on a au moins une donnée réelle => score neutre (moitié).
    if (valeurs.length < 2) return 12.5;

    const moyenne = valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
    if (moyenne === 0) return 0;

    const variance =
      valeurs.reduce((acc, v) => acc + Math.pow(v - moyenne, 2), 0) / valeurs.length;
    const ecartType = Math.sqrt(variance);

    // Coefficient de variation (CV) : écart-type relatif à la moyenne
    const coefficientVariation = ecartType / moyenne;

    // CV faible (revenus stables) => proche de 25 pts ; CV élevé => proche de 0
    const score = 25 * Math.max(0, 1 - coefficientVariation);
    return Math.min(25, score);
  }

  /**
   * Critère 4 — Ancienneté du compte (15 pts)
   * Proportionnel au nombre de mois d'utilisation, plafonné à 6 mois.
   */
  calculerAnciennete(dateCreationCompte: Date, mois: number, annee: number): number {
    const dateEvaluation = new Date(annee, mois - 1, 1);
    const dateCreation = new Date(dateCreationCompte);

    const moisEcoules =
      (dateEvaluation.getFullYear() - dateCreation.getFullYear()) * 12 +
      (dateEvaluation.getMonth() - dateCreation.getMonth()) +
      1; // +1 pour compter le mois en cours

    const moisPlafond = 6;
    const moisValides = Math.min(Math.max(moisEcoules, 0), moisPlafond);

    return (moisValides / moisPlafond) * 15;
  }
}
