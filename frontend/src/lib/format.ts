// Formate un nombre en "F CFA" avec séparateur de milliers (espace)
export function formaterMontant(valeur: number): string {
  const arrondi = Math.round(valeur);
  const formatte = arrondi.toLocaleString('fr-FR').replace(/,/g, ' ');
  return `${formatte} F CFA`;
}

// Formate une date ISO en jj/mm/aaaa
export function formaterDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR');
}

export const NOMS_MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
