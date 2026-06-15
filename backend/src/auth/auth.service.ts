import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const BCRYPT_ROUNDS = 12;

// Durée de validité d'un jeton de réinitialisation de mot de passe
const RESET_TOKEN_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // Inscription : hash du mot de passe puis création du compte
  async register(dto: RegisterDto) {
    const telephoneExiste = await this.prisma.user.findUnique({
      where: { telephone: dto.telephone },
    });
    if (telephoneExiste) {
      throw new BadRequestException('Ce numéro de téléphone est déjà utilisé');
    }

    const emailExiste = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (emailExiste) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    const motDePasseHash = await bcrypt.hash(dto.motDePasse, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        nom: dto.nom,
        telephone: dto.telephone,
        email: dto.email,
        entreprise: dto.entreprise,
        motDePasse: motDePasseHash,
        ville: dto.ville,
        pays: dto.pays,
      },
    });

    return this.genererTokens(user.id, user.telephone);
  }

  // Connexion : vérifie le téléphone + mot de passe, retourne les tokens
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { telephone: dto.telephone },
    });
    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    const motDePasseValide = await bcrypt.compare(dto.motDePasse, user.motDePasse);
    if (!motDePasseValide) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    return this.genererTokens(user.id, user.telephone);
  }

  // Rafraîchit l'access token à partir d'un refresh token valide
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      return this.genererTokens(payload.sub, payload.telephone);
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }

  // Génère un access token (15min) et un refresh token (7 jours)
  private async genererTokens(userId: string, telephone: string) {
    const payload = { sub: userId, telephone };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    });

    return { accessToken, refreshToken, userId };
  }

  /**
   * Demande de réinitialisation de mot de passe.
   *
   * Sécurité :
   * - Un jeton aléatoire de 32 octets (256 bits) est généré avec
   *   `crypto.randomBytes` (cryptographiquement sûr).
   * - Seul son HASH (SHA-256) est stocké en base — le jeton en clair
   *   n'existe que dans l'email envoyé à l'utilisateur. Une fuite de la
   *   base de données ne permet donc pas de réinitialiser un mot de passe.
   * - Le jeton expire après 15 minutes.
   * - La réponse est IDENTIQUE que l'email existe ou non (pas d'énumération
   *   de comptes) : on renvoie toujours un message générique.
   * - Les anciens jetons de l'utilisateur sont supprimés avant d'en créer
   *   un nouveau (un seul jeton actif à la fois).
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Ne révèle jamais si l'email existe : on s'arrête silencieusement.
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hasherToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRATION_MS);

    await this.prisma.$transaction([
      this.prisma.passwordReset.deleteMany({ where: { userId: user.id } }),
      this.prisma.passwordReset.create({ data: { userId: user.id, tokenHash, expiresAt } }),
    ]);

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const lien = `${baseUrl}/reset-password?token=${token}`;
    await this.mailService.envoyerEmailReinitialisation(user.email, lien);
  }

  /**
   * Réinitialise le mot de passe à partir d'un jeton valide (non expiré,
   * non utilisé). Le jeton est supprimé après usage (à usage unique),
   * qu'il s'agisse d'un succès — toute autre tentative avec le même jeton
   * échouera.
   */
  async resetPassword(token: string, nouveauMotDePasse: string): Promise<void> {
    const tokenHash = this.hasherToken(token);

    const reset = await this.prisma.passwordReset.findUnique({ where: { tokenHash } });
    if (!reset || reset.expiresAt < new Date()) {
      throw new BadRequestException('Lien de réinitialisation invalide ou expiré');
    }

    const motDePasseHash = await bcrypt.hash(nouveauMotDePasse, BCRYPT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: reset.userId }, data: { motDePasse: motDePasseHash } }),
      // Usage unique : le jeton est supprimé immédiatement après utilisation
      this.prisma.passwordReset.delete({ where: { id: reset.id } }),
    ]);
  }

  // Hash SHA-256 du jeton de réinitialisation (stocké en base, jamais le jeton en clair)
  private hasherToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
