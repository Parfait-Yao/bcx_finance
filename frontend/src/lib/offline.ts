import { api } from './api';
import { Transaction } from './types';

const STORAGE_KEY = 'pending_transactions';

/**
 * MODE OFFLINE — Logique de file d'attente locale.
 *
 * Lorsque l'utilisateur ajoute une transaction sans connexion internet,
 * elle est stockée dans localStorage sous la clé "pending_transactions".
 * Dès que la connexion revient, ces transactions sont envoyées en lot
 * vers POST /transactions/sync puis le localStorage est vidé.
 */

// Lit les transactions en attente depuis le localStorage
export function lirePendantTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  const brut = localStorage.getItem(STORAGE_KEY);
  return brut ? JSON.parse(brut) : [];
}

// Ajoute une transaction à la file d'attente locale (mode hors-ligne)
export function ajouterTransactionEnAttente(transaction: Transaction) {
  const liste = lirePendantTransactions();
  liste.push(transaction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(liste));
}

// Vide la file d'attente (après synchronisation réussie)
export function viderTransactionsEnAttente() {
  localStorage.removeItem(STORAGE_KEY);
}

export function compterTransactionsEnAttente(): number {
  return lirePendantTransactions().length;
}

/**
 * Crée une transaction : envoi direct si en ligne, sinon mise en file
 * d'attente locale pour synchronisation ultérieure.
 * Retourne 'envoyee' ou 'en_attente'.
 */
export async function creerTransactionAvecOffline(
  transaction: Omit<Transaction, 'id'>,
): Promise<'envoyee' | 'en_attente'> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    ajouterTransactionEnAttente({ ...transaction, id: `local-${Date.now()}` });
    return 'en_attente';
  }

  try {
    await api.post('/transactions', transaction);
    return 'envoyee';
  } catch {
    // En cas d'échec réseau malgré navigator.onLine = true, on bascule en attente
    ajouterTransactionEnAttente({ ...transaction, id: `local-${Date.now()}` });
    return 'en_attente';
  }
}

/**
 * Synchronise les transactions en attente avec le serveur.
 * Appelée automatiquement au retour de connexion (event "online").
 */
export async function synchroniserTransactionsEnAttente(): Promise<number> {
  const liste = lirePendantTransactions();
  if (liste.length === 0) return 0;

  const transactions = liste.map(({ type, montant, categorieId, description, dateTransaction }) => ({
    type,
    montant,
    categorieId,
    description,
    dateTransaction,
  }));

  await api.post('/transactions/sync', { transactions });
  viderTransactionsEnAttente();
  return liste.length;
}
