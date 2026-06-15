import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sécurité : headers HTTP, compression Gzip, cookies httpOnly
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // CORS : autorise le frontend configuré, ainsi que tout port localhost
  // en développement (le serveur Next.js change parfois de port — 3000,
  // 3001, 3002... — si le port par défaut est déjà occupé).
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // requêtes sans Origin (ex: curl, Postman)
      const estLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
      if (origin === frontendUrl || estLocalhost) {
        return callback(null, true);
      }
      callback(new Error(`Origine non autorisée par CORS : ${origin}`));
    },
    credentials: true,
  });

  // Validation stricte de tous les DTOs entrants
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`BCX Finance backend démarré sur http://localhost:${port}/api`);
}
bootstrap();
