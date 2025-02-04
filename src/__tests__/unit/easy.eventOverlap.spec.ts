import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2024-07-01', '14:30');
    expect(result).toEqual(new Date('2024-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2024ㄴㅇㄹ', '14:30:00');
    expect(isNaN(result.getDate())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2024-07-01', '14:sdf');
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(isNaN(result.getDate())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      date: '2024-07-01',
      startTime: '14:30',
      endTime: '15:30',
      id: '1',
      title: 'Event 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const result = convertEventToDateRange(event);
    expect(result).toEqual({
      start: new Date('2024-07-01T14:30:00'),
      end: new Date('2024-07-01T15:30:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      date: '2024ㄴㅎㅈㄷ',
      startTime: '14:30',
      endTime: '15:30',
      id: '1',
      title: 'Event 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const result = convertEventToDateRange(event);
    expect(isNaN(result.start.getDate())).toBe(true);
    expect(isNaN(result.end.getDate())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      date: '2024-07-01',
      startTime: '14:ㅈㅂㄷㅅㅁㅇ ',
      endTime: '15:30',
      id: '1',
      title: 'Event 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const result = convertEventToDateRange(event);
    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(false);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      date: '2025-02-04',
      startTime: '14:30',
      endTime: '15:30',
      id: '1',
      title: 'Event 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const event2: Event = {
      date: '2025-02-04',
      startTime: '14:30',
      endTime: '15:30',
      id: '2',
      title: 'Event 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const result = isOverlapping(event1, event2);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      date: '2025-02-04',
      startTime: '14:30',
      endTime: '15:30',
      id: '1',
      title: 'Event 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const event2: Event = {
      date: '2025-02-03',
      startTime: '14:30',
      endTime: '15:30',
      id: '2',
      title: 'Event 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const result = isOverlapping(event1, event2);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const event1: Event = {
      date: '2025-02-04',
      startTime: '14:30',
      endTime: '15:30',
      id: '1',
      title: 'Event 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const event2: Event = {
      date: '2025-02-04',
      startTime: '14:30',
      endTime: '15:30',
      id: '2',
      title: 'Event 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const events = [event1, event2];
    const result = findOverlappingEvents(event1, events);
    expect(result).toEqual([event2]);
  });
  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const event1: Event = {
      date: '2025-02-04',
      startTime: '14:30',
      endTime: '15:30',
      id: '1',
      title: 'Event 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const event2: Event = {
      date: '2025-02-03',
      title: 'Event 2',
      startTime: '14:30',
      endTime: '15:30',
      id: '2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const events: Event[] = [event1];
    const result = findOverlappingEvents(event2, events);
    expect(result).toEqual([]);
  });
});
