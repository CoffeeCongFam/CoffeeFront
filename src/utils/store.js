import api from "./api";
export async function getStoreInfo(){ // 함수 이름에 오타가 있어 getReceiveGiftData로 수정하는 것을 권장합니다.
  try {
    const response = await api.get(`/owners/stores`);
        console.log("store axios: ",response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

export async function postStoreHourInfo(data){ // 함수 이름에 오타가 있어 getReceiveGiftData로 수정하는 것을 권장합니다.
  try {
    console.log("시간등록/수정 보낸 데이터: ", data)
    const response = await api.post(`/stores/storeHours/batch`, data);
        console.log("시간등록/수정 axios: ",response.data.success);
    return response.data.success;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

export async function patchStoreInfo(partnerStoreId, data){ // 함수 이름에 오타가 있어 getReceiveGiftData로 수정하는 것을 권장합니다.
  try {
    // console.log("시간등록/수정 보낸 데이터: ", data)
    console.log("수정 요청 스토어 아이디: ", partnerStoreId)
    const response = await api.patch(`/owners/stores/${partnerStoreId}`, data, {
      headers: {
        "Content-Type" : "multipart/form-data",
      }
    });
        // console.log("시간등록/수정 axios: ",response.data.success);
    return response.data.success;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}