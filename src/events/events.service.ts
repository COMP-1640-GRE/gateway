import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, filter } from 'rxjs';

export type EventTypes = 'dashboard';

@Injectable()
export class EventsService {
  private eventSub = new Subject<MessageEvent>();

  publish(type: string, data?: string | object): void {
    return this.eventSub.next({ type, data });
  }

  event(eventName: string): Observable<MessageEvent> {
    return this.eventSub
      .asObservable()
      .pipe(filter((event) => event.type === eventName));
  }

  dashboardEvent(): Observable<MessageEvent> {
    return this.event('dashboard');
  }
}
