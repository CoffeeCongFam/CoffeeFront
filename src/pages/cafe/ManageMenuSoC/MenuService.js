// import axios from 'axios';
const API_BASE_URL = '/api/stores/menus';

// /api/stores/menus 매장 메뉴 등록
// /api/stores/menus/{menuId} 매장 메뉴 상세 정보 수정
// /api/stores/menus/{menuId} 메뉴 정보 소프트 삭제
// /api/stores/menus/store/{partnerStoreId} 매장 메뉴 조회
// /api/stores/menus/{menuId} 매장 메뉴 상세 조회

// axios 분리 - 🚩오직 백엔드 api와의 통신(CRUD)만을 담당.

// 🚩 더미 데이터 (테스트용도)
let DUMMY_STORE_MENUS = [
  {
    menuId: 'M001',
    partnerStoreId: 'S001',
    menuName: '아메리카노',
    price: 3500,
    menuImg: 'https://placehold.co/40x40/4CAF50/FFFFFF?text=☕',
    menuDesc: '가장 기본적인 에스프레소 추출 음료입니다.',
    menuStatus: 'ACTIVE',
    menuType: 'BEVERAGE',
    createdAt: '2025-10-10T09:00:00Z',
    updatedAt: '2025-10-31T14:44:25.581717',
  },
  {
    menuId: 'M002',
    partnerStoreId: 'S001',
    menuName: '카페 라떼',
    price: 4500,
    menuImg: 'https://placehold.co/40x40/2196F3/FFFFFF?text=🥛',
    menuDesc: '신선한 우유와 에스프레소의 부드러운 조화.',
    menuStatus: 'ACTIVE',
    menuType: 'BEVERAGE',
    createdAt: '2025-10-10T09:05:00Z',
    updatedAt: '2025-10-31T14:44:25.581717',
  },
  {
    menuId: 'M003',
    partnerStoreId: 'S001',
    menuName: '민트 초코 라떼',
    price: 5500,
    menuImg: 'https://placehold.co/40x40/FF9800/FFFFFF?text=🍫',
    menuDesc: '민트와 초콜릿의 상쾌하고 달콤한 만남.',
    menuStatus: 'INACTIVE',
    menuType: 'BEVERAGE',
    createdAt: '2025-10-15T15:30:00Z',
    updatedAt: '2025-10-31T14:44:25.581717',
  },
  {
    menuId: 'M004',
    partnerStoreId: 'S001',
    menuName: '플레인 크로와상',
    price: 3000,
    menuImg: 'https://placehold.co/40x40/607D8B/FFFFFF?text=🥐',
    menuDesc: '겉은 바삭하고 속은 촉촉한 기본 크로와상입니다.',
    menuStatus: 'ACTIVE',
    menuType: 'DESSERT',
    createdAt: '2025-10-20T11:00:00Z',
    updatedAt: '2025-10-31T14:44:25.581717',
  },
  {
    menuId: 'M005',
    partnerStoreId: 'S001',
    menuName: '클래식 브라우니',
    price: 4000,
    menuImg: 'https://placehold.co/40x40/795548/FFFFFF?text=🧁',
    menuDesc: '진한 초콜릿의 풍미가 가득한 브라우니.',
    menuStatus: 'ACTIVE',
    menuType: 'DESSERT',
    createdAt: '2025-10-20T11:05:00Z',
    updatedAt: '2025-10-31T14:44:25.581717',
  },
];

// 메뉴 리스트 조회 (GET)
// * @param {string} partnerStoreId - 매장 ID
export const fetchStoreMenus = async (partnerStoreId) => {
  // 🚩 [테스트 모드 시작] - axios 대신 더미 데이터 반환
  await new Promise((resolve) => setTimeout(resolve, 300)); // 통신 딜레이 모방

  // partnerStoreId에 해당하는 메뉴만 반환 (ManageMenu에서 S001로 고정)
  const result = DUMMY_STORE_MENUS.filter(
    (menu) => menu.partnerStoreId === partnerStoreId
  );
  return result;

  // 🚩 [실제 axios 코드 - 주석 처리]
  // try {
  //   const url = `${API_BASE_URL}/store/${partnerStoreId}`;
  //   const response = await axios.get(url);
  //   return response.data;
  // } catch (error) {
  //   console.error('메뉴 리스트 조회 실패 :', error);
  //   throw error;
  // }
};

// 메뉴 상세 정보 조회 - 일단 보류🚩

