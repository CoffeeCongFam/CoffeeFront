import React, { useState } from "react";
import { Button, FormControl, Select, MenuItem, TextField } from "@mui/material";

// 이메일은 부모 컴포넌트에서 props로 전달받는다고 가정합니다.
function MemberSignUp({ initialEmail = "member123@example.com" }) {
  // 상태 관리
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('남');
  
  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    // 서버로 전송할 최종 데이터 객체
    const formData = {
      name,
      email: initialEmail, 
      phone,
      gender,
    };

    console.log("전송할 회원가입 데이터:", formData);

    // alert(`회원가입 데이터 전송 준비 완료!\n이름: ${name}, 이메일: ${initialEmail}, 전화번호: ${phone}, 성별: ${gender}`);
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
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="000-0000-0000"
              size="small"
              variant="outlined"
              sx={{ minWidth: 240 }}
              inputProps={{ inputMode: 'tel' }}
            />
          </div>

          {/* 성별 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>성별:</span>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                displayEmpty
              >
                <MenuItem value={"남"}>남</MenuItem>
                <MenuItem value={"여"}>여</MenuItem>
              </Select>
            </FormControl>
            {/* 정렬을 맞추기 위한 빈 공간 (Flexbox 균형) */}
            <div style={{ flexGrow: 1 }}></div>
          </div>
          
          <Button type="submit" variant="contained"
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

export default MemberSignUp;