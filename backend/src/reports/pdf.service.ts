import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

// Types de données nécessaires pour construire le PDF
export interface UserInfoPdf {
  nom: string;
  telephone: string;
  entreprise: string;
  ville: string;
}

export interface TransactionPdf {
  date: string;
  type: 'recette' | 'depense';
  categorie: string;
  description: string;
  montant: number;
}

export interface InsightPdf {
  niveau: string;
  message: string;
}

export interface DonneesRapportPdf {
  user: UserInfoPdf;
  mois: number;
  annee: number;
  totalRecettes: number;
  totalDepenses: number;
  soldeNet: number;
  scoreBcx: number;
  transactions: TransactionPdf[];
  insights: InsightPdf[];
}

const NOMS_MOIS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
];

// Formate un montant avec des espaces comme séparateurs de milliers,
// sans dépendre de toLocaleString (dont le comportement varie selon
// la locale du serveur — sur Render/Linux peut produire des "/" ou ",").
function formatMontant(valeur: number): string {
  const entier = Math.round(valeur);
  const str = String(entier);
  const resultat = str.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${resultat} F CFA`;
}

function interpreterScore(score: number): string {
  if (score >= 70) return 'Bon';
  if (score >= 40) return 'Moyen';
  return 'A ameliorer';
}

// Couleurs de la charte BCX Finance
const VERT_PRIMAIRE = '#1A5C38';
const VERT_CLAIR = '#2E7D32';
const ROUGE = '#C62828';
const GRIS = '#666666';
const GRIS_CLAIR = '#F5F5F5';

@Injectable()
export class PdfService {
  /**
   * Génère le PDF du rapport en mémoire avec PDFKit (pas de Chromium,
   * pas de fichier sur disque — fonctionne sur Render plan gratuit).
   * Retourne un Buffer prêt à être envoyé en réponse HTTP.
   */
  async genererPdfRapport(donnees: DonneesRapportPdf): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const largeurPage = doc.page.width - 80; // marges 40px de chaque côté

      // ── EN-TÊTE ──
      doc.rect(0, 0, doc.page.width, 80).fill(VERT_PRIMAIRE);
      doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
        .text('BCX Finance', 40, 20);
      doc.fontSize(11).font('Helvetica')
        .text(`Rapport financier — ${NOMS_MOIS[donnees.mois - 1]} ${donnees.annee}`, 40, 48);
      doc.fillColor('#1a1a1a').moveDown(2);

      let y = 100;

      // ── IDENTITÉ ──
      doc.rect(40, y, largeurPage, 20).fill(GRIS_CLAIR);
      doc.fillColor(VERT_PRIMAIRE).fontSize(11).font('Helvetica-Bold')
        .text('Identite du commercant', 44, y + 5);
      y += 25;

      const infos = [
        ['Nom', donnees.user.nom],
        ['Telephone', donnees.user.telephone],
        ['Entreprise', donnees.user.entreprise],
        ['Ville', donnees.user.ville],
      ];

      for (const [label, valeur] of infos) {
        doc.fillColor(GRIS).fontSize(10).font('Helvetica').text(label, 44, y);
        doc.fillColor('#1a1a1a').text(valeur, 200, y);
        y += 18;
      }
      y += 10;

      // ── SCORE BCX ──
      doc.rect(40, y, largeurPage, 60).fill(VERT_PRIMAIRE);
      doc.fillColor('white').fontSize(11).font('Helvetica').text('Score BCX', 52, y + 8);
      doc.fontSize(22).font('Helvetica-Bold')
        .text(`${donnees.scoreBcx} / 100`, 52, y + 22);
      doc.fontSize(11).font('Helvetica')
        .text(interpreterScore(donnees.scoreBcx), 52, y + 44);
      y += 75;

      // ── RÉCAPITULATIF FINANCIER ──
      doc.rect(40, y, largeurPage, 20).fill(GRIS_CLAIR);
      doc.fillColor(VERT_PRIMAIRE).fontSize(11).font('Helvetica-Bold')
        .text('Recapitulatif financier', 44, y + 5);
      y += 25;

      const recap = [
        ['Total des recettes', formatMontant(donnees.totalRecettes), VERT_CLAIR],
        ['Total des depenses', formatMontant(donnees.totalDepenses), ROUGE],
        ['Solde net', formatMontant(donnees.soldeNet), '#1a1a1a'],
      ];

      for (const [label, valeur, couleur] of recap) {
        doc.fillColor(GRIS).fontSize(10).font('Helvetica').text(label, 44, y);
        doc.fillColor(couleur).font('Helvetica-Bold').text(valeur, 200, y);
        y += 18;
      }
      y += 10;

      // ── TRANSACTIONS ──
      if (y > doc.page.height - 150) { doc.addPage(); y = 40; }

      doc.rect(40, y, largeurPage, 20).fill(GRIS_CLAIR);
      doc.fillColor(VERT_PRIMAIRE).fontSize(11).font('Helvetica-Bold')
        .text('Transactions du mois', 44, y + 5);
      y += 25;

      // En-têtes du tableau
      const colX = [40, 120, 220, 330, 450];
      doc.rect(40, y, largeurPage, 18).fill(VERT_PRIMAIRE);
      doc.fillColor('white').fontSize(9).font('Helvetica-Bold');
      ['Date', 'Categorie', 'Description', 'Type', 'Montant'].forEach((col, i) => {
        doc.text(col, colX[i] + 2, y + 5);
      });
      y += 20;

      if (donnees.transactions.length === 0) {
        doc.fillColor(GRIS).fontSize(10).font('Helvetica')
          .text('Aucune transaction enregistree ce mois.', 44, y);
        y += 20;
      } else {
        for (const [i, t] of donnees.transactions.entries()) {
          if (y > doc.page.height - 60) { doc.addPage(); y = 40; }
          if (i % 2 === 0) doc.rect(40, y, largeurPage, 16).fill('#F9FAFB');
          doc.fillColor('#1a1a1a').fontSize(9).font('Helvetica');
          doc.text(t.date, colX[0] + 2, y + 3, { width: 75 });
          doc.text(t.categorie, colX[1] + 2, y + 3, { width: 95 });
          doc.text(t.description || '-', colX[2] + 2, y + 3, { width: 105 });
          doc.fillColor(t.type === 'recette' ? VERT_CLAIR : ROUGE)
            .text(t.type === 'recette' ? 'Recette' : 'Depense', colX[3] + 2, y + 3);
          doc.fillColor(t.type === 'recette' ? VERT_CLAIR : ROUGE)
            .text(formatMontant(t.montant), colX[4] + 2, y + 3);
          y += 17;
        }
      }
      y += 10;

      // ── INSIGHTS ──
      if (donnees.insights.length > 0) {
        if (y > doc.page.height - 100) { doc.addPage(); y = 40; }

        doc.rect(40, y, largeurPage, 20).fill(GRIS_CLAIR);
        doc.fillColor(VERT_PRIMAIRE).fontSize(11).font('Helvetica-Bold')
          .text('Insights', 44, y + 5);
        y += 25;

        for (const insight of donnees.insights) {
          if (y > doc.page.height - 40) { doc.addPage(); y = 40; }
          const niveauCouleur = insight.niveau === 'bon' ? VERT_CLAIR
            : insight.niveau === 'critique' ? ROUGE : '#E65100';
          doc.fillColor(niveauCouleur).fontSize(9).font('Helvetica-Bold')
            .text(`[${insight.niveau.toUpperCase()}]`, 44, y);
          doc.fillColor('#1a1a1a').font('Helvetica')
            .text(insight.message, 110, y, { width: largeurPage - 75 });
          y += 20;
        }
      }

      // ── PIED DE PAGE ──
      const date = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
      doc.fontSize(9).fillColor(GRIS)
        .text(`Document genere par BCX Finance le ${date}`, 40, doc.page.height - 40, {
          align: 'center',
          width: largeurPage,
        });

      doc.end();
    });
  }
}
