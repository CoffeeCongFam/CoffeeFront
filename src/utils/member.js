import api from "./api";
import useUserStore from "../stores/useUserStore";

export async function postCafe(data) {
  try {
    const response = await api.post("/memberInfo/update", data, {
      headers: {
        "Content-Type" : "multipart/form-data",
      }
    });
    // console.log(response.data.data)
    return response.data.success === true;
  } catch (error) {
    console.error("Error fetching cafe data:", error);
    return null;
  }
}

// 회원 정보 수정
export async function patchMember(data){ 
  try {
    const response = await api.patch("/memberInfo/update", data);
    console.log(response.data.success)
    return response.data.success;
  } catch (error) {
    console.error("Error fetching gift data:", error);
    return null;
  }
}

// 회원 탈퇴
export async function withdrawal() {
  try {
    const response = await api.patch("/active/update");
    const success = response.data.success;
    console.log(success);
    return success;
  } catch (error) {
    console.error("Error data:", error);
    return null;
  }
}