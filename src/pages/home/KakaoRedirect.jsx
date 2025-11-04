import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 컴포넌트 이름을 역할에 맞게 변경하는 것을 권장합니다. (예: KakaoRedirect)
function KakaoRedirect() { 
    const navigate = useNavigate();
    // 2. 인가 코드를 백엔드 서버로 전송하는 비동기 함수 정의
    const kakaoLoginHandler = async (code, role) => {
        try {
            // 백엔드 API 호출 (URL과 메소드는 백엔드 개발자와 협의된 대로 설정)
            const res = await axios({
                method: 'GET',

                url: `http://localhost:8080/auth/kakao/callback?code=${code}`,
                withCredentials: true,
            });
            if (res.status !== 200) {
                throw new Error(`Unexpected status: ${res.status}`);
            }

            // 3. 성공 응답 처리
            const ACCESS_TOKEN = res.data.accessToken;
            
            // 받아온 토큰을 로컬 스토리지에 저장하여 로그인 상태 유지
            localStorage.setItem('token', ACCESS_TOKEN);
            console.log('로그인 성공! Local Storage에 토큰 저장됨.');
            
            // 4. 역할별 회원가입 페이지로 이동
            if (role === 'member') {
                navigate('/memberSignUp');
            } else if (role === 'customer') {
                navigate('/customerSignUp');
            } else {
                navigate('/main');
            }
            // 4. 메인 페이지로 이동
            // navigate('/main');
            
        } catch (err) {
            // 5. 에러 처리
            console.error('카카오 소셜 로그인 에러:', err);
            window.alert('로그인에 실패하셨습니다.');
            navigate('/'); // 초기 페이지로 이동
        }
    };

    // 1. 컴포넌트가 마운트될 때 인가 코드 파싱 및 로그인 함수 실행
    useEffect(() => {
        // 현재 URL의 쿼리 파라미터에서 'code' 값 추출
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const role = urlParams.get('role');
        if (code) {
            console.log("인가 코드 획득:", code);
            // 인가 코드를 백엔드로 보내는 함수 실행
            kakaoLoginHandler(code, role);
        } else {
            // 인가 코드가 없는 경우 (로그인 취소 또는 에러)
            console.error("인가 코드를 획득하지 못했습니다.");
            navigate('/'); // 필요하다면 초기 페이지로 이동
        }
    }, []); // 빈 배열은 마운트 시 한 번만 실행됨을 의미

    return (
        <div>
            <h1>카카오 로그인 처리 중...</h1>
            <p>잠시만 기다려 주세요.</p>
        </div>
    );
}

export default KakaoRedirect;