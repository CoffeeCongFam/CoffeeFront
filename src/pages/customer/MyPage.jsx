import React, { useEffect, useState, useRef } from 'react';
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

  const tabContainerRef = useRef(null);
  const tabRefs = useRef({});


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

  useEffect(() => {
    if (isDesktop) return;
    const container = tabContainerRef.current;
    const activeEl = tabRefs.current[activeMenu];
    if (!container || !activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    const offset =
      activeRect.left -
      containerRect.left -
      containerRect.width / 2 +
      activeRect.width / 2;

    container.scrollTo({
      left: container.scrollLeft + offset,
      behavior: "smooth",
    });
  }, [activeMenu, isDesktop]);

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

  // 상단 메뉴 바 렌더링 함수 (데스크탑 / 모바일 분리)
  const renderMenuBar = () => {
    // 데스크탑: 기존 Grid 기반 UI 유지
    if (isDesktop) {
      return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Grid container spacing={1} justifyContent="flex-start">
            {renderGridItems(finalMenus)}
          </Grid>
        </Paper>
      );
    }

    // 모바일: 가로 스크롤 가능한 필 탭 스타일
    return (
      <Paper
        elevation={0}
        sx={{
          px: 1,
          py: 0.8,
          borderRadius: 0,
          bgcolor: "transparent",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <Box
          ref={tabContainerRef}
          sx={{
            display: "flex",
            overflowX: "auto",
            gap: 0.75,
            "::-webkit-scrollbar": { display: "none" },
          }}
        >
          {finalMenus.map((menu) => {
            const isActive = activeMenu === menu;
            return (
              <Button
                key={menu}
                ref={(el) => {
                  if (el) tabRefs.current[menu] = el;
                }}
                onClick={() => setActiveMenu(menu)}
                variant="text"
                sx={{
                  flexShrink: 0,
                  borderRadius: 999,
                  px: 1.6,
                  py: 0.55,
                  fontSize: "0.8rem",
                  fontWeight: isActive ? 700 : 500,
                  textTransform: "none",
                  boxShadow: "none",
                  border: isActive
                    ? "1px solid rgba(0,0,0,0.08)"
                    : "1px solid transparent",
                  bgcolor: isActive ? "rgba(0,0,0,0.04)" : "transparent",
                  color: isActive ? "text.primary" : "text.secondary",
                  "&:hover": {
                    bgcolor: isActive
                      ? "rgba(0,0,0,0.06)"
                      : "rgba(0,0,0,0.03)",
                    boxShadow: "none",
                  },
                }}
              >
                {menu}
              </Button>
            );
          })}
        </Box>
      </Paper>
    );
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
              minWidth: { xs: 'auto', sm: 'auto' },
              borderRadius: 999,
              px: { xs: 0.5, sm: 2.5 },
              py: { xs: 0.5, sm: 1 },
              fontWeight: 600,
              textTransform: "none",
              boxShadow: 'none',
              bgcolor: "grey.900",
              color: "common.white",
              "&:hover": {
                bgcolor: "grey.800",
                boxShadow: 3,
              },
            }}
          >
            {isDesktop ? '로그아웃' : <LogoutRoundedIcon sx={{ fontSize: '1.2rem' }} />}
          </Button>
        </Box>
      </Box>
      {/* 상단 메뉴 영역 */}
      {renderMenuBar()}

      {/* 선택된 메뉴 컨텐츠 영역 */}
      <Box sx={{ mt: 3 }}>{renderDrawerContent()}</Box>
    </Container>
  );
}

export default MyPage;
