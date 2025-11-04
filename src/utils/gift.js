// let BASE_URL = "https://566e8ca2-16d7-45d7-8097-da13ce9bd28d.mock.pstmn.io"
let BASE_URL = "http://localhost:8080"

import axios from "axios";

export async function getGiftData() {
  try {
    const response = await axios.get(`${BASE_URL}/api/me/purchase/gift`);
    // console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

export async function getSendGiftData() {
  try {
    const response = await axios.get(`${BASE_URL}/api/me/purchase/gift/send`);
    console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

export async function getReceievGiftData() { // 함수 이름에 오타가 있어 getReceiveGiftData로 수정하는 것을 권장합니다.
  try {
    const response = await axios.get(`${BASE_URL}/api/me/purchase/gift/receive`);
    // console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

export async function getSendGift(purchaseId){ // 함수 이름에 오타가 있어 getReceiveGiftData로 수정하는 것을 권장합니다.
  try {
    const response = await axios.get(`${BASE_URL}/api/me/purchase/gift/send?purchaseId=${purchaseId}`);
    // console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

export async function getReceiveGift(memberSubscriptionId){ // 함수 이름에 오타가 있어 getReceiveGiftData로 수정하는 것을 권장합니다.
  try {
    console.log(memberSubscriptionId);
    const response = await axios.get(`${BASE_URL}/api/me/purchase/gift/receive?memberSubscriptionId=${memberSubscriptionId}`);
    // console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}