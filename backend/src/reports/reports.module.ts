import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ScoringModule } from '../scoring/scoring.module';
import { InsightsService } from './insights.service';
import { AiAdviceService } from './ai-advice.service';
import { PdfService } from './pdf.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { TransactionChangedListener } from './transaction-changed.listener';

@Module({
  imports: [ScoringModule, NotificationsModule],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    InsightsService,
    AiAdviceService,
    PdfService,
    TransactionChangedListener,
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
