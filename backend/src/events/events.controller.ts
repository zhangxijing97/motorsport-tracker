import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('events/today')
  getTodayEvents(
    @Query('date') date?: string,
    @Query('series') series?: string,
  ) {
    return this.eventsService.getEventsByDate(date, series);
  }

  @Get('events/upcoming')
  getUpcomingEvents(
    @Query('date') date?: string,
    @Query('series') series?: string,
  ) {
    return this.eventsService.getUpcomingEvents(date, series);
  }

  @Get('events/live')
  getLiveEvents(
    @Query('date') date?: string,
    @Query('series') series?: string,
  ) {
    return this.eventsService.getLiveEvents(date, series);
  }

  @Get('events/past')
  getPastEvents(
    @Query('date') date?: string,
    @Query('series') series?: string,
  ) {
    return this.eventsService.getPastEvents(date, series);
  }

  @Get('events/:id')
  getEventById(
    @Param('id') id: string,
    @Query('series') series?: string,
  ) {
    return this.eventsService.getEventById(id, series);
  }

  @Get('sessions/:id/detail')
  getSessionDetail(
    @Param('id') id: string,
    @Query('series') series?: string,
  ) {
    return this.eventsService.getSessionDetailById(id, series);
  }
}
