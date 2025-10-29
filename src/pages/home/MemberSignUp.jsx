import React from "react";
import { Button } from "@mui/material";

function MemberSignUp() {

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
        gap: '16px'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '22px', color: 'black' }}>일반회원 회원가입</div>
        <form style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center'
        }}>
          <label style={{ color: 'black' }}>이름: <input type="text" placeholder="이름" /></label>
          <label style={{ color: 'black' }}>이메일: <input type="text" placeholder="이메일" disabled /></label>
          <label style={{ color: 'black' }}>전화번호: <input type="text" placeholder="전화번호" /></label>
          <label style={{ color: 'black' }}>성별: <select><option value="남">남</option><option value="여">여</option></select></label>
          <Button type="submit" variant="contained"
            sx={{
              backgroundColor: 'black',
              '&:hover': { backgroundColor: '#111' },
              textTransform: 'none',
            }}
          >회원가입</Button>
        </form>
      </div>
    </div>
  )
}

export default MemberSignUp;
