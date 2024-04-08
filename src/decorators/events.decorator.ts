import { SetMetadata } from '@nestjs/common';
import { EventTypes } from 'src/events/events.service';

export const EVENTS_KEY = 'events_key';
export const Events = (...events: EventTypes[]) =>
  SetMetadata(EVENTS_KEY, events);
