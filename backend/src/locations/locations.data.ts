// Données statiques : pays couverts par BCX Finance avec leur indicatif
// téléphonique, leur drapeau (emoji) et leurs principales villes.
// Ces données sont servies par l'API et utilisées par le frontend pour
// les champs Pays / Téléphone / Ville du formulaire d'inscription.

export interface Pays {
  code: string; // Code ISO 3166-1 alpha-2
  nom: string;
  drapeau: string; // Emoji du drapeau
  indicatif: string; // Indicatif téléphonique international (ex: +225)
  villes: string[];
}

export const PAYS: Pays[] = [
  {
    code: 'CI',
    nom: "Côte d'Ivoire",
    drapeau: '🇨🇮',
    indicatif: '+225',
    villes: ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo', 'Daloa'],
  },
  {
    code: 'SN',
    nom: 'Sénégal',
    drapeau: '🇸🇳',
    indicatif: '+221',
    villes: ['Dakar', 'Thiès', 'Saint-Louis', 'Touba', 'Ziguinchor'],
  },
  {
    code: 'ML',
    nom: 'Mali',
    drapeau: '🇲🇱',
    indicatif: '+223',
    villes: ['Bamako', 'Sikasso', 'Mopti', 'Koutiala', 'Ségou'],
  },
  {
    code: 'BF',
    nom: 'Burkina Faso',
    drapeau: '🇧🇫',
    indicatif: '+226',
    villes: ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora'],
  },
  {
    code: 'GH',
    nom: 'Ghana',
    drapeau: '🇬🇭',
    indicatif: '+233',
    villes: ['Accra', 'Kumasi', 'Tamale', 'Takoradi'],
  },
  {
    code: 'TG',
    nom: 'Togo',
    drapeau: '🇹🇬',
    indicatif: '+228',
    villes: ['Lomé', 'Sokodé', 'Kara', 'Atakpamé'],
  },
  {
    code: 'BJ',
    nom: 'Bénin',
    drapeau: '🇧🇯',
    indicatif: '+229',
    villes: ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey'],
  },
  {
    code: 'NG',
    nom: 'Nigéria',
    drapeau: '🇳🇬',
    indicatif: '+234',
    villes: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt'],
  },
  {
    code: 'NE',
    nom: 'Niger',
    drapeau: '🇳🇪',
    indicatif: '+227',
    villes: ['Niamey', 'Zinder', 'Maradi', 'Agadez'],
  },
  {
    code: 'CM',
    nom: 'Cameroun',
    drapeau: '🇨🇲',
    indicatif: '+237',
    villes: ['Douala', 'Yaoundé', 'Garoua', 'Bafoussam'],
  },
  {
    code: 'GN',
    nom: 'Guinée',
    drapeau: '🇬🇳',
    indicatif: '+224',
    villes: ['Conakry', 'Kankan', 'Labé', 'Nzérékoré'],
  },
  {
    code: 'TD',
    nom: 'Tchad',
    drapeau: '🇹🇩',
    indicatif: '+235',
    villes: ["N'Djamena", 'Moundou', 'Sarh', 'Abéché'],
  },
  {
    code: 'CD',
    nom: 'RD Congo',
    drapeau: '🇨🇩',
    indicatif: '+243',
    villes: ['Kinshasa', 'Lubumbashi', 'Goma', 'Bukavu'],
  },
  {
    code: 'GA',
    nom: 'Gabon',
    drapeau: '🇬🇦',
    indicatif: '+241',
    villes: ['Libreville', 'Port-Gentil', 'Franceville'],
  },
  {
    code: 'MA',
    nom: 'Maroc',
    drapeau: '🇲🇦',
    indicatif: '+212',
    villes: ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger'],
  },
  {
    code: 'TN',
    nom: 'Tunisie',
    drapeau: '🇹🇳',
    indicatif: '+216',
    villes: ['Tunis', 'Sfax', 'Sousse', 'Kairouan'],
  },
  {
    code: 'EG',
    nom: 'Égypte',
    drapeau: '🇪🇬',
    indicatif: '+20',
    villes: ['Le Caire', 'Alexandrie', 'Gizeh', 'Louxor'],
  },
  {
    code: 'KE',
    nom: 'Kenya',
    drapeau: '🇰🇪',
    indicatif: '+254',
    villes: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
  },
  {
    code: 'RW',
    nom: 'Rwanda',
    drapeau: '🇷🇼',
    indicatif: '+250',
    villes: ['Kigali', 'Butare', 'Gisenyi', 'Ruhengeri'],
  },
  {
    code: 'ZA',
    nom: 'Afrique du Sud',
    drapeau: '🇿🇦',
    indicatif: '+27',
    villes: ['Johannesburg', 'Le Cap', 'Pretoria', 'Durban'],
  },
];
