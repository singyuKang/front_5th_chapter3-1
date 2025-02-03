import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    const result = getDaysInMonth(2024, 1);
    expect(result).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const result = getDaysInMonth(2024, 4);
    expect(result).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const result = getDaysInMonth(2024, 2);
    expect(result).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const result = getDaysInMonth(2025, 2);
    expect(result).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    const testCase1 = { year: 2025, month: 13 };
    const testCase2 = { year: 2025, month: -14 };
    const testCase3 = { year: 2025, month: 0 };

    const result1 = getDaysInMonth(testCase1.year, testCase1.month);
    const result2 = getDaysInMonth(testCase2.year, testCase2.month);
    const result3 = getDaysInMonth(testCase3.year, testCase3.month);

    const normalizeMonth = (year: number, month: number) => {
      let normalizedYear;
      let normalizedMonth;
      if (month > 12) {
        normalizedYear = year + Math.floor(month / 12);
        normalizedMonth = month % 12;
      } else if (month < 0) {
        normalizedYear = year - Math.floor(Math.abs(month) / 12);
        normalizedMonth = 0 - (Math.abs(month) % 12);
      } else if (month === 0) {
        normalizedYear = year - 1;
        normalizedMonth = 12;
      } else {
        normalizedYear = year;
        normalizedMonth = month;
      }
      return getDaysInMonth(normalizedYear, normalizedMonth);
    };

    expect(result1).toEqual(normalizeMonth(testCase1.year, testCase1.month));
    expect(result2).toEqual(normalizeMonth(testCase2.year, testCase2.month));
    expect(result3).toEqual(normalizeMonth(testCase3.year, testCase3.month));
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2024-07-03');
    const result = getWeekDates(date);
    expect(result).toEqual([
      new Date('2024-06-30'),
      new Date('2024-07-01'),
      new Date('2024-07-02'),
      new Date('2024-07-03'),
      new Date('2024-07-04'),
      new Date('2024-07-05'),
      new Date('2024-07-06'),
    ]);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2024-07-01');
    const result = getWeekDates(date);
    expect(result).toEqual([
      new Date('2024-06-30'),
      new Date('2024-07-01'),
      new Date('2024-07-02'),
      new Date('2024-07-03'),
      new Date('2024-07-04'),
      new Date('2024-07-05'),
      new Date('2024-07-06'),
    ]);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2024-07-07');
    const result = getWeekDates(date);
    expect(result).toEqual([
      new Date('2024-07-07'),
      new Date('2024-07-08'),
      new Date('2024-07-09'),
      new Date('2024-07-10'),
      new Date('2024-07-11'),
      new Date('2024-07-12'),
      new Date('2024-07-13'),
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date('2024-12-31');
    const result = getWeekDates(date);
    expect(result).toEqual([
      new Date('2024-12-29'),
      new Date('2024-12-30'),
      new Date('2024-12-31'),
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      new Date('2025-01-03'),
      new Date('2025-01-04'),
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date('2024-01-01');
    const result = getWeekDates(date);
    expect(result).toEqual([
      new Date('2023-12-31'),
      new Date('2024-01-01'),
      new Date('2024-01-02'),
      new Date('2024-01-03'),
      new Date('2024-01-04'),
      new Date('2024-01-05'),
      new Date('2024-01-06'),
    ]);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-29');
    const result = getWeekDates(date);
    expect(result).toEqual([
      new Date('2024-02-25'),
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'),
    ]);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-28');
    const result = getWeekDates(date);
    expect(result).toEqual([
      new Date('2024-02-25'),
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'),
    ]);
  });
});

