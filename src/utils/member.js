import api from "./api";

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
    console.log("탈퇴 함수 실행");
    
    // sessionStorage에서 카카오 토큰 가져오기
    const kakaoToken = sessionStorage.getItem("kakaoToken");

    const response = await api.patch(
      "/active/update",
      { kakaoToken }, // 백엔드에서 unlink 처리용
      { withCredentials: true } // 쿠키 포함
    );

    if (response.data.success) {
      // JWT 등도 정리
      localStorage.removeItem("token");
      sessionStorage.removeItem("kakaoToken");
    }

    const success = response.data.success;
    console.log(success);
    return success;
  } catch (error) {
    console.error("Error data:", error);
    return null;
  }
}