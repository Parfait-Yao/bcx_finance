'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wallet, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import AuthVisual from '@/components/auth/AuthVisual';
import PasswordInput from '@/components/auth/PasswordInput';

// Page de réinitialisation : reçoit le jeton via ?token=... (lien envoyé
// par email), demande le nouveau mot de passe (avec confirmation) et
// appelle /auth/reset-password. Le jeton est à usage unique et expire
// après 15 minutes côté serveur.
function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';

  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur('');

    if (motDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (motDePasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setChargement(true);
    try {
      await api.post('/auth/reset-password', { token, motDePasse });
      setSucces(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      const messageApi = err?.response?.data?.message;
      setErreur(
        typeof messageApi === 'string'
          ? messageApi
          : 'Ce lien de réinitialisation est invalide ou a expiré. Faites une nouvelle demande.',
      );
    } finally {
      setChargement(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-depense/10 text-depense flex items-center justify-center mb-4">
          <AlertTriangle size={28} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Lien invalide</h1>
        <p className="text-gray-500 mt-2">
          Ce lien de réinitialisation est incomplet ou invalide. Faites une nouvelle demande.
        </p>
        <Link href="/forgot-password" className="inline-block mt-6 text-primaire font-semibold hover:underline">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  if (succes) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-recette/10 text-recette flex items-center justify-center mb-4">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Mot de passe réinitialisé</h1>
        <p className="text-gray-500 mt-2">
          Votre mot de passe a été changé avec succès. Redirection vers la connexion...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Nouveau mot de passe</h1>
        <p className="text-gray-500 mt-2">Choisissez un nouveau mot de passe pour votre compte.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
          <PasswordInput
            required
            minLength={6}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
          <PasswordInput
            required
            minLength={6}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {erreur && (
          <p className="text-depense text-sm bg-depense/5 border border-depense/20 rounded-bouton px-3 py-2">{erreur}</p>
        )}

        <button
          type="submit"
          disabled={chargement}
          className="w-full bg-primaire text-white font-semibold py-3.5 rounded-bouton hover:bg-[#15492c] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:translate-y-0 shadow-lg shadow-primaire/20"
        >
          {chargement && <Loader2 className="animate-spin" size={18} />}
          Réinitialiser le mot de passe
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen lg:flex">
      <AuthVisual
        titre="Choisissez un nouveau mot de passe"
        description="Votre nouveau mot de passe sera immédiatement actif. Pensez à choisir un mot de passe que vous n'utilisez pas ailleurs."
        image="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop"
        imageAlt="Personne sécurisant son compte sur son téléphone"
      />

      <div className="flex-1 flex items-center justify-center px-4 py-10 lg:py-0 animate-fade-up">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-primaire">
              <span className="w-10 h-10 rounded-bouton bg-primaire text-white flex items-center justify-center">
                <Wallet size={20} />
              </span>
              BCX Finance
            </Link>
          </div>

          <Link href="/login" className="hidden lg:inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primaire transition-colors mb-8">
            <ArrowLeft size={14} />
            Retour à la connexion
          </Link>

          <Suspense fallback={<Loader2 className="animate-spin text-primaire" size={28} />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
