// 알림 관련 api 모음

import api from "../utils/api";

// 알림 내역 전체 조회
export async function fetchNotificaitonList() {
  try {
    const res = await api.get(`/common/notification`);
    return res.data; // 정상 200 응답
  } catch (err) {
    if (err.response?.data) {
      return err.response.data; //
    }
    throw err;
  }
}
