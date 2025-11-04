const storeDetail = {
  partnerStoreId: 1,
  storeName: "카페 모나카",
  detailInfo: "수제 디저트와 핸드드립 커피 전문점",
  roadAddress: "서울특별시 성동구 서울숲2길 22-1",
  detailAddress: "3층 301호",
  storeTel: "02-1234-5678",

  storeHours: [
    { dayOfWeek: "MON", openTime: null, closeTime: null, isClosed: "Y" },
    { dayOfWeek: "TUE", openTime: "09:00", closeTime: "22:00", isClosed: "N" },
    { dayOfWeek: "WED", openTime: "09:00", closeTime: "22:00" },
    { dayOfWeek: "THU", openTime: "09:00", closeTime: "22:00" },
    { dayOfWeek: "FRI", openTime: "09:00", closeTime: "23:00" },
    { dayOfWeek: "SAT", openTime: "10:00", closeTime: "23:00" },
    { dayOfWeek: "SUN", openTime: "10:00", closeTime: "21:00" },
  ],
  menus: [
    {
      menuId: 1,
      partnerStoreId: 1,
      menuName: "아메리카노",
      menuType: "BEVERAGE",
      menuDesc: "산미가 조화로운 에티오피아 원두 블렌드 커피",
      menuStatus: "Y",
      createdAt: "2025-10-31T14:44:25.581717",
      updatedAt: "2025-10-31T15:16:45.215866",
      price: 4500,
      menuImg:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
    },
    {
      menuId: 2,
      partnerStoreId: 1,
      menuName: "라떼",
      menuType: "BEVERAGE",
      menuDesc: "산미가 조화로운 에티오피아 원두 블렌드 커피",
      menuStatus: "Y",
      createdAt: "2025-10-31T14:44:25.581717",
      updatedAt: "2025-10-31T15:16:45.215866",
      price: 4500,
      menuImg:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
    },
  ],
  subscriptions: [
    {
      subscriptionId: 2,
      store: {
        partnerStoreId: 1,
        storeName: "카페 모나카",
        storeImg: "https://picsum.photos/400/400",
      },
      partnerStoreId: 1,
      price: 19900,
      subscriptionImg:
        "https://images.unsplash.com/photo-1603025014859-2aa06fae7a08?w=600&q=80",
      subNasubscriptionNameme: "스탠다드 구독권",
      subType: "STANDARD",
      isExpired: "N", // Y | N
      subscriptionPeriod: 10,
      salesLimitQuantity: 10,
      subscriptionDesc: "구독권에 대한 간단한 설명",
      isGift: "Y", // Y | N
      isSubscribed: "N",
      maxDailyUsage: 2,
      remainSalesQuantity: 1,
    },
    {
      subscriptionId: 3,
      store: {
        partnerStoreId: 1,
        storeName: "카페 모나카",
        storeImg: "https://picsum.photos/400/400",
      },
      partnerStoreId: 1,
      price: 19900,
      subscriptionImg:
        "https://images.unsplash.com/photo-1603025014859-2aa06fae7a08?w=600&q=80",
      subNasubscriptionNameme: "스탠다드 구독권",
      subType: "STANDARD",
      isExpired: "N", // Y | N
      subscriptionPeriod: 10,
      salesLimitQuantity: 10,
      subscriptionDesc: "구독권에 대한 간단한 설명",
      isGift: "Y", // Y | N
      isSubscribed: "N",
      maxDailyUsage: 2,
      remainSalesQuantity: 1,
    },
  ],
};

export default storeDetail;
