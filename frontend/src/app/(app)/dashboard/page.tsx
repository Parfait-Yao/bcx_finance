'use client';

import { Wallet, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { usePolling } from '@/lib/usePolling';
import { Dashboard } from '@/lib/types';
import { formaterMontant, formaterDate } from '@/lib/format';
import ScoreGauge from '@/components/ScoreGauge';
import MetricCard from '@/components/MetricCard';
import EvolutionChart from '@/components/EvolutionChart';
import AlertsPreview from '@/components/AlertsPreview';

export default function DashboardPage() {
  const { data, chargement } = usePolling<Dashboard>('/dashboard');

  if (chargement) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primaire" size={32} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Impossible de charger le tableau de bord.
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">

      {/* Header de bienvenue — affiche le nom et l'entreprise */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 font-medium">Bonjour 👋</p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 truncate">
            {data.nom}
          </h1>
          {data.entreprise && (
            <p className="text-xs sm:text-sm text-gray-400 truncate">{data.entreprise}</p>
          )}
        </div>
        {/* Avatar avec initiales */}
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-primaire text-white flex items-center justify-center font-bold text-base sm:text-lg shrink-0 shadow-md">
          {data.nom.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
        </div>
      </div>

      <div className="bg-gradient-to-br from-primaire to-[#2E7D32] rounded-carte shadow-md p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="text-white">
          <p className="text-sm opacity-80">Votre Score BCX</p>
          <p className="text-3xl font-bold mt-1">
            {data.scoreBcx >= 70 ? 'Bon' : data.scoreBcx >= 40 ? 'Moyen' : 'À améliorer'}
          </p>
          <p className="text-sm opacity-80 mt-2 max-w-xs">
            Plus votre score est élevé, plus votre dossier de crédit est solide.
          </p>
        </div>
        <ScoreGauge score={data.scoreBcx} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard titre="Recettes du mois" montant={data.recettesMois} icone={TrendingUp} couleur="recette" />
        <MetricCard titre="Dépenses du mois" montant={data.depensesMois} icone={TrendingDown} couleur="depense" />
        <MetricCard titre="Solde" montant={data.solde} icone={Wallet} couleur="neutre" />
      </div>

      <EvolutionChart />
      <AlertsPreview />

      <div className="bg-carte rounded-carte shadow-sm p-4">
        <h2 className="font-semibold mb-3">Transactions récentes</h2>
        {data.dernieresTransactions.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune transaction enregistrée pour le moment.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.dernieresTransactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{t.categorie?.emoji || '💰'}</span>
                  <div>
                    <p className="font-medium text-sm">{t.categorie?.nom || t.description || 'Transaction'}</p>
                    <p className="text-xs text-gray-400">{formaterDate(t.dateTransaction)}</p>
                  </div>
                </div>
                <span className={`font-semibold text-sm ${t.type === 'recette' ? 'text-recette' : 'text-depense'}`}>
                  {t.type === 'recette' ? '+' : '-'} {formaterMontant(t.montant)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
