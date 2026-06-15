import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';

// DTO de mise à jour : tous les champs sont optionnels
export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
