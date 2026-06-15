import { LucideIcon } from 'lucide-react';
import { formaterMontant } from '@/lib/format';

interface Props {
  titre: string;
  montant: number;
  icone: LucideIcon;
  couleur: 'recette' | 'depense' | 'neutre';
}

const STYLES = {
  recette: 'text-recette bg-recette/10',
  depense: 'text-depense bg-depense/10',
  neutre: 'text-primaire bg-primaire/10',
};

// Carte métrique du dashboard (recettes, dépenses ou solde du mois)
export default function MetricCard({ titre, montant, icone: Icone, couleur }: Props) {
  return (
    <div className="bg-carte rounded-carte shadow-sm p-4 flex items-center gap-4">
      <div className={`p-3 rounded-bouton ${STYLES[couleur]}`}>
        <Icone size={22} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{titre}</p>
        <p className="text-lg font-bold">{formaterMontant(montant)}</p>
      </div>
    </div>
  );
}
