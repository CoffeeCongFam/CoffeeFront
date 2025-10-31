import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import CardMedia from "@mui/material/CardMedia";
import OrderStatusButton from "./OrderStatusButton";
import { useNavigate } from "react-router-dom";

function TodayOrderItem({ order }) {
  const navigate = useNavigate();

  return (
    <div>
      <Card
        key={order.orderId}
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center", // 🔹 세로 중앙 정렬
          padding: "16px",
          borderRadius: "12px",
          cursor: "pointer",
        }}
        onClick={() => {
          navigate(`/me/order/${order.orderId}`);
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <CardMedia
            component="img"
            style={{ borderRadius: "8px" }}
            sx={{ width: 100, height: 70, objectFit: "cover" }}
            image={order.store.storeImage}
            alt={order.store.storeName}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {order.store.storeName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.orderMenu[0].menuName} × {order.orderMenu[0].quantity}
            </Typography>
          </div>
        </div>

        {/* 오른쪽: 상태 버튼 */}
        <OrderStatusButton status={order.orderStatus}></OrderStatusButton>
      </Card>
    </div>
  );
}

export default TodayOrderItem;
