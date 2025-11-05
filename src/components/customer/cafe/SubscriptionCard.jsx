import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CoffeeIcon from '@mui/icons-material/Coffee';

export default function SubscriptionCard({subscription}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 320,
        p: 2.5,
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #FFE39F 0%, #FFD25E 100%)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      }}
    >
      {/* 왼쪽: 커피 이미지 */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.4)',
        }}
      >
        <CoffeeIcon sx={{ fontSize: 48, color: '#b26700' }} />
      </Box>

      {/* 오른쪽: 텍스트 영역 */}
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="body2" sx={{ color: '#5a3e2b' }}>
          {subscription.store.storeName} {subscription.subscriptionType} 
        </Typography>
        <Typography
          sx={{
            fontSize: "1.15rem",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            fontWeight: 700,
            color: '#4a3426',
            gap: 0.5,
          }}
        >
          <StarIcon sx={{ fontSize: 20, color: '#d89f00' }} /> {subscription.subName}
        </Typography>
        <Button
          variant="text"
          sx={{
            textTransform: 'none',
            color: '#4a3426',
            fontSize: '0.8rem',
            mt: 0.5,
            textDecoration: 'underline',
          }}
        >
          {subscription.remainingCount > 0 ? "잔 " : "이용 끝남"}
        </Button>
      </Box>
    </Box>
  );
}
