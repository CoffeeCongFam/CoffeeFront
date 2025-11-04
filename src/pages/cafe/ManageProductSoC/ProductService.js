// 🚩오직 API 통신(백엔드 연결 또는 더미 데이터 조작)만 담당
// 백엔드 연결 시 :
// import axios from 'axios'; 사용
// 테스트 시 : 더미 데이터를 사용하여 비동기 통신을 흉내

// /api/owners/subscriptions 구독권 목록 조회
// /api/owners/subscriptions/{subscriptionId} 구독권 상세정보 조회
// /api/owners/subscriptions 구독권 정보 등록
// /api/owners/subscriptions/{subscriptionId} 구독권 수정

// 🚨 백엔드 연결 시: 실제 API 기본 경로 사용 (예: '/api/owners/subscriptions')
const API_BASE_URL = '/api/owners/subscriptions';

// 🚩 더미 데이터
export let DUMMY_SUBSCRIPTIONS = {
  success: 'true',
  data: [
    {
      subscriptionId: 'S1',
      subscriptionName: '베이직 구독권',
      price: 19900,
      subscriptionDesc:
        '아메리카노 1일 1잔 1회 이용 가능하며, 30일간 유효합니다.',
      subscriptionPeriod: 30, // 30일
      createdAt: '2025-10-01T10:00:00Z',
      subscriptionStatus: 'ONSALE', // 판매 중
      remainSalesQuantity: 50,
      maxDailyUsage: 1,
      subscriptionType: 'BASIC',
      subscriptionImg:
        'https://placehold.co/400x200/4CAF50/FFFFFF?text=BASIC+Subscription',
      totalSale: 120,
      salesLimitQuantity: 100,
    },
    {
      subscriptionId: 'S2',
      subscriptionName: '스탠다드 구독권',
      price: 39900,
      subscriptionDesc:
        '모든 음료 1일 1잔 1회 이용 가능하며, 30일간 유효합니다.',
      subscriptionPeriod: 30,
      createdAt: '2025-09-15T14:30:00Z',
      subscriptionStatus: 'SOLDOUT', // 품절
      remainSalesQuantity: 0,
      maxDailyUsage: 1,
      subscriptionType: 'STANDARD',
      subscriptionImg:
        'https://placehold.co/400x200/FF9800/FFFFFF?text=STANDARD+Subscription',
      totalSale: 50,
      salesLimitQuantity: 50,
    },
    {
      subscriptionId: 'S3',
      subscriptionName: '프리미엄 구독권',
      price: 59900,
      subscriptionDesc:
        '모든 음료 중 자유 선택 1잔 + 모든 디저트 중 자유 선택 1개를 1일 1회까지 이용 가능하며, 30일간 유효합니다.',
      subscriptionPeriod: 30, // 30일
      createdAt: '2025-10-25T08:15:00Z',
      subscriptionStatus: 'SUSPENDED', // 판매 중지
      remainSalesQuantity: 44,
      maxDailyUsage: 1,
      subscriptionType: 'PREMIUM',
      subscriptionImg:
        'https://placehold.co/400x200/2196F3/FFFFFF?text=PREMIUM+Subscription',
      totalSale: 5,
      salesLimitQuantity: 50,
    },
  ],
  message: '요청이 성공적으로 처리되었습니다.',
};

// 통신 딜레이 흉내내는 함수 (일관되게 쓸 거라)
const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// 1. 구독권 리스트 조회 (GET)
// Endpoint: /api/owners/subscriptions
export const fetchSubscriptions = async () => {
  // 🚩 [테스트 모드 시작] - 더미 데이터에 추가
  // 실제 API 호출을 시뮬레이션하기 위해 딜레이
  await new Promise((resolve) => setTimeout(resolve, 500));
  return DUMMY_SUBSCRIPTIONS.data;

  //   // 실제 axios 코드
  //   try {
  //     const url = API_BASE_URL;
  //     const response = awaut axios.get(url);
  //     return response.data;
  //   } catch (error) {
  //     console.error('구독권 목록 조회 실패 :', error);
  //     throw error;
  //   }
};

