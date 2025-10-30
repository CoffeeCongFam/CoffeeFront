const storeDetail = {
  storeId: 1,
  storeName: "카페 모나카",
  summary:
    "매일 아침 직접 로스팅한 원두와 따뜻한 햇살이 어우러진 공간. 루미에르에서 커피 한 잔의 여유를 즐겨보세요.",
  address: "서울특별시 성동구 서울숲2길 22-1",
  phone: "010-2323-2323",
  storeHours: [
    { dayOfWeek: "MON", openTime: null, closeTime: null, isHoliday: true },
    { dayOfWeek: "TUE", openTime: "09:00", closeTime: "22:00" },
    { dayOfWeek: "WED", openTime: "09:00", closeTime: "22:00" },
    { dayOfWeek: "THU", openTime: "09:00", closeTime: "22:00" },
    { dayOfWeek: "FRI", openTime: "09:00", closeTime: "23:00" },
    { dayOfWeek: "SAT", openTime: "10:00", closeTime: "23:00" },
    { dayOfWeek: "SUN", openTime: "10:00", closeTime: "21:00" },
  ],
};

export default storeDetail;
