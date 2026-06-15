'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  contenu: string;
}

const MESSAGE_BIENVENUE: Message = {
  role: 'assistant',
  contenu:
    'Bonjour 👋 Je suis l\u2019assistant BCX Finance. Posez-moi vos questions sur le Score BCX, les abonnements, le mode hors connexion ou la création de votre compte.',
};

const SUGGESTIONS = [
  'Comment fonctionne le Score BCX ?',
  'Quelle est la différence entre les plans ?',
  'Mes données sont-elles en sécurité ?',
];

// Widget d'assistance IA flottant : répond aux questions sur la plateforme
export default function AiAssistant() {
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState<Message[]>([MESSAGE_BIENVENUE]);
  const [saisie, setSaisie] = useState('');
  const [chargement, setChargement] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, ouvert]);

  async function envoyer(texte: string) {
    const contenu = texte.trim();
    if (!contenu || chargement) return;

    const nouveauxMessages: Message[] = [...messages, { role: 'user', contenu }];
    setMessages(nouveauxMessages);
    setSaisie('');
    setChargement(true);

    try {
      const { data } = await api.post('/assistant/ask', {
        // N'envoie pas le message de bienvenue initial dans l'historique
        messages: nouveauxMessages.filter((_, i) => i > 0 || nouveauxMessages.length === 1),
      });
      setMessages((prev) => [...prev, { role: 'assistant', contenu: data.reponse }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          contenu:
            "Désolé, je ne suis pas disponible pour le moment. Vous pouvez utiliser le formulaire de contact ci-dessus.",
        },
      ]);
    } finally {
      setChargement(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    envoyer(saisie);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Panneau de discussion */}
      <div
        className={`mb-3 w-[22rem] max-w-[calc(100vw-2.5rem)] bg-white rounded-carte shadow-2xl border border-gray-100 flex flex-col overflow-hidden origin-bottom-right transition-all duration-300 ease-out ${
          ouvert ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
        style={{ height: '28rem' }}
      >
        {/* En-tête */}
        <div className="bg-gradient-to-r from-primaire to-[#2E7D32] text-white px-4 py-3 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
            <Sparkles size={16} />
          </span>
          <div>
            <p className="font-semibold text-sm leading-tight">Assistant BCX Finance</p>
            <p className="text-xs text-white/70 leading-tight">Réponses sur la plateforme</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] text-sm rounded-bouton px-3 py-2 ${
                  m.role === 'user' ? 'bg-primaire text-white' : 'bg-fond text-gray-700'
                }`}
              >
                {m.contenu}
              </div>
            </div>
          ))}

          {chargement && (
            <div className="flex justify-start">
              <div className="bg-fond text-gray-400 rounded-bouton px-3 py-2 text-sm flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Réflexion...
              </div>
            </div>
          )}

          {/* Suggestions de questions (affichées tant que la conversation n'a pas commencé) */}
          {messages.length === 1 && !chargement && (
            <div className="flex flex-col gap-2 pt-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => envoyer(s)}
                  className="text-left text-xs text-primaire bg-primaire/5 hover:bg-primaire/10 rounded-bouton px-3 py-2 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={finRef} />
        </div>

        {/* Saisie */}
        <form onSubmit={onSubmit} className="border-t border-gray-100 p-3 flex items-center gap-2">
          <input
            type="text"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder="Posez votre question..."
            className="flex-1 px-3 py-2.5 rounded-bouton border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primaire"
          />
          <button
            type="submit"
            disabled={chargement || !saisie.trim()}
            aria-label="Envoyer"
            className="w-10 h-10 rounded-bouton bg-primaire text-white flex items-center justify-center hover:bg-[#15492c] transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Bouton flottant */}
      <button
        onClick={() => setOuvert((v) => !v)}
        aria-label={ouvert ? 'Fermer l\u2019assistant' : 'Ouvrir l\u2019assistant'}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-primaire to-[#2E7D32] text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform relative"
      >
        <span className={`absolute transition-all duration-300 ${ouvert ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}>
          <Sparkles size={24} />
        </span>
        <span className={`absolute transition-all duration-300 ${ouvert ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}>
          <X size={24} />
        </span>
      </button>
    </div>
  );
}
