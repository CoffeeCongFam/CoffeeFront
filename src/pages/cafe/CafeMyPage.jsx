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
import { StoreForm } from "../home/CafeSignUp";
import { useNavigate } from "react-router-dom";
import { getStoreInfo } from "../../utils/store";
function CafeMyPage() {

  const { authUser, clearUser, setPartnerStoreId } = useUserStore();

  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);

  const finalMenus = authUser?.partnerStoreId
    ? ["매장 정보", "내 정보"]
    : ["매장 등록", "내 정보"];

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  useEffect(() => {
    if (authUser?.partnerStoreId || storeInfo) {
      setActiveMenu("매장 정보");
    } else {
      setActiveMenu("매장 등록");
    }
  }, [authUser, storeInfo]);

  const syncStoreInfo = async () => {
    try {
      const data = await getStoreInfo(authUser?.partnerStoreId);
      setStoreInfo(data);

      if (data?.partnerStoreId) {
        setPartnerStoreId(data.partnerStoreId);
      }

      if (!data) {
        setActiveMenu("매장 등록");
      } else {
        setActiveMenu("매장 정보");
      }
    } catch (error) {
      setStoreInfo(null);
      setActiveMenu("매장 등록");
    }
  };

  useEffect(() => {
    // Always call syncStoreInfo on mount
    syncStoreInfo();
    console.log("받아온 매장 정보야!!",storeInfo)
    if (!authUser) {
      setStoreInfo(null);
      setActiveMenu("매장 등록");
    }
  }, []);

  const logout = () => {
    clearUser();
    handleLogout();
  };

  const renderDrawerContent = () => {
    switch (activeMenu) {
      case "매장 정보":
        return <ManageStoreInfo storeInfo={storeInfo} />;
      case "매장 등록":
        return <StoreForm />;
      case "내 정보":
        return <Profile />;
      default:
        return null;
    }
  };

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
            color: "text.primary",
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h5" component="h1" fontWeight="bold">
            {authUser?.name} 점주님 환영합니다!!
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1.5}>
          <Button
            onClick={() => navigate('/me/myPage')}
            variant="contained"
            sx={{
              borderRadius: 999,
              px: 2.5,
              py: 1,
              fontWeight: 600,
              fontSize: "0.85rem",
              textTransform: "none",
              background: "linear-gradient(90deg, #fff7e6 0%, #ffe6f7 100%)",
              color: "text.primary",
              border: "1px solid #f3e0c7",
              boxShadow: "none",
              minWidth: 0,
              '&:hover': {
                background: "linear-gradient(90deg, #ffe8b3 0%, #ffcce9 100%)",
                boxShadow: 2,
              },
            }}
          >
            소비자 페이지
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
      </Box>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={1} justifyContent="flex-start">
          {renderGridItems(finalMenus)}
        </Grid>
      </Paper>
      <Box sx={{ mt: 3 }}>
        {activeMenu && renderDrawerContent()}
      </Box>
    </Container>
  );
}

export default CafeMyPage;
