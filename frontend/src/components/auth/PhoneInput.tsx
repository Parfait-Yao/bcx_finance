'use client';

import { PaysOption } from '@/lib/countries';
import FlagIcon from './FlagIcon';

interface Props {
  pays: PaysOption | null;
  numero: string;
  onChange: (numero: string) => void;
}

// Champ "Téléphone" : préfixe = drapeau + indicatif du pays sélectionné
// (mis à jour automatiquement dès qu'on change de pays dans CountrySelect),
// suivi d'un champ libre pour le numéro local.
//
// Le préfixe et le champ de saisie partagent UNE SEULE bordure (portée par
// le conteneur englobant) afin d'éviter l'effet de bordure "coupée" entre
// les deux zones : seul un séparateur vertical fin distingue les deux.
export default function PhoneInput({ pays, numero, onChange }: Props) {
  return (
    <div className="flex items-stretch rounded-bouton border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-primaire focus-within:border-primaire transition-shadow overflow-hidden">
      {/* Préfixe : drapeau + indicatif, dépend du pays choisi */}
      <div className="flex items-center gap-1.5 px-3 border-r border-gray-200 bg-fond text-gray-600 text-sm whitespace-nowrap">
        {pays ? (
          <>
            <FlagIcon code={pays.code} className="w-6 h-auto rounded-sm shrink-0" />
            <span className="font-medium">{pays.indicatif}</span>
          </>
        ) : (
          <span className="text-gray-400">+---</span>
        )}
      </div>

      {/* Numéro local */}
      <input
        type="tel"
        required
        value={numero}
        onChange={(e) => onChange(e.target.value)}
        placeholder="07 00 00 00 00"
        className="flex-1 w-full min-w-0 px-4 py-3.5 bg-transparent focus:outline-none"
      />
    </div>
  );
}
