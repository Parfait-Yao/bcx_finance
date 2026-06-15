import { ScoringService } from './scoring.service';

describe('ScoringService', () => {
  const scoring = new ScoringService();

  describe('calculerRegulariteSaisies', () => {
    it('retourne 30 si une transaction chaque jour du mois', () => {
      const annee = 2025;
      const mois = 2; // février 2025 = 28 jours
      const transactions = Array.from({ length: 28 }, (_, i) => ({
        type: 'recette' as const,
        montant: 1000,
        dateTransaction: new Date(annee, mois - 1, i + 1),
      }));
      expect(scoring.calculerRegulariteSaisies(transactions, mois, annee)).toBe(30);
    });

    it('retourne 0 si aucune transaction', () => {
      expect(scoring.calculerRegulariteSaisies([], 2, 2025)).toBe(0);
    });
  });

  describe('calculerSoldePositif', () => {
    it('retourne 0 si solde négatif ou nul', () => {
      const transactions = [
        { type: 'recette' as const, montant: 100, dateTransaction: new Date() },
        { type: 'depense' as const, montant: 150, dateTransaction: new Date() },
      ];
      expect(scoring.calculerSoldePositif(transactions)).toBe(0);
    });

    it('retourne 30 si toutes les recettes sont conservées (solde = recettes)', () => {
      const transactions = [
        { type: 'recette' as const, montant: 1000, dateTransaction: new Date() },
      ];
      expect(scoring.calculerSoldePositif(transactions)).toBe(30);
    });
  });

  describe('calculerStabiliteRevenus', () => {
    it('retourne 0 si aucun historique de recettes (nouveau compte)', () => {
      expect(scoring.calculerStabiliteRevenus([])).toBe(0);
    });

    it('retourne 12.5 (neutre) avec un seul mois de recettes', () => {
      expect(scoring.calculerStabiliteRevenus([1000])).toBe(12.5);
    });

    it('retourne proche de 25 si les revenus sont identiques', () => {
      expect(scoring.calculerStabiliteRevenus([1000, 1000, 1000])).toBeCloseTo(25);
    });

    it('retourne moins de 25 si les revenus varient fortement', () => {
      const score = scoring.calculerStabiliteRevenus([500, 2000, 100]);
      expect(score).toBeLessThan(25);
    });
  });

  describe('calculerAnciennete', () => {
    it('retourne 15 (max) après 6 mois ou plus', () => {
      const dateCreation = new Date(2024, 0, 1);
      expect(scoring.calculerAnciennete(dateCreation, 7, 2024)).toBe(15);
    });

    it('retourne 2.5 pour 1 mois d\'ancienneté', () => {
      const dateCreation = new Date(2025, 0, 1);
      expect(scoring.calculerAnciennete(dateCreation, 1, 2025)).toBeCloseTo(2.5);
    });
  });

  describe('calculerScore', () => {
    it('retourne un total entre 0 et 100', () => {
      const result = scoring.calculerScore({
        transactionsMois: [
          { type: 'recette', montant: 5000, dateTransaction: new Date(2025, 5, 1) },
          { type: 'depense', montant: 2000, dateTransaction: new Date(2025, 5, 2) },
        ],
        recettesMoisPrecedents: [4500, 4800, 5000],
        dateCreationCompte: new Date(2025, 0, 1),
        mois: 6,
        annee: 2025,
      });
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.total).toBeLessThanOrEqual(100);
    });
  });
});
