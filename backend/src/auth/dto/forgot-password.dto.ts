import { IsEmail } from 'class-validator';

// DTO de demande de réinitialisation : seul l'email est nécessaire.
// (On ne révèle jamais si cet email existe ou non dans la réponse, pour
// éviter qu'un attaquant énumère les comptes existants.)
export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
