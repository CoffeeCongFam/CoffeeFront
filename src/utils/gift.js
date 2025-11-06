import api from "./api";

export async function getGiftData() {
  try {
    const response = await api.get("/me/purchase/gift");
    // console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

export async function getSendGiftData() {
  try {
    const response = await api.get("/me/purchase/gift/send");
    console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

export async function getReceievGiftData() { 
  try {
    const response = await api.get("/me/purchase/gift/receive", {
      transformResponse: [(data) => {
        try {
          // Remove any characters before the first {
          const jsonStart = data.indexOf('{');
          if (jsonStart > 0) {
            data = data.substring(jsonStart);
          }
          const parsed = JSON.parse(data);
          return parsed;
        } catch (e) {
          console.error("Error parsing response data:", e);
          return data;
        }
      }]
    });
    // Safely access nested data
    const resultData = response.data?.data ?? (response.data?.result?.data ?? null);
    console.log("[getReceievGiftData] parsed:", response.data.data);
    return resultData;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

export async function getSendGift(purchaseId){ 
  try {
    const response = await api.get(`/me/purchase/gift/send?purchaseId=${purchaseId}`);
    // console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

export async function getReceiveGift(memberSubscriptionId){ 
  try {
    console.log(memberSubscriptionId);
    const response = await api.get(`/me/purchase/gift/receive?memberSubscriptionId=${memberSubscriptionId}`);
    // console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}
