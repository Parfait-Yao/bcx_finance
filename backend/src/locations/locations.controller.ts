import { Controller, Get, Param } from '@nestjs/common';
import { LocationsService } from './locations.service';

// Endpoints publics (pas de garde JWT) pour alimenter les champs
// Pays / Téléphone / Ville du formulaire d'inscription, accessibles
// avant même la connexion de l'utilisateur.
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('countries')
  listerPays() {
    return this.locationsService.listerPays();
  }

  @Get('countries/:code/cities')
  listerVilles(@Param('code') code: string) {
    return this.locationsService.listerVilles(code);
  }
}
