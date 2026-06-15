import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TypeTransactionDto } from './create-transaction.dto';

// DTO de requête pour lister les transactions (pagination + filtres)
export class QueryTransactionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  mois?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  annee?: number;

  @IsOptional()
  @IsEnum(TypeTransactionDto)
  type?: TypeTransactionDto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
