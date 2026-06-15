import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';

// Section héro : promesse principale + visuel + indicateurs clés
export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Dégradés décoratifs en arrière-plan */}
      <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-primaire/10 rounded-full blur-3xl" aria-hidden />
      <div className="absolute top-40 -left-40 w-[24rem] h-[24rem] bg-accent/10 rounded-full blur-3xl" aria-hidden />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center relative">
        {/* Colonne texte */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 bg-primaire/10 text-primaire text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <ShieldCheck size={14} />
            Conçu pour les PME africaines
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-gray-900">
            Donnez de la <span className="text-primaire">valeur</span> à votre activité avec le{' '}
            <span className="relative inline-block">
              Score BCX
              <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden>
                <path d="M0,8 Q50,0 100,6 T200,4" stroke="#F9A825" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-500 max-w-lg">
            Enregistrez vos recettes et dépenses en quelques secondes, suivez votre santé
            financière en temps réel et obtenez un rapport bancaire prêt à présenter
            pour décrocher votre prochain crédit.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-primaire text-white font-semibold px-6 py-3.5 rounded-bouton shadow-lg shadow-primaire/20 hover:bg-[#15492c] hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Créer mon compte gratuit
              <ArrowRight size={18} />
            </Link>
            <a
              href="#services"
              className="inline-flex items-center gap-2 bg-white text-gray-700 font-semibold px-6 py-3.5 rounded-bouton border border-gray-200 hover:border-primaire/40 hover:text-primaire transition-all"
            >
              Découvrir les services
            </a>
          </div>

          {/* Indicateurs clés */}
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">20+</p>
              <p className="text-xs text-gray-500 mt-1">Pays africains couverts</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">100<span className="text-accent">pts</span></p>
              <p className="text-xs text-gray-500 mt-1">Échelle du Score BCX</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">24/7</p>
              <p className="text-xs text-gray-500 mt-1">Suivi, même hors connexion</p>
            </div>
          </div>
        </div>

        {/* Colonne visuelle */}
        <div className="relative animate-fade-up-lg">
          <div className="relative rounded-carte overflow-hidden shadow-2xl aspect-[4/5] sm:aspect-[5/4]">
            <Image
              src="https://images.unsplash.com/photo-1687422808311-a776f467a468?fm=jpg&q=80&w=1200&auto=format&fit=crop"
              alt="Commerçante africaine souriante dans sa boutique"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primaire/40 via-transparent to-transparent" />
          </div>

          {/* Carte flottante : aperçu du Score BCX */}
          <div className="absolute -bottom-6 -left-4 sm:-left-10 bg-white rounded-carte shadow-xl p-4 w-48 animate-fade-left" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500">Score BCX</span>
              <TrendingUp size={16} className="text-recette" />
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-extrabold text-primaire">82</span>
              <span className="text-sm text-gray-400 mb-1">/ 100</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primaire to-accent rounded-full" style={{ width: '82%' }} />
            </div>
            <p className="text-xs text-recette font-medium mt-2">Bon niveau de crédibilité</p>
          </div>

          {/* Carte flottante : dernière recette */}
          <div className="absolute -top-6 -right-2 sm:-right-8 bg-white rounded-carte shadow-xl px-4 py-3 flex items-center gap-3 animate-fade-right" style={{ animationDelay: '500ms' }}>
            <span className="w-9 h-9 rounded-full bg-recette/10 flex items-center justify-center text-recette font-bold">+</span>
            <div>
              <p className="text-xs text-gray-400">Nouvelle recette</p>
              <p className="text-sm font-bold text-gray-900">45 000 F CFA</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
