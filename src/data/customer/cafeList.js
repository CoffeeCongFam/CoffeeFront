// 내 위치 ex) 강남역(37.4979, 127.0276) 기준 반경 약 2km 내 카페 리스트
const cafeList = [
  {
    storeId: 1,
    storeName: "카페 모나카",
    storeStatus: "OPEN",
    storeImage: "https://picsum.photos/400/400",
    roadAddress: "서울특별시 강남구 테헤란로 110",
    detailAddress: "지하 1층",
    xPoint: 37.501,      // 강남역보다 약간 위
    yPoint: 127.0272,
    // --- 구독 관련 ---
    subscriptionStock: 2,
    subscriberCount: 120,    // 🔢
    isSubscribed: true,      // ✅ 네가 구독 중인 걸로
    // --- 리뷰 관련 ---
    reviewCount: 68,
    averageRating: 4.7,
  },
  {
    storeId: 2,
    storeName: "어글리베이커 강남점",
    storeStatus: "CLOSED",
    storeImage: "https://picsum.photos/400/401",
    roadAddress: "서울특별시 강남구 강남대로94길 10",
    detailAddress: "1층",
    xPoint: 37.4991,
    yPoint: 127.0304,
    subscriptionStock: 5,
    subscriberCount: 95,
    isSubscribed: false,
    reviewCount: 34,
    averageRating: 4.3,
  },
  {
    storeId: 3,
    storeName: "카페 노티드 삼성점",
    storeStatus: "HOLIDAY",
    storeImage: "https://picsum.photos/400/402",
    roadAddress: "서울특별시 강남구 영동대로 513",
    detailAddress: "1층 101호",
    xPoint: 37.5082,     // 삼성역 쪽 → 멈
    yPoint: 127.063,
    subscriptionStock: 1,
    subscriberCount: 310,
    isSubscribed: false,
    reviewCount: 150,
    averageRating: 4.6,
  },
  {
    storeId: 4,
    storeName: "앤드테일 신논현점",
    storeStatus: "OPEN",
    storeImage: "https://picsum.photos/400/403",
    roadAddress: "서울특별시 서초구 강남대로 431",
    detailAddress: "2층",
    xPoint: 37.5048,
    yPoint: 127.023,
    subscriptionStock: 0, // 품절 테스트
    subscriberCount: 72,
    isSubscribed: false,
    reviewCount: 28,
    averageRating: 4.4,
  },
  {
    storeId: 5,
    storeName: "펄스커피 교대점",
    storeStatus: "OPEN",
    storeImage: "https://picsum.photos/400/404",
    roadAddress: "서울특별시 서초구 서초대로 325",
    detailAddress: "1층 103호",
    xPoint: 37.4938,    // 강남역보다 약간 남쪽
    yPoint: 127.0138,
    subscriptionStock: 3,
    subscriberCount: 45,   // 제일 작게
    isSubscribed: false,
    reviewCount: 12,
    averageRating: 4.1,
  },
  {
    storeId: 6,
    storeName: "블루보틀 삼성점",
    storeStatus: "OPEN",
    storeImage: "https://picsum.photos/400/405",
    roadAddress: "서울특별시 강남구 봉은사로 524",
    detailAddress: "1층",
    xPoint: 37.5134,   // 꽤 위
    yPoint: 127.0562,
    subscriptionStock: 4,
    subscriberCount: 360,  // 🔼
    isSubscribed: false,
    reviewCount: 180,
    averageRating: 4.8,
  },
  {
    storeId: 7,
    storeName: "빈브라더스 역삼점",
    storeStatus: "OPEN",
    storeImage: "https://picsum.photos/400/406",
    roadAddress: "서울특별시 강남구 논현로 508",
    detailAddress: "1층",
    xPoint: 37.4962,
    yPoint: 127.0325,
    subscriptionStock: 2,
    subscriberCount: 88,
    isSubscribed: false,
    reviewCount: 41,
    averageRating: 4.5,
  },
  {
    storeId: 8,
    storeName: "할리스커피 강남역 1번출구점",
    storeStatus: "OPEN",
    storeImage: "https://picsum.photos/400/407",
    roadAddress: "서울특별시 강남구 강남대로 396",
    detailAddress: "2층",
    xPoint: 37.498,    // 강남역이랑 거의 붙임
    yPoint: 127.0266,
    subscriptionStock: 6,
    subscriberCount: 150,
    isSubscribed: false,
    reviewCount: 77,
    averageRating: 4.2,
  },
  {
    storeId: 9,
    storeName: "컴포즈커피 신논현점",
    storeStatus: "OPEN",
    storeImage: "https://picsum.photos/400/408",
    roadAddress: "서울특별시 서초구 서초대로77길 55",
    detailAddress: "1층",
    xPoint: 37.5033,
    yPoint: 127.0244,
    subscriptionStock: 1,
    subscriberCount: 61,
    isSubscribed: false,
    reviewCount: 25,
    averageRating: 4.0,
  },
  {
    storeId: 10,
    storeName: "스타벅스 강남R점",
    storeStatus: "OPEN",
    storeImage: "https://picsum.photos/400/409",
    roadAddress: "서울특별시 강남구 강남대로 390",
    detailAddress: "1~2층",
    xPoint: 37.4979,    // 기준점과 동일
    yPoint: 127.0276,
    subscriptionStock: 10,
    subscriberCount: 420, // 🔥 제일 큼 → 구독자순 테스트
    isSubscribed: true,   // ✅ 너가 구독한 걸로
    reviewCount: 210,     // 🔥 제일 큼 → 리뷰순 테스트
    averageRating: 4.9,
  },
];

export default cafeList;
