import axios from "axios";
export async function getPaymentsHistory(){ // 함수 이름에 오타가 있어 getReceiveGiftData로 수정하는 것을 권장합니다.
  try {
    console.log();
    const response = await axios.get(`/me/purchase/gift/receive?memberSubscriptionId`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

export async function postRefund(purchaseId){ 
  try {
    const response = await axios.patch(`https://566e8ca2-16d7-45d7-8097-da13ce9bd28d.mock.pstmn.io/api/me/purchase/refund/${purchaseId}`);
     console.log("여기야여기------", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

export async function getPayments(){ 
  try {
    const response = await axios.get(`https://566e8ca2-16d7-45d7-8097-da13ce9bd28d.mock.pstmn.io/api/me/purchase`);
       
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}