// 2. 신규 구독권 등록 (POST)
// Endpoint: /api/owners/subscriptions
export const registerSubscription = async (subscriptionData, imageFile) => {
  // 🚩 [테스트 모드 시작] - 더미 데이터에 추가
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newId = `S${Date.now()}`;
  const finalImageUrl = imageFile
    ? URL.createObjectURL(imageFile)
    : subscriptionData.subscriptionImg ||
      'https://placehold.co/400x200/666666/FFFFFF?text=NEW+ITEM';

  const newSubscription = {
    ...subscriptionData,
    subscriptionId: newId,
    price: parseInt(subscriptionData.price),
    subscriptionPeriod: parseInt(subscriptionData.subscriptionPeriod),
    maxDailyUsage: parseInt(subscriptionData.maxDailyUsage),
    remainSalesQuantity: parseInt(subscriptionData.remainSalesQuantity),
    salesLimitQuantity: parseInt(subscriptionData.salesLimitQuantity),
    totalSale: 0,
    subscriptionImg: finalImageUrl,
    createdAt: new Date().toISOString(),
  };

  DUMMY_SUBSCRIPTIONS.data.push(newSubscription); // 더미 데이터 배열에 추가

  console.log('✅ 현재 더미 데이터 총 개수:', DUMMY_SUBSCRIPTIONS.data.length);

  return newSubscription;

  // 🚩 [실제 axios 코드]
  //   const url = API_BASE_URL;
  //   const formData = new FormData();

  //   if (imageFile) {
  //     formData.append('image', imageFile);
  //   }

  //   const subJson = new Blob([JSON.stringify(subscriptionData)], {
  //     type: 'application/json',
  //   });
  //   formData.append('subscription', subJson); // 백엔드 스펙에 맞게 key 확인

  //   try {
  //     const response = await axios.post(url, formData, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('구독권 등록 실패:', error);
  //     throw error;
  //   }
};

// 3. 구독권 수정 (PUT)
// Endpoint: /api/owners/subscriptions/{subscriptionId}

export const updateSubscription = async (
  subscriptionId,
  updateData,
  imageFile
) => {
  // 🚩 [테스트 모드 시작] - 더미 데이터 업데이트
  await new Promise((resolve) => setTimeout(resolve, 500));

  let finalImageUrl = updateData.subscriptionImg;

  if (imageFile) {
    finalImageUrl = URL.createObjectURL(imageFile);
  }

  const updatedSubscription = {
    ...updateData,
    subscriptionId,
    price: parseInt(updateData.price),
    subscriptionPeriod: parseInt(updateData.subscriptionPeriod),
    maxDailyUsage: parseInt(updateData.maxDailyUsage),
    remainSalesQuantity: parseInt(updateData.remainSalesQuantity),
    salesLimitQuantity: parseInt(updateData.salesLimitQuantity),
    subscriptionImg: finalImageUrl,
    updatedAt: new Date().toISOString(),
  };

  DUMMY_SUBSCRIPTIONS.data = DUMMY_SUBSCRIPTIONS.data.map((sub) =>
    sub.subscriptionId === subscriptionId ? updatedSubscription : sub
  );

  return updatedSubscription;

  // 🚩 [실제 axios 코드]
  //   const url = `${API_BASE_URL}/${subscriptionId}`;
  //   const formData = new FormData();
  //   if (imageFile) {
  //     formData.append('image', imageFile);
  //   }
  //   const subJson = new Blob([JSON.stringify(updateData)], {
  //     type: 'application/json',
  //   });
  //   formData.append('subscription', subJson);

  //   try {
  //     const response = await axios.put(url, formData, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error(`구독권 수정 실패 (ID: ${subscriptionId}):`, error);
  //     throw error;
  //   }
};

// 4. 구독권 상세 정보 조회 (READ ONE - GET)
// Endpoint: /api/owners/subscriptions/{subscriptionId}

export const fetchSubscriptionsDetail = async (subscriptionId) => {
  // 🚩 [테스트 모드 시작] - 더미 데이터에서 찾아서 반환
  await mockDelay(300);

  const subscription = DUMMY_SUBSCRIPTIONS.data.find(
    (sub) => sub.subscriptionId === subscriptionId
  );

  return subscription;

  // 🚩 [실제 axios 코드]
  //   try {
  //     const url = `${API_BASE_URL}/${subscriptionId}`;
  //     const response = await axios.get(url);
  //     return response.data.data || response.data;
  //   } catch (error) {
  //     console.error(`구독권 상세 조회 실패 (ID: ${subscriptionId}):`, error);
  //     throw error;
  //   }
};
