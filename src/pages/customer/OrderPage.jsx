import React, { useEffect, useState } from "react";
import TodayOrderItem from "../../components/customer/order/TodayOrderItem";
import todayOrderList from "../../data/customer/todayOrderList";
import { Box, Divider, Typography } from "@mui/material";

function OrderPage() {
  const [todayDate, setTodayDate] = useState(null);

  useEffect(() => {
    // 오늘 날짜 및 시간 초기화
    const currentDate = new Date();
    console.log(currentDate);
    const formatted = currentDate.toISOString().split("T")[0];
    const time = currentDate.toISOString().split("T")[1];
    setTodayDate(formatted + " " + time.split(".")[0]);
  }, []);

  return (
    <Box sx={{ px: 12, py: 8 }}>
      {/* TODO. npm install dayjs 다운받기 */}
      {/* <StaticTimePicker defaultValue={dayjs("2022-04-17T15:30")} /> */}
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <Typography style={{ fontSize: "20px", fontWeight: "bold" }}>
          {todayDate}
        </Typography>

        <Typography style={{ fontSize: "25px", fontWeight: "bold" }}>
          현재 진행 중인 주문 ...
        </Typography>
      </Box>

      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {todayOrderList.orderList.map((order) => {
          return <TodayOrderItem order={order} key={order.orderId} />;
        })}
      </Box>
      <Divider>픽업 완료</Divider>
    </Box>
  );
}

export default OrderPage;
