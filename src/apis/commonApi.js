// 공통 api 목록
import api from "../utils/api";

// 매장별 리뷰 목록 조회
export async function fetchStoreReviewList(partnerStoreId) {
  console.log("매장별 리뷰 목록 조회");
  const res = await api.get(`/reviews/stores/${partnerStoreId}`);
  console.log(res.data?.data);

  return res.data?.data;
}
