import { Controller, Get, Param, ParseIntPipe, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';

type AuthUser = { userId: string };

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  // Génère le PDF en mémoire et l'envoie directement en réponse HTTP
  // (pas de fichier sur disque — compatible avec les hébergeurs sans stockage persistant)
  @Get(':id/pdf')
  async downloadPdf(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reportsService.genererPdf(id, user.userId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="rapport-bcx-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  // Génère/retourne (cache 24h) le rapport mensuel avec score et insights
  @Get(':mois/:annee')
  getReport(
    @CurrentUser() user: AuthUser,
    @Param('mois', ParseIntPipe) mois: number,
    @Param('annee', ParseIntPipe) annee: number,
  ) {
    return this.reportsService.getOrGenerate(user.userId, mois, annee);
  }

}
