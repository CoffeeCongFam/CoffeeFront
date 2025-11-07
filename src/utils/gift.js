import api from "./api";

export async function getGiftData() {
  try {
    const response = await api.get("/me/purchase/gift");
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

export async function getSendGiftData() {
  try {
    const response = await api.get("/me/purchase/gift/send");
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

export async function getReceievGiftData() {
  try {
    const response = await api.get("/me/purchase/gift/receive", {
      transformResponse: [
        (data) => {
          if (typeof data === "string") {
            try {
              return JSON.parse(data); // 문자열이면 JSON으로 파싱
            } catch (e) {
              console.error("JSON 파싱 실패:", e);
              return data;
            }
          }
          return data;
        },
      ],
    });

    const resData = response.data;

    console.log("response.data:", resData);

    if (resData && resData.success && Array.isArray(resData.data)) {
      return resData.data; // 정상 구조
    } else if (Array.isArray(resData)) {
      return resData; // 배열만 주는 경우
    } else {
      console.error("API 응답 구조 오류:", resData);
      return null;
    }
  } catch (error) {
    console.error("API 호출 오류:", error);
    throw error;
  }
}

// 보낸 선물 단일조회
export async function getSendGift(purchaseId) {
  try {
    console.log("보낸선물 단일 조회 요청됨!");
    const response = await api.get(
      `/me/purchase/gift/send?purchaseId=${purchaseId}`
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}
// 받은 선물 단일 조회
export async function getReceiveGift(memberSubscriptionId) {
  try {
    console.log("받은선물 단일 조회 요청됨!");
    console.log(memberSubscriptionId);
    const response = await api.get(
      `/me/purchase/gift/receive?memberSubscriptionId=${memberSubscriptionId}`
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}
