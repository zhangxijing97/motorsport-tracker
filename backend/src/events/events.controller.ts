import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { textParam, validateKeys, type QueryValues } from '../racing/query';
@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}
  private listQuery(q: QueryValues) {
    validateKeys(q, ['date', 'series']);
    return [textParam(q, 'date'), textParam(q, 'series')] as const;
  }
  @Get('events/today')
  getTodayEvents(@Query() q: QueryValues) {
    return this.eventsService.getEventsByDate(...this.listQuery(q));
  }
  @Get('events/upcoming')
  getUpcomingEvents(@Query() q: QueryValues) {
    return this.eventsService.getUpcomingEvents(...this.listQuery(q));
  }
  @Get('events/live')
  getLiveEvents(@Query() q: QueryValues) {
    return this.eventsService.getLiveEvents(...this.listQuery(q));
  }
  @Get('events/past')
  getPastEvents(@Query() q: QueryValues) {
    return this.eventsService.getPastEvents(...this.listQuery(q));
  }
  @Get('events/:id')
  getEventById(@Param('id') id: string, @Query() q: QueryValues) {
    validateKeys(q, ['series']);
    return this.eventsService.getEventById(id, textParam(q, 'series'));
  }
  @Get('sessions/:id/detail')
  getSessionDetail(@Param('id') id: string, @Query() q: QueryValues) {
    validateKeys(q, ['series']);
    return this.eventsService.getSessionDetailById(id, textParam(q, 'series'));
  }
}
