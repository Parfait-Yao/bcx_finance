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

  // Télécharge le rapport en PDF (déclaré avant :mois/:annee pour éviter une collision de route)
  @Get(':id/pdf')
  async downloadPdf(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const cheminAbsolu = await this.reportsService.genererPdf(id, user.userId);
    res.download(cheminAbsolu);
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
