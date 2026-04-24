// bootstrap the app (create server + start listening)

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // create the app using AppModule

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://motorsporttracker.netlify.app',
    ],
  });
  // allow requests from these frontends only (browser)

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  // start server
}

bootstrap();
// run app
