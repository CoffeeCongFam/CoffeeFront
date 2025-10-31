import React, { useEffect, useState } from "react";
import SubscriptionItem from "../../components/customer/home/SubscriptionItem";
import subList from "../../data/customer/subList";
import cafeList from '../../data/customer/cafeList';
import { Box, IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LocalCafeCard from "../../components/customer/home/LocalCafeCard";
import api from '../../utils/api';

function CustomerHome() {
  const navigate = useNavigate();
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
    <Box sx={{ px: 12, py: 8 }}>
      {/* 헤더 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <Typography sx={{ fontSize: "25px", fontWeight: "bold" }}>
            유저 님, 오늘도 한 잔의 여유를 즐겨보세요.
          </Typography>
          <Typography>오늘은 어디에서 커피 한 잔 할까요? ☕️</Typography>
        </Box>

        <Box>
          <IconButton onClick={() => scrollBy(-260)} size="small">
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => scrollBy(260)} size="small">
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
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
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ccc",
            borderRadius: 8,
          },
        }}
      >
        {subscriptions.map((item) => (
          <Box
            key={item.subId}
            sx={{ scrollSnapAlign: "start", flex: "0 0 auto" }}
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

        <Box sx={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
