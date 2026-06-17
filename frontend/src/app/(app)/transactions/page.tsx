'use client';

import { useEffect, useState } from 'react';
import { Loader2, Clock, CheckCircle2, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { api } from '@/lib/api';
import { Transaction, TypeTransaction } from '@/lib/types';
import { formaterMontant, formaterDate } from '@/lib/format';
import { lirePendantTransactions } from '@/lib/offline';
import EditTransactionModal from '@/components/EditTransactionModal';

interface ReponsePaginee {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Onglets de filtrage : "toutes" n'envoie pas de paramètre "type" à l'API
type Onglet = 'toutes' | TypeTransaction;

const ONGLETS: { id: Onglet; label: string }[] = [
  { id: 'toutes', label: 'Toutes' },
  { id: 'recette', label: 'Recettes' },
  { id: 'depense', label: 'Dépenses' },
];

export default function TransactionsPage() {
  const [data, setData] = useState<ReponsePaginee | null>(null);
  const [enAttente, setEnAttente] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [onglet, setOnglet] = useState<Onglet>('toutes');
  const [chargement, setChargement] = useState(true);
  const [transactionEnEdition, setTransactionEnEdition] = useState<Transaction | null>(null);

  function charger() {
    setChargement(true);
    const params: Record<string, unknown> = { page, limit: 20 };
    if (onglet !== 'toutes') params.type = onglet;

    api
      .get<ReponsePaginee>('/transactions', { params })
      .then((res) => setData(res.data))
      .finally(() => setChargement(false));

    setEnAttente(lirePendantTransactions());
  }

  useEffect(() => {
    charger();

    // Rafraîchit automatiquement quand l'onglet redevient actif, pour
    // afficher sans action manuelle les transactions ajoutées entre-temps
    // (ex: synchronisation hors-ligne terminée, ajout depuis un autre onglet).
    function onVisibilite() {
      if (document.visibilityState === 'visible') charger();
    }
    document.addEventListener('visibilitychange', onVisibilite);
    window.addEventListener('focus', charger);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilite);
      window.removeEventListener('focus', charger);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, onglet]);

  // Changer d'onglet revient toujours à la première page
  function onChangerOnglet(o: Onglet) {
    setOnglet(o);
    setPage(1);
  }

  // Regroupe les transactions par date (jj/mm/aaaa)
  function grouperParDate(transactions: Transaction[]) {
    const groupes = new Map<string, Transaction[]>();
    for (const t of transactions) {
      const cle = formaterDate(t.dateTransaction);
      if (!groupes.has(cle)) groupes.set(cle, []);
      groupes.get(cle)!.push(t);
    }
    return groupes;
  }

  // Les transactions en attente de synchronisation (offline) sont filtrées
  // selon l'onglet actif, comme celles venant de l'API.
  const enAttenteFiltree = onglet === 'toutes' ? enAttente : enAttente.filter((t) => t.type === onglet);
  const toutesLesTransactions = [...enAttenteFiltree, ...(data?.items || [])];
  const groupes = grouperParDate(toutesLesTransactions);

  return (
    <>
      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-4">
        <h1 className="text-2xl font-bold">Historique des transactions</h1>

        {/* Onglets de filtrage : Toutes / Recettes / Dépenses */}
        <div className="flex gap-2 bg-fond rounded-bouton p-1">
          {ONGLETS.map((o) => (
            <button
              key={o.id}
              onClick={() => onChangerOnglet(o.id)}
              className={`flex-1 py-2 rounded-bouton text-sm font-semibold transition-all ${
                onglet === o.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {chargement ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primaire" size={28} />
          </div>
        ) : toutesLesTransactions.length === 0 ? (
          <p className="text-gray-400 text-center py-10">Aucune transaction enregistrée.</p>
        ) : (
          <>
            {Array.from(groupes.entries()).map(([date, transactions]) => (
              <div key={date} className="bg-carte rounded-carte shadow-sm overflow-hidden">
                <div className="bg-fond px-4 py-2 text-xs font-semibold text-gray-500">{date}</div>
                <ul className="divide-y divide-gray-100">
                  {transactions.map((t) => (
                    <li key={t.id} className="flex items-center justify-between px-4 py-3 gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">{t.categorie?.emoji || '💰'}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{t.categorie?.nom || t.description || 'Transaction'}</p>
                          {t.description && t.categorie && (
                            <p className="text-xs text-gray-400 truncate">{t.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-semibold text-sm ${t.type === 'recette' ? 'text-recette' : 'text-depense'}`}>
                          {t.type === 'recette' ? '+' : '-'} {formaterMontant(t.montant)}
                        </span>
                        {t.id.startsWith('local-') ? (
                          <span title="En attente de synchronisation">
                            <Clock size={16} className="text-accent" />
                          </span>
                        ) : (
                          <>
                            <span title="Synchronisé">
                              <CheckCircle2 size={16} className="text-recette" />
                            </span>
                            <button
                              onClick={() => setTransactionEnEdition(t)}
                              title="Modifier ou supprimer"
                              className="text-gray-400 hover:text-primaire transition-colors p-1"
                            >
                              <Pencil size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-bouton border border-gray-200 disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-gray-500">
                  Page {data.page} / {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="p-2 rounded-bouton border border-gray-200 disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modale de modification/suppression */}
      {transactionEnEdition && (
        <EditTransactionModal
          transaction={transactionEnEdition}
          onFermer={() => setTransactionEnEdition(null)}
          onTermine={() => {
            setTransactionEnEdition(null);
            charger();
          }}
        />
      )}
    </>
  );
}
