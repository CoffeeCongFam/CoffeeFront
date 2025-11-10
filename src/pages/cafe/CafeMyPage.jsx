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
  const [isLoadingStore, setIsLoadingStore] = useState(false);

  // ✅ 매장 정보 있으면 “매장 정보 / 내 정보”
  //    없으면 “매장 등록 / 내 정보”
  const hasStore = !!storeInfo?.partnerStoreId;  // 또는 그냥 !!storeInfo
  const finalMenus = hasStore
    ? ["매장 정보", "내 정보"]
    : ["매장 등록", "내 정보"];

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  // ✅ 매장 정보 동기화
  const syncStoreInfo = async () => {
    try {
      setIsLoadingStore(true);

      const data = await getStoreInfo();
      console.log("📡 받아온 매장 정보:", data);

      if (data) {
        setStoreInfo(data);

        if (data.partnerStoreId) {
          setPartnerStoreId(data.partnerStoreId);
        }

        setActiveMenu("매장 정보");
      } else {
        setStoreInfo(null);
        setActiveMenu("매장 등록");
      }
    } catch (error) {
      console.error("매장 정보 조회 실패:", error);
      setStoreInfo(null);
      setActiveMenu("매장 등록");
    } finally {
      setIsLoadingStore(false);
    }
  };

  // ✅ authUser가 준비되면 한 번 매장 정보 조회
  useEffect(() => {
    if (!authUser) {
      setStoreInfo(null);
      setActiveMenu("매장 등록");
      return;
    }

    syncStoreInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.partnerStoreId]);

  const logout = () => {
    clearUser();
    handleLogout();
  };

  const renderDrawerContent = () => {
    switch (activeMenu) {
      case "매장 정보":
        return <ManageStoreInfo storeInfo={storeInfo} syncStoreInfo={syncStoreInfo} />;
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
            color: "#334336",
          }}
          onClick={() => handleMenuClick(menu)}
        >
          {menu}
        </Button>
      </Grid>
    ));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, borderRadius: 2, border: "1px solid #ffe0b2", p: 2, backgroundColor: "white" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h5" component="h1" fontWeight="bold" sx={{ color: "#334336" }}>
            {authUser?.name} 점주님 환영합니다!!
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1.5}>
          <Button
            onClick={() => navigate("/me/myPage")}
            variant="contained"
            sx={{
              borderRadius: 999,
              px: 2.5,
              py: 1,
              fontWeight: 600,
              fontSize: "0.85rem",
              textTransform: "none",
              bgcolor: "#334336",
              color: "#fff9f4",
              border: "1px solid #334336",
              boxShadow: "none",
              minWidth: 0,
              "&:hover": {
                bgcolor: "#334336",
                opacity: 0.9,
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
              bgcolor: "#334336",
              color: "#fff9f4",
              "&:hover": {
                bgcolor: "#334336",
                opacity: 0.9,
                boxShadow: 3,
              },
            }}
          >
            로그아웃
          </Button>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, border: "1px solid #ffe0b2", backgroundColor: "white" }}>
        <Grid container spacing={1} justifyContent="flex-start">
          {renderGridItems(finalMenus)}
        </Grid>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {isLoadingStore ? (
          <Typography sx={{ color: "#334336" }}>
            매장 정보를 불러오는 중입니다...
          </Typography>
        ) : (
          activeMenu && renderDrawerContent()
        )}
      </Box>
    </Container>
  );
}

export default CafeMyPage;