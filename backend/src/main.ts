// Entry point: Create, configure, and start the NestJS application.

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow browser requests from the local and deployed frontends
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://motorsporttracker.netlify.app',
    ],
  });

  // Use the environment port or default to 3001
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

bootstrap();
