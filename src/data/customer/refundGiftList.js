// 환불 내역 (sendGiftList 기반)
// PaymentHistory.jsx 의 normalize()가 인식하는 키에 맞춰 작성
// - refundAt (또는 refundedAt/refundDate 중 하나)
// - status: "REFUNDED" (선택)

const refundGiftList = [
  {
    id: 9001,
    purchaseId: 87654321, // sendGiftList id:5 예시
    storeName: "더리터 발산역점",
    productName: "더리터 구독권",
    price: 12000,
    paidAt: "2025-10-30T05:06:40.992Z",
    refundAt: "2025-11-02T09:15:00.000Z",
    purchaseType: "신한카드",
    sender: "커피콩빵",
    receiver: "빈츠",
    status: "REFUNDED",
    refundReason: "단순 변심"
  },
  {
    id: 9002,
    purchaseId: 11223344, // sendGiftList id:6 예시
    storeName: "메가커피 강남점",
    productName: "메가커피 구독권",
    price: 13000,
    paidAt: "2025-09-29T08:30:00.000Z",
    refundAt: "2025-10-05T12:00:00.000Z",
    purchaseType: "현대카드",
    sender: "라떼킹",
    receiver: "홍길동",
    status: "REFUNDED",
    refundReason: "가맹점 요청"
  },
  {
    id: 9003,
    purchaseId: 22334455, // sendGiftList id:7 예시
    storeName: "컴포즈커피 신촌점",
    productName: "컴포즈커피 구독권",
    price: 11000,
    paidAt: "2025-08-12T09:10:00.000Z",
    refundAt: "2025-08-20T18:20:00.000Z",
    purchaseType: "국민카드",
    sender: "아이스아메리카노",
    receiver: "초코라떼",
    status: "REFUNDED",
    refundReason: "결제 오류"
  },
  {
    id: 9004,
    purchaseId: 33445566, // sendGiftList id:8 예시
    storeName: "할리스 홍대점",
    productName: "할리스 구독권",
    price: 16000,
    paidAt: "2025-07-15T12:45:00.000Z",
    refundAt: "2025-07-22T10:05:00.000Z",
    purchaseType: "롯데카드",
    sender: "빈스",
    receiver: "모카",
    status: "REFUNDED",
    refundReason: "재구매 후 취소"
  },
  {
    id: 9005,
    purchaseId: 44556677, // sendGiftList id:9 예시
    storeName: "이디야 서울대입구점",
    productName: "이디야 구독권",
    price: 12500,
    paidAt: "2025-06-20T07:20:00.000Z",
    refundAt: "2025-06-21T09:00:00.000Z",
    purchaseType: "삼성카드",
    sender: "카페라떼",
    receiver: "에스프레소",
    status: "REFUNDED",
    refundReason: "사용자 요청"
  }
];

export default refundGiftList;
