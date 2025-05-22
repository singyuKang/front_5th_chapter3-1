# 7주차 테스트 과제

## 난이도 선택 가이드

### Easy

- https://github.com/hanghae-plus/front_5th_chapter3-1/tree/easy
- 테스트를 처음 작성해보시는 분들을 위한 과제입니다. 가벼운 유틸함수, 훅 기반 단위 테스트를 작성해보면서 컴포넌트를 개선해보세요.
- 모든 테스트케이스, 설정이 제공됩니다.
- 작성을 해보고 피어 리뷰와 멘토들의 피드백을 받아보세요!
- **하지만, 모두 통과를 하더라도 합격을 받을 수는 없습니다. 가능하면 이 난이도를 선택하지 마세요**

### Medium

- https://github.com/hanghae-plus/front_5th_chapter3-1/tree/medium
- Easy에 비해 추가로 작성할 여러 통합 테스트가 존재합니다.
- PR template에 있는 여러 질문에 답을 해보면서 문제를 풀어보세요
- **Best가 불가능합니다**

### Hard

- https://github.com/hanghae-plus/front_5th_chapter3-1/tree/hard
- Medium과 동일한 TC를 작성하지만, 과제를 작성하기 위한 여러가지 설정을 제공드리지 않습니다.
- PR template에 있는 여러 질문에 답을 해보면서 문제를 풀어보세요!
- **적절하게 목적에 맞게 작성하셨을 경우 Best가 가능합니다.**


# HARD

## 7주차 과제 체크포인트

### 기본과제

- [x] 총 11개의 파일, 115개의 단위 테스트를 무사히 작성하고 통과시킨다.

### 심화 과제

- [x] App 컴포넌트 적절한 단위의 컴포넌트, 훅, 유틸 함수로 분리했는가?
- [x] 해당 모듈들에 대한 적절한 테스트를 5개 이상 작성했는가?

#### 질문

> Q. handlersUtils에 남긴 질문에 답변해주세요.

