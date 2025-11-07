import React from "react";
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Withdrawal() {
  const navigate = useNavigate();

  const handleGoodbyeConfirm = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#fffdf7',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 4,
          boxShadow: 6,
          bgcolor: 'white',
        }}
      >
        <CardContent
          sx={{
            px: 4,
            py: 5,
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            언젠간 다시 돌아오세요
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
            커피엔스의 커피 세상으로
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.7 }}
          >
            매일의 커피 한 잔으로 하루를 진화시키던 그 시간들처럼,
            <br />
            언젠가 다시, 당신의 하루를 깨우는 커피 한 잔이 필요해질 때
            <br />
            COFFEIENS가 여기에서 기다리고 있을게요.
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
