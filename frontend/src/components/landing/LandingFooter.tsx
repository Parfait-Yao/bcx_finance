import Link from 'next/link';
import { Wallet, Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';

// Pied de page : contact, liens utiles, réseaux sociaux
export default function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo + description */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
              <span className="w-9 h-9 rounded-bouton bg-primaire text-white flex items-center justify-center">
                <Wallet size={18} />
              </span>
              BCX Finance
            </Link>
            <p className="text-sm text-gray-400 mt-4">
              La solution de gestion financière et de Score BCX pour les PME africaines.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-primaire transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-primaire transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-primaire transition-colors">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="hover:text-white transition-colors">À propos</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a></li>
              <li><a href="#afrique" className="hover:text-white transition-colors">Présence en Afrique</a></li>
              <li><a href="#temoignages" className="hover:text-white transition-colors">Témoignages</a></li>
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h3 className="font-semibold text-white mb-4">Votre compte</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register" className="hover:text-white transition-colors">Créer un compte</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Connexion</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Tableau de bord</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contactez-nous</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-accent shrink-0" />
                contact@bcxfinance.africa
              </li>
              <li className="flex items-center gap-2">
                <Phone size={15} className="text-accent shrink-0" />
                +225 07 00 00 00 00
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={15} className="text-accent shrink-0 mt-0.5" />
                Abidjan, Côte d&apos;Ivoire
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} BCX Finance. Tous droits réservés.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Conditions d&apos;utilisation</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
