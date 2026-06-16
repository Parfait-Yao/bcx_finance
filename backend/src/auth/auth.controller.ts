import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

// En production (domaines différents : vercel.app ≠ onrender.com), les
// cookies cross-site nécessitent sameSite: 'none' + secure: true.
// En développement (même origine localhost), sameSite: 'lax' suffit.
const estProduction = process.env.NODE_ENV === "production";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: estProduction,
  sameSite: (estProduction ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
};

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, userId } =
      await this.authService.register(dto);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken, userId };
  }

  // Limite à 5 tentatives / 15 min par IP pour contrer le brute-force
  @Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } })
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, userId } =
      await this.authService.login(dto);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken, userId };
  }

  @Post("refresh")
  async refresh(
    @Body("refreshToken") bodyToken: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    // Le refresh token est lu prioritairement depuis le cookie httpOnly
    const token = req?.cookies?.refreshToken || bodyToken;
    const { accessToken, refreshToken, userId } =
      await this.authService.refresh(token);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken, userId };
  }

  // Limite à 3 demandes / 15 min par IP : évite le spam d'emails et le
  // brute-force sur l'énumération d'adresses email.
  @Throttle({ default: { limit: 3, ttl: 15 * 60 * 1000 } })
  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    // Message volontairement générique : ne révèle jamais si l'email existe
    return { message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." };
  }

  @Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } })
  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.motDePasse);
    return { message: "Mot de passe réinitialisé avec succès." };
  }
}
