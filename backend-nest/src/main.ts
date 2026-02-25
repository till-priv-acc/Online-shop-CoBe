import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Session Middleware
  app.use(
    session({
      secret: 'geheimes-key',  // sicherer Key
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax', // reicht für Backend-only
        secure: false,   // true bei HTTPS
        maxAge: 1000 * 60 * 60 * 24, // 1 Tag
      },
    }),
  );

  // CORS für Frontend
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();
