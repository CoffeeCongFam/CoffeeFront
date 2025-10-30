import React, { useEffect, useState } from "react";
import SubscriptionItem from "../../components/customer/home/SubscriptionItem";
import subList from "../../data/customer/subList";
import { Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

function CustomerHome() {
  // 유저 정보

  // navigation
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [today, setToday] = useState(null);

  useEffect(() => {
    // 오늘 날짜 설정
    const todayDate = new Date(); // 2025-10-30
    setToday(todayDate.toISOString().split("T")[0]);

    // 데이터 테스트 - 유저 보유 구독권 목록 조회
    setSubscriptions(subList);
  }, []);

  // 주문하기 클릭 시 이동
  function handleOrderClick(sub) {
    console.log(sub.subId + " 구독권으로 주문하기");
    navigate("/me/order/new", {
      state: {
        subscription: sub, // 구독권 객체를 전달
      },
    });
  }

  return (
    <Container style={{ display: "flex", flexDirection: "row" }}>
      {subscriptions.map((item) => {
        return (
          <SubscriptionItem
            today={today}
            item={item}
            key={item.subId}
            handleOrderClick={handleOrderClick}
          />
        );
      })}
    </Container>
  );
}

export default CustomerHome;
