import React from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Avatar,
  IconButton,
  Divider,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";

// 필요한 메뉴 항목
// const topMenus = ["구독권 관리", "내 기프티콘", "내 선물함", "선물하기"];
// const bottomMenus = ["리뷰 내역", "결제 관리"];

function MyPage() {
  let navigate = useNavigate();
  const userName = "커피콩빵_러버"; // 하드코딩된 유저 이름

  // MUI Paper 구역에 포함되어야 할 최종 버튼 목록
  const finalMenus = ["구독권 관리", "내 선물함", "선물하기", "결제 내역"];
  
  const handleMenuClick = (menu) => {
    switch (menu) {
      case "구독권 관리":
        navigate("/me/subscription");
        break;
      case "내 선물함":
        navigate("/me/mygift");
        break;
      case "선물하기":
        navigate("/me/gift");
        break;
      case "결제 내역":
        navigate("/me/paymenthistory");
        break;
      default:
        console.log(`${menu} 클릭 - 정의되지 않은 경로`);
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
          {/* 원형의 검정색 프로필 사진 (아바타) */}
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "black", // 검정색 배경
              mr: 2,
            }}
          >
            {/* 필요하다면 여기에 아이콘이나 이니셜 추가 가능 */}
          </Avatar>
          {/* 유저 이름 (하드코딩) */}
          <Box>
            <Typography variant="h5" component="h1" fontWeight="bold">
              {userName}
            </Typography>
            {/* 이미지에 있던 추가 정보는 요청에 없으므로 생략 */}
          </Box>
        </Box>
        {/* 설정 아이콘 */}
        <IconButton aria-label="settings" color="default">
          <SettingsIcon />
        </IconButton>
      </Box>

      {/* 흰색 구역 (Paper 컴포넌트 사용) */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={1} justifyContent="flex-start">
          {renderGridItems(finalMenus)}
        </Grid>
      </Paper>
    </Container>
  );
}

export default MyPage;