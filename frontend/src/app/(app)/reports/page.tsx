'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Download, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { api, getAccessToken } from '@/lib/api';
import { Report } from '@/lib/types';
import { formaterMontant, NOMS_MOIS } from '@/lib/format';
import ScoreGauge from '@/components/ScoreGauge';
import OfflineDataBanner from '@/components/OfflineDataBanner';

function interpreterScore(score: number) {
  if (score >= 70) return 'Bon';
  if (score >= 40) return 'Moyen';
  return 'À améliorer';
}

const ICONES_NIVEAU = {
  bon: CheckCircle,
  attention: AlertTriangle,
  critique: AlertCircle,
};

const COULEURS_NIVEAU = {
  bon: 'text-recette bg-recette/10',
  attention: 'text-accent bg-accent/10',
  critique: 'text-depense bg-depense/10',
};

export default function ReportsPage() {
  const maintenant = new Date();
  const [mois, setMois] = useState(maintenant.getMonth() + 1);
  const [annee, setAnnee] = useState(maintenant.getFullYear());
  const [report, setReport] = useState<Report | null>(null);
  const [chargement, setChargement] = useState(true);
  const [horsLigne, setHorsLigne] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    const cleCache = `bcx_cache_report_${mois}_${annee}`;
    // Affiche le cache immédiatement si disponible
    try {
      const cache = localStorage.getItem(cleCache);
      if (cache) setReport(JSON.parse(cache));
    } catch { /* ignore */ }

    try {
      const res = await api.get<Report>(`/reports/${mois}/${annee}`);
      setReport(res.data);
      setHorsLigne(false);
      try { localStorage.setItem(cleCache, JSON.stringify(res.data)); } catch { /* quota */ }
    } catch {
      setHorsLigne(true);
    } finally {
      setChargement(false);
    }
  }, [mois, annee]);

  useEffect(() => {
    charger();
    window.addEventListener('online', charger);
    return () => window.removeEventListener('online', charger);
  }, [charger]);

  function changerMois(delta: number) {
    let nouveauMois = mois + delta;
    let nouvelleAnnee = annee;
    if (nouveauMois < 1) { nouveauMois = 12; nouvelleAnnee -= 1; }
    if (nouveauMois > 12) { nouveauMois = 1; nouvelleAnnee += 1; }
    setMois(nouveauMois);
    setAnnee(nouvelleAnnee);
  }

  // Téléchargement du PDF (nécessite l'en-tête Authorization, donc fetch manuel)
  async function telechargerPdf() {
    if (!report) return;
    const token = getAccessToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/${report.id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-bcx-${mois}-${annee}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {horsLigne && <OfflineDataBanner />}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Rapport mensuel</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => changerMois(-1)} className="p-2 rounded-bouton border border-gray-200">
              <ChevronLeft size={18} />
            </button>
            <span className="font-medium text-sm w-32 text-center">{NOMS_MOIS[mois - 1]} {annee}</span>
            <button onClick={() => changerMois(1)} className="p-2 rounded-bouton border border-gray-200">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {chargement ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primaire" size={28} />
          </div>
        ) : !report ? (
          <p className="text-gray-400 text-center py-10">Aucune donnée pour cette période.</p>
        ) : (
          <>

            {/* Jauge du score */}
            <div className="bg-gradient-to-br from-primaire to-[#2E7D32] rounded-carte shadow-md p-6 flex items-center justify-between flex-wrap gap-4">
              <div className="text-white">
                <p className="text-sm opacity-80">Score BCX</p>
                <p className="text-3xl font-bold mt-1">{interpreterScore(report.scoreBcx)}</p>
                <p className="text-sm opacity-80 mt-2">
                  Saisies effectuées sur {report.joursSaisie} jour(s) ce mois-ci.
                </p>
              </div>
              <ScoreGauge score={report.scoreBcx} />
            </div>

            {/* Récapitulatif type "reçu" */}
            <div className="bg-carte rounded-carte shadow-sm p-5">
              <h2 className="font-semibold mb-4">Récapitulatif</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                  <span className="text-gray-500">Total des recettes</span>
                  <span className="font-semibold text-recette">{formaterMontant(report.totalRecettes)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                  <span className="text-gray-500">Total des dépenses</span>
                  <span className="font-semibold text-depense">{formaterMontant(report.totalDepenses)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Solde net</span>
                  <span className="font-bold">{formaterMontant(report.soldeNet)}</span>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-carte rounded-carte shadow-sm p-5">
              <h2 className="font-semibold mb-3">Insights</h2>
              {report.insights.length === 0 ? (
                <p className="text-sm text-gray-400">Aucun insight pour ce mois.</p>
              ) : (
                <ul className="space-y-2">
                  {report.insights.map((insight) => {
                    const Icone = ICONES_NIVEAU[insight.niveau];
                    return (
                      <li key={insight.id} className={`flex items-start gap-3 rounded-bouton px-3 py-2 ${COULEURS_NIVEAU[insight.niveau]}`}>
                        <Icone size={18} className="mt-0.5 shrink-0" />
                        <span className="text-sm">{insight.message}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <button
              onClick={telechargerPdf}
              className="w-full bg-primaire text-white font-semibold py-3 rounded-bouton hover:bg-[#15492c] transition-all flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Télécharger le rapport PDF
            </button>
          </>
        )}
      </main>
  );
}
