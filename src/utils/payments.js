import api from "./api";
export async function getPaymentsHistory(){ // 함수 이름에 오타가 있어 getReceiveGiftData로 수정하는 것을 권장합니다.
  try {
    console.log();
    const response = await api.get(`/me/purchase/gift/receive?memberSubscriptionId`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

export async function postRefund(purchaseId){ 
  try {
    const response = await api.patch(`/me/purchase/refund/${purchaseId}`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}