```javascript
let eventStore = [] as Event[];
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  eventStore = initEvents;
};
```
![스크린샷 2025-05-16 오전 9 13 48](https://github.com/user-attachments/assets/8ab428e3-744f-413a-a8fc-0180b341dcda)

초기에 주어진 코드를 그대로 사용을 하게 되면은 각 테스트 마다 `eventStore` 상태를 공유하게 됩니다 .

각 테스트마다 `eventStore`에 접근을 하여 `생성, 업데이트, 삭제` 등등 작업을 진행을 하게 되면은 `병렬적으로 테스트를 진행`을 하게 되는것!

테스트 간 상태 공유로 인한 간섭 -> `테스트 작성자가 예측 불가능한 결과`

실제로 주어진 코드로  `useEventOperations`훅 구현시 테스트 순서에 따라 결과값이 달라지는 경험을 했습니다.

> Q. 테스트를 독립적으로 구동시키기 위해 작성했던 설정들을 소개해주세요.

`클린코드 주차`에서 함수를 작성할때 순수함수로 작성하는 이유를 생각해 보면 `함수내에서의 상태를 보장`해주기 때문입니다. 

외부요인을 신경쓰다보면 `테스트 코드도 길어지고` `예상하지 못한 오류` 발생할 가능성이 높아짐을 경험

여기서 테스트가 `독립적`으로 구동시키기 위해서는 각 테스트 마다 `상태를 격리` 시켜주는 것이 중요하다고 생각했습니다.

![스크린샷 2025-05-16 오전 9 24 43](https://github.com/user-attachments/assets/648f7203-3971-48ec-b8da-14dcc8de2885)

`CreateHandler`를 통해 각 테스트마다 네트워크 요청을 가로채고 제가 지정한 이벤트들을 반환해주도록 하고

`Server.use`를 통해 어떠한 요청을 가로챌지 설정을 해주었습니다.

```javascript
  const initialEvent: Event = {
    category: '업무',
    date: '2025-05-10',
    id: '1',
    title: '팀 회의',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  setupMockHandlerCreation([initialEvent]);

export const setupMockHandlerCreation = (initEvents: Event[] = []) => {
  const mockEvents: Event[] = [...initEvents];
  const createHandlers = [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = String(mockEvents.length + 1);
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    }),
  ];

  server.use(...createHandlers);
};

```

`어떠한 Event`를 반환해 줄것인지 + `어떠한 요청을 가로챌지`에 대한 설정을 하는 식으로 구현했습니다.


## 과제 셀프회고

## 초기상태 테스트

초기상태값에 대한 테스트를 진행을 하면은
```jsx
describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    assertDate(result.current.currentDate, new Date('2025-10-01'));
  });

  it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.holidays['2025-10-03']).toBe('개천절');
    expect(result.current.holidays['2025-10-09']).toBe('한글날');
  });
});
```

아래 단계 테스트 진행할때 위에서 진행했던 초기상태 판단하는 테스트들을 할 필요가 없어집니다
```jsx
//여기에서 result의 초기상태 'month'를 테스트할 필요가 없어짐
//expect(result.current.view).toBe('month') -> 당연히 초기값은 month니깐 이에대한 비용을 줄일수있음
it("setView 함수를 사용하여 초기상태 'month'를 'week'으로 변경할 수 있다", () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView('week');
  });
  expect(result.current.view).toBe('week');
});
```

## 정확한 상태 체크

저는 `getWeekDates` 같은 함수는 "정확도"가 중요하다고 생각이 들어서 모든 수를 비교하는 식으로 진행했습니다!
실제로 수요일에 해당하는 "정확한 날짜"가 중요하다고 생각이들어서 아래와 같은 테스트 코드를 작성했습니다.
```javascript
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2025-05-14'));
    expect(weekDates).toEqual([
      new Date('2025-05-11'),
      new Date('2025-05-12'),
      new Date('2025-05-13'),
      new Date('2025-05-14'),
      new Date('2025-05-15'),
      new Date('2025-05-16'),
      new Date('2025-05-17'),
    ]);
  });
```


## 내가 상황을 컨트롤 할 수 있을떄

아래와 같이 내가 상황을 정의할수 있을때는 갯수를 비교하는 식으로 진행했습니다!

```javascript
const HOLIDAY_RECORD = {
  '2025-01-01': '신정',
  '2025-01-29': '설날',
  '2025-01-30': '설날',
  '2025-01-31': '설날',
  '2025-03-01': '삼일절',
  '2025-05-05': '어린이날',
  '2025-06-06': '현충일',
  '2025-08-15': '광복절',
  '2025-10-05': '추석',
  '2025-10-06': '추석',
  '2025-10-07': '추석',
  '2025-10-03': '개천절',
  '2025-10-09': '한글날',
  '2025-12-25': '크리스마스',
};
  it('주어진 월의 공휴일만 반환한다', () => {
    const result = fetchHolidays(new Date('2025-10-01'));
    expect(Object.keys(result)).toHaveLength(5);
  });
```

`HOLIDAY_RECORD` 라는 휴가를 이미 내가 정의 해놓은 상태에서 

당연하게 `10월이면은 5개의 휴일`이 있으니(내가 만들어 놓은 상황)` 5를 반환받으면은 올바른 작동`으로 판단하였습니다.

## 애매한 표현 제거

```javascript
// week으로 적절하게 변영보다 자세히 작성
it("setView 함수를 사용하여 초기상태 'month'를 'week'으로 변경할 수 있다", () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView('week');
  });
  expect(result.current.view).toBe('week');
});
```
적절하게 보다는 `정확하게 어떻게 되었는지`를 작성하려 하였습니다.

## 시나리오 체크

```javascript
  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const weekEvent: Event[] = [
      {
        category: '업무',
        date: '2025-05-03',
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
    setupMockHandlerCreation([...weekEvent]);

    renderApp();

    // 초기 상태 확인(기본값이 month인지 확인)
    const viewSelect = screen.getByLabelText('view');
    expect(viewSelect).toHaveValue('month');

    //week 변환 처리("week로 반드시 변환이 됨"을 검증해야 아래있는 expect가 의미있음)
    await userEvent.selectOptions(viewSelect, 'week');
    expect(viewSelect).toHaveValue('week');

    //week변환이 되었는지 확인을 안해주면은 그냥 pass가 되어버림
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText(/생일이에여/)).toBeInTheDocument();
  });
```
주별 뷰로 변경이 되었는지를 확인을 안하면은

```javascript
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText(/생일이에여/)).toBeInTheDocument();
```
이 테스트는 그냥 통과가 되어버리기 때문에

`초기값 month -> week로 변환`해주는 것을 확인해주어야 합니다.


## 컴포넌트 분리

`테스트 코드`가 작성되어 있다보니 컴포넌트 분리하는 속도가 굉장히 빨라져 `공격적인 리팩토링`이 가능했습니다.

```javascript
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventEditor
          title={title}
          setTitle={setTitle}
          date={date}
          setDate={setDate}
          startTime={startTime}
          endTime={endTime}
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
          category={category}
          setCategory={setCategory}
          isRepeating={isRepeating}
          setIsRepeating={setIsRepeating}
          repeatType={repeatType}
          setRepeatType={setRepeatType}
          repeatInterval={repeatInterval}
          setRepeatInterval={setRepeatInterval}
          repeatEndDate={repeatEndDate}
          setRepeatEndDate={setRepeatEndDate}
          notificationTime={notificationTime}
          setNotificationTime={setNotificationTime}
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          editingEvent={editingEvent}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          addOrUpdateEvent={addOrUpdateEvent}
          categories={categories}
          notificationOptions={notificationOptions}
        />
        <CalendarView
          view={view}
          setView={setView}
          currentDate={currentDate}
          holidays={holidays}
          navigate={navigate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
        />

        <EventList
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          notificationOptions={notificationOptions}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
        />
      </Flex>

      <OverlapDialog
        isOpen={isOverlapDialogOpen}
        onClose={closeOverlapDialog}
        overlappingEvents={overlappingEvents}
        cancelRef={cancelRef}
        onContinue={handleContinueOverlap}
      />

      <NotificationList
        notifications={notifications}
        onCloseNotification={handleCloseNotification}
      />
    </Box>
```
![스크린샷 2025-05-16 오전 10 59 39](https://github.com/user-attachments/assets/ba2a8089-b21f-4fbd-8884-3fcbabd8955a)







## 리뷰 받고 싶은 내용

## 내가 상황을 컨트롤 할 수 있을떄

아래와 같이 내가 상황을 정의할수 있을때는 `갯수`를 비교하는 식으로 진행했습니다!

```javascript
const HOLIDAY_RECORD = {
  '2025-01-01': '신정',
  '2025-01-29': '설날',
  '2025-01-30': '설날',
  '2025-01-31': '설날',
  '2025-03-01': '삼일절',
  '2025-05-05': '어린이날',
  '2025-06-06': '현충일',
  '2025-08-15': '광복절',
  '2025-10-05': '추석',
  '2025-10-06': '추석',
  '2025-10-07': '추석',
  '2025-10-03': '개천절',
  '2025-10-09': '한글날',
  '2025-12-25': '크리스마스',
};
  it('주어진 월의 공휴일만 반환한다', () => {
    const result = fetchHolidays(new Date('2025-10-01'));
    expect(Object.keys(result)).toHaveLength(5);
  });
```
에서 상황을 가정을 할수 있을때는 간단하게 비교를 진행하였는데요
이 방식이 맞는 방식인지 궁금합니다!
정확도가 중요한 상황 or 상황을 가정할 수 있는 상황 -> 이 두개로 판단해도 되는것인지

이를 통한 코치님만의 테스트코드 작성하는 법이 궁금합니다!

---

신규님, 고퀄의 PR문서 잘 보았습니다!! 저도 배울게 많았네요!

----

질문주신것도 실무에서 많이 고민하는 문제여서 저도 생각을 해보는 계기가 되어 좋았습니다. 일단 이 케이스를 보자마자 드는 생각은 국제화 대응을 할때 지금 코드는 꽤나 불편하겠구나라는 생각이 먼저 들었고... 이 생각을 차치하고 질문주신부분, 테스트 대상의 출력 범위와 제어 가능성이 클때 출력 갯수만으로 검증해도 괜찮을까라는 부분에만 포커스해서 답변드려볼게요.

우리는 한국인이고 정부가 뻘짓을 하지 않는 이상 (임시공휴일 지정이나 있던 공휴일 없애거나, 없던 공휴일 갑자기 사회 논의 없이 만드는것들..) 언제 어떤 공휴일이 있다는건 명백하기 때문에(입력/출력 통제가 명확함) 지금 하신것처럼 갯수만 비교해도 괜찮습니다.

근데 아시겠지만 90년대는 없었던 임시공휴일(설/추석이 주말 끼면 이어지는 평일은 임시공휴일 지정)관련한 정책이 지금시대는 행안부에서 내려오기때문에.. 지금 케이스 자체는 length만으로 하기엔 크게 무리가 있긴해요. time관련한게 제일 테스트 짜기가 어렵더라구요 저는.

정리를 해보자면, 만약 해당 서비스가 공휴일 관련한 변경에 예민하다고 하면 지금과 같은 방식은 테스트가 깨질 확률이 높기 때문에 '구조'까지 비교하는 방향으로 개선해야 한다가 됩니다. 외부(정부, 외국 정부, 다른회사)정책은 우리가 상황을 가정할 수 없으니까 그런 경우는 구조를 비교해야한다! 이렇게 정리해볼게요.


