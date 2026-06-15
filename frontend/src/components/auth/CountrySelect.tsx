'use client';

import Select, { components, OptionProps, SingleValueProps, StylesConfig } from 'react-select';
import { PAYS_OPTIONS, PaysOption } from '@/lib/countries';
import FlagIcon from './FlagIcon';

interface Props {
  valeur: PaysOption | null;
  onChange: (pays: PaysOption) => void;
}

// Affiche le drapeau + le nom du pays dans chaque option de la liste
function OptionPays(props: OptionProps<PaysOption>) {
  const { data } = props;
  return (
    <components.Option {...props}>
      <span className="flex items-center gap-2">
        <FlagIcon code={data.code} className="w-6 h-auto rounded-sm shrink-0" />
        <span className="truncate">{data.nom}</span>
        <span className="text-gray-400 text-xs ml-auto">{data.indicatif}</span>
      </span>
    </components.Option>
  );
}

// Affiche le drapeau + le nom du pays sélectionné dans le champ
function ValeurPays(props: SingleValueProps<PaysOption>) {
  const { data } = props;
  return (
    <components.SingleValue {...props}>
      <span className="flex items-center gap-2">
        <FlagIcon code={data.code} className="w-6 h-auto rounded-sm shrink-0" />
        <span className="truncate">{data.nom}</span>
      </span>
    </components.SingleValue>
  );
}

// Styles "react-select" alignés sur la charte BCX Finance (bordures
// arrondies, focus vert primaire, hauteur identique aux autres champs).
const styles: StylesConfig<PaysOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: '52px',
    paddingLeft: '0.25rem',
    borderRadius: '12px',
    borderColor: state.isFocused ? '#1A5C38' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(26,92,56,0.2)' : 'none',
    '&:hover': { borderColor: state.isFocused ? '#1A5C38' : '#e5e7eb' },
  }),
  placeholder: (base) => ({ ...base, color: '#9ca3af' }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#1A5C38' : state.isFocused ? '#F7F8FA' : 'white',
    color: state.isSelected ? 'white' : '#111827',
    cursor: 'pointer',
  }),
  menu: (base) => ({ ...base, borderRadius: '12px', overflow: 'hidden', zIndex: 30 }),
  menuList: (base) => ({ ...base, maxHeight: '260px' }),
};

// Champ "Pays" : liste complète des 250 pays (package world-countries),
// avec recherche par nom et drapeau affiché — comportement façon Indeed.
// Le pays choisi détermine ensuite l'indicatif téléphonique (PhoneInput)
// et la liste des villes (CitySelect).
export default function CountrySelect({ valeur, onChange }: Props) {
  return (
    <Select<PaysOption, false>
      instanceId="pays-select"
      options={PAYS_OPTIONS}
      value={valeur}
      onChange={(option) => option && onChange(option)}
      getOptionValue={(option) => option.code}
      getOptionLabel={(option) => option.nom}
      components={{ Option: OptionPays, SingleValue: ValeurPays }}
      styles={styles}
      placeholder="Rechercher un pays…"
      noOptionsMessage={() => 'Aucun pays trouvé'}
      isSearchable
    />
  );
}
