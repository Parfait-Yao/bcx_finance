'use client';

import { useMemo } from 'react';
import Select, { StylesConfig } from 'react-select';
import { City } from 'country-state-city';

interface VilleOption {
  value: string;
  label: string;
}

interface Props {
  codePays: string | null;
  valeur: string;
  onChange: (ville: string) => void;
}

const styles: StylesConfig<VilleOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: '52px',
    paddingLeft: '0.25rem',
    borderRadius: '12px',
    borderColor: state.isFocused ? '#1A5C38' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(26,92,56,0.2)' : 'none',
    backgroundColor: state.isDisabled ? '#F7F8FA' : 'white',
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

// Champ "Ville" : liste des villes du pays sélectionné, calculée à la
// volée via le package "country-state-city" (aucune requête réseau).
// Désactivé tant qu'aucun pays n'a été choisi.
export default function CitySelect({ codePays, valeur, onChange }: Props) {
  const options = useMemo<VilleOption[]>(() => {
    if (!codePays) return [];
    return City.getCitiesOfCountry(codePays)
      ?.map((ville) => ({ value: ville.name, label: ville.name }))
      // Évite les doublons (plusieurs villes peuvent porter le même nom
      // dans des régions différentes du même pays)
      .filter((option, index, tableau) => tableau.findIndex((o) => o.value === option.value) === index)
      .sort((a, b) => a.label.localeCompare(b.label, 'fr')) ?? [];
  }, [codePays]);

  const valeurSelectionnee = options.find((o) => o.value === valeur) ?? null;

  return (
    <Select<VilleOption, false>
      instanceId="ville-select"
      options={options}
      value={valeurSelectionnee}
      onChange={(option) => onChange(option?.value ?? '')}
      isDisabled={!codePays}
      styles={styles}
      placeholder={codePays ? 'Sélectionner une ville…' : 'Choisissez d\u2019abord un pays'}
      noOptionsMessage={() => 'Aucune ville trouvée'}
      isSearchable
    />
  );
}
