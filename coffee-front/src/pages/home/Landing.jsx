import React from "react";
import kakaoBtn from "../../assets/kakao_login_medium_wide.png";
import { useNavigate } from "react-router-dom";

function Landing() {
  let navigate = useNavigate();
  // 카카오 소셜로그인 필요한 코드 및 주소
  const REST_API_KEY = '2ceea440100a5441ab093de7a7f761b3';
  const REDIRECT_URI = `http://localhost:5173/kakaoRedirect`;
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  // 카카오 로그인 버튼
  const kakaoLogin = (e) => {
      e.preventDefault();
      window.location.href = KAKAO_AUTH_URL;
  };
  
  return (
    <div style={{
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
        <button onClick={() => navigate('/signup')}>회원가입</button>
      </div>
    </div>
  )
}

export default Landing;