// 매장 메뉴 등록 (POST) - 파일 첨부 포함
//  * 신규 메뉴를 등록. 파일 업로드를 위해 FormData를 사용.
//  * @param {Object} menuData - 메뉴 정보를 담은 JSON 객체 (menuName, price, menuDesc 등)
//  * @param {File | null} imageFile - 첨부할 이미지 파일 (File 객체)
//  * @returns {Promise<Object>} 등록된 메뉴 정보 객체
export const registerMenu = async (menuData, imageFile) => {
  // 🚩 [테스트 모드 시작] - axios 대신 더미 데이터에 추가
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newMenuId = `M${Date.now()}`;
  const finalImageUrl = imageFile
    ? URL.createObjectURL(imageFile) // 새 파일 임시 URL
    : 'https://placehold.co/40x40/F44336/FFFFFF?text=NEW'; // 기본 이미지

  const newMenu = {
    ...menuData,
    menuId: newMenuId,
    menuImg: finalImageUrl,
    price: parseInt(menuData.price),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  DUMMY_STORE_MENUS.push(newMenu); // 더미 리스트에 추가
  return newMenu; // 등록된 메뉴 정보 반환

  // 🚩 [실제 axios 코드 - 주석 처리]
  // const url = `${API_BASE_URL}`;

  // // 파일과 json 데이터를 함께 보내기 위해 FormData를 사용
  // const formData = new FormData();

  // // 이미지 파일 추가 - ** 이건 경로인가?
  // if (imageFile) {
  //   formData.append('image', imageFile);
  // }

  // // 메뉴 json 데이터 추가
  // const menuJson = new Blob([JSON.stringify(menuData)], {
  //   type: 'application/json',
  // });
  // formData.append('menu', menuJson);

  // try {
  //   const response = await axios.post(url, formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data',
  //     },
  //   });
  //   return response.data;
  // } catch (error) {
  //   console.error('메뉴 등록 실패 :', error);
  //   throw error;
  // }
};

// 매장 메뉴 수정(PUT) - 파일 첨부 포함
// PUT /api/stores/menus/{menuId}
// * @param {string} menuId - 수정할 메뉴 ID

export const updateMenu = async (menuId, updateData, imageFIle) => {
  // 🚩 [테스트 모드 시작] - axios 대신 더미 데이터 업데이트
  await new Promise((resolve) => setTimeout(resolve, 500));

  let finalImageUrl = updateData.menuImg; // 기존 URL 보존

  // 새 파일이 있다면, 새 파일의 임시 URL을 사용합니다.
  if (imageFIle) {
    finalImageUrl = URL.createObjectURL(imageFIle);
  }

  const updatedMenu = {
    ...updateData,
    menuId,
    price: parseInt(updateData.price),
    menuImg: finalImageUrl,
    updatedAt: new Date().toISOString(),
  };

  // 더미 리스트 업데이트
  DUMMY_STORE_MENUS = DUMMY_STORE_MENUS.map((menu) =>
    menu.menuId === menuId ? updatedMenu : menu
  );

  return updatedMenu; // 수정된 메뉴 정보 반환

  // // 🚩 [실제 axios 코드 - 주석 처리]
  // const url = `${API_BASE_URL}/${menuId}`;

  // const formData = new FormData();

  // // 이미지 파일 추가
  // if (imageFIle) {
  //   formData.append('image', imageFIle);
  // }

  // // 메뉴 json 데이터 추가
  // const menuJson = new Blob([JSON.stringify(updateData)], {
  //   type: 'application/json',
  // });
  // formData.append('menu', menuJson);

  // try {
  //   // put 요청
  //   const response = await axios.put(url, formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data',
  //     },
  //   });
  //   return response.data;
  // } catch (error) {
  //   console.error(`메뉴 수정 실패 (ID : ${menuId}:`, error);
  //   throw error;
  // }
};

// 메뉴 정보 소프트 삭제 (DELETE)
// Endpoint: DELETE /api/stores/menus/{menuId}
//  * @param {string} menuId - 삭제할 메뉴 ID
export const deleteMenu = async (menuId) => {
  // 🚩 [테스트 모드 시작] - axios 대신 더미 데이터 삭제
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 더미 리스트에서 해당 ID 제거
  DUMMY_STORE_MENUS = DUMMY_STORE_MENUS.filter(
    (menu) => menu.menuId !== menuId
  );

  return { success: true }; // 성공 객체 반환

  // 🚩 [실제 axios 코드 - 주석 처리]
  // try {
  //   const url = `${API_BASE_URL}/${menuId}`;
  //   const response = await axios.delete(url);
  //   return response.data;
  // } catch (error) {
  //   console.error(`메뉴 삭제 실패 (ID: ${menuId}):`, error);
  //   throw error;
  // }
};
