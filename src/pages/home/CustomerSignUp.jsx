import React, { useState } from "react";
import { Button, FormControl, Select, MenuItem, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// 이메일은 부모 컴포넌트에서 props로 전달받는다고 가정합니다.
function CustomerSignUp({ initialEmail = "member123@example.com" }) {
  const navigate = useNavigate();
  // 상태 관리
  const [formState, setFormState] = useState({
    name: '',
    tel: '',
    gender: 'M',
    memberType: "GENERAL",
    email: initialEmail
  });
  
  // 전화번호를 000-0000-0000 형태로 포맷팅 (3-4-4)
  const formatTelNumber = (raw) => {
    const digitsOnly = String(raw).replace(/\D/g, "").slice(0, 11);
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 7) return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7)}`;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formState.name,
      tel: formState.tel.replace(/\D/g, ''), // 숫자만 추출
      gender: formState.gender,
      memberType: formState.memberType,
      email: formState.email,
    };

    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        alert("인증 토큰이 없습니다. 다시 로그인해주세요.");
        navigate('/login'); // 로그인 페이지로 이동
        return;
      }

      console.log("회원가입 요청 데이터:", payload);
      const response = await axios.post(
        "http://localhost:8080/member/signup",
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

      if (response.status === 200) {
        alert("회원가입이 성공적으로 완료되었습니다.");
        navigate("/"); // 메인 페이지로 이동
      }
    } catch (error) {
      console.error("회원가입 API 호출 중 에러 발생:", error.response || error);
      alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 라벨 텍스트와 입력 필드를 포함하는 컨테이너의 스타일 정의
  // 라벨 텍스트와 입력 필드 간의 정렬을 위해 Flexbox를 사용합니다.
  const inputRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px', // 라벨과 인풋 사이 간격
    width: '100%', // 폼 너비만큼 확장
    justifyContent: 'flex-start',
  };

  // 라벨 텍스트 ("이름:", "이메일:", "전화번호:", "성별:")의 우측 정렬 스타일
  const labelTextStyle = {
    color: 'black',
    minWidth: '70px', // 라벨 너비를 일정하게 유지
    textAlign: 'right', // 텍스트 우측 정렬
  };

  // 모든 필수 필드가 채워졌는지 확인하는 변수
  const isFormValid =
    formState.name.trim() !== "" &&
    formState.tel.length >= 12; // 010-123-4567 (12자리) 이상
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        // 폼 전체를 감싸는 외곽선 및 패딩 추가
        border: '1px solid #ddd', 
        padding: '30px 40px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        backgroundColor: '#fff',
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '22px', color: 'black', marginBottom: '10px' }}>일반회원</div>
        
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
          width: '100%', // 폼 너비 설정
        }}>
          {/* 이름 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>이름:</span>
            <TextField
              value={formState.name}
              onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
              placeholder="이름"
              size="small"
              variant="outlined"
              sx={{ minWidth: 240 }}
            />
          </div>
          {/* 이메일 - 일반 텍스트 형태로만 표시 (수정 불가) */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>이메일:</span>
            <span style={{
              color: 'black',
              flexGrow: 1, // 남은 공간 채우기
            }}>
              {initialEmail}
            </span>
          </div>
          
          {/* 전화번호 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>전화번호:</span>
            <TextField
              value={formState.tel}
              onChange={(e) => setFormState(prev => ({ ...prev, tel: formatTelNumber(e.target.value) }))}
              placeholder="000-0000-0000"
              size="small"
              variant="outlined"
              sx={{ minWidth: 240 }}
              inputProps={{ inputMode: 'tel', pattern: '[0-9-]*', maxLength: 13 }}
            />
          </div>

          {/* 성별 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>성별:</span>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={formState.gender}
                onChange={(e) => setFormState(prev => ({ ...prev, gender: e.target.value }))}
                displayEmpty
              >
                <MenuItem value={"M"}>남</MenuItem>
                <MenuItem value={"F"}>여</MenuItem>
              </Select>
            </FormControl>
            {/* 정렬을 맞추기 위한 빈 공간 (Flexbox 균형) */}
            <div style={{ flexGrow: 1 }}></div>
          </div>
          <Button type="submit" variant="contained"
            disabled={!isFormValid}
            sx={{
              backgroundColor: 'black',
              '&:hover': { backgroundColor: '#111' },
              textTransform: 'none',
              marginTop: '15px',
              width: '100%',
              padding: '10px 0'
            }}
          >회원가입</Button>
        </form>
      </div>
    </div>
  )
}

export default CustomerSignUp;