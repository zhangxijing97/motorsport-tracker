import { Module } from '@nestjs/common';
import { DataProvidersModule } from '../data-providers/data-providers.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [DataProvidersModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
