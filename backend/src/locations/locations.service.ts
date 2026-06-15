import { Injectable, NotFoundException } from '@nestjs/common';
import { PAYS } from './locations.data';

// Service "Locations" : expose la liste des pays couverts par BCX Finance
// (avec indicatif téléphonique et drapeau) et leurs villes principales.
// Données statiques en mémoire : pas besoin de base de données pour ces
// informations qui changent rarement.
@Injectable()
export class LocationsService {
  // Retourne la liste des pays, sans le détail des villes (allège la réponse)
  listerPays() {
    return PAYS.map(({ code, nom, drapeau, indicatif }) => ({
      code,
      nom,
      drapeau,
      indicatif,
    }));
  }

  // Retourne les villes d'un pays donné (recherche par code ISO)
  listerVilles(codePays: string) {
    const pays = PAYS.find((p) => p.code === codePays.toUpperCase());
    if (!pays) {
      throw new NotFoundException(`Pays inconnu : ${codePays}`);
    }
    return pays.villes;
  }
}
