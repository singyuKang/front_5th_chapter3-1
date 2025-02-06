import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';
const mockEvents: Event[] = [
  {
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
  },
];
it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(mockEvents));

  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.useFakeTimers();

  const mockDateTime = new Date(mockEvents[0].date + `T18:58`);
  vi.setSystemTime(mockDateTime);
  const { result } = renderHook(() => useNotifications(mockEvents));
  expect(formatDate(new Date())).toBe('2024-10-15');
  expect(parseHM(new Date().getTime())).toBe('18:58');
  expect(result.current.notifications).toEqual([]);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications(mockEvents));
  result.current.removeNotification(0);
  expect(result.current.notifications).toEqual([]);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-10-15T18:58'));
  const { result } = renderHook(() => useNotifications(mockEvents));
  //처음 알림 발생
  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  //발생한 알림 개수 확인
  expect(result.current.notifications).toHaveLength(1);
  //발생한 알림 아이디 확인
  expect(result.current.notifiedEvents).toContain('1');

  //1분 돌리고
  await act(async () => {
    vi.advanceTimersByTime(60000);
  });

  //발생한 알림 개수 확인 (여전히 1개인지)
  expect(result.current.notifications).toHaveLength(1);
});
