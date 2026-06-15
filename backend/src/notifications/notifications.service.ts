import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Liste des notifications de l'utilisateur, les plus récentes en premier
  findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Marque une notification comme lue (vérifie l'isolation des données)
  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification introuvable');
    if (notification.userId !== userId) {
      throw new ForbiddenException('Accès interdit à cette notification');
    }
    return this.prisma.notification.update({ where: { id }, data: { lu: true } });
  }

  // Création d'une notification (utilisée par le module reports lors des alertes auto)
  create(userId: string, type: string, message: string) {
    return this.prisma.notification.create({ data: { userId, type, message } });
  }

  // Supprime définitivement une notification (vérifie l'isolation des données)
  async remove(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification introuvable');
    if (notification.userId !== userId) {
      throw new ForbiddenException('Accès interdit à cette notification');
    }
    await this.prisma.notification.delete({ where: { id } });
    return { id };
  }
}
