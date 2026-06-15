// Événement émis chaque fois qu'une transaction est créée, modifiée,
// supprimée ou synchronisée. Permet au module "reports" de recalculer
// le rapport et les alertes du mois concerné sans dépendance directe
// avec le module "transactions".
export const TRANSACTION_CHANGED_EVENT = 'transaction.changed';

export class TransactionChangedEvent {
  constructor(
    public readonly userId: string,
    /** Mois (1-12) et année concernés par la transaction modifiée */
    public readonly mois: number,
    public readonly annee: number,
  ) {}
}
