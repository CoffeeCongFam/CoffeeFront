const orderHistoryList = [
  // 1개월 이내 (2025년 10월 8일 ~ 2025년 11월 7일)
  {
    orderId: 50,
    createdAt: "2025-11-07T18:41:22.44749Z",
    subscriptionName: "골드",
    storeName: "카페 리즈",
    orderStatus: "COMPLETED", // 수령 완료
    storeImg: "https://picsum.photos/id/60/100/70",
    menuList: [{ menuName: "아이스 아메리카노", quantity: 1 }],
  },
  {
    orderId: 49,
    createdAt: "2025-11-05T11:05:51.265765Z",
    subscriptionName: "실버",
    storeName: "커피인터뷰 본점",
    orderStatus: "READY", // 준비 완료
    storeImg: "https://picsum.photos/id/160/100/70",
    menuList: [{ menuName: "바닐라 라떼", quantity: 1 }, { menuName: "크로플", quantity: 1 }],
  },
  {
    orderId: 48,
    createdAt: "2025-11-01T09:46:36.412863Z",
    subscriptionName: "브론즈",
    storeName: "올데이 커피",
    orderStatus: "PREPARING", // 준비 중
    storeImg: "https://picsum.photos/id/260/100/70",
    menuList: [{ menuName: "따뜻한 카페라떼", quantity: 1 }],
  },
  {
    orderId: 47,
    createdAt: "2025-10-28T15:32:22.055605Z",
    subscriptionName: "골드",
    storeName: "카페 리즈",
    orderStatus: "CANCELED", // 취소
    storeImg: "https://picsum.photos/id/60/100/70",
    menuList: [{ menuName: "아이스 아메리카노", quantity: 2 }],
  },
  {
    orderId: 46,
    createdAt: "2025-10-25T14:57:17.248908Z",
    subscriptionName: "실버",
    storeName: "커피인터뷰 본점",
    orderStatus: "COMPLETED",
    storeImg: "https://picsum.photos/id/160/100/70",
    menuList: [{ menuName: "딸기 스무디", quantity: 1 }],
  },
  {
    orderId: 45,
    createdAt: "2025-10-20T14:56:46.976622Z",
    subscriptionName: "브론즈",
    storeName: "올데이 커피",
    orderStatus: "READY",
    storeImg: "https://picsum.photos/id/260/100/70",
    menuList: [{ menuName: "콜드브루", quantity: 1 }],
  },
  {
    orderId: 44,
    createdAt: "2025-10-15T13:45:09.425386Z",
    subscriptionName: "골드",
    storeName: "카페 리즈",
    orderStatus: "PREPARING",
    storeImg: "https://picsum.photos/id/60/100/70",
    menuList: [{ menuName: "카모마일 티", quantity: 1 }],
  },
  {
    orderId: 43,
    createdAt: "2025-10-10T09:17:17.315301Z",
    subscriptionName: "실버",
    storeName: "커피인터뷰 본점",
    orderStatus: "CANCELED",
    storeImg: "https://picsum.photos/id/160/100/70",
    menuList: [{ menuName: "아이스티", quantity: 1 }],
  },
  {
    orderId: 42,
    createdAt: "2025-10-09T17:51:21.937865Z",
    subscriptionName: "브론즈",
    storeName: "올데이 커피",
    orderStatus: "COMPLETED",
    storeImg: "https://picsum.photos/id/260/100/70",
    menuList: [{ menuName: "아이스 아메리카노", quantity: 1 }],
  },
  {
    orderId: 41,
    createdAt: "2025-10-08T18:39:24.134283Z",
    subscriptionName: "골드",
    storeName: "카페 리즈",
    orderStatus: "READY",
    storeImg: "https://picsum.photos/id/60/100/70",
    menuList: [{ menuName: "에스프레소", quantity: 1 }],
  },
  // 1년 이내 (2024년 11월 8일 ~ 2025년 10월 7일)
  {
    orderId: 40,
    createdAt: "2025-09-29T10:11:55.123456Z",
    subscriptionName: "실버",
    storeName: "커피인터뷰 본점",
    orderStatus: "PREPARING",
    storeImg: "https://picsum.photos/id/160/100/70",
    menuList: [{ menuName: "녹차 라떼", quantity: 1 }],
  },
  {
    orderId: 39,
    createdAt: "2025-09-15T12:20:00.000000Z",
    subscriptionName: "브론즈",
    storeName: "올데이 커피",
    orderStatus: "CANCELED",
    storeImg: "https://picsum.photos/id/260/100/70",
    menuList: [{ menuName: "카페 모카", quantity: 1 }],
  },
  // ... 나머지 항목은 유사하게 업데이트 가능
  {
    orderId: 38,
    createdAt: "2025-08-30T20:45:10.555888Z",
    subscriptionName: "골드",
    storeName: "카페 리즈",
    orderStatus: "COMPLETED",
    storeImg: "https://picsum.photos/id/60/100/70",
    menuList: [{ menuName: "아이스 아메리카노", quantity: 1 }],
  },
  {
    orderId: 37,
    createdAt: "2025-08-10T08:00:30.999111Z",
    subscriptionName: "실버",
    storeName: "커피인터뷰 본점",
    orderStatus: "READY",
    storeImg: "https://picsum.photos/id/160/100/70",
    menuList: [{ menuName: "자몽 에이드", quantity: 1 }],
  },
  {
    orderId: 36,
    createdAt: "2025-07-25T16:30:45.000123Z",
    subscriptionName: "브론즈",
    storeName: "올데이 커피",
    orderStatus: "PREPARING",
    storeImg: "https://picsum.photos/id/260/100/70",
    menuList: [{ menuName: "핫초코", quantity: 1 }],
  },
  {
    orderId: 35,
    createdAt: "2025-07-01T14:00:00.000000Z",
  },
  {
    orderId: 34,
    createdAt: "2025-06-15T11:50:50.111222Z",
  },
  {
    orderId: 33,
    createdAt: "2025-05-28T19:25:30.333444Z",
  },
  {
    orderId: 32,
    createdAt: "2025-05-10T07:40:20.555666Z",
  },
  {
    orderId: 31,
    createdAt: "2025-04-22T13:15:15.777888Z",
  },
  {
    orderId: 30,
    createdAt: "2025-04-05T09:05:05.999000Z",
  },
  {
    orderId: 29,
    createdAt: "2025-03-20T17:55:40.123456Z",
  },
  {
    orderId: 28,
    createdAt: "2025-03-01T10:00:00.000000Z",
  },
  {
    orderId: 27,
    createdAt: "2025-02-14T15:30:30.234567Z",
  },
  {
    orderId: 26,
    createdAt: "2025-01-28T11:45:45.345678Z",
  },
  {
    orderId: 25,
    createdAt: "2025-01-10T08:10:10.456789Z",
  },
  {
    orderId: 24,
    createdAt: "2024-12-25T19:50:50.567890Z",
  },
  {
    orderId: 23,
    createdAt: "2024-12-05T14:20:20.678901Z",
  },
  {
    orderId: 22,
    createdAt: "2024-11-20T16:40:40.789012Z",
  },
  {
    orderId: 21,
    createdAt: "2024-11-08T12:00:00.890123Z",
  },
  // 2년 이내 (2023년 11월 8일 ~ 2024년 11월 7일)
  {
    orderId: 20,
    createdAt: "2024-10-30T09:35:15.111222Z",
  },
  {
    orderId: 19,
    createdAt: "2024-10-15T18:00:00.333444Z",
  },
  {
    orderId: 18,
    createdAt: "2024-09-28T13:45:30.555666Z",
  },
  {
    orderId: 17,
    createdAt: "2024-09-10T07:20:00.777888Z",
  },
  {
    orderId: 16,
    createdAt: "2024-08-25T15:55:55.999000Z",
  },
  {
    orderId: 15,
    createdAt: "2024-08-01T11:30:10.123456Z",
  },
  {
    orderId: 14,
    createdAt: "2024-07-15T19:10:20.234567Z",
  },
  {
    orderId: 13,
    createdAt: "2024-06-28T14:45:45.345678Z",
  },
  {
    orderId: 12,
    createdAt: "2024-06-10T10:25:50.456789Z",
  },
  {
    orderId: 11,
    createdAt: "2024-05-25T17:00:00.567890Z",
  },
  {
    orderId: 10,
    createdAt: "2024-05-01T08:50:35.678901Z",
  },
  {
    orderId: 9,
    createdAt: "2024-04-15T16:30:50.789012Z",
  },
  {
    orderId: 8,
    createdAt: "2024-03-30T12:10:25.890123Z",
  },
  {
    orderId: 7,
    createdAt: "2024-03-10T19:40:40.012345Z",
  },
  {
    orderId: 6,
    createdAt: "2024-02-20T14:55:15.123456Z",
  },
  {
    orderId: 5,
    createdAt: "2024-02-01T10:30:30.234567Z",
  },
  {
    orderId: 4,
    createdAt: "2024-01-15T18:15:45.345678Z",
  },
  {
    orderId: 3,
    createdAt: "2023-12-28T13:40:00.456789Z",
  },
  {
    orderId: 2,
    createdAt: "2023-12-10T09:25:20.567890Z",
  },
  {
    orderId: 1,
    createdAt: "2023-11-08T17:50:05.678901Z",
  },
];

export default orderHistoryList;