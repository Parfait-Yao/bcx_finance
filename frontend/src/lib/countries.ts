// Liste complète des pays (250) construite à partir du package
// "world-countries", avec nom en français, drapeau (emoji) et indicatif
// téléphonique international. Utilisée par les champs Pays / Téléphone
// du formulaire d'inscription (sélecteur façon Indeed avec recherche).
import worldCountries from 'world-countries';

export interface PaysOption {
  /** Code ISO 3166-1 alpha-2 (ex: "CI") */
  code: string;
  /** Nom du pays en français (ex: "Côte d'Ivoire") */
  nom: string;
  /** Drapeau emoji (ex: "🇨🇮") */
  drapeau: string;
  /** Indicatif téléphonique international (ex: "+225") */
  indicatif: string;
}

// Construit l'indicatif téléphonique à partir de idd.root + idd.suffixes
// (ex: root "+2", suffixes ["25"] -> "+225"). Certains pays ont plusieurs
// indicatifs (ex: USA/Canada) ; on garde le premier.
function construireIndicatif(idd: { root?: string; suffixes?: string[] }): string {
  if (!idd?.root) return '';
  const suffixe = idd.suffixes?.[0] ?? '';
  return `${idd.root}${suffixe}`;
}

// Liste triée par nom français, sans les pays sans indicatif valide.
export const PAYS_OPTIONS: PaysOption[] = worldCountries
  .map((pays) => ({
    code: pays.cca2,
    nom: pays.translations?.fra?.common || pays.name.common,
    drapeau: pays.flag,
    indicatif: construireIndicatif(pays.idd),
  }))
  .filter((p) => p.indicatif)
  .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

// Recherche un pays par son code ISO alpha-2.
export function trouverPaysParCode(code: string | null | undefined): PaysOption | undefined {
  if (!code) return undefined;
  return PAYS_OPTIONS.find((p) => p.code === code);
}
