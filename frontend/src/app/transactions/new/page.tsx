'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, CloudOff } from 'lucide-react';
import { api } from '@/lib/api';
import { Categorie, TypeTransaction } from '@/lib/types';
import { creerTransactionAvecOffline } from '@/lib/offline';
import NavBar from '@/components/NavBar';
import OfflineBanner from '@/components/OfflineBanner';

export default function NewTransactionPage() {
  const router = useRouter();
  const [type, setType] = useState<TypeTransaction>('recette');
  const [montant, setMontant] = useState('');
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [categorieId, setCategorieId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [chargement, setChargement] = useState(false);
  const [statut, setStatut] = useState<'envoyee' | 'en_attente' | null>(null);

  useEffect(() => {
    api.get<Categorie[]>('/categories').then((res) => setCategories(res.data));
  }, []);

  // Catégories filtrées selon le type sélectionné (recette/dépense)
  const categoriesFiltrees = categories.filter((c) => c.type === type);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setStatut(null);

    try {
      const resultat = await creerTransactionAvecOffline({
        type,
        montant: Number(montant),
        categorieId: categorieId || undefined,
        description: description || undefined,
        dateTransaction: new Date(date).toISOString(),
      });
      setStatut(resultat);

      // Réinitialise le formulaire après envoi réussi (en ligne ou en attente)
      setMontant('');
      setDescription('');
      setCategorieId(null);

      setTimeout(() => {
        if (resultat === 'envoyee') router.push('/dashboard');
      }, 1200);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="md:pl-60 pb-20 md:pb-8">
      <OfflineBanner />
      <NavBar />

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        <h1 className="text-2xl font-bold">Nouvelle transaction</h1>

        <form onSubmit={onSubmit} className="bg-carte rounded-carte shadow-sm p-5 space-y-5">
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

          {/* Montant en grand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (F CFA)</label>
            <input
              type="number"
              required
              min="1"
              step="1"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="0"
              className="w-full text-4xl font-bold text-center py-4 rounded-bouton border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaire"
            />
          </div>

          {/* Catégories en pills */}
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

          <button
            type="submit"
            disabled={chargement}
            className={`w-full font-semibold py-3 rounded-bouton transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
              type === 'recette' ? 'bg-recette text-white hover:bg-[#26692a]' : 'bg-depense text-white hover:bg-[#a82222]'
            }`}
          >
            {chargement && <Loader2 className="animate-spin" size={18} />}
            Enregistrer la transaction
          </button>

          {statut === 'envoyee' && (
            <p className="flex items-center gap-2 text-recette text-sm justify-center">
              <Check size={16} /> Transaction enregistrée avec succès.
            </p>
          )}
          {statut === 'en_attente' && (
            <p className="flex items-center gap-2 text-accent text-sm justify-center">
              <CloudOff size={16} /> Hors connexion : transaction enregistrée localement, elle sera synchronisée automatiquement.
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
