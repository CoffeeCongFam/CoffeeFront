import React, { useState, useEffect } from "react";
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
import useUserStore from "../../stores/useUserStore";

import kakaoBtn from "../../assets/kakaoLoginIcon.png";
import monkeyLogo from "../../assets/coffeiensLogoTitle.png";
import LoginIcon from "@mui/icons-material/Login";
import { TokenService } from "../../utils/api";

function Landing() {
  const { isAppLike } = useAppShellMode();
  const navigate = useNavigate();
  const { authUser, setUser } = useUserStore();
  const [active, setActive] = useState("hero");
  const isMobile = useMediaQuery("(max-width:900px)");

  useEffect(() => {
    // 현재 페이지를 히스토리 스택에 추가하여 뒤로가기 시도를 감지합니다.
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // 뒤로가기 시도가 감지되면 다시 현재 페이지의 히스토리를 추가하여
      // 페이지 전환을 막습니다.
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const sections = ["hero", "customer", "store", "cta"];
  const containerRef = (React.useRef < HTMLDivElement) | (null > null);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight } = e.currentTarget;
    const index = Math.round(scrollTop / clientHeight);
    const sec = sections[index] || sections[0];
    setActive(sec);
  };

  // 카카오 소셜로그인 필요한 코드 및 주소
  const CLIENT_KEY = import.meta.env.VITE_KAKAO_CLIENT_KEY;
  const LOGIN_REDIRECT_URI = import.meta.env.VITE_LOGIN_REDIRECT_URI;

  // 카카오 로그인 버튼
  const kakaoLogin = async () => {
    let URI = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_KEY}&redirect_uri=${LOGIN_REDIRECT_URI}&response_type=code`;

    window.location.href = URI;
  };

  // 로그인 상태 확인용 로그
  useEffect(() => {
    if (!authUser) {
      const cachedUser = TokenService.getUser();
      if (cachedUser) {
        setUser(cachedUser);
      }
    }
  }, [authUser, setUser]);

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
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
              sx={{
                color: "#cc5f2b",
                fontWeight: 600,
                fontSize: isMobile ? "0.8rem" : "1rem",
              }}
            >
              우리는 생각한다. 고로 커피를 마신다… ☕
            </Typography>
            <Typography
              sx={{
                fontSize: isMobile ? "1.6rem" : "2.3rem",
                fontWeight: 700,
                lineHeight: 1.25,
                color: "#4a3426",
              }}
            >
              당신의 하루를 진화시키는
              <br />
              커피 구독 플랫폼, COFFEIENS
            </Typography>
            <Typography
              sx={{
                color: "#4a3426",
                fontSize: isMobile ? "0.8rem" : "1rem",
                mt: 1,
              }}
            >
              매일의 커피 한 잔이 당신의 하루를 바꾸듯,
              <br />
              COFFEIENS는 소비자에게는 더 현명한 하루를,
              <br />
              사장님들께는 꾸준히 찾아오는 단골의 기쁨을 선물합니다.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mt: 6 }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#c84436",
                  textTransform: "none",
                  borderRadius: "9999px",
                  flex: isMobile && 1,
                  px: isMobile || 6,
                  "&:hover": { backgroundColor: "#b0382b" },
                }}
                endIcon={<LoginIcon />}
                onClick={kakaoLogin}
              >
                계정 활성화하기
              </Button>
            </Box>
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
              px: isMobile ? 3 : 14,
              gap: 2,
            }}
          >
            <Typography
              sx={{
                color: "#cc5f2b",
                fontWeight: 600,
                fontSize: isMobile ? "0.8rem" : "1rem",
              }}
            >
              매일의 커피, 더 똑똑하게 즐기다
            </Typography>
            <Typography
              sx={{
                fontSize: isMobile ? "1.5rem" : "2.3rem",
                fontWeight: 700,
                color: "#4a3426",
              }}
            >
              매일 마시는 커피,
              <br /> 이제는 구독으로 더 합리적이게
            </Typography>
            <Typography
              sx={{ color: "#4a3426", fontSize: isMobile ? "0.8rem" : "1rem" }}
            >
              CoffeeEns는 당신이 자주 가는 동네 카페를 구독으로 연결해줍니다.
              <br />한 달 구독으로 매일의 커피를 더 합리적으로, 줄 서지 않고
              간편하게 즐기세요.
            </Typography>
            <Typography
              sx={{ color: "#4a3426", fontSize: isMobile ? "0.8rem" : "1rem" }}
            >
              좋아하는 카페가 ‘나만의 사이렌 오더’가 됩니다.
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 6 }}>
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
              px: isMobile ? 3 : 14,
              gap: 2,
            }}
          >
            <Typography
              sx={{
                color: "#cc5f2b",
                fontWeight: 600,
                fontSize: isMobile ? "0.8rem" : "1rem",
              }}
            >
              예측 가능한 매출, 사장님의 새로운 루틴
            </Typography>
            <Typography
              sx={{
                fontSize: isMobile ? "1.6rem" : "2.3rem",
                fontWeight: 700,
                color: "#4a3426",
              }}
            >
              {/* 이제 우리 카페에도 사이렌 오더가 생깁니다. */}
              {/* <br /> */}
              단골은 늘리고, <br />
              매출은 안정적으로
              {/* 매출은 예측 가능하게 */}
            </Typography>
            <Typography
              sx={{ color: "#4a3426", fontSize: isMobile ? "0.8rem" : "1rem" }}
            >
              구독을 통해 꾸준히 방문하는 단골을 만들어줍니다.
              <br />
              매일 찾는 단골 고객을 확보하고, <br /> 주문과 결제를 간편하게
              관리하세요. <br />
              프랜차이즈의 시스템을 비용 부담 없이 당신의 카페로.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mt: 6,
                justifyContent: isMobile && "flex-end",
              }}
            >
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
