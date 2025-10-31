import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

/**
 * 개별 선물 항목을 출력하는 컴포넌트
 */
const GiftListItem = ({ messageComponent, date}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '12px 0',
        }}
      >
        {/* 왼쪽: 아이콘 영역 및 메시지 출력 */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1 }}>
          {/* 메시지 내용: Typography의 component='span'을 사용해 줄 바꿈을 방지하고 인라인 텍스트로 처리 */}
          <Typography variant="body1" component="span" sx={{ mt: 0.5, lineHeight: 1.5 }}>
            {messageComponent}
          </Typography>
        </Box>

        {/* 오른쪽: 날짜 및 메시지 유형 ('정') */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            minWidth: '80px',
            ml: 2,
          }}
        >
          {/* 날짜 */}
          <Typography variant="caption" color="text.secondary">
            {date}
          </Typography>
        </Box>
      </Box>
      <Divider />
    </Box>
  );
};

export default GiftListItem;