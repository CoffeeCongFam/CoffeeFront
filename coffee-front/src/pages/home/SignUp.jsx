import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

function SignUp() {
  let navigate = useNavigate();
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '24px',
          color: 'black'
        }}>버튼 클릭시 카카오 인증 페이지로 이동됩니다.</div>
        <div style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Button
            variant="contained"
            onClick={() => navigate('/memberSignUp')}
            sx={{
              backgroundColor: 'black',
              '&:hover': { backgroundColor: '#111' },
              width: '320px',
              height: '140px',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: 'bold',
              textTransform: 'none'
            }}
          >
            일반회원
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/customerSignUp')}
            sx={{
              backgroundColor: 'black',
              '&:hover': { backgroundColor: '#111' },
              width: '320px',
              height: '140px',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: 'bold',
              textTransform: 'none'
            }}
          >
            점주회원
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
