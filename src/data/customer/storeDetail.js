const storeDetail = {
  storeId: 1,
  storeName: "카페 모나카",
  summary:
    "매일 아침 직접 로스팅한 원두와 따뜻한 햇살이 어우러진 공간. 루미에르에서 커피 한 잔의 여유를 즐겨보세요.",
  address: "서울특별시 성동구 서울숲2길 22-1",
  phone: "010-2323-2323",
  storeStatus: "OPEN",
  storeHours: [
    { dayOfWeek: "MON", openTime: null, closeTime: null, isHoliday: true },
    { dayOfWeek: "TUE", openTime: "09:00", closeTime: "22:00" },
    { dayOfWeek: "WED", openTime: "09:00", closeTime: "22:00" },
    { dayOfWeek: "THU", openTime: "09:00", closeTime: "22:00" },
    { dayOfWeek: "FRI", openTime: "09:00", closeTime: "23:00" },
    { dayOfWeek: "SAT", openTime: "10:00", closeTime: "23:00" },
    { dayOfWeek: "SUN", openTime: "10:00", closeTime: "21:00" },
  ],
  menus: [
    {
      menuId: 1,
      storeId: 1,
      menuName: "아메리카노",
      menuType: "BEVERAGE",
      description: "산미가 조화로운 에티오피아 원두 블렌드 커피",
      isActive: false,
      price: 4500,
      menuImage:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
    },
    {
      menuId: 2,
      storeId: 1,
      menuName: "카페라떼",
      menuType: "BEVERAGE",
      description: "신선한 우유와 에스프레소의 부드러운 조화",
      isActive: true,
      price: 5000,
      menuImage:
        "https://images.unsplash.com/photo-1510626176961-4b37d6dc1a6c?w=600&q=80",
    },
    {
      menuId: 3,
      storeId: 1,
      menuName: "바닐라라떼",
      menuType: "BEVERAGE",
      description: "바닐라 시럽이 은은하게 감도는 달콤한 라떼",
      isActive: true,
      price: 5300,
      menuImage:
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&q=80",
    },
    {
      menuId: 4,
      storeId: 1,
      menuName: "딸기 스무디",
      menuType: "BEVERAGE",
      description: "생딸기를 갈아 만든 상큼한 스무디",
      isActive: true,
      price: 5800,
      menuImage:
        "https://images.unsplash.com/photo-1576402187873-3a8e0d5659d9?w=600&q=80",
    },
    {
      menuId: 5,
      storeId: 1,
      menuName: "크루아상",
      menuType: "DESERT",
      description: "겹겹이 버터 풍미가 살아있는 클래식 크루아상",
      isActive: true,
      price: 3800,
      menuImage:
        "https://images.unsplash.com/photo-1606813902787-4560e8b4f7f7?w=600&q=80",
    },
    {
      menuId: 6,
      storeId: 1,
      menuName: "초코 케이크",
      menuType: "DESERT",
      description: "진한 다크초콜릿으로 만든 촉촉한 케이크",
      isActive: true,
      price: 5900,
      menuImage:
        "https://images.unsplash.com/photo-1606312619344-ffb6fc88b1e7?w=600&q=80",
    },
    {
      menuId: 7,
      storeId: 1,
      menuName: "치즈케이크",
      menuType: "DESERT",
      description: "꾸덕한 질감의 뉴욕 스타일 치즈케이크",
      isActive: true,
      price: 6200,
      menuImage:
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80",
    },
    {
      menuId: 8,
      storeId: 1,
      menuName: "마카롱 세트",
      menuType: "DESERT",
      description: "다양한 맛의 프렌치 마카롱 3종 세트",
      isActive: true,
      price: 7500,
      menuImage:
        "https://images.unsplash.com/photo-1603025014859-2aa06fae7a08?w=600&q=80",
    },
  ],
  subscriptions: [
    {
      subId: 2,
      store: {
        storeId: 1,
        storeName: "카페 모나카",
        storeImage: "https://picsum.photos/400/400",
      },
      price: 19900,
      subImage:
        "https://images.unsplash.com/photo-1603025014859-2aa06fae7a08?w=600&q=80",
      subName: "스탠다드 구독권",
      subType: "STANDARD",
      isExpired: "N", // Y | N
      limitEntity: 10,
      stock: 10,
      description: "구독권에 대한 간단한 설명",
      isGift: "Y", // Y | N
      isSubscribed: "N",
      maxDailyUsage: 2,
      menuList: ["아메리카노", "아이스카페라떼"],
    },
    {
      subId: 3,
      store: {
        storeId: 1,
        storeName: "카페 모나카",
        storeImage: "https://picsum.photos/400/400",
      },
      price: 19900,
      subImage:
        "https://images.unsplash.com/photo-1603025014859-2aa06fae7a08?w=600&q=80",
      subName: "!!!스페셜 구독권",
      subType: "PREMIUM",
      isExpired: "N", // Y | N
      limitEntity: 10,
      stock: 10,
      description: "구독권에 대한 간단한 설명",
      isGift: "Y", // Y | N
      isSubscribed: "Y",
      maxDailyUsage: 1,
      menuList: ["아메리카노", "아이스카페라떼"],
    },
    {
      subId: 4,
      store: {
        storeId: 1,
        storeName: "카페 모나카",
        storeImage: "https://picsum.photos/400/400",
      },
      price: 19900,
      subImage:
        "https://images.unsplash.com/photo-1603025014859-2aa06fae7a08?w=600&q=80",
      subName: "!!!그냥 기본 구독권",
      subType: "BASIC",
      isExpired: "N", // Y | N
      limitEntity: 10,
      stock: 10,
      description: "구독권에 대한 간단한 설명",
      isGift: "Y", // Y | N
      isSubscribed: "Y",
      maxDailyUsage: 1,
      menuList: ["아메리카노", "아이스카페라떼"],
    },
  ],
};

export default storeDetail;
