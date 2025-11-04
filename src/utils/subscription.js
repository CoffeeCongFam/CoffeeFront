// src/api/subscription.js
import axios from 'axios';
const BASE_URL = "https://566e8ca2-16d7-45d7-8097-da13ce9bd28d.mock.pstmn.io"
// let BASE_URL = "http://localhost:8080"
export async function getSubscription() {
  try {
    const response = await axios.get(`${BASE_URL}/api/customers/subscriptions`, {
      transformResponse: [(data) => {
        if (typeof data === 'string') {
          // 1) BOM/공백 제거
          let s = data.replace(/^\uFEFF/, '').trim();
          // 2) 트레일링 콤마 제거: ,] 또는 ,}
          s = s.replace(/,\s*([\]}])/g, '$1');
          try {
            return JSON.parse(s);
          } catch (e) {
            console.warn('[api/getSubscription] JSON parse failed:', e);
            return { raw: s }; // 마지막 안전망
          }
        }
        // axios가 이미 object로 파싱해준 경우
        return data;
      }],
    });

    const payload = response.data;

    // 정상 케이스: { success, data, message }
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload;
    }
    // 서버가 배열만 준 경우: [] → { data: [] }로 정규화
    if (Array.isArray(payload)) {
      return { data: payload };
    }
    // 문자열 그대로 온 경우(raw) 등
    return payload ?? { data: [] };
  } catch (err) {
    console.error('[api/getSubscription] request failed:', err);
    throw err;
  }
}