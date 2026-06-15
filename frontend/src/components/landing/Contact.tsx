'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';

// Section "Contactez-nous" : informations de contact + formulaire de message
export default function Contact() {
  const [envoi, setEnvoi] = useState<'idle' | 'chargement' | 'envoye'>('idle');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi('chargement');
    // Simulation d'envoi : à remplacer par un appel API réel (ex: /api/contact)
    setTimeout(() => setEnvoi('envoye'), 1200);
  }

  return (
    <section id="contact" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-accent font-semibold text-sm uppercase tracking-wide">Contact</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">
            Une question ? Parlons-en
          </h2>
          <p className="text-gray-500 mt-4">
            Notre équipe vous répond sous 24h, du lundi au vendredi.
            Vous pouvez aussi utiliser l&apos;assistant IA en bas de l&apos;écran
            pour une réponse immédiate.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 bg-fond rounded-carte p-6 sm:p-10">

          {/* Coordonnées */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-start gap-3">
              <span className="w-11 h-11 rounded-bouton bg-primaire/10 text-primaire flex items-center justify-center shrink-0">
                <Mail size={20} />
              </span>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-semibold text-gray-900">contact@bcxfinance.africa</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-11 h-11 rounded-bouton bg-primaire/10 text-primaire flex items-center justify-center shrink-0">
                <Phone size={20} />
              </span>
              <div>
                <p className="text-sm text-gray-400">Téléphone</p>
                <p className="font-semibold text-gray-900">+225 07 00 00 00 00</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-11 h-11 rounded-bouton bg-primaire/10 text-primaire flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </span>
              <div>
                <p className="text-sm text-gray-400">Adresse</p>
                <p className="font-semibold text-gray-900">Abidjan, Côte d&apos;Ivoire</p>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={onSubmit} className="lg:col-span-3 bg-white rounded-carte p-6 space-y-4 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  placeholder="Votre nom"
                  className="w-full px-4 py-3 rounded-bouton border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaire transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email ou téléphone</label>
                <input
                  type="text"
                  required
                  placeholder="vous@exemple.com"
                  className="w-full px-4 py-3 rounded-bouton border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaire transition-shadow"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
              <input
                type="text"
                required
                placeholder="Ex : Question sur les tarifs"
                className="w-full px-4 py-3 rounded-bouton border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaire transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                required
                rows={4}
                placeholder="Comment pouvons-nous vous aider ?"
                className="w-full px-4 py-3 rounded-bouton border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaire resize-none transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={envoi !== 'idle'}
              className="w-full bg-primaire text-white font-semibold py-3.5 rounded-bouton hover:bg-[#15492c] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:translate-y-0"
            >
              {envoi === 'chargement' && <Loader2 size={18} className="animate-spin" />}
              {envoi === 'envoye' && <CheckCircle2 size={18} />}
              {envoi === 'idle' && <Send size={18} />}
              {envoi === 'envoye' ? 'Message envoyé !' : 'Envoyer le message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
