import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${BASE_URL}/api/stores/menus`;

// /api/stores/menus 매장 메뉴 등록
// /api/stores/menus/{menuId} 매장 메뉴 상세 정보 수정
// /api/stores/menus/{menuId} 메뉴 정보 소프트 삭제
// /api/stores/menus/store/{partnerStoreId} 매장 메뉴 조회
// /api/stores/menus/{menuId} 매장 메뉴 상세 조회

// axios 분리 역할 js - 🚩오직 백엔드 api와의 통신(CRUD)만을 담당.

// 🚩 더미 데이터 (테스트용도)
// let DUMMY_STORE_MENUS = [
//   {
//     menuId: 'M001',
//     partnerStoreId: 'S001',
//     menuName: '아메리카노',
//     price: 3500,
//     menuImg: 'https://placehold.co/40x40/4CAF50/FFFFFF?text=☕',
//     menuDesc: '가장 기본적인 에스프레소 추출 음료입니다.',
//     menuStatus: 'ACTIVE',
//     menuType: 'BEVERAGE',
//     createdAt: '2025-10-10T09:00:00Z',
//     updatedAt: '2025-10-31T14:44:25.581717',
//   },
//   {
//     menuId: 'M002',
//     partnerStoreId: 'S001',
//     menuName: '카페 라떼',
//     price: 4500,
//     menuImg: 'https://placehold.co/40x40/2196F3/FFFFFF?text=🥛',
//     menuDesc: '신선한 우유와 에스프레소의 부드러운 조화.',
//     menuStatus: 'ACTIVE',
//     menuType: 'BEVERAGE',
//     createdAt: '2025-10-10T09:05:00Z',
//     updatedAt: '2025-10-31T14:44:25.581717',
//   },
//   {
//     menuId: 'M003',
//     partnerStoreId: 'S001',
//     menuName: '민트 초코 라떼',
//     price: 5500,
//     menuImg: 'https://placehold.co/40x40/FF9800/FFFFFF?text=🍫',
//     menuDesc: '민트와 초콜릿의 상쾌하고 달콤한 만남.',
//     menuStatus: 'INACTIVE',
//     menuType: 'BEVERAGE',
//     createdAt: '2025-10-15T15:30:00Z',
//     updatedAt: '2025-10-31T14:44:25.581717',
//   },
//   {
//     menuId: 'M004',
//     partnerStoreId: 'S001',
//     menuName: '플레인 크로와상',
//     price: 3000,
//     menuImg: 'https://placehold.co/40x40/607D8B/FFFFFF?text=🥐',
//     menuDesc: '겉은 바삭하고 속은 촉촉한 기본 크로와상입니다.',
//     menuStatus: 'ACTIVE',
//     menuType: 'DESSERT',
//     createdAt: '2025-10-20T11:00:00Z',
//     updatedAt: '2025-10-31T14:44:25.581717',
//   },
//   {
//     menuId: 'M005',
//     partnerStoreId: 'S001',
//     menuName: '클래식 브라우니',
//     price: 4000,
//     menuImg: 'https://placehold.co/40x40/795548/FFFFFF?text=🧁',
//     menuDesc: '진한 초콜릿의 풍미가 가득한 브라우니.',
//     menuStatus: 'ACTIVE',
//     menuType: 'DESSERT',
//     createdAt: '2025-10-20T11:05:00Z',
//     updatedAt: '2025-10-31T14:44:25.581717',
//   },
// ];

// 🚩메뉴 리스트 조회 (GET)
// * @param {string} partnerStoreId - 매장 ID
export const fetchStoreMenus = async (partnerStoreId) => {
  // [실제 axios 코드]
  try {
    const url = `${API_BASE_URL}/store/${partnerStoreId}`;
    // 테스트용 PARTNER_STORE_ID
    const response = await axios.get(url);
    console.log(
      "✅ GET 성공, 데이터 로드 완료:",
      response.data.data.length,
      "개"
    );
    return response.data.data;
  } catch (error) {
    console.error("메뉴 리스트 조회 실패 :", error);
    throw error;
  }
};

// 🚩 매장 메뉴 등록 (POST) - 파일 첨부 포함
//  * 신규 메뉴를 등록. 파일 업로드를 위해 FormData를 사용.
//  * @param {Object} menuData - 메뉴 정보를 담은 JSON 객체 (menuName, price, menuDesc 등)
//  * @param {File | null} imageFile - 첨부할 이미지 파일 (File 객체)
//  * @returns {Promise<Object>} 등록된 메뉴 정보 객체
export const registerMenu = async (data, imageFile) => {
  // 🚩 [실제 axios 코드]
  const url = `${API_BASE_URL}`;

  // 파일과 json 데이터를 함께 보내기 위해 FormData를 사용
  const formData = new FormData();

  // 이미지 파일 추가 - ** 이건 경로인가?
  if (imageFile) {
    formData.append("file", imageFile);
  }

  // 메뉴 json 데이터 추가
  const menuJson = new Blob([JSON.stringify(data)], {
    type: "application/json",
  });
  formData.append("data", menuJson);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("메뉴 등록 실패 :", error);
    throw error;
  }
};

// 🚩매장 메뉴 수정(PATCH) - 파일 첨부 포함
// PUT /api/stores/menus/{menuId}
// * @param {string} menuId - 수정할 메뉴 ID

export const updateMenu = async (menuId, updateData, imageFIle) => {
  // 🚩 [실제 axios 코드 - 주석 처리]
  const url = `${API_BASE_URL}/${menuId}`;
  // 테스트용 MENU_ID

  const formData = new FormData();

  // 이미지 파일 추가
  if (imageFIle) {
    formData.append("file", imageFIle);
  }

  // 메뉴 json 데이터 추가
  const menuJson = new Blob([JSON.stringify(updateData)], {
    type: "application/json",
  });
  formData.append("data", menuJson);

  try {
    // put 요청
    const response = await axios.patch(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  } catch (error) {
    console.error(`메뉴 수정 실패 (ID : ${menuId}:`, error);
    throw error;
  }
};

// 메뉴 정보 소프트 삭제 (DELETE) - 프론트에서 볼 수 없으나, 활성화 상태를 비활성화로 바꾼
// Endpoint: DELETE /api/stores/menus/{menuId}
//  * @param {string} menuId - 삭제할 메뉴 ID
export const deleteMenu = async (menuId) => {
  // 🚩 [실제 axios 코드 - 주석 처리]
  try {
    const url = `${API_BASE_URL}/${menuId}`;
    // 테스트용 MENU_ID
    const response = await axios.delete(url);
    return response.data.data;
  } catch (error) {
    console.error(`메뉴 삭제 실패 (ID: ${menuId}):`, error);
    throw error;
  }
};
