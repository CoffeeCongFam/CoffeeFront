// todayOrderList.js
// status: "REQUEST" | "INPROGRESS" | "COMPLETED" | "RECEIVED" | "REJECTED"

const todayOrderList = {
  memberId: 1, // 주문 회원 아이디
  date: "2025-10-29", // 오늘 날짜
  orderList: [
    {
      orderId: 2,
      createdAt: "2025-10-30T17:05:22.001473",
      orderStatus: "REQUEST",
      subscriptionType: "BASIC",
      subscriptionName: "카페 모나카 BASIC 구독권",
      storeName: "카페 모나카",
      storeImg: "",
      orderMenu: [{ menuName: "아메리카노", quantity: 1 }],
    },
    {
      orderId: 3,
      createdAt: "2025-10-30T17:05:22.001473",
      orderStatus: "INPROGRESS",
      subscriptionType: "BASIC",
      subscriptionName: "카페 모나카 BASIC 구독권",
      storeName: "카페 모나카",
      storeImg: "",
      orderMenu: [{ menuName: "아메리카노", quantity: 1 }],
    },
    {
      orderId: 4,
      createdAt: "2025-10-30T17:05:22.001473",
      orderStatus: "COMPLETED",
      subscriptionType: "BASIC",
      subscriptionName: "카페 모나카 BASIC 구독권",
      storeName: "카페 모나카",
      storeImg: "",
      orderMenu: [{ menuName: "아메리카노", quantity: 1 }],
    },
    {
      orderId: 5,
      createdAt: "2025-10-30T17:05:22.001473",
      orderStatus: "RECEIVED",
      subscriptionType: "BASIC",
      subscriptionName: "카페 모나카 BASIC 구독권",
      storeName: "카페 모나카",
      storeImg: "",
      orderMenu: [{ menuName: "아메리카노", quantity: 1 }],
    },
    {
      orderId: 6,
      createdAt: "2025-10-30T17:05:22.001473",
      orderStatus: "INPROGRESS",
      subscriptionType: "BASIC",
      subscriptionName: "카페 모나카 BASIC 구독권",
      storeName: "카페 모나카",
      storeImg: "",
      orderMenu: [{ menuName: "아메리카노", quantity: 1 }],
    },
    {
      orderId: 7,
      createdAt: "2025-10-30T17:05:22.001473",
      orderStatus: "REJECTED",
      subscriptionType: "BASIC",
      subscriptionName: "카페 모나카 BASIC 구독권",
      storeName: "카페 모나카",
      storeImg: "",
      orderMenu: [{ menuName: "아메리카노", quantity: 1 }],
    },
  ],
};

export default todayOrderList;