describe('getWeeksAtMonth', () => {
  it('2024년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date('2024-07-01');
    const result = getWeeksAtMonth(date);
    expect(result).toEqual([
      [null, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
      [14, 15, 16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25, 26, 27],
      [28, 29, 30, 31, null, null, null],
    ]);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const date = new Date('2024-07-01').getDate();
    const events = [
      {
        date: new Date('2024-07-01'),
        title: 'Event 1',
        id: '1',
        startTime: '09:00',
        endTime: '10:00',
        description: 'Description 1',
        location: 'Location 1',
        category: 'Category 1',
        repeat: 'none',
        notificationTime: null,
      },
      {
        date: new Date('2024-07-02'),
        title: 'Event 2',
        id: '2',
        startTime: '10:00',
        endTime: '11:00',
        description: 'Description 2',
        location: 'Location 2',
        category: 'Category 2',
        repeat: 'none',
        notificationTime: null,
      },
    ];
    const result = getEventsForDay(events, date);
    expect(result).toEqual([
      {
        date: new Date('2024-07-01'),
        title: 'Event 1',
        repeat: 'none',
        notificationTime: null,
        id: '1',
        startTime: '09:00',
        endTime: '10:00',
        description: 'Description 1',
        location: 'Location 1',
        category: 'Category 1',
      },
    ]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const date = new Date('2024-07-01').getDate();
    const events = [{ date: new Date('2024-07-02'), title: 'Event 2' }];
    const result = getEventsForDay(events, date);
    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const date = new Date('').getDate();
    const events = [
      {
        date: new Date('2024-07-01'),
        title: 'Event 1',
        id: '1',
        startTime: '09:00',
        endTime: '10:00',
        description: 'Description 1',
        location: 'Location 1',
        category: 'Category 1',
        repeat: 'none',
        notificationTime: null,
      },
      {
        date: new Date('2024-07-02'),
        title: 'Event 2',
        id: '2',
        startTime: '10:00',
        endTime: '11:00',
        description: 'Description 2',
        location: 'Location 2',
        category: 'Category 2',
        repeat: 'none',
        notificationTime: null,
      },
    ];
    const result = getEventsForDay(events, date);
    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events = [{ date: new Date('2024-07-02'), title: 'Event 2' }];
    const result = getEventsForDay(events, 32);
    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-07-14');
    const result = formatWeek(date);
    expect(result).toBe(`2024년 7월 3주`);
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-07-01');
    const result = formatWeek(date);
    expect(result).toBe(`2024년 7월 1주`);
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-07-31');
    const result = formatWeek(date);
    expect(result).toBe(`2024년 8월 1주`);
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-12-31');
    const result = formatWeek(date);
    expect(result).toBe(`2025년 1월 1주`);
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-02-29');
    const result = formatWeek(date);
    expect(result).toBe(`2024년 2월 5주`);
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-02-28');
    const result = formatWeek(date);
    expect(result).toBe(`2025년 2월 4주`);
  });
});

describe('formatMonth', () => {
  it("2024년 7월 10일을 '2024년 7월'로 반환한다", () => {
    const date = new Date('2024-07-10');
    const result = formatMonth(date);
    expect(result).toBe(`2024년 7월`);
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2024-07-01');
  const rangeEnd = new Date('2024-07-31');

  it('범위 내의 날짜 2024-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-10');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 시작일 2024-07-01에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-01');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 종료일 2024-07-31에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-31');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2024-06-30에 대해 false를 반환한다', () => {
    const date = new Date('2024-06-30');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2024-08-01에 대해 false를 반환한다', () => {
    const date = new Date('2024-08-01');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const rangeStart = new Date('2024-07-31');
    const rangeEnd = new Date('2024-07-01');
    const result = isDateInRange(new Date('2024-07-10'), rangeStart, rangeEnd);
    expect(result).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const result = fillZero(5);
    expect(result).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const result = fillZero(10);
    expect(result).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const result = fillZero(3, 3);
    expect(result).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const result = fillZero(100, 2);
    expect(result).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const result = fillZero(0, 2);
    expect(result).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const result = fillZero(1, 5);
    expect(result).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const result = fillZero(3.14, 5);
    expect(result).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const result = fillZero(1);
    expect(result).toBe('01');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const result = fillZero(12345, 2);
    expect(result).toBe('12345');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date('2024-07-10');
    const result = formatDate(date);
    expect(result).toBe('2024-07-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2024-07-10');
    const result = formatDate(date, 1);
    expect(result).toBe('2024-07-01');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2024-07-10');
    const result = formatDate(date, 1);
    expect(result).toBe('2024-07-01');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2024-07-10');
    const result = formatDate(date, 1);
    expect(result).toBe('2024-07-01');
  });
});
