import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';
const INITIAL_EVENTS = events as Event[];

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));
  await act(async () => {
    await result.current.fetchEvents(); // get요청 실행
  });
  expect(result.current.events).toEqual(INITIAL_EVENTS);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation(INITIAL_EVENTS);

  const newEvent: EventForm = {
    title: '기존 회의',
    date: '2024-10-15',
    startTime: '19:00',
    endTime: '20:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  console.log('====================================');
  console.log('test');
  console.log(result.current.events);
  console.log('====================================');

  expect(result.current.events).toEqual([
    ...INITIAL_EVENTS,
    { ...newEvent, id: expect.any(String) },
  ]);
});

it('기존 이벤트의 제목과 종료 시간을 새로운 값으로 업데이트하면 변경된 내용이 저장된다', async () => {
  const updateEvent: Event = {
    id: '1',
    title: '에라 모르겠다',
    date: '2024-10-15',
    startTime: '19:00',
    endTime: '23:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent(updateEvent);
  });

  expect(result.current.events).toEqual([updateEvent]);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(result.current.events).toEqual([]);
});

const toastFn = vi.fn();

//Chakra UI의 다른 기능(ex. Button, Box)은 실제 동작하도록 유지하면서,특정 기능(useToast)만 가짜(mock)로 대체하려고 함.
vi.mock('@chakra-ui/react', async () => {
  //Chakra UI 모듈 전체를 모킹..
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', async () => {
      return new HttpResponse(null, { status: 500 }); // 서버 에러 (500)
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({ title: '이벤트 로딩 실패', status: 'error' })
  );
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const updateEvent: Event = {
    id: '3',
    title: '에라 모르겠다',
    date: '2024-10-15',
    startTime: '19:00',
    endTime: '23:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  server.use(
    http.put('/api/events/:id', () => {
      return HttpResponse.json(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent(updateEvent);
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({ title: '일정 저장 실패', status: 'error' })
  );
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return HttpResponse.json(null, { status: 500 });
    })
  );
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({ title: '일정 삭제 실패', status: 'error' })
  );
});
