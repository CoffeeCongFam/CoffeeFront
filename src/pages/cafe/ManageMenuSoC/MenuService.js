import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${BASE_URL}/api/stores/menus`;

// /api/stores/menus 매장 메뉴 등록
// /api/stores/menus/{menuId} 매장 메뉴 상세 정보 수정
// /api/stores/menus/{menuId} 메뉴 정보 소프트 삭제
// /api/stores/menus/store/{partnerStoreId} 매장 메뉴 조회
// /api/stores/menus/{menuId} 매장 메뉴 상세 조회

// axios 분리 역할 js - 🚩오직 백엔드 api와의 통신(CRUD)만을 담당.

// 🚩메뉴 리스트 조회 (GET)
// * @param {string} partnerStoreId - 매장 ID
export const fetchStoreMenus = async (partnerStoreId) => {
  // [실제 axios 코드]
  try {
    const url = `${API_BASE_URL}/store/${partnerStoreId}`;
    // 테스트용 PARTNER_STORE_ID
    const response = await axios.get(url);
    console.log(
      '✅ GET 성공, 데이터 로드 완료:',
      response.data.data.length,
      '개'
    );
    return response.data.data;
  } catch (error) {
    console.error('메뉴 리스트 조회 실패 :', error);
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
    formData.append('file', imageFile);
  }

  // 메뉴 json 데이터 추가
  const menuJson = new Blob([JSON.stringify(data)], {
    type: 'application/json',
  });
  formData.append('data', menuJson);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.success; // data를 반환할 필요가 없고, 그냥 성공만 return하거나..
  } catch (error) {
    console.error('메뉴 등록 실패 :', error);
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

  // 이미지 파일이 없는 경우 (기존 이미지 유지하게끔)
  // if (!imageFIle) {
  //   try {
  //     const response = await axios.patch(url, updateData, {
  //       // 기존 URL이 담긴 updateData
  //       headers: {
  //         'Content-Type': 'application/json', // JSON 타입 명시
  //       },
  //     });
  //     console.log('메뉴 수정 성공(기존 이미지 유지)');
  //     return response.data.success;
  //   } catch (error) {
  //     console.error('메뉴 수정 실패', error);
  //     throw error;
  //   }
  // } else {
  const formData = new FormData();

  // 이미지 파일 추가
  if (imageFIle) {
    formData.append('file', imageFIle);
  }

  // 메뉴 json 데이터 추가
  const menuJson = new Blob([JSON.stringify(updateData)], {
    type: 'application/json',
  });
  formData.append('data', menuJson);

  try {
    // put 요청
    const response = await axios.patch(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('메뉴 수정 완료');
    return response.data.success; // data를 반환할 필요가 없고, 그냥 성공만 return하거나..
  } catch (error) {
    console.error(`메뉴 수정 실패 (ID : ${menuId}:`, error);
    throw error;
  }
  // }
};
