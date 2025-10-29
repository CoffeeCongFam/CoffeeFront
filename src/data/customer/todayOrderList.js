// todayOrderList.js
// status: "REQUEST" | "INPROGRESS" | "COMPLETED" | "RECEIVED" | "REJECTED"

const todayOrderList = {
  memberId: 1, // 주문 회원 아이디
  date: "2025-10-29", // 오늘 날짜
  orderList: [
    {
      orderId: 1,
      store: {
        storeId: 1,
        storeName: "카페 모나카",
        storeImage: "https://picsum.photos/400/400",
      },
      orderedAt: "2025-10-29",
      productType: "G",
      inventory: {
        inventoryId: 1,
        inventoryName: "카페 모나카 스탠다드 구독권",
      },
      orderType: "I",
      orderMenu: [{ menuName: "아메리카노", quantity: 1 }],
      orderStatus: "REQUEST",
    },
    {
      orderId: 2,
      store: {
        storeId: 2,
        storeName: "카페 라떼하우스",
        storeImage: "https://picsum.photos/400/400",
      },
      orderedAt: "2025-10-29",
      productType: "G",
      inventory: {
        inventoryId: 1,
        inventoryName: "카페 라떼 하우스 프리미엄 구독권",
      },
      orderType: "I",
      orderMenu: [{ menuName: "카페라떼", quantity: 1 }],
      orderStatus: "INPROGRESS",
    },
  ],
};

export default todayOrderList;
