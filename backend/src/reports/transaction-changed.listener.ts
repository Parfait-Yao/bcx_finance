import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  TRANSACTION_CHANGED_EVENT,
  TransactionChangedEvent,
} from '../common/events/transaction-changed.event';
import { ReportsService } from './reports.service';

/**
 * Écoute les changements de transactions et recalcule immédiatement
 * le rapport (score + insights + alertes) du mois concerné, afin que
 * le frontend affiche toujours des données à jour après un ajout,
 * une modification ou une suppression de transaction.
 */
@Injectable()
export class TransactionChangedListener {
  private readonly logger = new Logger(TransactionChangedListener.name);

  constructor(private reportsService: ReportsService) {}

  @OnEvent(TRANSACTION_CHANGED_EVENT, { async: true })
  async handle(event: TransactionChangedEvent) {
    try {
      await this.reportsService.recalculer(event.userId, event.mois, event.annee);
    } catch (error) {
      // Le recalcul ne doit jamais faire échouer la requête HTTP d'origine
      this.logger.error(
        `Échec du recalcul du rapport (${event.mois}/${event.annee}) pour l'utilisateur ${event.userId}`,
        error as Error,
      );
    }
  }
}
