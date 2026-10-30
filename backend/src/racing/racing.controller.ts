import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { F1, meta, scopeMeta, type Envelope, type Event } from './model';
import { RacingService } from './racing.service';
import {
  dateParam,
  f1,
  integerParam,
  paging,
  seasonYear,
  textParam,
  validateKeys,
  yearParam,
  type QueryValues,
} from './query';
function page<T>(response: Envelope<T[]>, query: QueryValues): Envelope<T[]> {
  const { limit, offset } = paging(query);
  return {
    data: response.data.slice(offset, offset + limit),
    meta: {
      ...response.meta,
      pagination: { limit, offset, total: response.data.length },
    },
  };
}
@Controller('api/v1')
export class RacingController {
  constructor(private readonly racing: RacingService) {}
  @Get('series')
  series(@Query() query: QueryValues) {
    validateKeys(query, ['limit', 'offset']);
    return page({ data: [F1], meta: meta() }, query);
  }
  @Get('series/:id/seasons')
  async seasons(@Param('id') id: string, @Query() query: QueryValues) {
    f1(id);
    validateKeys(query, ['limit', 'offset']);
    paging(query);
    return page(await this.racing.seasons(), query);
  }
  @Get('events')
  async events(@Query() query: QueryValues) {
    validateKeys(query, ['seriesId', 'year', 'from', 'to', 'limit', 'offset']);
    f1(textParam(query, 'seriesId'));
    paging(query);
    const year = yearParam(
      textParam(query, 'year') ?? textParam(query, 'from')?.slice(0, 4),
    );
    const from = dateParam(textParam(query, 'from'), `${year}-01-01`);
    const to = dateParam(textParam(query, 'to'), `${year}-12-31`);
    const first = yearParam(from.slice(0, 4));
    const last = yearParam(to.slice(0, 4));
    if (
      from > to ||
      last - first > 1 ||
      (query.year && (first !== year || last !== year))
    )
      throw new BadRequestException(
        'Date range must be ordered, span at most two years and agree with year',
      );
    const responses: Envelope<Event[]>[] = [];
    for (let y = first; y <= last; y++)
      responses.push(await this.racing.calendar(y));
    const selected = responses
      .flatMap((r) => r.data)
      .filter((e) => e.startsOn <= to && e.endsOn >= from);
    return page(
      {
        data: selected,
        meta: scopeMeta(
          meta(
            responses.some((r) => r.meta.availability === 'partial')
              ? 'partial'
              : 'available',
            responses.flatMap((r) => r.meta.sources),
            responses.flatMap((r) => r.meta.warnings),
          ),
          selected.map((e) => e.id),
        ),
      },
      query,
    );
  }
  @Get('events/:id')
  event(@Param('id') id: string, @Query() query: QueryValues) {
    validateKeys(query, []);
    return this.racing.event(id);
  }
  @Get('sessions/:id')
  session(@Param('id') id: string, @Query() query: QueryValues) {
    validateKeys(query, []);
    return this.racing.session(id);
  }
  @Get('sessions/:id/results')
  results(@Param('id') id: string, @Query() query: QueryValues) {
    validateKeys(query, []);
    return this.racing.results(id);
  }
  @Get('sessions/:id/race-control')
  async raceControl(@Param('id') id: string, @Query() query: QueryValues) {
    validateKeys(query, ['limit', 'offset']);
    paging(query);
    return page(await this.racing.raceControl(id), query);
  }
  @Get('standings')
  async standings(@Query() query: QueryValues) {
    validateKeys(query, ['seasonId', 'type', 'round', 'limit', 'offset']);
    const year = seasonYear(textParam(query, 'seasonId'));
    const type = textParam(query, 'type') ?? 'drivers';
    if (type !== 'drivers' && type !== 'constructors')
      throw new BadRequestException('type must be drivers or constructors');
    const round =
      query.round === undefined
        ? undefined
        : integerParam(textParam(query, 'round'), 1, 1, 100);
    const { limit, offset } = paging(query);
    const response = await this.racing.standings(year, type, round);
    if (!response.data) return response;
    return {
      data: {
        ...response.data,
        rows: response.data.rows.slice(offset, offset + limit),
      },
      meta: {
        ...response.meta,
        pagination: { limit, offset, total: response.data.rows.length },
      },
    };
  }
}
