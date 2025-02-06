import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import {
  setupMockHandlerAppend,
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdateById,
} from './handlersUtils';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.

setupMockHandlerCreation(events as Event[]);

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json(events);
  }),

  http.post('/api/events', async ({ request }) => {
    const event = (await request.json()) as Event;
    const newEvent = { ...event, id: events.length + 1 };
    setupMockHandlerAppend(newEvent);
    return HttpResponse.json(newEvent);
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    const id = params.id as string;
    const updates = (await request.json()) as Record<string, unknown>;

    const updatedEvent = events.map((event) =>
      Number(event.id) === Number(id) ? ({ ...event, ...updates } as Event) : event
    );
    setupMockHandlerUpdateById(id, updatedEvent);
    return HttpResponse.json(updatedEvent);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const filteredEvents = events.filter((event) => Number(event.id) !== Number(id));
    setupMockHandlerDeletion(id);
    return HttpResponse.json(filteredEvents);
  }),
];
