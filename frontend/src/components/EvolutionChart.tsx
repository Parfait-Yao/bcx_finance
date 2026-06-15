'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';
import { formaterMontant } from '@/lib/format';

interface PointGraphique {
  jour: number;
  solde: number;
}

/**
 * Graphique d'évolution du solde sur le mois en cours.
 * Récupère les transactions du mois courant et calcule un solde cumulé jour par jour.
 */
export default function EvolutionChart() {
  const [donnees, setDonnees] = useState<PointGraphique[]>([]);

  useEffect(() => {
    const maintenant = new Date();
    api
      .get('/transactions', {
        params: { mois: maintenant.getMonth() + 1, annee: maintenant.getFullYear(), limit: 100 },
      })
      .then((res) => {
        const transactions = res.data.items as { type: string; montant: number; dateTransaction: string }[];
        const joursDansLeMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0).getDate();

        const soldesParJour = new Array(joursDansLeMois + 1).fill(0);
        for (const t of transactions) {
          const jour = new Date(t.dateTransaction).getDate();
          const montant = Number(t.montant);
          soldesParJour[jour] += t.type === 'recette' ? montant : -montant;
        }

        let cumul = 0;
        const points: PointGraphique[] = [];
        for (let jour = 1; jour <= joursDansLeMois; jour++) {
          cumul += soldesParJour[jour];
          points.push({ jour, solde: cumul });
        }
        setDonnees(points);
      })
      .catch(() => setDonnees([]));
  }, []);

  if (donnees.length === 0) return null;

  return (
    <div className="bg-carte rounded-carte shadow-sm p-4">
      <h2 className="font-semibold mb-3">Évolution du solde ce mois-ci</h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={donnees}>
          <XAxis dataKey="jour" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={70} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
          <Tooltip formatter={(value: number) => formaterMontant(value)} labelFormatter={(jour) => `Jour ${jour}`} />
          <Line type="monotone" dataKey="solde" stroke="#1A5C38" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
