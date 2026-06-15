'use client';

import { useState, InputHTMLAttributes } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

// Champ mot de passe avec icône de cadenas et bouton oeil pour
// afficher/masquer la saisie. Reprend exactement le style des autres
// champs du formulaire (bordure, focus, padding).
export default function PasswordInput(props: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={
          props.className ??
          'w-full pl-11 pr-11 py-3.5 rounded-bouton border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaire focus:border-primaire transition-shadow'
        }
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
