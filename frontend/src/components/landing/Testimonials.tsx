import Image from 'next/image';
import { Quote, Star } from 'lucide-react';

interface Temoignage {
  nom: string;
  role: string;
  ville: string;
  pays: string;
  citation: string;
  initiales: string;
  degrade: string;
  photo?: string;
}

const TEMOIGNAGES: Temoignage[] = [
  {
    nom: 'Aïcha Koné',
    role: 'Gérante de boutique textile',
    ville: 'Abidjan',
    pays: 'Côte d\u2019Ivoire',
    citation:
      'Avant, je n\u2019avais aucune preuve de mes revenus. Avec mon Score BCX à 78, ma banque a validé mon crédit en une semaine.',
    initiales: 'AK',
    degrade: 'from-primaire to-[#2E7D32]',
    photo: 'https://images.unsplash.com/photo-1687422808311-a776f467a468?fm=jpg&q=80&w=400&auto=format&fit=crop',
  },
  {
    nom: 'Moussa Diarra',
    role: 'Artisan menuisier',
    ville: 'Bamako',
    pays: 'Mali',
    citation:
      'Je note mes dépenses même sans connexion au village. Tout se synchronise au retour en ville. Un vrai gain de temps.',
    initiales: 'MD',
    degrade: 'from-accent to-[#c97d0a]',
  },
  {
    nom: 'Fatou Ndiaye',
    role: 'Restauratrice',
    ville: 'Dakar',
    pays: 'Sénégal',
    citation:
      'Les alertes m\u2019ont prévenue que mes dépenses en stock augmentaient trop vite. J\u2019ai pu réagir avant la fin du mois.',
    initiales: 'FN',
    degrade: 'from-[#1A5C38] to-[#0d2e1c]',
  },
];

// Section "Témoignages" : retours d'utilisatrices et utilisateurs africains
export default function Testimonials() {
  return (
    <section id="temoignages" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-accent font-semibold text-sm uppercase tracking-wide">Témoignages</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">
            Ils utilisent BCX Finance au quotidien
          </h2>
          <p className="text-gray-500 mt-4">
            Des commerçantes, artisans et prestataires partout en Afrique de l&apos;Ouest
            témoignent de l&apos;impact de BCX Finance sur leur activité.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMOIGNAGES.map((t, index) => (
            <div
              key={t.nom}
              className="bg-fond rounded-carte p-6 border border-gray-100 flex flex-col animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Quote size={28} className="text-accent/40 mb-3" />
              <p className="text-sm text-gray-600 flex-1">&laquo; {t.citation} &raquo;</p>

              <div className="flex items-center gap-1 mt-4 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                {t.photo ? (
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0">
                    <Image src={t.photo} alt={t.nom} fill className="object-cover" />
                  </div>
                ) : (
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.degrade} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                    {t.initiales}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm text-gray-900">{t.nom}</p>
                  <p className="text-xs text-gray-500">{t.role} · {t.ville}, {t.pays}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
