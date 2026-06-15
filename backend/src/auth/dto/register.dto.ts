import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

// DTO d'inscription : toutes les infos nécessaires pour créer un compte PME
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  telephone: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  entreprise: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  motDePasse: string;

  @IsString()
  @IsNotEmpty()
  ville: string;

  @IsString()
  @IsNotEmpty()
  pays: string;
}
