import React, { useEffect, useState } from "react";
import TodayOrderItem from "../../components/customer/order/TodayOrderItem";
import todayOrderList from "../../data/customer/todayOrderList";
import { Box } from "@mui/material";

function OrderPage() {
  const [todayDate, setTodayDate] = useState(null);

  useEffect(() => {
    const currentDate = new Date();
    console.log(currentDate);
    const formatted = currentDate.toISOString().split("T")[0];
    const time = currentDate.toISOString().split("T")[1];
    setTodayDate(formatted + " " + time);
  }, []);
  return (
    <div>
      <h2>현재 진행 중인 주문 ...</h2>
      {todayDate}

      <Box style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {todayOrderList.orderList.map((order) => {
          return <TodayOrderItem order={order} key={order.orderId} />;
        })}
      </Box>
    </div>
  );
}

export default OrderPage;
