import api from "../utils/api";

/*
    소비자 요청 api 모음
    받는 쪽에서 await 로 받아야 함.
*/

/*  메인 홈 */

// 보유 구독권 목록 조회
export async function fetchCustomerSubscriptions() {
  const res = await api.get("/customers/subscriptions");
  return res.data?.data ?? [];
}

// 내 위치 기반 근처 카페 목록 조회
export async function fetchNearbyCafes({ xPoint, yPoint, radius = 500 }) {
  const res = await api.get("/customers/stores/nearby", {
    params: { xPoint, yPoint, radius },
  });
  return res.data ?? [];
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
  const res = await api.post("/me/orders/new", payload);
  return res.data?.data || null;
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
export async function fetchStoreDetail(partnerStoreId) {
  const res = await api.get(`/customers/stores/${partnerStoreId}`);
  console.log(res.data?.message);
  return res.data?.data;
}

// 구독권 구매
// export

/*  매장 탐색 탭 */
// 카페 목록 조회
export async function fetchStoreList() {
  const res = await api.get(`//`);
}

// /api/customers/stores/nearby?xPoint=37.4979&yPoint=127.0276&radius=2
