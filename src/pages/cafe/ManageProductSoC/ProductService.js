// 🚩오직 API 통신(백엔드 연결 또는 더미 데이터 조작)만 담당
import axios from "axios";

// /api/owners/subscriptions 구독권 목록 조회
// /api/owners/subscriptions/{subscriptionId} 구독권 상세정보 조회
// /api/owners/subscriptions 구독권 정보 등록
// /api/owners/subscriptions/{subscriptionId} 구독권 수정

// 🚨 백엔드 연결 시: 실제 API 기본 경로 사용 (예: '/api/owners/subscriptions')
const BASE_URL = import.meta.env.VITE_API_UR;
const API_BASE_URL = `${BASE_URL}/api/owners/subscriptions`;

const SUBSCRIPTION_ID = 1;

// 1. 구독권 리스트 조회 (GET)
// Endpoint: /api/owners/subscriptions
export const fetchSubscriptions = async () => {
  // 실제 axios 코드
  try {
    const url = API_BASE_URL;
    const response = await axios.get(url, {
      withCredentials: true, // Http 쿠키 전송
    });
    return response.data.data;
  } catch (error) {
    console.error("구독권 목록 조회 실패 :", error);
    throw error;
  }
};

// 2. 신규 구독권 등록 (POST)
// Endpoint: /api/owners/subscriptions
export const registerSubscription = async (subscriptionData, imageFile) => {
  //🚩 [실제 axios 코드]
  const url = API_BASE_URL;
  const formData = new FormData();

  if (imageFile) {
    formData.append("file", imageFile);
  }

  const subJson = new Blob([JSON.stringify(subscriptionData)], {
    type: "application/json",
  });
  formData.append("data", subJson); // 백엔드 스펙에 맞게 key 확인

  try {
    const response = await axios.post(url, formData, {
      withCredentials: true,
    });
    return response.data.success;
    // API 명세서 상에 RESPONSE를 좀 잘 봤어야 했음
  } catch (error) {
    console.error("구독권 등록 실패:", error);
    throw error;
  }
};

// 3. 구독권 수정 (PATCH) - (소프트) 실제 구독권 변경이 아니라 상태 변경?
// Endpoint: /api/owners/subscriptions/{subscriptionId}

export const updateSubscription = async (subscriptionId, updateData) => {
  // 🚩 [실제 axios 코드]
  const url = `${API_BASE_URL}/${SUBSCRIPTION_ID}`;
  // SUBSCRIPTION_ID 테스트용 가데이터

  try {
    const response = await axios.patch(url, updateData);
    return response.data.data;
  } catch (error) {
    console.error(`구독권 수정 실패 (ID: ${subscriptionId}):`, error);
    throw error;
  }
};

// 4. 구독권 상세 정보 조회 (READ ONE - GET)
// Endpoint: /api/owners/subscriptions/{subscriptionId}

export const fetchSubscriptionsDetail = async (subscriptionId) => {
  // 🚩 [실제 axios 코드]
  try {
    const url = `${API_BASE_URL}/${subscriptionId}`;
    // subscriptionId는 가데이터로 대체 (테스트용)
    const response = await axios.get(url);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`구독권 상세 조회 실패 (ID: ${subscriptionId}):`, error);
    throw error;
  }
};

// 5. 구독권 소프트 삭제 (DELETE)
// Endpoint: /api/owners/subscriptions/{subscriptionId}
export const softDeleteSubscription = async (subscriptionId) => {
  // 🚩 [실제 axios 코드]
  try {
    const url = `${API_BASE_URL}/${subscriptionId}`;
    const response = await axios.delete(url);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`구독권 삭제 실패 (ID: ${subscriptionId}):`, error);
    throw error;
  }
};

// 6. 메뉴 목록 반환
export const fetchAllMenus = async (partnerStoreId) => {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const MENU_API_URL = `${BASE_URL}/api/stores/menus/store/${partnerStoreId}`;
  try {
    // 🚩 [수정] 실제 메뉴 목록을 불러오는 API 호출
    const response = await axios.get(MENU_API_URL, {
      withCredentials: true,
    }); // 백엔드 응답 구조에 따라 .data.data 또는 .data를 반환하도록 조정
    console.log(
      "✅ GET 성공, 데이터 로드 완료:",
      response.data.data.length,
      "개"
    );
    return response.data.data;
  } catch (error) {
    console.error("전체 메뉴 목록 조회 실패:", error);

    throw error;
  }
};
