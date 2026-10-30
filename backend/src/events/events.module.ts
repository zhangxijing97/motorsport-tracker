import { RacingController } from '../racing/racing.controller';
import { RacingService } from '../racing/racing.service';
// Events module: Register the events API and its data provider dependencies.

import { Module } from '@nestjs/common';
import { DataProvidersModule } from '../data-providers/data-providers.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  // Import racing data providers
  imports: [DataProvidersModule],

  // Register the events controller and service
  controllers: [EventsController, RacingController],
  providers: [EventsService, RacingService],
})
export class EventsModule {}
