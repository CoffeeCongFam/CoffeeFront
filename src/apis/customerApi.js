import api from "../utils/api";

/*
    소비자 요청 api 모음
*/

// 보유 구독권 목록 조회
export async function fetchCustomerSubscriptions() {
  const res = await api.get("/customers/subscriptions");
  return res.data?.data ?? [];
}

// 내 위치 기반 근처 카페 목록 조회
export async function fetchNearbyCafes({ lat, lng, radius = 500 }) {
  const res = await api.get("/stores/nearby", {
    params: { lat, lng, radius },
  });
  return res.data ?? [];
}
