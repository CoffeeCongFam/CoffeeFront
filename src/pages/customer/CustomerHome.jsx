import React, { useEffect, useState } from "react";
import SubscriptionItem from "../../components/customer/home/SubscriptionItem";
import subList from "../../data/customer/subList";
import cafeList from "../../data/customer/cafeList";
import { Box, IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LocalCafeCard from "../../components/customer/home/LocalCafeCard";

function CustomerHome() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [today, setToday] = useState(null);

  // 스크롤 박스 ref
  const scrollRef = React.useRef(null);

  useEffect(() => {
    const todayDate = new Date();
    setToday(todayDate.toISOString().split("T")[0]);
    setSubscriptions(subList);
  }, []);

  // 주문하기 클릭 시 이동
  function handleOrderClick(sub) {
    console.log(sub.subId + " 구독권으로 주문하기");
    navigate("/me/order/new", {
      state: {
        subscription: sub,
      },
    });
  }

  // 좌우 버튼으로 스크롤
  const scrollBy = (offset) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: offset,
      behavior: "smooth",
    });
  };

  return (
    <Box sx={{ px: 10, py: 2 }}>
      {/* 헤더 영역 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Box style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <Typography style={{ fontSize: "25px", fontWeight: "bold" }}>
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

      {/* 가로 캐러셀 영역 */}
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          mb: 5,
          py: 1,
          // 스크롤바 살짝 감추기
          "&::-webkit-scrollbar": {
            height: 6,
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
            sx={{
              scrollSnapAlign: "start",
              flex: "0 0 auto", // 줄어들지 않게
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

      <Box>
        <Typography style={{ fontSize: "20px", fontWeight: "bold" }}>
          내 근처 동네 카페
        </Typography>
        <Box style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          {cafeList?.map((store) => {
            return <LocalCafeCard store={store} key={store.storeId} />;
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default CustomerHome;
