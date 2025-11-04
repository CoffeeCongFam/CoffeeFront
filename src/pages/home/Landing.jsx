import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Element, Link } from "react-scroll";
import { useNavigate } from "react-router-dom";
import useAppShellMode from "../../hooks/useAppShellMode";

import kakaoBtn from "../../assets/kakaoLoginIcon.png";
import monkeyLogo from "../../assets/CoffeiensLogo.png";

function Landing() {
  const { isAppLike } = useAppShellMode();
  const navigate = useNavigate();
  const [active, setActive] = useState("hero");
  const isMobile = useMediaQuery("(max-width:900px)");

  // 카카오 소셜로그인 필요한 코드 및 주소
  const CLIENT_KEY = import.meta.env.VITE_KAKAO_CLIENT_KEY;
  const REDIRECT_URI = `http://localhost:8080/auth/kakao/callback`;

  // 카카오 로그인 버튼
  const kakaoLogin = () => {
    console.log("KAKAO LOGIN-----------------------");
    const URI = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = URI;
  };

  const sections = ["hero", "customer", "store", "cta"];

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        overflowY: "auto",
        scrollSnapType: "y mandatory",
        backgroundColor: "#f6e4d1",
      }}
    >
      {/* 오른쪽 점 네비게이션 */}
      {!isMobile && (
        <Box
          sx={{
            position: "fixed",
            right: 30,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            zIndex: 10,
          }}
        >
          {sections.map((sec) => (
            <Link
              key={sec}
              to={sec}
              spy={true}
              smooth={true}
              duration={500}
              offset={0}
              onSetActive={() => setActive(sec)}
            >
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "9999px",
                  border: "2px solid #a16246",
                  backgroundColor: active === sec ? "#a16246" : "transparent",
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              />
            </Link>
          ))}
        </Box>
      )}

      {/* ------------------- 1 챕터 ------------------- */}
      <Element name="hero" onSetActive={() => setActive("hero")}>
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            scrollSnapAlign: "start",
          }}
        >
          {/* 왼쪽 이미지 영역 */}
          {!isAppLike && !isMobile && (
            <Box
              sx={{
                flex: 1,
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={monkeyLogo}
                alt="COFFEIENS Logo"
                style={{ maxWidth: "380px", height: "auto" }}
              />
            </Box>
          )}

          {/* 오른쪽 컨텐츠 영역 */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: "#f6e4d1", // 베이지
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: isMobile ? 3 : 12,
              gap: 2,
              width: "100%",
            }}
          >
            <Typography
              sx={{ color: "#cc5f2b", fontWeight: 600, fontSize: "0.95rem" }}
            >
              우리는 생각한다. 고로 커피를 마신다… ☕
            </Typography>
            <Typography
              sx={{
                fontSize: isMobile ? "1.8rem" : "2.3rem",
                fontWeight: 700,
                lineHeight: 1.25,
                color: "#4a3426",
              }}
            >
              당신의 하루를 진화시키는
              <br />
              커피 구독 플랫폼, CoffeeEns
            </Typography>
            <Typography sx={{ color: "#4a3426", fontSize: "0.9rem" }}>
              매일의 커피 한 잔이 당신의 하루를 바꾸듯,
              <br />
              COFFEIENS는 소비자에게는 더 현명한 하루를,
              <br />
              사장님들께는 꾸준히 찾아오는 단골의 기쁨을 선물합니다.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#c84436",
                  textTransform: "none",
                  borderRadius: "9999px",
                  px: 4,
                  "&:hover": { backgroundColor: "#b0382b" },
                }}
                onClick={() => navigate("/signup")}
              >
                회원 가입하기
              </Button>
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#4a3426",
                  color: "#4a3426",
                  textTransform: "none",
                  borderRadius: "9999px",
                  px: 3,
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  "&:hover": {
                    borderColor: "#4a3426",
                    backgroundColor: "rgba(74,52,38,0.05)",
                  },
                }}
                onClick={kakaoLogin}
                // onClick={() =>
                //   scroller.scrollTo("cta", { smooth: true, duration: 500 })
                // }
              >
                로그인 →
              </Button>
            </Box>

            {/* 다음으로 내려가는 버튼 */}
            <Link to="feature" smooth duration={500}>
              <IconButton
                sx={{
                  mt: 4,
                  width: 34,
                  height: 34,
                  borderRadius: "9999px",
                  border: "2px solid #4a3426",
                  color: "#4a3426",
                }}
              >
                •••
              </IconButton>
            </Link>
          </Box>
        </Box>
      </Element>

      {/* ------------------- 2 챕터 (소비자 타겟)------------------- */}
      <Element name="customer" onSetActive={() => setActive("customer")}>
        <Box
          sx={{
            height: "100vh",
            scrollSnapAlign: "start",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            backgroundColor: "#fff5eb",
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: isMobile ? 3 : 6,
              gap: 2,
            }}
          >
            <Typography sx={{ color: "#cc5f2b", fontWeight: 600 }}>
              매일의 커피, 더 똑똑하게 즐기다
            </Typography>
            <Typography
              sx={{ fontSize: "2rem", fontWeight: 700, color: "#4a3426" }}
            >
              매일 마시는 커피,
              <br /> 이제는 구독으로 더 합리적이게
            </Typography>
            <Typography sx={{ color: "#4a3426" }}>
              CoffeeEns는 당신이 자주 가는 동네 카페를 구독으로 연결해줍니다.
              <br />한 달 구독으로 매일의 커피를 더 합리적으로, 줄 서지 않고
              간편하게 즐기세요.
            </Typography>
            <Typography sx={{ color: "#4a3426" }}>
              좋아하는 카페가 ‘나만의 사이렌 오더’가 됩니다.
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Link to="cta" smooth duration={500}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#c84436",
                    textTransform: "none",
                    borderRadius: "9999px",
                  }}
                >
                  바로 시작하기
                </Button>
              </Link>
            </Box>
          </Box>
        </Box>
      </Element>
      {/* ------------------- 3 챕터 (점주 타겟)------------------- */}
      <Element name="store" onSetActive={() => setActive("store")}>
        <Box
          sx={{
            height: "100vh",
            scrollSnapAlign: "start",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            backgroundColor: "#fff5eb",
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: isMobile ? 3 : 6,
              gap: 2,
            }}
          >
            <Typography sx={{ color: "#cc5f2b", fontWeight: 600 }}>
              구독이니까 가능한 일
            </Typography>
            <Typography
              sx={{ fontSize: "2rem", fontWeight: 700, color: "#4a3426" }}
            >
              한 번 결제하고
              <br />한 달 내내 커피만 고르세요.
            </Typography>
            <Typography sx={{ color: "#4a3426" }}>
              소비자는 번거로운 결제를 줄이고,
              <br />
              사장님은 예측 가능한 매출을 만들 수 있습니다.
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Link to="cta" smooth duration={500}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#c84436",
                    textTransform: "none",
                    borderRadius: "9999px",
                  }}
                >
                  바로 시작하기
                </Button>
              </Link>
            </Box>
          </Box>
        </Box>
      </Element>

      {/* ------------------- 4 챕터 (로그인/카카오) ------------------- */}
      <Element name="cta" onSetActive={() => setActive("cta")}>
        <Box
          sx={{
            height: "100vh",
            scrollSnapAlign: "start",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: isMobile ? "flex-start" : "center",
            backgroundColor: "#f6e4d1",
            px: isMobile ? 3 : 0,
          }}
        >
          <Typography
            sx={{
              fontSize: "1.4rem",
              fontWeight: 600,
              color: "#4a3426",
              mb: 2,
            }}
          >
            지금 COFFEIENS에 합류하세요.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#4a3426",
                textTransform: "none",
                borderRadius: "9999px",
                px: 4,
                "&:hover": { backgroundColor: "#3a2a1f" },
              }}
              onClick={() => navigate("/signup")}
            >
              회원가입 하러 가기
            </Button>

            {/* 카카오 버튼 */}
            <IconButton
              onClick={kakaoLogin}
              sx={{
                background: "transparent",
                border: "none",
                p: 0,
              }}
              aria-label="카카오 로그인"
            >
              <img
                src={kakaoBtn}
                alt="카카오 로그인"
                style={{ height: "44px", borderRadius: "10px" }}
              />
            </IconButton>
          </Box>
        </Box>
      </Element>
    </Box>
  );
}

export default Landing;
