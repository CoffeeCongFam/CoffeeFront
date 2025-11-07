import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Paper, Grid, Button } from '@mui/material';
import Profile from './Profile';
import { useNavigate } from 'react-router-dom';
import SubscriptionPage from './Subscription';
import PaymentHistory from './PaymentHistory';
import ReviewPage from './ReviewPage';
import { handleLogout } from '../../utils/logout';

// TODO: 각 메뉴에 해당하는 컴포넌트를 임포트해야 합니다.
import MyGiftPage from "./MyGift";
import useUserStore from "../../stores/useUserStore";
import OrderHistory from "./OrderHistory";
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

function MyPage() {
  let navigate = useNavigate();

  const { authUser, clearUser } = useUserStore();
  // const userName = "커피콩빵"; // 하드코딩된 유저 이름

  const [activeMenu, setActiveMenu] = useState("구독권 관리");

  // MUI Paper 구역에 포함되어야 할 최종 버튼 목록
  const finalMenus = [
    "구독권 관리",
    "내 선물함",
    "주문 내역",
    "결제 내역",
    "리뷰내역",
    "내 정보",
  ];

  useEffect(() => {
    console.log("AUTH USER 변경됨 >>> ", authUser);
  }, [authUser]);

  const logout = () => {
    // userStore 초기화
    clearUser();

    // 로그아웃 처리
    handleLogout();
  };

  // Drawer에 표시할 컨텐츠를 렌더링하는 함수
  const renderDrawerContent = () => {
    switch (activeMenu) {
      case "구독권 관리":
        return <SubscriptionPage />;
      case "내 선물함":
        return <MyGiftPage />;
      case "주문 내역":
        return <OrderHistory />;
      case '결제 내역':
        return <PaymentHistory />;
      case "리뷰내역":
        return <ReviewPage />;
      case "내 정보":
        return <Profile />;
      default:
        return null;
    }
  };

  // 최종 메뉴 배열을 Grid Item으로 변환하는 함수
  const renderGridItems = (menus) => {
    return menus.map((menu, index) => (
      <Grid item xs={6} sm={4} md={3} key={index} sx={{ p: 1 }}>
        <Button
          variant="text"
          fullWidth
          sx={{
            py: 2,
            fontSize: "1rem",
            fontWeight: "bold",
            color: "text.primary", // 텍스트 색상 유지
          }}
        >
          {menu}
        </Button>
      </Grid>
    ));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* 프로필 섹션 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        {/* 좌측: 유저 정보 */}
        <Box>
          <Typography variant="h5" component="h1" fontWeight="bold">
            {authUser?.name}님 환영합니다!
          </Typography>
        </Box>

        {/* 우측: 트렌디한 네비게이션 & 로그아웃 버튼 그룹 */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Button
            onClick={() => navigate('/store/cafeMyPage')}
            variant="contained"
            sx={{
              borderRadius: 999,
              px: 2.2,
              py: 0.8,
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'none',
              boxShadow: 'none',
              background: 'linear-gradient(135deg, #fff7e6 0%, #ffe6f7 100%)',
              color: 'grey.900',
              border: '1px solid rgba(0,0,0,0.05)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ffe8b3 0%, #ffcce9 100%)',
                boxShadow: 2,
              },
            }}
          >
            카페 사장님 페이지
          </Button>

          <Button
            onClick={logout}
            variant="contained"
            startIcon={<LogoutRoundedIcon />}
            sx={{
              borderRadius: 999,
              px: 2.5,
              py: 1,
              fontWeight: 600,
              fontSize: '0.9rem',
              textTransform: 'none',
              boxShadow: 'none',
              bgcolor: 'grey.900',
              color: 'common.white',
              '&:hover': {
                bgcolor: 'grey.800',
                boxShadow: 3,
              },
            }}
          >
            로그아웃
          </Button>
        </Box>
      </Box>
      {/* 상단 메뉴 영역 */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={1} justifyContent="flex-start">
          {renderGridItems(finalMenus)}
        </Grid>
      </Paper>

      {/* 선택된 메뉴 컨텐츠 영역 */}
      <Box sx={{ mt: 3 }}>{renderDrawerContent()}</Box>
    </Container>
  );
}

export default MyPage;
