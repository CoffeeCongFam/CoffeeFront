import React, { useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/common/Loading";
import { Box } from "@mui/material";
import api from "../../utils/api";

function KakaoRedirectProd() {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const hasRunRef = useRef(false);

  const kakaoLoginHandler = async (code, state) => {
    try {
      console.log("KakaoRedirect: kakaoLoginHandler 실행");

      const res = await axios.get(
        `${BASE_URL}/auth/kakao/callback?code=${code}&state=${state}`,
        {
          withCredentials: true,
        }
      );

      if (res.status !== 200) {
        throw new Error(`Unexpected status: ${res.status}`);
      }

      const data = res.data;
      console.log("백엔드 응답:", data);

      // 90일 이내 탈퇴 회원 안내
      if (data.isActiveStatus === true) {
        const proceed = window.confirm(
          "탈퇴한 계정입니다. 새로운 로그인 창에서 다시 로그인하시겠습니까?"
        );

        
        if (proceed) {
          navigate("/relanding");
          await api.patch("/member/active", {memberId:data.memberId});
          
        } else {
          // 취소 시 아무 동작 없이 현재 화면 유지
          console.log("사용자가 로그인 진행을 취소했습니다.");
        }
        return;
      }

      // JWT는 쿠키에 httpOnly로 저장되어 있으므로 JS에서 접근 불가
      // SPA 라우팅 판단은 memberType 기반
      if (data.isMember) {
        if (data.memberType === "GENERAL") {
          navigate("/me");
        } else if (data.memberType === "STORE") {
          navigate("/store");
        } else {
          console.warn("알 수 없는 memberType:", data.memberType);
          navigate("/");
        }
      } else {
        // 회원가입이 필요한 경우
        if (data.state === "CUSTOMER") {
          navigate("/memberSignUp?token=" + data.accessToken);
        } else if (data.state === "OWNER") {
          navigate("/customerSignUp?token=" + data.accessToken);
        } else {
          navigate("/signup?token=" + data.accessToken);
        }
      }
    } catch (err) {
      console.error("카카오 로그인 처리 에러:", err);
      window.alert("로그인에 실패했습니다.");
      navigate("/");
    }
  };

  useEffect(() => {
    if (hasRunRef.current) {
      console.log("KakaoRedirect effect already run. Skip.");
      return;
    }
    hasRunRef.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code) {
      console.log("인가 코드 획득:", code);
      kakaoLoginHandler(code, state);
    } else {
      console.error("인가 코드를 획득하지 못했습니다.");
      navigate("/");
    }
  }, []);

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <Loading
        message={"COFFEIENS에 오신 걸 환영해요 ☕️"}
        title={"로그인 중입니다."}
      />
    </Box>
  );
}

export default KakaoRedirectProd;
