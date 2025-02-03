import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-02-04',
        startTime: '14:30',
        endTime: '15:30',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-02-04',
        startTime: '14:30',
        endTime: '15:30',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
        category: '이벤트 2 카테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
    ];
    const result = getFilteredEvents(events, '이벤트 2', new Date(), 'week');
    expect(result).toEqual([events[1]]);
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-06-01',
        startTime: '14:30',
        endTime: '15:30',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2024-07-01',
        startTime: '14:30',
        endTime: '15:30',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
        category: '이벤트 2 카테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
    ];
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'week');
    expect(result).toEqual([events[1]]);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '14:30',
        endTime: '15:30',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
    ];
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(result).toEqual([events[0]]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '14:30',
        endTime: '15:30',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
    ];
    const result = getFilteredEvents(events, '이벤트', new Date('2024-07-01'), 'week');
    expect(result).toEqual([events[0]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '14:30',
        endTime: '15:30',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2024-07-01',
        startTime: '14:30',
        endTime: '15:30',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
        category: '이벤트 2 카테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
    ];
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'week');
    expect(result).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: 'event 1',
        date: '2024-07-01',
        startTime: '14:30',
        endTime: '15:30',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
    ];
    const result = getFilteredEvents(events, 'Event 1', new Date('2024-07-01'), 'week');
    expect(result).toEqual([events[0]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '14:30',
        endTime: '15:30',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
    ];
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(result).toEqual([events[0]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [];
    const result = getFilteredEvents(events, '', new Date(), 'week');
    expect(result).toEqual([]);
  });
});
