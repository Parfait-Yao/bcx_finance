'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet, Mail, Loader2, MailCheck } from 'lucide-react';
import { api } from '@/lib/api';
import AuthVisual from '@/components/auth/AuthVisual';

// Page "Mot de passe oublié" : demande l'email de l'utilisateur et déclenche
// l'envoi d'un lien de réinitialisation (valable 15 minutes, à usage unique).
// La réponse de l'API est volontairement générique (ne révèle jamais si
// l'email existe), donc l'écran de confirmation est toujours le même.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [chargement, setChargement] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setEnvoye(true);
    } catch {
      setErreur('Une erreur est survenue. Réessayez dans quelques instants.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="min-h-screen lg:flex">
      <AuthVisual
        titre="Récupérez l'accès à votre compte en toute sécurité"
        description="Nous vous envoyons un lien à usage unique, valable 15 minutes, pour choisir un nouveau mot de passe."
        image="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop"
        imageAlt="Personne consultant son téléphone pour réinitialiser son mot de passe"
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

          {envoye ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-recette/10 text-recette flex items-center justify-center mb-4">
                <MailCheck size={28} />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900">Vérifiez votre boîte mail</h1>
              <p className="text-gray-500 mt-2">
                Si un compte existe avec l&apos;adresse <strong>{email}</strong>, vous recevrez un email
                contenant un lien pour réinitialiser votre mot de passe. Ce lien est valable 15 minutes.
              </p>
              <Link href="/login" className="inline-block mt-6 text-primaire font-semibold hover:underline">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Mot de passe oublié</h1>
                <p className="text-gray-500 mt-2">
                  Saisissez l&apos;adresse email associée à votre compte. Nous vous envoyons un lien
                  pour choisir un nouveau mot de passe.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aicha@exemple.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-bouton border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaire focus:border-primaire transition-shadow"
                    />
                  </div>
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
                  Envoyer le lien de réinitialisation
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-8">
                <Link href="/login" className="text-primaire font-semibold hover:underline">
                  Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
