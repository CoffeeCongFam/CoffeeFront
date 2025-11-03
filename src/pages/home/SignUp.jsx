import React from "react";
// import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

function SignUp() {
  // let navigate = useNavigate();
  const CLIENT_KEY = import.meta.env.VITE_KAKAO_CLIENT_KEY;

  const buildKakaoUrl = (role) => {
    const REDIRECT_URI = `http://localhost:8080/auth/kakao/callback`;

    const encodedState = encodeURIComponent(role);

    const URI = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code&state=${encodedState}`;
    return URI;
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "24px",
            color: "black",
          }}
        >
          버튼 클릭시 카카오 인증 페이지로 이동됩니다.
        </div>
        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={() => {
              window.location.href = buildKakaoUrl("member");
            }}
            sx={{
              backgroundColor: "black",
              "&:hover": { backgroundColor: "#111" },
              width: "320px",
              height: "140px",
              borderRadius: "12px",
              fontSize: "20px",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            일반회원
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              window.location.href = buildKakaoUrl("customer");
            }}
            sx={{
              backgroundColor: "black",
              "&:hover": { backgroundColor: "#111" },
              width: "320px",
              height: "140px",
              borderRadius: "12px",
              fontSize: "20px",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            점주회원
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
