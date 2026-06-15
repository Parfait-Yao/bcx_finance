import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { NotificationsService } from '../notifications/notifications.service';

export interface ContexteConseilIA {
  userId: string;
  mois: number;
  annee: number;
  scoreActuel: number;
  scorePrecedent: number | null;
  totalRecettes: number;
  totalDepenses: number;
  soldeNet: number;
  joursSaisie: number;
  joursDansLeMois: number;
}

/**
 * Service d'analyse IA contextuelle (Score BCX + actions du mois).
 *
 * Utilise l'API Anthropic (Claude) pour générer un message court,
 * personnalisé et en français, encourageant ou alertant l'utilisateur
 * selon l'évolution de son Score BCX et de sa situation financière.
 *
 * Si la clé API n'est pas configurée ou si l'appel échoue, un message
 * de repli basé sur des règles simples est utilisé (le service reste
 * donc toujours fonctionnel, sans dépendance bloquante).
 */
@Injectable()
export class AiAdviceService {
  private readonly logger = new Logger(AiAdviceService.name);
  private readonly client: Anthropic | null;

  constructor(private notificationsService: NotificationsService) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
  }

  /**
   * Génère et enregistre un conseil/alerte IA personnalisé sous forme de
   * notification (type "ia_conseil") pour l'utilisateur.
   */
  async genererConseil(ctx: ContexteConseilIA): Promise<void> {
    const message = this.client
      ? await this.genererAvecClaude(ctx).catch((error) => {
          this.logger.warn(`Appel à l'API Anthropic échoué, repli sur les règles : ${error.message}`);
          return this.genererMessageDeRepli(ctx);
        })
      : this.genererMessageDeRepli(ctx);

    if (!message) return;

    await this.notificationsService.create(ctx.userId, 'ia_conseil', message);
  }

  // Construit le prompt et appelle l'API Anthropic pour un conseil sur-mesure
  private async genererAvecClaude(ctx: ContexteConseilIA): Promise<string | null> {
    if (!this.client) return null;

    const evolution =
      ctx.scorePrecedent === null
        ? 'Pas de score le mois précédent (premier rapport).'
        : `Score précédent : ${ctx.scorePrecedent}/100.`;

    const prompt = `Tu es un conseiller financier pour une application destinée aux PME africaines (BCX Finance).
Analyse la situation suivante et rédige UN SEUL message court (1 phrase, maximum 220 caractères),
en français, pour encourager ou alerter le commerçant selon l'évolution de son Score BCX.

Données du mois ${ctx.mois}/${ctx.annee} :
- Score BCX actuel : ${ctx.scoreActuel}/100
- ${evolution}
- Total recettes : ${Math.round(ctx.totalRecettes)} F CFA
- Total dépenses : ${Math.round(ctx.totalDepenses)} F CFA
- Solde net : ${Math.round(ctx.soldeNet)} F CFA
- Jours de saisie : ${ctx.joursSaisie}/${ctx.joursDansLeMois}

Règles :
- Si le score a augmenté ou est élevé (>= 70), félicite et encourage à continuer.
- Si le score a baissé ou est faible (< 40), alerte avec bienveillance et donne une piste d'amélioration concrète.
- Sinon, encourage la régularité.
- Ne donne pas de conseil d'investissement. Réponds uniquement avec le message, sans guillemets ni préambule.`;

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });

    const bloc = response.content.find((b) => b.type === 'text');
    if (!bloc || bloc.type !== 'text') return null;

    return bloc.text.trim().slice(0, 280);
  }

  /**
   * Message de repli basé sur des règles simples, utilisé si l'API
   * Anthropic n'est pas configurée ou indisponible.
   */
  private genererMessageDeRepli(ctx: ContexteConseilIA): string | null {
    const { scoreActuel, scorePrecedent } = ctx;

    // Évolution du score par rapport au mois précédent
    if (scorePrecedent !== null) {
      const ecart = scoreActuel - scorePrecedent;
      if (ecart >= 5) {
        return `Bravo ! Votre Score BCX progresse (${scorePrecedent} → ${scoreActuel}). Continuez ainsi, votre dossier de crédit se renforce.`;
      }
      if (ecart <= -5) {
        return `Attention : votre Score BCX a chuté (${scorePrecedent} → ${scoreActuel}). Pensez à saisir vos transactions plus régulièrement ce mois-ci.`;
      }
    }

    // Score globalement faible ou élevé, indépendamment de l'évolution
    if (scoreActuel >= 70) {
      return `Excellent score (${scoreActuel}/100) ! Votre gestion financière est solide, continuez sur cette lancée.`;
    }
    if (scoreActuel < 40) {
      return `Votre Score BCX est encore faible (${scoreActuel}/100). Saisissez vos recettes et dépenses chaque jour pour l'améliorer rapidement.`;
    }

    // Score moyen et stable : pas de message particulier
    return null;
  }
}
