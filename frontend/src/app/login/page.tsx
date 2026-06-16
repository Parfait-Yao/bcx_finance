'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, Loader2, ArrowLeft, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthVisual from '@/components/auth/AuthVisual';
import PasswordInput from '@/components/auth/PasswordInput';

export default function LoginPage() {
  const { login } = useAuth();
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      // Normalise le numéro : supprime espaces et tirets, garde le +
      // Le numéro doit être saisi avec indicatif (ex: +2250700000000)
      // pour correspondre exactement à ce qui a été enregistré à l'inscription.
      const numeroNormalise = telephone.replace(/[\s\-]/g, '');
      await login({ telephone: numeroNormalise, motDePasse });
    } catch {
      setErreur('Numéro de téléphone ou mot de passe incorrect.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Panneau visuel masqué sur mobile */}
      <AuthVisual
        titre="Bienvenue de retour sur votre tableau de bord financier"
        description="Suivez vos recettes, vos dépenses et l'évolution de votre Score BCX en un coup d'œil, où que vous soyez en Afrique."
        image="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1200&auto=format&fit=crop"
        imageAlt="Jeune femme africaine souriante tenant son téléphone"
      />

      {/* Formulaire — scrollable sur mobile */}
      <div className="flex-1 flex items-start lg:items-center justify-center px-4 py-10 lg:py-0 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-primaire">
              <span className="w-10 h-10 rounded-bouton bg-primaire text-white flex items-center justify-center">
                <Wallet size={20} />
              </span>
              BCX Finance
            </Link>
          </div>

          <Link href="/" className="hidden lg:inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primaire transition-colors mb-8">
            <ArrowLeft size={14} />
            Retour à l&apos;accueil
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Connexion</h1>
            <p className="text-gray-500 mt-2">Entrez vos identifiants pour accéder à votre compte.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+225 07 00 00 00 00"
                  className="w-full pl-11 pr-4 py-3.5 rounded-bouton border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaire focus:border-primaire transition-shadow"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Numéro complet avec indicatif, ex&nbsp;: +225 07 00 00 00 00
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <Link href="/forgot-password" className="text-xs font-medium text-primaire hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <PasswordInput
                required
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {erreur && (
              <p className="text-depense text-sm bg-depense/5 border border-depense/20 rounded-bouton px-3 py-2">
                {erreur}
              </p>
            )}

            <button
              type="submit"
              disabled={chargement}
              className="w-full bg-primaire text-white font-semibold py-3.5 rounded-bouton hover:bg-[#15492c] transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-primaire/20"
            >
              {chargement && <Loader2 className="animate-spin" size={18} />}
              Se connecter
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8 pb-6">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-primaire font-semibold hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
