'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, Wallet, User, Mail, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthVisual from '@/components/auth/AuthVisual';
import CountrySelect from '@/components/auth/CountrySelect';
import PhoneInput from '@/components/auth/PhoneInput';
import CitySelect from '@/components/auth/CitySelect';
import PasswordInput from '@/components/auth/PasswordInput';
import { PaysOption } from '@/lib/countries';

export default function RegisterPage() {
  const { register } = useAuth();

  const [paysSelectionne, setPaysSelectionne] = useState<PaysOption | null>(null);

  const [form, setForm] = useState({
    nom: '',
    numeroTelephone: '', // numéro local, sans l'indicatif
    email: '',
    entreprise: '',
    motDePasse: '',
    ville: '',
  });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  function majChamp(champ: keyof typeof form, valeur: string) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  // Quand on change de pays : met à jour l'indicatif (via paysSelectionne)
  // et réinitialise la ville, car la liste des villes change.
  function onChangePays(p: PaysOption) {
    setPaysSelectionne(p);
    majChamp('ville', '');
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur('');

    // Validation des champs qui ne sont pas de simples <input required>,
    // car react-select ne déclenche pas la validation HTML native.
    if (!paysSelectionne) {
      setErreur('Veuillez sélectionner votre pays.');
      return;
    }
    if (!form.numeroTelephone.trim()) {
      setErreur('Veuillez saisir votre numéro de téléphone.');
      return;
    }
    if (!form.ville) {
      setErreur('Veuillez sélectionner votre ville.');
      return;
    }

    setChargement(true);
    try {
      await register({
        nom: form.nom,
        // Le numéro complet envoyé à l'API combine l'indicatif du pays
        // sélectionné et le numéro local saisi par l'utilisateur (espaces
        // retirés pour un format homogène, ex: +2250700000000).
        telephone: `${paysSelectionne.indicatif}${form.numeroTelephone.replace(/\s+/g, '')}`,
        email: form.email,
        entreprise: form.entreprise,
        motDePasse: form.motDePasse,
        ville: form.ville,
        pays: paysSelectionne.nom,
      });
    } catch (err: any) {
      // L'API NestJS renvoie soit une chaîne, soit un tableau de messages
      // de validation (class-validator) dans data.message.
      const messageApi = err?.response?.data?.message;
      if (Array.isArray(messageApi)) {
        setErreur(messageApi.join(' '));
      } else if (typeof messageApi === 'string') {
        setErreur(messageApi);
      } else if (err?.request) {
        // La requête a été envoyée mais aucune réponse reçue (API hors
        // ligne, CORS, etc.)
        setErreur('Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.');
      } else {
        setErreur('Une erreur est survenue lors de l\'inscription.');
      }
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Panneau visuel masqué sur mobile */}
      <AuthVisual
        titre="Donnez à votre activité la crédibilité qu'elle mérite"
        description="En quelques minutes, créez votre compte et commencez à construire votre historique financier et votre Score BCX."
        image="https://images.unsplash.com/photo-1604881991720-f91add269bed?q=80&w=1200&auto=format&fit=crop"
        imageAlt="Entrepreneur africain s'inscrivant sur BCX Finance depuis son téléphone"
      />

      {/* Formulaire — scrollable sur mobile */}
      <div className="flex-1 flex items-start lg:items-center justify-center px-4 py-10 overflow-y-auto">
        <div className="w-full max-w-lg pb-6">
          {/* En-tête mobile uniquement */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-primaire">
              <span className="w-10 h-10 rounded-bouton bg-primaire text-white flex items-center justify-center">
                <Wallet size={20} />
              </span>
              BCX Finance
            </Link>
          </div>

          {/* Lien retour (desktop) */}
          <Link href="/" className="hidden lg:inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primaire transition-colors mb-8">
            <ArrowLeft size={14} />
            Retour à l&apos;accueil
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Créer un compte</h1>
            <p className="text-gray-500 mt-2">Gratuit, sans engagement. Vous pourrez changer de formule à tout moment.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Nom complet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={form.nom}
                  onChange={(e) => majChamp('nom', e.target.value)}
                  placeholder="Aïcha Koné"
                  className="w-full pl-11 pr-4 py-3.5 rounded-bouton border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaire focus:border-primaire transition-shadow"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pays : recherche + sélection, met à jour l'indicatif et les villes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pays</label>
                <CountrySelect
                  valeur={paysSelectionne}
                  onChange={onChangePays}
                />
              </div>

              {/* Téléphone : indicatif + drapeau automatiques selon le pays */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                <PhoneInput
                  pays={paysSelectionne}
                  numero={form.numeroTelephone}
                  onChange={(v) => majChamp('numeroTelephone', v)}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => majChamp('email', e.target.value)}
                    placeholder="aicha@exemple.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-bouton border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaire focus:border-primaire transition-shadow"
                  />
                </div>
              </div>

              {/* Entreprise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Entreprise</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={form.entreprise}
                    onChange={(e) => majChamp('entreprise', e.target.value)}
                    placeholder="Boutique Aïcha"
                    className="w-full pl-11 pr-4 py-3.5 rounded-bouton border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaire focus:border-primaire transition-shadow"
                  />
                </div>
              </div>

              {/* Ville : liste dépendante du pays sélectionné (pleine largeur, comme le mot de passe) */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
                <CitySelect
                  codePays={paysSelectionne?.code ?? null}
                  valeur={form.ville}
                  onChange={(v) => majChamp('ville', v)}
                />
              </div>

              {/* Mot de passe */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                <PasswordInput
                  required
                  minLength={6}
                  value={form.motDePasse}
                  onChange={(e) => majChamp('motDePasse', e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {erreur && (
              <p className="text-depense text-sm bg-depense/5 border border-depense/20 rounded-bouton px-3 py-2">{erreur}</p>
            )}

            <button
              type="submit"
              disabled={chargement}
              className="w-full bg-primaire text-white font-semibold py-3.5 rounded-bouton hover:bg-[#15492c] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:translate-y-0 shadow-lg shadow-primaire/20 mt-2"
            >
              {chargement && <Loader2 className="animate-spin" size={18} />}
              Créer mon compte
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-primaire font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
