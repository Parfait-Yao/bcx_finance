import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { SyncTransactionsDto } from './dto/sync-transactions.dto';
import {
  TRANSACTION_CHANGED_EVENT,
  TransactionChangedEvent,
} from '../common/events/transaction-changed.event';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // Émet l'événement de recalcul pour le mois/année d'une date donnée
  private emettreChangement(userId: string, date: Date) {
    this.eventEmitter.emit(
      TRANSACTION_CHANGED_EVENT,
      new TransactionChangedEvent(userId, date.getMonth() + 1, date.getFullYear()),
    );
  }

  // Création d'une transaction pour l'utilisateur authentifié
  async create(userId: string, dto: CreateTransactionDto) {
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: dto.type,
        montant: dto.montant,
        categorieId: dto.categorieId,
        description: dto.description,
        dateTransaction: new Date(dto.dateTransaction),
      },
    });
    this.emettreChangement(userId, transaction.dateTransaction);
    return transaction;
  }

  // Liste paginée, filtrable par mois/année/type — isolée par utilisateur
  async findAll(userId: string, query: QueryTransactionDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const where: any = { userId };

    if (query.type) where.type = query.type;

    if (query.mois && query.annee) {
      const debut = new Date(query.annee, query.mois - 1, 1);
      const fin = new Date(query.annee, query.mois, 0);
      where.dateTransaction = { gte: debut, lte: fin };
    } else if (query.annee) {
      where.dateTransaction = {
        gte: new Date(query.annee, 0, 1),
        lte: new Date(query.annee, 11, 31),
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { dateTransaction: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { categorie: { select: { nom: true, emoji: true } } },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Vérifie que la transaction appartient à l'utilisateur (isolation des données)
  private async verifierProprietaire(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction introuvable');
    if (transaction.userId !== userId) {
      throw new ForbiddenException('Accès interdit à cette transaction');
    }
    return transaction;
  }

  async update(id: string, userId: string, dto: UpdateTransactionDto) {
    const ancienne = await this.verifierProprietaire(id, userId);
    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...(dto.type && { type: dto.type }),
        ...(dto.montant !== undefined && { montant: dto.montant }),
        ...(dto.categorieId !== undefined && { categorieId: dto.categorieId }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.dateTransaction && { dateTransaction: new Date(dto.dateTransaction) }),
      },
    });

    // Invalide le mois de l'ancienne ET de la nouvelle date (si elle a changé)
    this.emettreChangement(userId, ancienne.dateTransaction);
    this.emettreChangement(userId, transaction.dateTransaction);
    return transaction;
  }

  async remove(id: string, userId: string) {
    const transaction = await this.verifierProprietaire(id, userId);
    await this.prisma.transaction.delete({ where: { id } });
    this.emettreChangement(userId, transaction.dateTransaction);
    return transaction;
  }

  /**
   * Synchronisation offline : enregistre en lot les transactions
   * accumulées hors connexion dans le localStorage du frontend.
   */
  async sync(userId: string, dto: SyncTransactionsDto) {
    const data = dto.transactions.map((t) => ({
      userId,
      type: t.type,
      montant: t.montant,
      categorieId: t.categorieId,
      description: t.description,
      dateTransaction: new Date(t.dateTransaction),
    }));

    const result = await this.prisma.transaction.createMany({ data });

    // Invalide tous les mois distincts concernés par le lot synchronisé
    const moisAnneesUniques = new Set(
      data.map((t) => `${t.dateTransaction.getMonth() + 1}-${t.dateTransaction.getFullYear()}`),
    );
    for (const cle of moisAnneesUniques) {
      const [mois, annee] = cle.split('-').map(Number);
      this.eventEmitter.emit(
        TRANSACTION_CHANGED_EVENT,
        new TransactionChangedEvent(userId, mois, annee),
      );
    }

    return { syncCount: result.count };
  }
}
