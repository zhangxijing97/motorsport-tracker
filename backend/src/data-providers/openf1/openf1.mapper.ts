import { Injectable } from '@nestjs/common';
import { computeSessionStatus } from '../../common/date.util';
import type { Event, Session, SessionCategory } from '../../events/types';
import type { OpenF1Meeting, OpenF1Session } from './openf1.types';

@Injectable()
export class OpenF1Mapper {
  mapSessionTypeToCategory(
    sessionType: string,
    sessionName: string,
  ): SessionCategory {
    const type = sessionType.toLowerCase();
    const name = sessionName.toLowerCase();

    if (name.includes('sprint')) return 'sprint';
    if (type.includes('practice')) return 'practice';
    if (type.includes('qualifying')) return 'qualifying';
    if (type.includes('race')) return 'race';

    return 'other';
  }

  mapOpenF1SessionToSession(
    session: OpenF1Session,
    eventId: string,
  ): Session {
    return {
      id: `openf1-session-${session.session_key}`,
      eventId,
      name: session.session_name,
      category: this.mapSessionTypeToCategory(
        session.session_type,
        session.session_name,
      ),
      startTime: session.date_start,
      endTime: session.date_end,
      status: computeSessionStatus(
        session.date_start,
        session.date_end,
        session.is_cancelled,
      ),
    };
  }

  mapMeetingAndSessionsToEvent(
    meeting: OpenF1Meeting,
    sessions: OpenF1Session[],
  ): Event {
    const eventId = `openf1-${meeting.meeting_key}`;

    return {
      id: eventId,
      series: {
        id: 'f1',
        name: 'Formula 1',
        category: 'Single-Seater',
      },
      season: {
        id: `f1-${meeting.year}`,
        year: meeting.year,
        name: `${meeting.year} Formula 1 World Championship`,
      },
      eventName: meeting.meeting_name,
      country: meeting.country_name,
      location: meeting.location,
      venueName: meeting.circuit_short_name,
      dateStart: meeting.date_start,
      dateEnd: meeting.date_end,
      sessions: sessions.map((session) =>
        this.mapOpenF1SessionToSession(session, eventId),
      ),
    };
  }

  buildFallbackEventFromSession(session: OpenF1Session): Event {
    const eventId = `openf1-${session.meeting_key}`;

    return {
      id: eventId,
      series: {
        id: 'f1',
        name: 'Formula 1',
        category: 'Single-Seater',
      },
      season: {
        id: `f1-${session.year}`,
        year: session.year,
        name: `${session.year} Formula 1 World Championship`,
      },
      eventName: `${session.country_name} Grand Prix`,
      country: session.country_name,
      location: session.location,
      venueName: session.circuit_short_name,
      dateStart: session.date_start,
      dateEnd: session.date_end,
      sessions: [this.mapOpenF1SessionToSession(session, eventId)],
    };
  }
}
