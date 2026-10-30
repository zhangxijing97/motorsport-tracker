import { APP_FILTER } from '@nestjs/core';
import { ApiErrorFilter } from './racing/api-error.filter';
// Root module: Configure and register the application's modules, controllers, and providers.

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    // Load environment variables and make configuration globally available
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Register the motorsport events module
    EventsModule,
  ],

  // Register the root controller and its service
  controllers: [AppController],
  providers: [AppService, { provide: APP_FILTER, useClass: ApiErrorFilter }],
})
export class AppModule {}
