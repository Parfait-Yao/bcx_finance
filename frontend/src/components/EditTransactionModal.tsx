'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Categorie, Transaction, TypeTransaction } from '@/lib/types';

interface Props {
  transaction: Transaction;
  /** Appelé après une modification ou une suppression réussie */
  onTermine: () => void;
  onFermer: () => void;
}

// Modale de modification/suppression d'une transaction existante.
// Réutilise le même formulaire que la page "Nouvelle transaction"
// (type, montant, catégorie, date, description), pré-rempli avec les
// valeurs actuelles, plus un bouton de suppression avec confirmation.
export default function EditTransactionModal({ transaction, onTermine, onFermer }: Props) {
  const [type, setType] = useState<TypeTransaction>(transaction.type);
  const [montant, setMontant] = useState(String(transaction.montant));
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [categorieId, setCategorieId] = useState<string | null>(transaction.categorieId ?? null);
  const [description, setDescription] = useState(transaction.description ?? '');
  const [date, setDate] = useState(() => new Date(transaction.dateTransaction).toISOString().slice(0, 10));
  const [chargement, setChargement] = useState(false);
  const [suppression, setSuppression] = useState(false);
  const [confirmerSuppression, setConfirmerSuppression] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    api.get<Categorie[]>('/categories').then((res) => setCategories(res.data));
  }, []);

  const categoriesFiltrees = categories.filter((c) => c.type === type);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      await api.patch(`/transactions/${transaction.id}`, {
        type,
        montant: Number(montant),
        categorieId: categorieId || undefined,
        description: description || undefined,
        dateTransaction: new Date(date).toISOString(),
      });
      onTermine();
    } catch {
      setErreur('La modification a échoué. Réessayez.');
    } finally {
      setChargement(false);
    }
  }

  async function onSupprimer() {
    setErreur('');
    setSuppression(true);
    try {
      await api.delete(`/transactions/${transaction.id}`);
      onTermine();
    } catch {
      setErreur('La suppression a échoué. Réessayez.');
      setSuppression(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-carte shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold">Modifier la transaction</h2>
          <button onClick={onFermer} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-5">
          {/* Toggle recette / dépense */}
          <div className="grid grid-cols-2 gap-2 bg-fond rounded-bouton p-1">
            <button
              type="button"
              onClick={() => { setType('recette'); setCategorieId(null); }}
              className={`py-2 rounded-bouton font-semibold transition-all ${
                type === 'recette' ? 'bg-recette text-white shadow' : 'text-gray-500'
              }`}
            >
              Recette
            </button>
            <button
              type="button"
              onClick={() => { setType('depense'); setCategorieId(null); }}
              className={`py-2 rounded-bouton font-semibold transition-all ${
                type === 'depense' ? 'bg-depense text-white shadow' : 'text-gray-500'
              }`}
            >
              Dépense
            </button>
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (F CFA)</label>
            <input
              type="number"
              required
              min="1"
              step="1"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full text-3xl font-bold text-center py-3 rounded-bouton border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaire"
            />
          </div>

          {/* Catégories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <div className="flex flex-wrap gap-2">
              {categoriesFiltrees.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategorieId(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    categorieId === cat.id
                      ? 'bg-primaire text-white border-primaire'
                      : 'border-gray-200 text-gray-600 hover:border-primaire'
                  }`}
                >
                  {cat.emoji} {cat.nom}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-bouton border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaire"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex : Vente de marchandises au marché"
              className="w-full px-4 py-3 rounded-bouton border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaire"
            />
          </div>

          {erreur && (
            <p className="text-depense text-sm bg-depense/5 border border-depense/20 rounded-bouton px-3 py-2">{erreur}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={chargement || suppression}
              className={`flex-1 font-semibold py-3 rounded-bouton transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                type === 'recette' ? 'bg-recette text-white hover:bg-[#26692a]' : 'bg-depense text-white hover:bg-[#a82222]'
              }`}
            >
              {chargement && <Loader2 className="animate-spin" size={18} />}
              Enregistrer
            </button>

            {!confirmerSuppression ? (
              <button
                type="button"
                onClick={() => setConfirmerSuppression(true)}
                disabled={chargement || suppression}
                className="px-4 py-3 rounded-bouton border border-depense/30 text-depense hover:bg-depense/5 transition-colors disabled:opacity-60"
                title="Supprimer cette transaction"
              >
                <Trash2 size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSupprimer}
                disabled={suppression}
                className="px-4 py-3 rounded-bouton bg-depense text-white font-semibold flex items-center gap-2 disabled:opacity-60"
              >
                {suppression && <Loader2 className="animate-spin" size={18} />}
                Confirmer
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
