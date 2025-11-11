import React, { useEffect } from "react";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore";

function Withdrawal() {
  const navigate = useNavigate();
  const { clearUser } = useUserStore();

  useEffect(() => {
    // 1. Zustand 스토어 초기화
    if (typeof clearUser === "function") {
      clearUser();
    }

    // 2. localStorage 초기화
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear();
    }

    // 3. sessionStorage 초기화 (필요 시)
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.clear();
    }

    // 4. 쿠키 삭제
    if (typeof document !== "undefined" && document.cookie) {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
    }

    // 현재 페이지를 히스토리 스택에 추가하여 뒤로가기 시도를 감지할 수 있도록 합니다.
    window.history.pushState(null, "", window.location.href);

    const handlePopState = (event) => {
      // 사용자가 뒤로가기를 시도하면 홈으로 보냅니다.
      navigate("/", { replace: true });
    };

    // popstate 이벤트 리스너를 추가합니다.
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState); // 컴포넌트 언마운트 시 리스너 제거
    };
  }, [navigate, clearUser]);

  const handleGoodbyeConfirm = () => {
    navigate("/", { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#fff9f4',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 4,
          boxShadow: 6,
          bgcolor: 'white',
          border: '1px solid #ffe0b2',
        }}
      >
        <CardContent
          sx={{
            px: 4,
            py: 5,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: '#334336' }}>
            언젠간 다시 돌아오세요
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#334336' }}>
            커피엔스의 커피 세상으로
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#334336', mb: 4, lineHeight: 1.7 }}
          >
            매일의 커피 한 잔으로 하루를 진화시키던 그 시간들처럼,
            <br />
            언젠가 다시, 당신의 하루를 깨우는 커피 한 잔이 필요해질 때
            <br />
            COFFIENS가 여기에서 기다리고 있을게요.
          </Typography>
          <Button
            variant="contained"
            onClick={handleGoodbyeConfirm}
            sx={{
              borderRadius: 999,
              px: 4,
              py: 1.2,
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: '#334336',
              color: '#fff9f4',
              '&:hover': {
                bgcolor: '#334336',
                opacity: 0.9,
              },
            }}
          >
            확인
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Withdrawal;
