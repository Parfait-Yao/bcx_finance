import { IsString, MinLength } from 'class-validator';

// DTO de réinitialisation : jeton reçu par email + nouveau mot de passe
export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  motDePasse: string;
}
