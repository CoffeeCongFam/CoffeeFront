import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import kakaoBtn from "../../assets/kakao_login_medium_wide.png";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/common/Loading";

function Landing() {
  const [isLoading, setIsLoading] = useState(false);
  let navigate = useNavigate();
  // 카카오 소셜로그인 필요한 코드 및 주소
  const JAVASCRIPT_API_KEY = '46061414e5a25e9d2320da056e3f4407';
  const REDIRECT_URI = `http://localhost:5173/kakaoRedirect`;
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${JAVASCRIPT_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  // 카카오 로그인 버튼
  const kakaoLogin = (e) => {
      e.preventDefault();
      window.location.href = KAKAO_AUTH_URL;
  };
  
  return (
    <Box
      sx={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0
    }}>
      {/* 왼쪽 검정색 영역 */}
      <div style={{
        flex: 1,
        backgroundColor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      </div>
      
      {/* 오른쪽 텍스트 영역 */}
      <div style={{
        flex: 1,
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        fontSize: '24px',
        color: 'black'
      }}>
        <Button onClick={() => setIsLoading(!isLoading)}>로딩 화면 테스트</Button>
        <button
          onClick={kakaoLogin}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
          aria-label="카카오 로그인"
        >
          <img
            src={kakaoBtn}
            alt="카카오 로그인"
            style={{ height: '45px', borderRadius: '8px' }}
          />
        </button>
        <Button
          variant="contained"
          onClick={() => navigate('/signup')}
          sx={{
            backgroundColor: 'black',
            '&:hover': { backgroundColor: '#111' },
            textTransform: 'none',
            borderRadius: '8px',
            padding: '8px 16px'
          }}
        >회원가입</Button>
      </div>
      {
        isLoading && <Loading />
      }
    </Box>
  )
}

export default Landing;
