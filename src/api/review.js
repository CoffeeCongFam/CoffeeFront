let BASE_URL = "https://566e8ca2-16d7-45d7-8097-da13ce9bd28d.mock.pstmn.io"

import axios from "axios";

export async function getReview(){ // 함수 이름에 오타가 있어 getReceiveGiftData로 수정하는 것을 권장합니다.
  try {
    const response = await axios.get(`${BASE_URL}/api/reviews/me`);
    // console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}


export async function deleteReview({reviewId}){ // 함수 이름에 오타가 있어 getReceiveGiftData로 수정하는 것을 권장합니다.
  try {
    const response = await axios.delete(`${BASE_URL}/api/reviews/${reviewId}`);
    console.log(response.data.success)
    return response.data.success == true;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}