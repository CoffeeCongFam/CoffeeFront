import { Box } from '@mui/material';
import React from 'react';
import { Outlet } from 'react-router-dom';

function AdminHome() {
  return (
    <>
      {/* 페이지 콘텐츠 */}
      <Box
        sx={{
          p: 1,
          display: 'flex',
          flexDirection: 'column', // 아이템들을 세로로 쌓음
          gap: 2,
        }}
      >
        <Box sx={{ p: 2 }}>월별 구독자 수 추이 현황 (차트위치)</Box>

        <br />
        {/* 통계 박스 2개를 담을 컨테이너 */}
        <Box
          sx={{
            p: 2,
            flex: 1, // 사용 가능한 공간을 균등하게 차지
          }}
        >
          <div>오늘 가입자 : {}명</div>
          <div>오늘 방문자 : {}명</div>
          <div>미답변 1:1 문의 : {}건</div>
          <div>승인 대기 상품 : {}건</div>
          <div>승인 대기 매장 : {}건</div>
        </Box>
        <Box sx={{ p: 2, flex: 1 }}>구독 고객 비중 (차트위치)</Box>

        <Outlet />
      </Box>
    </>
  );
}

export default AdminHome;
