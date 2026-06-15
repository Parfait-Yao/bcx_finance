import { IsEnum, IsISO8601, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export enum TypeTransactionDto {
  recette = 'recette',
  depense = 'depense',
}

// DTO de création d'une transaction (recette ou dépense)
export class CreateTransactionDto {
  @IsEnum(TypeTransactionDto)
  type: TypeTransactionDto;

  @IsNumber()
  @IsPositive()
  montant: number;

  @IsOptional()
  @IsUUID()
  categorieId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsISO8601()
  dateTransaction: string;
}
