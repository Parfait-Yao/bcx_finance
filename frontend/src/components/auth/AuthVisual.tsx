import Link from 'next/link';
import Image from 'next/image';
import { Wallet, ShieldCheck, TrendingUp, Globe2 } from 'lucide-react';

interface Props {
  titre: string;
  description: string;
  /** URL de la photo illustrant la section (Unsplash) */
  image: string;
  /** Texte alternatif décrivant la photo */  
  imageAlt: string;
}

/**
 * Panneau visuel affiché à côté du formulaire d'authentification sur desktop
 * (masqué sur mobile pour garder un formulaire centré et épuré).
 * Affiche une photo illustrative en arrière-plan avec un dégradé pour
 * garder le texte lisible.
 */
export default function AuthVisual({ titre, description, image, imageAlt }: Props) {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative text-white flex-col justify-between p-10 overflow-hidden">
      {/* Photo d'illustration en arrière-plan */}
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        className="object-cover"
        sizes="50vw"
      />
      {/* Dégradé sombre pour garder le texte lisible sur la photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-primaire/90 via-primaire/70 to-[#0c2e1c]/95" aria-hidden />
      <div className="absolute inset-0 opacity-[0.06]" aria-hidden>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-accent/15 rounded-full blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" aria-hidden />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-bold text-lg relative z-10">
        <span className="w-9 h-9 rounded-bouton bg-white/15 flex items-center justify-center">
          <Wallet size={18} />
        </span>
        BCX Finance
      </Link>

      {/* Texte principal */}
      <div className="relative z-10">
        <span className="inline-flex items-center gap-2 bg-white/10 text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
          <ShieldCheck size={14} />
          Plateforme sécurisée
        </span>
        <h2 className="text-3xl font-extrabold leading-tight max-w-sm">{titre}</h2>
        <p className="text-white/70 mt-3 max-w-sm">{description}</p>
      </div>

      {/* Statistiques en bas du panneau */}
      <div className="relative z-10 grid grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-bouton p-4 backdrop-blur-sm">
          <TrendingUp size={18} className="text-accent mb-2" />
          <p className="text-xl font-extrabold">100 pts</p>
          <p className="text-xs text-white/70 mt-1">Échelle du Score BCX</p>
        </div>
        <div className="bg-white/10 rounded-bouton p-4 backdrop-blur-sm">
          <Globe2 size={18} className="text-accent mb-2" />
          <p className="text-xl font-extrabold">20+</p>
          <p className="text-xs text-white/70 mt-1">Pays africains</p>
        </div>
        <div className="bg-white/10 rounded-bouton p-4 backdrop-blur-sm">
          <ShieldCheck size={18} className="text-accent mb-2" />
          <p className="text-xl font-extrabold">OHADA</p>
          <p className="text-xs text-white/70 mt-1">Conformité intégrée</p>
        </div>
      </div>
    </div>
  );
}
