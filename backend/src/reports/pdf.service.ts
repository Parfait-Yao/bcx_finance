import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';

interface UserInfo {
  nom: string;
  telephone: string;
  entreprise: string;
  ville: string;
}

interface TransactionLigne {
  date: string;
  type: 'recette' | 'depense';
  categorie: string;
  description: string;
  montant: number;
}

interface InsightLigne {
  niveau: string;
  message: string;
}

interface DonneesRapportPdf {
  user: UserInfo;
  mois: number;
  annee: number;
  totalRecettes: number;
  totalDepenses: number;
  soldeNet: number;
  scoreBcx: number;
  transactions: TransactionLigne[];
  insights: InsightLigne[];
}

const NOMS_MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

// Formate un montant en "F CFA" avec séparateur de milliers (espace)
function formatMontant(valeur: number): string {
  const arrondi = Math.round(valeur);
  return `${arrondi.toLocaleString('fr-FR').replace(/,/g, ' ')} F CFA`;
}

function interpreterScore(score: number): string {
  if (score >= 70) return 'Bon';
  if (score >= 40) return 'Moyen';
  return 'À améliorer';
}

// Construit le HTML du rapport PDF conforme aux normes bancaires
function construireHtml(d: DonneesRapportPdf): string {
  const lignesTransactions = d.transactions
    .map(
      (t) => `
      <tr>
        <td>${t.date}</td>
        <td>${t.categorie}</td>
        <td>${t.description || '-'}</td>
        <td class="${t.type === 'recette' ? 'recette' : 'depense'}">
          ${t.type === 'recette' ? '+' : '-'} ${formatMontant(t.montant)}
        </td>
      </tr>`,
    )
    .join('');

  const lignesInsights = d.insights
    .map((i) => `<li><strong>[${i.niveau.toUpperCase()}]</strong> ${i.message}</li>`)
    .join('');

  const dateGeneration = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; color: #1a1a1a; font-size: 12px; padding: 24px; }
      h1 { color: #1A5C38; margin-bottom: 4px; }
      .sous-titre { color: #555; margin-bottom: 24px; }
      .bloc { margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; font-size: 11px; }
      th { background: #1A5C38; color: white; }
      .recette { color: #2E7D32; font-weight: bold; }
      .depense { color: #C62828; font-weight: bold; }
      .score-bloc { background: linear-gradient(135deg, #1A5C38, #2E7D32); color: white; padding: 16px; border-radius: 16px; margin-bottom: 16px; }
      .score-valeur { font-size: 28px; font-weight: bold; }
      .footer { margin-top: 32px; font-size: 10px; color: #888; border-top: 1px solid #ddd; padding-top: 8px; }
      .recap-table td:first-child { font-weight: bold; width: 50%; }
    </style>
  </head>
  <body>
    <h1>BCX Finance</h1>
    <div class="sous-titre">Rapport financier mensuel — ${NOMS_MOIS[d.mois - 1]} ${d.annee}</div>

    <div class="bloc">
      <h3>Identité du commerçant</h3>
      <table class="recap-table">
        <tr><td>Nom</td><td>${d.user.nom}</td></tr>
        <tr><td>Téléphone</td><td>${d.user.telephone}</td></tr>
        <tr><td>Entreprise</td><td>${d.user.entreprise}</td></tr>
        <tr><td>Ville</td><td>${d.user.ville}</td></tr>
      </table>
    </div>

    <div class="bloc">
      <h3>Récapitulatif financier</h3>
      <table class="recap-table">
        <tr><td>Total des recettes</td><td class="recette">${formatMontant(d.totalRecettes)}</td></tr>
        <tr><td>Total des dépenses</td><td class="depense">${formatMontant(d.totalDepenses)}</td></tr>
        <tr><td>Solde net</td><td>${formatMontant(d.soldeNet)}</td></tr>
      </table>
    </div>

    <div class="score-bloc">
      <div>Score BCX</div>
      <div class="score-valeur">${d.scoreBcx} / 100 — ${interpreterScore(d.scoreBcx)}</div>
    </div>

    <div class="bloc">
      <h3>Transactions du mois</h3>
      <table>
        <thead>
          <tr><th>Date</th><th>Catégorie</th><th>Description</th><th>Montant</th></tr>
        </thead>
        <tbody>${lignesTransactions || '<tr><td colspan="4">Aucune transaction enregistrée</td></tr>'}</tbody>
      </table>
    </div>

    <div class="bloc">
      <h3>Insights</h3>
      <ul>${lignesInsights || '<li>Aucun insight généré pour ce mois.</li>'}</ul>
    </div>

    <div class="footer">
      Document généré par BCX Finance le ${dateGeneration}.
    </div>
  </body>
  </html>`;
}

const DOSSIER_STORAGE = path.join(process.cwd(), 'storage', 'reports');

@Injectable()
export class PdfService {
  /**
   * Génère le PDF du rapport mensuel avec Puppeteer et le sauvegarde sur disque.
   * Retourne le chemin relatif du fichier généré.
   */
  async genererPdfRapport(reportId: string, donnees: DonneesRapportPdf): Promise<string> {
    if (!fs.existsSync(DOSSIER_STORAGE)) {
      fs.mkdirSync(DOSSIER_STORAGE, { recursive: true });
    }

    const html = construireHtml(donnees);
    const nomFichier = `rapport-${reportId}.pdf`;
    const cheminAbsolu = path.join(DOSSIER_STORAGE, nomFichier);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: cheminAbsolu,
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
      });
    } finally {
      await browser.close();
    }

    return path.join('storage', 'reports', nomFichier);
  }

  cheminAbsoluDepuisRelatif(cheminRelatif: string): string {
    return path.join(process.cwd(), cheminRelatif);
  }
}
