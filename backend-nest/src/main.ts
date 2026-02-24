import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookies parsen
  app.use(cookieParser());

  // CORS für Frontend mit Credentials
  app.enableCors({
    origin: 'http://localhost:3001', // z. B. dein Next.js-Frontend
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
