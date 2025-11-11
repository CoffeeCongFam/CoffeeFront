import React from 'react';
import { Box, Typography, Divider, useMediaQuery, useTheme } from '@mui/material';

/**
 * 개별 선물 항목을 출력하는 컴포넌트
 */
<<<<<<< HEAD
const GiftListItem = ({ messageComponent, date, isAppLike }) => {
=======
const GiftListItem = ({ messageComponent, date}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

>>>>>>> 7237919 (ui 최종)
  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isAppLike ? "column" : "row",
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '12px 0',
        }}
      >
        {/* 왼쪽: 아이콘 영역 및 메시지 출력 */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1, minWidth: 0 }}>
          {/* 메시지 내용: 모바일일 때 줄바꿈 허용 및 좌측 정렬 */}
          <Typography 
            variant="body1" 
            component={isMobile ? "div" : "span"}
            sx={{ 
              mt: 0.5, 
              lineHeight: 1.5,
              fontSize: isMobile ? '0.75rem' : '0.9rem',
              textAlign: isMobile ? 'left' : 'inherit',
              wordBreak: isMobile ? 'break-word' : 'normal',
            }}
          >
            {messageComponent}
          </Typography>
        </Box>

        {/* 오른쪽: 날짜 및 메시지 유형 ('정') */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            minWidth: isMobile ? '100px' : '80px',
            ml: 2,
            flexShrink: 0,
          }}
        >
          {/* 날짜: 오전/오후 포함하여 줄바꿈 */}
          {date && (() => {
            // 날짜 형식: "2025.11.08  오후 10시 26분" -> 날짜와 시간 분리
            const parts = date.split(/\s{2,}/); // 두 개 이상의 공백으로 분리
            const datePart = parts[0] || '';
            const timePart = parts.slice(1).join(' ') || '';
            
            return (
              <Box sx={{ textAlign: 'right' }}>
                {datePart && (
                  <Typography variant="caption" color="text.secondary" component="div">
                    {datePart}
                  </Typography>
                )}
                {timePart && (
                  <Typography variant="caption" color="text.secondary" component="div">
                    {timePart}
                  </Typography>
                )}
              </Box>
            );
          })()}
        </Box>
      </Box>
      <Divider />
    </Box>
  );
};

export default GiftListItem;