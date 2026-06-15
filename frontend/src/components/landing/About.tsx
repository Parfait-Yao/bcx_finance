import { FileX2, FileCheck2, ArrowRight } from 'lucide-react';

// Section "À propos" : le problème vécu par les PME, et la solution BCX Finance
export default function About() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-14">
          <span className="text-accent font-semibold text-sm uppercase tracking-wide">À propos de BCX Finance</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">
            Votre comptabilité au quotidien, votre crédibilité pour demain
          </h2>
          <p className="text-gray-500 mt-4">
            Des milliers de commerçantes, artisans et prestataires gèrent encore leur activité
            sur papier. Sans preuve fiable de leur santé financière, l&apos;accès au crédit reste
            fermé. BCX Finance transforme vos saisies quotidiennes en un dossier solide,
            reconnu par les institutions financières.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Avant */}
          <div className="bg-fond rounded-carte p-7 border border-gray-100">
            <div className="w-12 h-12 rounded-bouton bg-depense/10 text-depense flex items-center justify-center mb-4">
              <FileX2 size={22} />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Avant BCX Finance</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li>• Cahiers de comptes éparpillés et incomplets</li>
              <li>• Aucune vision claire du solde réel</li>
              <li>• Demandes de crédit refusées, faute de preuves</li>
              <li>• Aucune alerte en cas de dérapage des dépenses</li>
            </ul>
          </div>

          {/* Après */}
          <div className="bg-gradient-to-br from-primaire to-[#2E7D32] rounded-carte p-7 text-white relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full" aria-hidden />
            <div className="w-12 h-12 rounded-bouton bg-white/15 flex items-center justify-center mb-4 relative">
              <FileCheck2 size={22} />
            </div>
            <h3 className="font-bold text-lg relative">Avec BCX Finance</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/85 relative">
              <li className="flex items-start gap-2"><ArrowRight size={14} className="mt-0.5 shrink-0 text-accent" /> Recettes et dépenses enregistrées en 10 secondes</li>
              <li className="flex items-start gap-2"><ArrowRight size={14} className="mt-0.5 shrink-0 text-accent" /> Solde, score et tendances visibles d&apos;un coup d&apos;œil</li>
              <li className="flex items-start gap-2"><ArrowRight size={14} className="mt-0.5 shrink-0 text-accent" /> Rapport PDF conforme aux normes bancaires</li>
              <li className="flex items-start gap-2"><ArrowRight size={14} className="mt-0.5 shrink-0 text-accent" /> Alertes intelligentes pour anticiper les risques</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
