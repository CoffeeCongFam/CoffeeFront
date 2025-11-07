import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import CardMedia from "@mui/material/CardMedia";
import OrderStatusButton from "./OrderStatusButton";
import { useNavigate } from "react-router-dom";
import menuDummy from "../../../assets/menuDummy.jpg";
import { Box } from "@mui/material";
import useAppShellMode from "../../../hooks/useAppShellMode";

function TodayOrderItem({ order }) {
  // const { isAppLike } = useAppShellMode();
  const navigate = useNavigate();

  return (
    <Box>
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
          backgroundColor:
            order.orderStatus === "COMPLETED" ? "#e5e5e5a5" : "white",
        }}
        onClick={() => {
          navigate(`/me/order/${order.orderId}`);
        }}
      >
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "1rem",
            }}
          >
            <CardMedia
              component="img"
              style={{ borderRadius: "8px" }}
              sx={{
                width: 100,
                height: 70,
                objectFit: "cover",
              }}
              image={order.storeImg || menuDummy}
              alt={order.storeName}
            />
            <Box
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {order.storeName} - {order.subscriptionName} 구독권
              </Typography>
              {order.menuList.map((menu) => (
                <Typography variant="body2" color="text.secondary">
                  {menu.menuName} x {menu.quantity}
                </Typography>
              ))}
            </Box>
          </Box>
          {/* 오른쪽: 상태 버튼 */}
          <Box
            sx={{
              textAlign: "right",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <OrderStatusButton status={order.orderStatus}></OrderStatusButton>
            <Typography variant="body2" color="text.secondary">
              {/* {order.createdAt.split("T")[0]}{" "} */}
              {order.createdAt.split("T")[1].split(".")[0]}
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

export default TodayOrderItem;
