// Seed des catégories par défaut pour BCX Finance
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { nom: 'Vente', type: 'recette' as const, emoji: '🛒' },
    { nom: 'Prestation', type: 'recette' as const, emoji: '💼' },
    { nom: 'Stock', type: 'depense' as const, emoji: '📦' },
    { nom: 'Loyer', type: 'depense' as const, emoji: '🏠' },
    { nom: 'Transport', type: 'depense' as const, emoji: '🚗' },
    { nom: 'Salaires', type: 'depense' as const, emoji: '👥' },
    { nom: 'Services', type: 'depense' as const, emoji: '🔧' },
    { nom: 'Autre', type: 'depense' as const, emoji: '➕' },
  ];

  for (const categorie of categories) {
    const existe = await prisma.category.findFirst({
      where: { nom: categorie.nom, type: categorie.type },
    });
    if (!existe) {
      await prisma.category.create({ data: categorie });
    }
  }

  console.log('Catégories par défaut créées avec succès.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
