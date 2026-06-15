import {
  Receipt,
  Gauge,
  FileBarChart,
  WifiOff,
  BellRing,
  ShieldCheck,
  LucideIcon,
} from 'lucide-react';

interface Service {
  icone: LucideIcon;
  titre: string;
  description: string;
  couleur: string;
}

const SERVICES: Service[] = [
  {
    icone: Receipt,
    titre: 'Suivi des recettes et dépenses',
    description: 'Enregistrez chaque vente, chaque achat, par catégorie, en quelques secondes depuis votre téléphone.',
    couleur: 'bg-primaire/10 text-primaire',
  },
  {
    icone: Gauge,
    titre: 'Score BCX sur 100 points',
    description: 'Un score de crédibilité financière calculé sur la régularité, le solde, la stabilité des revenus et l\u2019ancienneté.',
    couleur: 'bg-accent/10 text-[#a87000]',
  },
  {
    icone: FileBarChart,
    titre: 'Rapports PDF bancaires',
    description: 'Générez un rapport mensuel détaillé, prêt à être présenté à votre banque ou à un partenaire financier.',
    couleur: 'bg-recette/10 text-recette',
  },
  {
    icone: WifiOff,
    titre: 'Mode hors connexion',
    description: 'Continuez à saisir vos transactions même sans réseau. Tout se synchronise dès le retour de la connexion.',
    couleur: 'bg-primaire/10 text-primaire',
  },
  {
    icone: BellRing,
    titre: 'Alertes intelligentes',
    description: 'Trésorerie faible, dépense anormale, progression du score : recevez des conseils personnalisés au bon moment.',
    couleur: 'bg-depense/10 text-depense',
  },
  {
    icone: ShieldCheck,
    titre: 'Données protégées',
    description: 'Vos informations financières restent privées et sécurisées, accessibles uniquement par vous.',
    couleur: 'bg-accent/10 text-[#a87000]',
  },
];

// Section "Services" : présentation des fonctionnalités clés de l'application
export default function Services() {
  return (
    <section id="services" className="py-20 sm:py-28 bg-fond">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-accent font-semibold text-sm uppercase tracking-wide">Nos solutions</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">
            Tout ce qu&apos;il faut pour piloter votre activité
          </h2>
          <p className="text-gray-500 mt-4">
            Une suite d&apos;outils pensée pour le terrain : simple à utiliser, fiable même
            hors connexion, et reconnue par les institutions financières.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map(({ icone: Icone, titre, description, couleur }, index) => (
            <div
              key={titre}
              className="bg-white rounded-carte p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className={`w-12 h-12 rounded-bouton flex items-center justify-center mb-4 ${couleur}`}>
                <Icone size={22} />
              </div>
              <h3 className="font-bold text-gray-900">{titre}</h3>
              <p className="text-sm text-gray-500 mt-2">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
