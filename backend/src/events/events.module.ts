// Events module: Register the events API and its data provider dependencies.

import { Module } from '@nestjs/common';
import { DataProvidersModule } from '../data-providers/data-providers.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  // Import racing data providers
  imports: [DataProvidersModule],

  // Register the events controller and service
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
