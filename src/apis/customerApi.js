import api from "../utils/api";

/*
    소비자 요청 api 모음
    받는 쪽에서 await 로 받아야 함.
    
    백에서 HTTP 상태 코드가 200이 아닌 경우 (예: 400, 409 등)라면
    Axios는 이 응답을 “에러로 간주”하고 response 를 반환하지 않음.

/*  메인 홈 */

// 보유 구독권 목록 조회
export async function fetchCustomerSubscriptions() {
  const res = await api.get("/customers/subscriptions");
  return res.data?.data ?? [];
}

// 내 위치 기반 근처 카페 목록 조회
export async function fetchNearbyCafes(xPoint, yPoint, radius = 500) {
  const res = await api.get("/customers/stores/nearby", {
    params: { xPoint, yPoint, radius },
  });
  console.log("xPoint>> ", xPoint, "yPoint>> ", yPoint);
  return res.data?.data ?? [];
}

// 카페 목록 전체 조회
export async function fetchAllCafes() {
  const res = await api.get(`/customers/stores`);
  console.log(res.data?.data);
  return res.data?.data;
}

/*  주문  */
// 오늘 주문 목록 조회
export async function fetchTodayOrderList() {
  const res = await api.get(`/me/orders/today`);
  console.log(res.data?.data);
  return res.data?.data;
}

// 주문 요청
export async function requestNewOrder(payload) {
  try {
    const res = await api.post("/me/orders/new", payload);
    return res.data; // 정상 200 응답
  } catch (err) {
    // 서버에서 JSON 에러 응답을 준 경우
    if (err.response?.data) {
      return err.response.data; // { success:false, message:"...", data:null }
    }
    // 네트워크나 서버 다운 등
    throw err;
  }
}

// 주문 상세 조회
export async function fetchOrderDetail(orderId) {
  const res = await api.get(`/me/orders/${orderId}`);
  return res.data?.data || null;
}

// 주문 취소 요청
export async function requestCancelOrder(orderId) {
  const res = await api.patch(`/me/orders/${orderId}`);
  console.log(res.data?.message);
  return res.data?.data;
}

// 카페 상세 정보 조회
export async function fetchStoreDetail(storeId) {
  const res = await api.get(`/customers/stores/${storeId}`);
  // console.log(res.data?.message);
  console.log("카페 상세 정보 조회>> ", res.data);
  return res.data?.data;
}

// 보유 구독권 목록 조회
export async function fetchUserSubscriptions() {
  console.log("보유 구독권 목록 조회");

  const res = await api.get(`/customers/subscriptions`);
  console.log("보유 구독권 목록 : ", res.data?.data);
  return res.data?.data;
}

// 특정 구독권 정보 조회
export async function fetchSubscriptionInfo(subscriptionId) {
  console.log("특정 구독권 정보 조회 요청");

  const res = await api.get(`/owners/subscriptions/${subscriptionId}`);
  console.log(res.data?.data);
  return res.data?.data;
}
// 구독권 구매
export async function requestPurchase(payload) {
  console.log("구독권 구매 요청>> ", payload);

  // try {

  // }
  const res = await api.post(`/me/purchase/new`, payload);

  console.log("result: ", res.data?.data);
  return res.data?.data;
}

// 구독권 구매 내역 조회
export async function fetchPurchaseInfo(purchaseId) {
  console.log("구독권 구매 내역 조회>> ", purchaseId);

  const res = await api.get(`/me/purchase/${purchaseId}`);
  console.log(res.data?.data);
  return res.data?.data;
}

// TODO. 선물하기 대상 멤버 찾기
export async function findReceiver(payload) {
  console.log("선물 전달할 멤버 조회>> ", payload);

  const res = await api.post(`/me/purchase/gift/tel`, payload);
  console.log(res.data?.data);
  return res.data?.data;
}

/*  매장 탐색 탭 */
// 카페 목록 조회
export async function fetchStoreList() {
  // const res = await api.get(`//`);
}

// /api/customers/stores/nearby?xPoint=37.4979&yPoint=127.0276&radius=2

// 리뷰 작성
// form 데이터 기반으로 수정
// 리뷰 작성 (multipart/form-data)
export async function createReview(payload, imageFile) {
  const formData = new FormData();

  // JSON을 Blob 형태로 감싸서 "data" 필드로 추가
  const jsonBlob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  });
  formData.append("data", jsonBlob);

  // 이미지 파일이 있으면 "file" 필드로 추가
  if (imageFile) {
    formData.append("file", imageFile);
  }

  console.log("📤 리뷰 등록 요청 >>", payload, imageFile);

  //  multipart/form-data 전송
  const res = await api.post("/reviews", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

// 리뷰 삭제
export async function deleteReview(reviewId) {
  console.log("리뷰 삭제 요청>> ", reviewId);
  // /api/reviews/{review}

  const res = await api.delete(`/reviews/${reviewId}`);
  return res.data?.success; // true || false
}

// 소비자별 리뷰 조회
export async function fetchUserReview() {
  console.log("");
  const res = await api.get(`/reviews/me`);
  return res.data?.data;
}
