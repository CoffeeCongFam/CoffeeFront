const subMenuListData = {
  subId: 1,
  subscriptionName: "스탠다드 구독권",
  // 오늘 남은 주문 가능 횟수

  orderRule: {
    requiredTypes: ["BEVERAGE"],
    optionalTypes: ["DESSERT"],
  },
  menusByType: {
    BEVERAGE: [
      { menuId: 1, name: "아메리카노", price: 1500, menuImage: "" },
      { menuId: 2, name: "카페라떼", price: 2000, menuImage: "" },
      { menuId: 3, name: "카푸치노", price: 2200, menuImage: "" },
      { menuId: 4, name: "디카페인 아메리카노", price: 1800, menuImage: "" },
      { menuId: 5, name: "바닐라라떼", price: 2500, menuImage: "" },
    ],
    DESSERT: [{ menuId: 6, name: "커피콩빵", price: 2500 }],
  },
};

export default subMenuListData;
