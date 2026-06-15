import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Garde global : protège les routes en exigeant un access token JWT valide
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
