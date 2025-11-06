import api from "./api";
export async function getStoreInfo(){ // 함수 이름에 오타가 있어 getReceiveGiftData로 수정하는 것을 권장합니다.
  try {
    console.log();
    const response = await api.get(`/owners/stores`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}