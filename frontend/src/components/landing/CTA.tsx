import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Section d'appel à l'action final, avant le footer
export default function CTA() {
  return (
    <section className="py-20 sm:py-28 bg-fond">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative bg-gradient-to-br from-primaire to-[#2E7D32] rounded-carte px-6 sm:px-12 py-14 text-center text-white overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-accent/15 rounded-full" aria-hidden />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/5 rounded-full" aria-hidden />

          <h2 className="text-3xl sm:text-4xl font-extrabold relative">
            Prêt à faire reconnaître la valeur de votre activité ?
          </h2>
          <p className="text-white/80 mt-4 max-w-xl mx-auto relative">
            Créez votre compte gratuitement en moins de deux minutes et obtenez
            votre premier Score BCX dès aujourd&apos;hui.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 relative">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-7 py-3.5 rounded-bouton shadow-lg hover:bg-[#e09915] hover:-translate-y-0.5 transition-all"
            >
              Créer mon compte gratuit
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-7 py-3.5 rounded-bouton border border-white/20 hover:bg-white/20 transition-all"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
