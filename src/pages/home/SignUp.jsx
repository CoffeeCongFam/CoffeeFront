import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

const userTypeBoxStyle = {
  backgroundColor: 'black',
  borderRadius: '1rem',
  minHeight: '7rem',
  flex: 1,
  fontSize: '1.2rem',
};

function SignUp() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    console.log('Sign UP --------------------------');
    const query = new URLSearchParams(location.search);
    const fromPurpose = query.get('from-purpose');

    // 비회원이 카카오톡 간편 로그인 접근 : 백엔드에서 redirecturl + SignUp?from-purpose=kakao로 온 경우
    if (fromPurpose === 'kakao') {
      alert('회원가입이 필요한 회원입니다.');
      navigate('/signup');
    }
  }, [location, navigate]);
  const CLIENT_KEY = import.meta.env.VITE_KAKAO_CLIENT_KEY;

  const buildKakaoUrl = (role) => {
    const LOGIN_REDIRECT_URI = import.meta.env.VITE_LOGIN_REDIRECT_URI;

    const encodedState = encodeURIComponent(role);

    const URI = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_KEY}&redirect_uri=${LOGIN_REDIRECT_URI}&response_type=code&state=${encodedState}`;
    return URI;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        pb: '10%',
      }}
    >
      <Typography sx={{ color: 'black', fontSize: '1.3rem' }}>
        어떤 회원으로 가입하시겠어요 ? ☕
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '1rem',
          width: '100%',
          px: '10%',
          mt: '3%',
        }}
      >
        <Button
          variant="contained"
          onClick={() => {
            window.location.href = buildKakaoUrl('member');
          }}
          sx={userTypeBoxStyle}
          // sx={{
          //   backgroundColor: "black",
          //   "&:hover": { backgroundColor: "#111" },
          //   borderRadius: "12px",
          //   fontSize: "20px",
          //   fontWeight: "bold",
          //   textTransform: "none",
          // }}
        >
          일반회원
          <img src="../../assets/coffeiensLogoTitle.png" />
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            window.location.href = buildKakaoUrl('customer');
          }}
          sx={userTypeBoxStyle}
          // sx={{
          //   backgroundColor: "black",
          //   "&:hover": { backgroundColor: "#111" },
          //   borderRadius: "12px",
          //   fontSize: "20px",
          //   fontWeight: "bold",
          //   textTransform: "none",
          // }}
        >
          점주회원
        </Button>
      </Box>
    </Box>
  );
}

export default SignUp;
