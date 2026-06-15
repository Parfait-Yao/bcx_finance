import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Liste toutes les catégories (recettes + dépenses)
  findAll() {
    return this.prisma.category.findMany({ orderBy: { nom: 'asc' } });
  }
}
