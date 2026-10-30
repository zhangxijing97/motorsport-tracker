import { Test } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
describe('legacy EventsController', () => {
  it('passes selected date and series and rejects repeated/unknown queries', async () => {
    const service = { getEventsByDate: jest.fn().mockResolvedValue([]) };
    const module = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: service }],
    }).compile();
    const controller = module.get(EventsController);
    await controller.getTodayEvents({ date: '2025-03-23', series: 'f1' });
    expect(service.getEventsByDate).toHaveBeenCalledWith('2025-03-23', 'f1');
    expect(() =>
      controller.getTodayEvents({ series: ['f1', 'nascar'] }),
    ).toThrow();
    expect(() => controller.getTodayEvents({ unexpected: 'x' })).toThrow();
  });
});
