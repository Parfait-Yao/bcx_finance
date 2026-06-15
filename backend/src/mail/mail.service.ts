import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/**
 * Service d'envoi d'emails (réinitialisation de mot de passe, etc.).
 *
 * Si les variables SMTP_HOST / SMTP_USER / SMTP_PASS sont configurées dans
 * .env, les emails sont envoyés via ce serveur SMTP. Sinon (environnement
 * de développement sans SMTP configuré), le contenu de l'email est
 * simplement affiché dans les logs du serveur — ce qui permet de tester
 * le flux de réinitialisation de mot de passe sans dépendance externe.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporteur: nodemailer.Transporter | null;

  constructor() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    this.transporteur = SMTP_HOST
      ? nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT || 587),
          secure: Number(SMTP_PORT) === 465,
          auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
        })
      : null;
  }

  async envoyerEmailReinitialisation(email: string, lienReinitialisation: string): Promise<void> {
    const sujet = 'Réinitialisation de votre mot de passe BCX Finance';
    const texte = [
      'Vous avez demandé la réinitialisation de votre mot de passe BCX Finance.',
      '',
      `Cliquez sur ce lien pour choisir un nouveau mot de passe : ${lienReinitialisation}`,
      '',
      'Ce lien est valable 15 minutes et ne peut être utilisé qu\'une seule fois.',
      'Si vous n\'êtes pas à l\'origine de cette demande, ignorez simplement cet email.',
    ].join('\n');

    if (!this.transporteur) {
      // Pas de SMTP configuré : on journalise le lien pour pouvoir tester
      // le flux en développement sans dépendance externe.
      this.logger.warn(
        `SMTP non configuré — lien de réinitialisation pour ${email} : ${lienReinitialisation}`,
      );
      return;
    }

    await this.transporteur.sendMail({
      from: process.env.SMTP_FROM || 'BCX Finance <no-reply@bcxfinance.com>',
      to: email,
      subject: sujet,
      text: texte,
    });
  }
}
