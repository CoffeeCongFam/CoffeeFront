import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Avatar,
  IconButton,
  Slide,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from "react-router-dom";
import SubscriptionPage from "./Subscription";
import PaymentHistory from "./PaymentHistory";


// TODO: 각 메뉴에 해당하는 컴포넌트를 임포트해야 합니다.
import MyGiftPage from "./MyGift";
// import GiftPage from "./Gift";
// import PaymentHistoryPage from "./PaymentHistory";

// 임시 플레이스홀더 컴포넌트
const PlaceholderComponent = ({ title }) => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h5">{title}</Typography>
    <Typography>이곳에 {title} 페이지 내용이 표시됩니다.</Typography>
  </Box>
);

function MyPage() {
  let navigate = useNavigate();
  const userName = "커피콩빵"; // 하드코딩된 유저 이름

  const [drawerContent, setDrawerContent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // MUI Paper 구역에 포함되어야 할 최종 버튼 목록
  const finalMenus = ["구독권 관리", "내 선물함", "선물하기", "결제 내역"];
  
  const handleMenuClick = (menu) => {
    if (menu === "선물하기") { // "선물하기" 클릭 시 주문 페이지로 이동
      navigate("/me/order/new"); // 절대 경로로 수정 및 오타 수정
      return;
    }
    setDrawerContent(menu);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Drawer에 표시할 컨텐츠를 렌더링하는 함수
  const renderDrawerContent = () => {
    switch (drawerContent) {
      case "구독권 관리": return <SubscriptionPage />;
      case "내 선물함": return <MyGiftPage />;
      case "선물하기": return <PlaceholderComponent title="선물하기" />;
      case "결제 내역": return <PaymentHistory />;
      default: return null;
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
            color: 'text.primary' // 텍스트 색상 유지
          }}
          onClick={() => handleMenuClick(menu)}
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
        <Box display="flex" alignItems="center">
          {/* 유저 이름 (하드코딩) */}
          <Box>
            <Typography variant="h5" component="h1" fontWeight="bold">
              {userName}
            </Typography>
            {/* 이미지에 있던 추가 정보는 요청에 없으므로 생략 */}
          </Box>
        </Box>
      </Box>
      {/* 흰색 구역 (Paper 컴포넌트 사용) - 시트가 열리면 숨김 */}
      {!isDrawerOpen && (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Grid container spacing={1} justifyContent="flex-start">
            {renderGridItems(finalMenus)}
          </Grid>
        </Paper>
      )}

      {/* 하단에서 올라오는 Bottom Sheet (전체 화면 덮지 않음) */}
      <Slide direction="up" in={isDrawerOpen} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            left: '30%',
            transform: 'translateX(-50%)',
            bottom: 0,
            width: '100%',
            maxWidth: 800, // Container maxWidth="md"(약 900px)에 맞춤
            height: '80vh', // 화면 일부만 차지
            bgcolor: 'background.paper',
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
            boxShadow: 24,
            zIndex: (theme) => theme.zIndex.drawer, // AppBar 위로
          }}
        >
          <Box sx={{ position: 'relative', height: '100%' }}>
            <IconButton
              aria-label="close"
              onClick={handleCloseDrawer}
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
            >
              <CloseIcon />
            </IconButton>
            <Box sx={{ height: '100%', overflowY: 'auto', pt: 2 }}>
              {renderDrawerContent()}
            </Box>
          </Box>
        </Box>
      </Slide>
    </Container>
  );
}

export default MyPage;