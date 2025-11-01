import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab, Typography, Divider, Chip } from "@mui/material";
import { useParams } from "react-router-dom";
import storeDetail from "../../../data/customer/storeDetail.js";
import CafeInfo from "../../../components/customer/cafe/CafeInfo.jsx";
import CafeMenuList from "../../../components/customer/cafe/CafeMenuList.jsx";
import CafeSubscriptionList from "../../../components/customer/cafe/CafeSubscriptionList.jsx";
import CafeReviewList from "../../../components/customer/cafe/CafeReviewList.jsx";
import useAppShellMode from "../../../hooks/useAppShellMode.js";

// 공통 탭 패널 컴포넌트
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`store-tabpanel-${index}`}
      aria-labelledby={`store-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `store-tab-${index}`,
    "aria-controls": `store-tabpanel-${index}`,
  };
}

function StoreDetailPage() {

  const { isAppLike } = useAppShellMode(); // PWA / 모바일 모드
  const { storeId } = useParams();

  const [store, setStore] = useState({
    storeId: null,
    storeName: "",
    storeStatus: "",
    summary: "",
    address: "",
    phone: "",
    storeHours: [],
    menus: [], // 메뉴 탭용
    subscriptions: [], // 구독권 탭용
    reviews: [], // 리뷰 탭용
    storeImage: "https://picsum.photos/400/400",
    maxDailyUsage: 0,
  });

  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  useEffect(() => {
    // TODO: storeId로 실제 api 호출한다고 가정
    // 지금은 더미 데이터 주입
    setStore(storeDetail);
  }, [storeId]);

  return (
    <Box 
      sx={{
        width: "100%",
        maxWidth: isAppLike ? "100%" : "1100px", // 데스크탑에서만 가운데로
        mx: "auto",
        pb: isAppLike ?  "15%" : 0
      }}
    >
      {/* 상단 대표 이미지 */}

      <Box
        sx={{
          width: "100%",
          height: { xs: 240, sm: 240, md: 300 },
          // borderRadius: 2,
          overflow: "hidden",
          mb: 2,
        }}
      >
        <img
          src={store.storeImage || "https://picsum.photos/400/400"}
          alt={store.storeName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </Box>
        
      <Box sx={{ px: 2 }}>
        {/* 상단 기본 정보 */}
        <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 1,
          mb: 1.5,
        }}
      >
        {store.storeStatus && (
          <Chip
              label={store.storeStatus}
              size="small"
              color={
                store.storeStatus === "OPEN"
                  ? "success"
                  : store.storeStatus === "HOLIDAY"
                  ? "warning"
                  : "default"
              }
            />
          )}
          <Typography
            variant={isAppLike ? "h5" : "h4"}
            sx={{ fontWeight: 700 }}
          >
            {store.storeName || "카페 이름"}
          </Typography>
        </Box>

        {/* 탭 */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            aria-label="store detail tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="상세정보" {...a11yProps(0)} />
            <Tab label="메뉴" {...a11yProps(1)} />
            <Tab label="구독권" {...a11yProps(2)} />
            <Tab label="리뷰" {...a11yProps(3)} />
          </Tabs>
        </Box>

        {/* 0. 상세정보 탭 */}
        <TabPanel value={tab} index={0}>
          <CafeInfo store={store} />
        </TabPanel>

        {/* 1. 메뉴 탭 */}
        <TabPanel value={tab} index={1}>
          <CafeMenuList menus={store.menus} />
        </TabPanel>

        {/* 2. 구독권 탭 */}
        <TabPanel value={tab} index={2}>
          <CafeSubscriptionList subscriptions={store.subscriptions} />
        </TabPanel>

        {/* 3. 리뷰 탭 */}
        <TabPanel value={tab} index={3}>
          <CafeReviewList store={store} />
        </TabPanel>

      </Box>
      
    </Box>
  );
}

export default StoreDetailPage;
