import { Globe2 } from 'lucide-react';
import { AFRICA_COUNTRY_PATHS, AFRICA_MARKERS, AFRICA_VIEWBOX } from './africa-map-data';

// Liste des pays couverts par BCX Finance, avec leur drapeau, affichée
// sous forme de puces dans le panneau de texte.
const PAYS = [
  { nom: 'Côte d\u2019Ivoire', drapeau: '🇨🇮' },
  { nom: 'Sénégal', drapeau: '🇸🇳' },
  { nom: 'Mali', drapeau: '🇲🇱' },
  { nom: 'Burkina Faso', drapeau: '🇧🇫' },
  { nom: 'Ghana', drapeau: '🇬🇭' },
  { nom: 'Togo', drapeau: '🇹🇬' },
  { nom: 'Bénin', drapeau: '🇧🇯' },
  { nom: 'Nigéria', drapeau: '🇳🇬' },
  { nom: 'Niger', drapeau: '🇳🇪' },
  { nom: 'Cameroun', drapeau: '🇨🇲' },
  { nom: 'Guinée', drapeau: '🇬🇳' },
  { nom: 'Tchad', drapeau: '🇹🇩' },
  { nom: 'RD Congo', drapeau: '🇨🇩' },
  { nom: 'Gabon', drapeau: '🇬🇦' },
  { nom: 'Maroc', drapeau: '🇲🇦' },
  { nom: 'Tunisie', drapeau: '🇹🇳' },
  { nom: 'Égypte', drapeau: '🇪🇬' },
  { nom: 'Kenya', drapeau: '🇰🇪' },
  { nom: 'Rwanda', drapeau: '🇷🇼' },
  { nom: 'Afrique du Sud', drapeau: '🇿🇦' },
];

// Section "Présence en Afrique" : carte réelle du continent (silhouettes
// des pays issues de données géographiques) avec les pays couverts par
// BCX Finance mis en évidence en orange et des marqueurs sur leurs capitales.
export default function AfricaPresence() {
  return (
    <section id="afrique" className="py-20 sm:py-28 bg-[#0B1220] text-white relative overflow-hidden">
      {/* Grille de fond subtile */}
      <div className="absolute inset-0 opacity-[0.05]" aria-hidden>
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative grid lg:grid-cols-2 gap-12 items-center">
        {/* Texte */}
        <div>
          <span className="inline-flex items-center gap-2 bg-white/10 text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Expansion en cours
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            Un continent,<br />
            Une <span className="bg-accent text-primaire px-2 rounded-md">Infrastructure</span>.
          </h2>
          <p className="text-white/70 mt-4 max-w-md">
            BCX Finance unifie le suivi financier des PME en Afrique.
            Connectez-vous à l&apos;économie numérique de 20 pays via une
            seule plateforme.
          </p>

          {/* Statistiques */}
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
            <div className="bg-white/5 border border-white/10 rounded-bouton p-4">
              <p className="text-2xl font-extrabold">20</p>
              <p className="text-xs text-white/60 mt-1">Pays couverts</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-bouton p-4">
              <p className="text-2xl font-extrabold">F CFA</p>
              <p className="text-xs text-white/60 mt-1">Devise commune (UEMOA / CEMAC)</p>
            </div>
          </div>

          {/* Grille des pays */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 max-w-md">
            {PAYS.map((pays) => (
              <div key={pays.nom} className="flex items-center gap-2 text-sm text-white/85">
                <span className="text-lg leading-none">{pays.drapeau}</span>
                {pays.nom}
              </div>
            ))}
          </div>
        </div>

        {/* Carte réelle du continent africain */}
        <div className="relative">
          <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full" aria-hidden />

          <svg viewBox={AFRICA_VIEWBOX} className="w-full max-w-xl mx-auto relative" aria-label="Carte de l'Afrique avec les pays couverts par BCX Finance">
            {/* Pays du continent : gris pour les non-couverts, accent pour les couverts */}
            {AFRICA_COUNTRY_PATHS.map((pays) => (
              <path
                key={pays.id}
                d={pays.d}
                fill={pays.couvert ? '#F9A825' : 'rgba(255,255,255,0.06)'}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
            ))}

            {/* Marqueurs sur les capitales des pays couverts */}
            {AFRICA_MARKERS.map((marqueur, index) => (
              <g key={marqueur.id}>
                <circle cx={marqueur.x} cy={marqueur.y} r="9" fill="#0B1220" stroke="#fff" strokeWidth="2">
                  <animate
                    attributeName="r"
                    values="7;10;7"
                    dur="2.4s"
                    begin={`${(index % 6) * 0.3}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx={marqueur.x} cy={marqueur.y} r="3" fill="#fff" />
              </g>
            ))}
          </svg>

          {/* Encadré "Couverture" en bas à droite, façon carte de référence */}
          <div className="absolute bottom-2 right-2 sm:right-6 bg-[#111a2e]/90 border border-white/10 rounded-bouton px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
            <span className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent">
              <Globe2 size={16} />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/50">Couverture</p>
              <p className="text-sm font-bold">20 pays &amp; en croissance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
