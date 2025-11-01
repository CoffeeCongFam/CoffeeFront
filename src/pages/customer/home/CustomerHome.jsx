import React, { useEffect, useState } from "react";
import SubscriptionItem from "../../../components/customer/home/SubscriptionItem";
import subList from "../../../data/customer/subList";
import cafeList from '../../../data/customer/cafeList';
import { Box, IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LocalCafeCard from "../../../components/customer/home/LocalCafeCard";
import api from '../../../utils/api';
import useAppShellMode from "../../../hooks/useAppShellMode";

function CustomerHome() {
  const navigate = useNavigate();
  const { isAppLike } = useAppShellMode();  // 앱(PWA)/모바일 여부
  const [subscriptions, setSubscriptions] = useState([]);
  const [today, setToday] = useState(null);
  const [nearbyCafes, setNearbyCafes] = useState([]);
  const [locError, setLocError] = useState("");

  const scrollRef = React.useRef(null);

  useEffect(() => {
    const todayDate = new Date();
    setToday(todayDate.toISOString().split("T")[0]);
    setSubscriptions(subList);

    // 위치 가져와서 근처 카페 요청
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("현재 위치>>", latitude, longitude);

          try {
            // const res = await api.get("/stores/nearby", {
            //   params: {
            //     lat: latitude,
            //     lng: longitude,
            //     radius: 500,
            //   },
            // });
            // setNearbyCafes(res.data);
            setNearbyCafes(cafeList)
          } catch (err) {
            console.error(err);
            setLocError("주변 카페를 불러오는 데 실패했어요.");
          }
        },
        (err) => {
          console.log("위치 권한 거부", err);
          setLocError("위치 권한을 허용하면 근처 카페를 보여줄 수 있어요.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocError("이 브라우저에서는 위치 정보를 사용할 수 없어요.");
    }
  }, []);

  function handleOrderClick(sub) {
    navigate("/me/order/new", {
      state: { subscription: sub },
    });
  }

  const scrollBy = (offset) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: offset,
      behavior: "smooth",
    });
  };

  return (
    <Box
        sx={{
          // PWA/모바일이면 여백 작게
          px: isAppLike ? 2 : 12,
          py: isAppLike ? 2 : 5,
          pb: isAppLike ? 9 : 8, // 하단 BottomNav 공간 확보
          minHeight: "100%",
        }}
      >
        {/* 헤더 메시지 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isAppLike ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isAppLike ? "flex-start" : "center",
            gap: isAppLike ? 2 : 0,
            mb: 1.5,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", mb: "2%" }}>
            <Typography sx={{ fontSize: isAppLike ? "23px" : "30px", fontWeight: "bold" }}>
              유저 님, {isAppLike && <br></br>} 오늘도 한 잔의 여유를 즐겨보세요.
            </Typography>
            <Typography>오늘은 어디에서 커피 한 잔 할까요? ☕️</Typography>
          </Box>

          {/* 데스크탑에서만 좌우 스크롤 버튼 보이게 */}
          {/* {!isAppLike && ( */}
            <Box style={{float: "right", alignSelf: isAppLike ? "flex-end" : "auto",}}>
              <IconButton onClick={() => scrollBy(-260)} size="small">
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => scrollBy(260)} size="small">
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
            </Box>
          {/* )} */}
        </Box>

      {/* 구독권 캐러셀 */}
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          mb: 5,
          py: 1,
          "&::-webkit-scrollbar": {
            height: isAppLike ? 0 : 6,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ccc",
            borderRadius: 8,
          },
        }}
      >
        {subscriptions.map((item) => (
          <Box
            key={item.subId}
            sx={{ scrollSnapAlign: "start", 
              px: isAppLike ? "8%" : 0,
              flex: isAppLike ? "0 0 100%" : "0 0 auto", // 모바일에선 화면 너비 꽉 차게
            }}
          >
            <SubscriptionItem
              today={today}
              item={item}
              handleOrderClick={handleOrderClick}
            />
          </Box>
        ))}
      </Box>

      {/* 내 근처 카페 */}
      <Box>
        <Typography sx={{ fontSize: "20px", fontWeight: "bold", mb: 2 }}>
          내 근처 동네 카페
        </Typography>

        {locError && (
          <Typography color="error" sx={{ mb: 1 }}>
            {locError}
          </Typography>
        )}

        <Box sx={{
            display: "grid",
            gridTemplateColumns: isAppLike ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "10px",
          }}
        >
          {nearbyCafes.map((store) => (
            <LocalCafeCard
              store={store}
              key={store.id || store.storeId}
            />
          ))}
          {!locError && nearbyCafes.length === 0 && (
            <Typography sx={{ color: "text.secondary" }}>
              500m 안에 등록된 카페가 아직 없어요 ☕
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default CustomerHome;
