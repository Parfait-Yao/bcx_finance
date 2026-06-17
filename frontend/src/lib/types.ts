// Types partagés entre les pages du frontend BCX Finance

export type TypeTransaction = 'recette' | 'depense';

export interface Categorie {
  id: string;
  nom: string;
  type: TypeTransaction;
  emoji: string;
}

export interface Transaction {
  id: string;
  type: TypeTransaction;
  montant: number;
  categorieId?: string | null;
  categorie?: { nom: string; emoji: string } | null;
  description?: string | null;
  dateTransaction: string;
  createdAt?: string;
  // Statut de synchronisation (uniquement côté frontend, mode offline)
  enAttenteSync?: boolean;
}

export interface Dashboard {
  nom: string;
  entreprise: string;
  solde: number;
  recettesMois: number;
  depensesMois: number;
  scoreBcx: number;
  dernieresTransactions: Transaction[];
}

export interface ReportInsight {
  id: string;
  type: string;
  niveau: 'bon' | 'attention' | 'critique';
  message: string;
}

export interface Report {
  id: string;
  mois: number;
  annee: number;
  totalRecettes: number;
  totalDepenses: number;
  soldeNet: number;
  scoreBcx: number;
  joursSaisie: number;
  insights: ReportInsight[];
}

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  lu: boolean;
  createdAt: string;
}
