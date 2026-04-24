import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('events/today')
  getTodayEvents(@Query('date') date?: string) {
    return this.eventsService.getEventsByDate(date);
  }

  @Get('events/upcoming')
  getUpcomingEvents(@Query('date') date?: string) {
    return this.eventsService.getUpcomingEvents(date);
  }

  @Get('events/live')
  getLiveEvents(@Query('date') date?: string) {
    return this.eventsService.getLiveEvents(date);
  }

  @Get('events/past')
  getPastEvents(@Query('date') date?: string) {
    return this.eventsService.getPastEvents(date);
  }

  @Get('events/:id')
  getEventById(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

  @Get('sessions/:id/detail')
  getSessionDetail(@Param('id') id: string) {
    return this.eventsService.getSessionDetailById(id);
  }
}
