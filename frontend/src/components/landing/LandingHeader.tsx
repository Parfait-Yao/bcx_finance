'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Wallet } from 'lucide-react';

const LIENS = [
  { href: '#about', label: 'À propos' },
  { href: '#services', label: 'Services' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#afrique', label: 'En Afrique' },
  { href: '#temoignages', label: 'Témoignages' },
  { href: '#contact', label: 'Contact' },
];

// En-tête de la landing page : logo, navigation, connexion/inscription
export default function LandingHeader() {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primaire">
          <span className="w-9 h-9 rounded-bouton bg-primaire text-white flex items-center justify-center">
            <Wallet size={18} />
          </span>
          BCX Finance
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden lg:flex items-center gap-8">
          {LIENS.map((lien) => (
            <a key={lien.href} href={lien.href} className="text-sm font-medium text-gray-600 hover:text-primaire transition-colors">
              {lien.label}
            </a>
          ))}
        </nav>

        {/* Boutons connexion/inscription desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-primaire px-4 py-2 rounded-bouton hover:bg-primaire/5 transition-colors">
            Connexion
          </Link>
          <Link href="/register" className="text-sm font-semibold text-white bg-accent px-5 py-2.5 rounded-bouton hover:bg-[#e09915] transition-colors shadow-sm">
            Créer un compte
          </Link>
        </div>

        {/* Bouton menu mobile */}
        <button
          onClick={() => setMenuOuvert((v) => !v)}
          className="lg:hidden p-2 rounded-bouton text-primaire transition-transform duration-300"
          style={{ transform: menuOuvert ? 'rotate(90deg)' : 'rotate(0deg)' }}
          aria-label="Ouvrir le menu"
        >
          {menuOuvert ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu mobile déroulant : transition fluide de hauteur/opacité */}
      <div
        className={`lg:hidden overflow-hidden bg-white border-t border-gray-100 transition-[max-height,opacity] duration-300 ease-in-out ${
          menuOuvert ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 border-t-0'
        }`}
      >
        <div className="px-4 sm:px-6 py-4 space-y-3">
          {LIENS.map((lien) => (
            <a
              key={lien.href}
              href={lien.href}
              onClick={() => setMenuOuvert(false)}
              className="block text-sm font-medium text-gray-600 hover:text-primaire py-2"
            >
              {lien.label}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <Link href="/login" className="flex-1 text-center text-sm font-semibold text-primaire border border-primaire/20 px-4 py-2.5 rounded-bouton">
              Connexion
            </Link>
            <Link href="/register" className="flex-1 text-center text-sm font-semibold text-white bg-accent px-4 py-2.5 rounded-bouton">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
