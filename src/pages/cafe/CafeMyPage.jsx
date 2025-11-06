import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
} from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import Profile from "../customer/Profile";
import { handleLogout } from "../../utils/logout";
import useUserStore from "../../stores/useUserStore";
import ManageStoreInfo from "./ManageStoreInfo";
import { useNavigate } from "react-router-dom";

function CafeMyPage() {

  const { authUser, clearUser } = useUserStore();
  console.log("AUTH USER>> ", authUser);
  // const userName = "커피콩빵"; // 하드코딩된 유저 이름
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("매장 정보");

  // MUI Paper 구역에 포함되어 할 최종 버튼 목록
  const finalMenus = [
    "매장 정보",
    "내 정보",
  ];

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

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
      case "매장 정보":
        return <ManageStoreInfo />;
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
        {/* 좌측: 유저 정보 */}
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h5" component="h1" fontWeight="bold">
            {authUser?.name}
          </Typography>
          <Button
            onClick={() => navigate("/me")}
            variant="contained"
            sx={{
              borderRadius: 999,
              px: 2,
              py: 0.7,
              fontWeight: 600,
              fontSize: "0.8rem",
              textTransform: "none",
              boxShadow: "none",
              bgcolor: "linear-gradient(45deg, #d7c4a3 30%, #f5f0e6 90%)",
              color: "text.primary",
              "&:hover": {
                boxShadow: "0 4px 10px rgba(215, 196, 163, 0.5)",
                bgcolor: "linear-gradient(45deg, #d7c4a3 30%, #f5f0e6 90%)",
              },
            }}
          >
            소비자 페이지
          </Button>
        </Box>

        {/* 우측: 트렌디한 로그아웃 버튼 */}
        <Button
          onClick={logout}
          variant="contained"
          startIcon={<LogoutRoundedIcon />}
          sx={{
            borderRadius: 999,
            px: 2.5,
            py: 1,
            fontWeight: 600,
            fontSize: "0.9rem",
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
          로그아웃
        </Button>
      </Box>
      {/* 상단 메뉴 영역 */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={1} justifyContent="flex-start">
          {renderGridItems(finalMenus)}
        </Grid>
      </Paper>

      {/* 선택된 메뉴 컨텐츠 영역 */}
      <Box sx={{ mt: 3 }}>
        {renderDrawerContent()}
      </Box>
    </Container>
  );
}

export default CafeMyPage;
