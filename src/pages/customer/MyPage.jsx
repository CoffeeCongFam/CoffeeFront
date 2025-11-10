import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Paper, Grid, Button, useMediaQuery, useTheme } from '@mui/material';
import Profile from './Profile';
import { useNavigate } from 'react-router-dom';
import SubscriptionPage from './Subscription';
import PaymentHistory from './PaymentHistory';
import ReviewPage from './ReviewPage';
import { handleLogout } from '../../utils/logout';
// TODO: 각 메뉴에 해당하는 컴포넌트를 임포트해야 합니다.
import MyGiftPage from "./MyGift";
import useUserStore from "../../stores/useUserStore";
import OrderHistory from "./order/OrderHistory";
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Loading from '../../components/common/Loading';

function MyPage() {
  let navigate = useNavigate();

  const { authUser, clearUser } = useUserStore();
  const theme = useTheme();
  // sm breakpoint (600px) 이상일 때 true
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const [activeMenu, setActiveMenu] = useState("구독권");
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  // MUI Paper 구역에 포함되어야 할 최종 버튼 목록
  const finalMenus = [
    "구독권",
    "선물함",
    "결제 내역",
    "리뷰내역",
    "회원 정보",
  ];

  useEffect(() => {
    console.log("AUTH USER 변경됨 >>> ", authUser);
  }, [authUser]);

  const logout = async () => {
    setIsLoggingOut(true);
    try{
      // userStore 초기화
      clearUser();

      // 로그아웃 처리
      // handleLogout();
      await Promise.resolve(handleLogout());

    } finally {
      setIsLoggingOut(false);
    }
    
  };

  // Drawer에 표시할 컨텐츠를 렌더링하는 함수
  const renderDrawerContent = () => {
    switch (activeMenu) {
      case "구독권":
        return <SubscriptionPage />;
      case "선물함":
        return <MyGiftPage />;
      case '결제 내역':
        return <PaymentHistory />;
      case "리뷰내역":
        return <ReviewPage />;
      case "회원 정보":
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
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: "0.9rem", sm: "1rem" },
            fontWeight: "bold",
            color: "text.primary",
          }}
          onClick={() => setActiveMenu(menu)}
        >
          {menu}
        </Button>
      </Grid>
    ));
  };

  if (isLoggingOut) {
    return (
      <Box sx={{ height: "100vh" }}>
        <Loading
          title="로그아웃 중입니다"
          message={"잠시만 기다려주세요 ☕\n안전하게 로그아웃 처리 중이에요."}
        />
      </Box>
    );
  }


  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* 프로필 섹션 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexDirection="row"
        mb={3}
      >
        {/* 좌측: 유저 정보 */}
        <Box>
          <Typography variant={{ xs: 'h6', sm: 'h5' }} component="h1" fontWeight="bold">
            {authUser?.name}님 환영합니다!
          </Typography>
        </Box>

        {/* 우측: 트렌디한 네비게이션 & 로그아웃 버튼 그룹 */}
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="flex-end" 
          gap={{ xs: 0.5, sm: 1.5 }}
        >
          {authUser?.memberType == "STORE" && (
            <Button
              onClick={() => navigate('/store/cafeMyPage')}
              variant="contained"
              sx={{
                borderRadius: 999,
                px: { xs: 1.2, sm: 2.2 },
                py: { xs: 0.5, sm: 0.8 },
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.85rem' },
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
          )}

          {/* 우측: 트렌디한 로그아웃 버튼 */}
          <Button
            onClick={logout}
            variant="contained"
            startIcon={isDesktop ? <LogoutRoundedIcon /> : null}
            sx={{
              minWidth: { xs: 'auto', sm: 'auto' }, // 아이콘만 있을 때 너비 자동 조절
              borderRadius: 999,
              px: { xs: 0, sm: 2.5 }, // 모바일에서 좌우 패딩 제거, 데스크톱은 유지
              py: { xs: 1, sm: 1 },   // 모바일에서 상하 패딩을 px와 맞춤
              fontWeight: 600,
              fontSize: { xs: "0.75rem", sm: "0.9rem" },
              textTransform: "none",
              boxShadow: "none",
              bgcolor: "grey.900",
              color: "common.white",
              "&:hover": {
                bgcolor: "grey.800",
                boxShadow: 3,
              },
            }}
          >
            {isDesktop ? '로그아웃' : <LogoutRoundedIcon />}
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
