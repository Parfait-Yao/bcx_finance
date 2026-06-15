import { IsNotEmpty, IsString } from 'class-validator';

// DTO de connexion : authentification par téléphone + mot de passe
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  telephone: string;

  @IsString()
  @IsNotEmpty()
  motDePasse: string;
}
