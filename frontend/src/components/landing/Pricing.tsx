import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { formaterMontant } from '@/lib/format';

interface Plan {
  nom: string;
  prix: number;
  description: string;
  fonctionnalites: string[];
  miseEnAvant?: boolean;
}

const PLANS: Plan[] = [
  {
    nom: 'Starter',
    prix: 5000,
    description: 'Pour démarrer le suivi de votre activité sans matériel particulier.',
    fonctionnalites: [
      'Saisie manuelle des recettes et dépenses',
      'Tableau de bord de base',
      'Conformité OHADA simplifiée',
      'Historique des transactions',
    ],
  },
  {
    nom: 'Standard',
    prix: 15000,
    description: 'L\u2019offre la plus populaire pour les commerces en croissance.',
    fonctionnalites: [
      'Tout le plan Starter',
      'Connexion Mobile Money (Orange Money, Moov, Wave)',
      'Alertes intelligentes par IA',
      'Rapports mensuels automatiques',
    ],
    miseEnAvant: true,
  },
  {
    nom: 'Premium',
    prix: 35000,
    description: 'Pour les PME prêtes à accéder au financement bancaire.',
    fonctionnalites: [
      'Tout le plan Standard',
      'Scoring bancaire détaillé (Score BCX)',
      'Mise en relation avec des investisseurs',
      'Support comptable dédié',
    ],
  },
];

// Section "Tarifs" : trois offres d'abonnement adaptées aux PME africaines
export default function Pricing() {
  return (
    <section id="tarifs" className="py-20 sm:py-28 bg-fond">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-accent font-semibold text-sm uppercase tracking-wide">Tarifs</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">
            Un abonnement adapté à chaque étape de votre croissance
          </h2>
          <p className="text-gray-500 mt-4">
            Des prix pensés pour les PME africaines : moins qu&apos;un repas d&apos;affaires
            par jour. Changez de formule à tout moment selon vos besoins.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, index) => (
            <div
              key={plan.nom}
              className={`relative rounded-carte p-7 flex flex-col animate-fade-up ${
                plan.miseEnAvant
                  ? 'bg-gradient-to-br from-primaire to-[#2E7D32] text-white shadow-2xl lg:-translate-y-3'
                  : 'bg-white border border-gray-100'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.miseEnAvant && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Sparkles size={12} />
                  Le plus choisi
                </span>
              )}

              <h3 className={`font-bold text-lg ${plan.miseEnAvant ? 'text-white' : 'text-gray-900'}`}>{plan.nom}</h3>
              <p className={`text-sm mt-1 ${plan.miseEnAvant ? 'text-white/75' : 'text-gray-500'}`}>{plan.description}</p>

              <div className="mt-5 flex items-end gap-1">
                <span className="text-3xl font-extrabold">{formaterMontant(plan.prix)}</span>
                <span className={`text-sm mb-1 ${plan.miseEnAvant ? 'text-white/70' : 'text-gray-400'}`}>/ mois</span>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.fonctionnalites.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={16} className={`mt-0.5 shrink-0 ${plan.miseEnAvant ? 'text-accent' : 'text-recette'}`} />
                    <span className={plan.miseEnAvant ? 'text-white/90' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`mt-8 text-center font-semibold py-3 rounded-bouton transition-all ${
                  plan.miseEnAvant
                    ? 'bg-accent text-white hover:bg-[#e09915]'
                    : 'bg-primaire/10 text-primaire hover:bg-primaire hover:text-white'
                }`}
              >
                Choisir {plan.nom}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">
          Tous les plans incluent le mode hors connexion et la sécurisation de vos données.
          Les règles comptables appliquées sont conformes au référentiel OHADA/SYSCOHADA.
        </p>
      </div>
    </section>
  );
}
