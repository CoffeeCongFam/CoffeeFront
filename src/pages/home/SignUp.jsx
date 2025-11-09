import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button, IconButton, Typography } from "@mui/material";
import customerUser from "../../assets/customer2.png";
import storeUser from "../../assets/store2.png";
import useAppShellMode from "../../hooks/useAppShellMode";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";


const userTypeBoxStyle = {
  backgroundColor: "#ffffffff",
  gap: 1,
  borderRadius: "1rem",
  minHeight: "7rem",
  width: "fit-content",
  fontSize: "1.2rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "1rem",
  cursor: "pointer",
  boxShadow:"0 0 0 2px rgba(111, 78, 55, 0.2)",
};

const selectedStyle = {
  border: "2px solid #6f4e37",
  boxShadow: "0 0 0 2px rgba(111, 78, 55, 0.2)",
};

function SignUp() {
  const {isMobile} = useAppShellMode();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null); // 'CUSTOMER' | 'OWNER'

  useEffect(() => {
    console.log("Sign UP --------------------------");
    const query = new URLSearchParams(location.search);
    const fromPurpose = query.get("from-purpose");

    if (fromPurpose === "kakao") {
      alert("회원가입이 필요한 회원입니다.");
      navigate("/signup");
    }
  }, [location, navigate]);

  const CLIENT_KEY = import.meta.env.VITE_KAKAO_CLIENT_KEY;

  const buildKakaoUrl = (role) => {
    const LOGIN_REDIRECT_URI = import.meta.env.VITE_LOGIN_REDIRECT_URI;

    // role 예: 'CUSTOMER', 'OWNER' -> 백엔드랑 맞춰서 사용
    const encodedState = encodeURIComponent(role);

    return `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_KEY}&redirect_uri=${LOGIN_REDIRECT_URI}&response_type=code&state=${encodedState}`;
  };

  const handleKakaoLogin = () => {
    if (!selectedRole) return;
    window.location.href = buildKakaoUrl(selectedRole);
  };

  function handleBack() {
    navigate(-1);
  }


  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        margin: "0 auto",
        padding: 0,
        bgcolor: "#faf8f5",
        alignItems: "center",
        justifyContent: "center",
        pb: "10%",
      }}
    >
      {/* 뒤로가기 버튼: 왼쪽 고정 */}
                      <IconButton
                        onClick={handleBack}
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          zIndex: 2,
                          bgcolor: "rgba(0,0,0,0.45)",
                          color: "white",
                          "&:hover": {
                            bgcolor: "rgba(0,0,0,0.65)",
                          },
                        }}
                        aria-label="뒤로가기"
                      >
                        <ArrowBackIcon />
                      </IconButton>
      <Typography
        variant="h6"
        sx={{ color: "black", fontSize: isMobile ? "1rem" :"1.3rem", fontWeight: "bold" }}
      >
        어떤 회원으로 가입하시겠어요 ? ☕
      </Typography>

      {/* 타입 선택 영역 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
          width: "100%",
          margin: "0 auto",
          px: "10%",
          mt: "3%",
          justifyContent: "center",
        }}
      >
        {/* 일반 소비자 */}
        <Box
          sx={{
            ...userTypeBoxStyle,
            ...(selectedRole === "CUSTOMER" ? selectedStyle : {}),
          }}
          onClick={() => setSelectedRole("CUSTOMER")}
        >
          <img src={customerUser} style={{ width: "40%" }} />
          <Typography sx={{ mb: 1, fontWeight: "bold" }}>일반회원</Typography>
        </Box>

        {/* 점주 */}
        <Box
          sx={{
            ...userTypeBoxStyle,
            ...(selectedRole === "OWNER" ? selectedStyle : {}),
          }}
          onClick={() => setSelectedRole("OWNER")}
        >
          <img src={storeUser} style={{ width: "40%" }} />
          <Typography sx={{ mb: 1 , fontWeight: "bold"}}>점주회원</Typography>
        </Box>

        
      </Box>

      {/* 카카오 로그인 버튼 */}
      <Button
        variant="contained"
        onClick={handleKakaoLogin}
        disabled={!selectedRole}
        sx={{
          mt: 4,
          bgcolor: "#FEE500",
          color: "black",
          "&:hover": { bgcolor: "#FADA0A" },
          px: 4,
        }}
      >
        카카오로 계속하기
      </Button>
    </Box>
  );
}

export default SignUp;
