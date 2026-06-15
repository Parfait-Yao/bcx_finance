import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateTransactionDto } from './create-transaction.dto';

// DTO de synchronisation offline : reçoit un lot de transactions en attente
export class SyncTransactionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionDto)
  transactions: CreateTransactionDto[];
}
