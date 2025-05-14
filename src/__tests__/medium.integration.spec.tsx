import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';
import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event, EventForm } from '../types';

const renderApp = () => {
  return render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
};

const initialEvents: Event[] = [
  {
    category: '업무',
    date: '2025-05-04',
    id: '1',
    title: '생일',
    startTime: '10:00',
    endTime: '11:00',
    description: '생일이에여',
    location: '회의실 A',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];
beforeEach(async () => {
  await act(async () => {
    vi.setSystemTime(new Date('2025-05-01'));
    // renderApp();
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const _initialEvents = [...initialEvents];
    setupMockHandlerCreation(_initialEvents);

    const newEvent: EventForm = {
      title: '입력한 새로운 일정 정보 추가',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '입력한 새로운 일정 정보 추가 입니다.',
      location: '네이버',
      category: '개인',
      notificationTime: 10,
      repeat: {
        type: 'daily',
        interval: 1,
      },
    };

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categoryInput = screen.getByLabelText('카테고리');
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    const notificationTimeSelect = screen.getByLabelText('알림 설정');
    const repeatEventTypeSelect = screen.queryByLabelText('반복 유형');
    const repeatEventInterval = screen.queryByLabelText('반복 간격');
    const addEventButton = screen.getByTestId('event-submit-button');

    await userEvent.type(titleInput, newEvent.title);
    await userEvent.type(dateInput, newEvent.date);
    await userEvent.type(startTimeInput, newEvent.startTime);
    await userEvent.type(endTimeInput, newEvent.endTime);
    await userEvent.type(descriptionInput, newEvent.description);
    await userEvent.type(locationInput, newEvent.location);
    await userEvent.selectOptions(categoryInput, newEvent.category);
    await userEvent.selectOptions(notificationTimeSelect, newEvent.notificationTime.toString());
    await userEvent.click(repeatCheckbox);

    if (repeatEventTypeSelect) {
      await userEvent.selectOptions(repeatEventTypeSelect, newEvent.repeat.type);
    }
    if (repeatEventInterval) {
      await userEvent.type(repeatEventInterval, newEvent.repeat.interval.toString());
    }

    await userEvent.click(addEventButton);
    const eventList = screen.getByTestId('event-list');

    expect(within(eventList).getByText(newEvent.title)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const _initialEvents = [...initialEvents];
    setupMockHandlerUpdating(_initialEvents);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const updatedEvent: Event = {
      category: '개인',
      date: '2025-05-04',
      id: '1',
      title: '기존 일정의 세부 정보를 수정해보기',
      startTime: '10:00',
      endTime: '13:30',
      description: '두번째 설명입니다.',
      location: '회사 근처 식당',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(screen.getByText(initialEvents[0].location)).toBeInTheDocument();
    });

    const editButton = within(eventList).getAllByLabelText(/edit event/i);
    await userEvent.click(editButton[0]);

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categoryInput = screen.getByLabelText('카테고리');
    const notificationTimeSelect = screen.getByLabelText('알림 설정');
    const repeatEventTypeSelect = screen.queryByLabelText('반복 유형');
    const repeatEventInterval = screen.queryByLabelText('반복 간격');

    const addEventButton = screen.getByTestId('event-submit-button');

    expect(titleInput).toHaveValue(initialEvents[0].title);
    expect(dateInput).toHaveValue(initialEvents[0].date);
    expect(startTimeInput).toHaveValue(initialEvents[0].startTime);
    expect(endTimeInput).toHaveValue(initialEvents[0].endTime);
    expect(descriptionInput).toHaveValue(initialEvents[0].description);
    expect(locationInput).toHaveValue(initialEvents[0].location);
    expect(categoryInput).toHaveValue(initialEvents[0].category);
    expect(notificationTimeSelect).toHaveValue(initialEvents[0].notificationTime.toString());

    if (repeatEventTypeSelect) {
      expect(repeatEventTypeSelect).toHaveValue(initialEvents[0].repeat.type);
    }
    if (repeatEventInterval) {
      expect(repeatEventInterval).toHaveValue(initialEvents[0].repeat.interval.toString());
    }

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, updatedEvent.title);

    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, updatedEvent.date);

    await userEvent.clear(startTimeInput);
    await userEvent.type(startTimeInput, updatedEvent.startTime);

    await userEvent.clear(endTimeInput);
    await userEvent.type(endTimeInput, updatedEvent.endTime);

    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, updatedEvent.description);

    await userEvent.clear(locationInput);
    await userEvent.type(locationInput, updatedEvent.location);

    await userEvent.selectOptions(categoryInput, updatedEvent.category);

    await userEvent.selectOptions(notificationTimeSelect, updatedEvent.notificationTime.toString());

    if (repeatEventTypeSelect) {
      await userEvent.selectOptions(repeatEventTypeSelect, updatedEvent.repeat.type);
    }
    if (repeatEventInterval) {
      await userEvent.type(repeatEventInterval, updatedEvent.repeat.interval.toString());
    }

    await userEvent.click(addEventButton);

    expect(within(eventList).getByText(updatedEvent.title)).toBeInTheDocument();
    expect(within(eventList).getByText(updatedEvent.date)).toBeInTheDocument();
    expect(
      within(eventList).getByText(updatedEvent.startTime, { exact: false })
    ).toBeInTheDocument();
    expect(within(eventList).getByText(updatedEvent.endTime, { exact: false })).toBeInTheDocument();
    expect(within(eventList).getByText(updatedEvent.description)).toBeInTheDocument();
    expect(within(eventList).getByText(updatedEvent.location)).toBeInTheDocument();
    expect(
      within(eventList).getByText(updatedEvent.category, { exact: false })
    ).toBeInTheDocument();
    expect(within(eventList).getByText(/10분 전/i)).toBeInTheDocument();

    if (repeatEventTypeSelect) {
      expect(repeatEventTypeSelect).toHaveValue(updatedEvent.repeat.type);
    }
    if (repeatEventInterval) {
      expect(repeatEventInterval).toHaveValue(updatedEvent.repeat.interval.toString());
    }
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {});
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {});

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {});

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {});

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {});

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {});
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {});

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {});

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {});
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {});

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {});
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {});
