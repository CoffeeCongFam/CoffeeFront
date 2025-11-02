import React from 'react';
import { Box, Typography } from '@mui/material';

// 주황색 STANDARD 태그 컴포넌트
const StandardTag = ({ type }) => {
  return (
    <Box
      sx={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '20px',
        backgroundColor: '#FF9800', // 주황색
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.8rem',
          lineHeight: 1,
          letterSpacing: '0.5px',
        }}
      >
        {type.toUpperCase()}
      </Typography>
    </Box>
  );
};

export default StandardTag;