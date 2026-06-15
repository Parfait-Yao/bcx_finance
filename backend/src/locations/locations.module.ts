import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

// Module indépendant et testable : aucune dépendance externe (Prisma,
// etc.), uniquement des données statiques en mémoire.
@Module({
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
