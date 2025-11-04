import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab, Typography, Divider, Chip } from "@mui/material";
import { useParams } from "react-router-dom";
import CafeInfo from "../../../components/customer/cafe/CafeInfo.jsx";
import CafeMenuList from "../../../components/customer/cafe/CafeMenuList.jsx";
import CafeSubscriptionList from "../../../components/customer/cafe/CafeSubscriptionList.jsx";
import CafeReviewList from "../../../components/customer/cafe/CafeReviewList.jsx";
import useAppShellMode from "../../../hooks/useAppShellMode.js";
import getStoreStatusByDate from "../../../utils/getStoreStatusByDate.js";
import { fetchStoreDetail } from "../../../apis/customerApi.js";
import dummyImg from "./../../../assets/CoffeiensLogo.png";

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

const DAY_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function StoreDetailPage() {
  const { isAppLike } = useAppShellMode(); // PWA / 모바일 모드
  const { storeId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState({});
  const [storeStatus, setStoreStatus] = useState("OPEN"); // OPEN || CLOSED || HOLIDAY

  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  useEffect(() => {
    // 카페 정보 초기화
    try {
      loadStoreDetail(storeId);
      // 카페 상태 계산
      setStoreStatus(getStoreStatusByDate(store.storeHours));
      setIsLoading(false);
    } catch (err) {
      console.log("카페 상세  정보 요청 실패: ", err);
      alert("카페 상세 정보 조회에 실패했어요. 다시 시도해주세요.");
    }
  }, [storeId]);

  const loadStoreDetail = async (storeId) => {
    try {
      const data = await fetchStoreDetail(storeId);
      setStore(data);
    } catch (e) {
      console.error(e);
    }
  };

  return isLoading ? (
    <Box>로딩 중...</Box>
  ) : (
    <Box
      sx={{
        width: "100%",
        maxWidth: isAppLike ? "100%" : "50%", // 데스크탑에서만 가운데로
        mx: "auto",
        pb: isAppLike ? "15%" : 0,
      }}
    >
      {/* 상단 대표 이미지 */}
      <Box
        sx={{
          width: "100%",
          justifyContent: "center",
          alignContent: "center",
          height: { xs: 240, sm: 240, md: 300 },
          overflow: "hidden",
          mb: 2,
        }}
      >
        <img
          src={dummyImg || store.storeImg}
          alt={store.storeName}
          sx={{
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
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 1,
            mb: 1.5,
            mt: 3,
          }}
        >
          {storeStatus && (
            <Chip
              label={
                storeStatus === "OPEN"
                  ? "영업중"
                  : storeStatus === "HOLIDAY"
                  ? "휴무일"
                  : "영업종료"
              }
              size="small"
              color={
                storeStatus === "OPEN"
                  ? "success"
                  : storeStatus === "HOLIDAY"
                  ? "warning"
                  : "default"
              }
            />
          )}
          <Typography
            variant={isAppLike ? "h5" : "h4"}
            sx={{ fontWeight: 700 }}
          >
            {store?.storeName || "카페 이름"}
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
          <CafeReviewList storeId={storeId} />
        </TabPanel>
      </Box>
    </Box>
  );
}

export default StoreDetailPage;
