import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Décorateur @CurrentUser() : récupère l'utilisateur authentifié (injecté par JwtStrategy)
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
