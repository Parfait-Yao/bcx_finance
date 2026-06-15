import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Module global : PrismaService disponible dans toute l'application sans réimport
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
