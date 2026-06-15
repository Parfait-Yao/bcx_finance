'use client';

import * as Flags from 'country-flag-icons/react/3x2';

interface Props {
  /** Code ISO 3166-1 alpha-2 (ex: "CI") */
  code: string;
  className?: string;
}

// Affiche le drapeau SVG d'un pays à partir de son code ISO (package
// "country-flag-icons"). Utilisé dans les champs Pays et Téléphone pour
// garantir un affichage fiable du drapeau (les émojis de drapeaux ne
// s'affichent pas correctement sur certaines configurations Windows).
export default function FlagIcon({ code, className = 'w-5 h-auto rounded-sm' }: Props) {
  const Drapeau = (Flags as Record<string, React.ComponentType<{ title?: string; className?: string }>>)[code];
  if (!Drapeau) return null;
  return <Drapeau title={code} className={className} />;
}
