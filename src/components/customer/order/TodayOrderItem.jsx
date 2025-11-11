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
import LocationPinIcon from "@mui/icons-material/LocationPin";
import { Box, Divider } from "@mui/material";

function TodayOrderItem({ order, isAppLike }) {
  // const { isAppLike } = useAppShellMode();
  const navigate = useNavigate();

  return (
    <Box>
      {isAppLike ? (
        <Card
          key={order.orderId}
          sx={{
            display: "flex",
            flexDirection: "column",
            borderRadius: "1.5rem",
            px: 2,
            py: 2,
            gap: 1,
            cursor: "pointer",
            "&:hover": {
              // backgroundColor: "rgba(141, 141, 141, 0.04)", // 살짝 어둡게
              // boxShadow: "0 4px 12px rgba(0,0,0,0.1)", // 약한 그림자 추가
              // transform: "translateY(-2px)", // 살짝 떠오르는 느낌
            },
          }}
          onClick={() => {
            navigate(`/me/order/${order.orderId}`);
          }}
        >
          {/* 상단 이미지 및 카페, 구독권 이름, 메뉴 */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyItems: "center",
              gap: "1rem",
            }}
          >
            <CardMedia
              component="img"
              style={{ borderRadius: "2.3rem" }}
              sx={{
                width: isAppLike ? 70 : 100,
                height: 70,
                objectFit: "cover",
              }}
              image={order.storeImg || menuDummy}
              alt={order.storeName}
            />
            <Box>
              <Typography
                fontWeight="bold"
                sx={{ fontSize: "0.8rem", mb: 0.5 }}
              >
                {order.menuList[0].menuName} x {order.menuList[0].quantity}
                {order.menuList.length > 0 &&
                  ` 외 ${order.menuList.length - 1} 개`}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  alignContent: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyItems: "center",
                    alignItems: "center",
                    justifyContent: "center",
                    alignContent: "center",
                    fontSize: "0.9rem",
                    color: "text.secondary",
                  }}
                >
                  <LocationPinIcon />
                  {order.storeName}
                </Box>
                <Typography sx={{ fontSize: "0.9rem" }} color="text.secondary">
                  {order.subscriptionName}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Divider />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              px: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {order.createdAt.split("T")[1].split(".")[0]}
            </Typography>
            <OrderStatusButton status={order.orderStatus}></OrderStatusButton>
          </Box>
        </Card>
      ) : (
        <Card
          key={order.orderId}
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center", // 세로 중앙 정렬
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
                  width: isAppLike ? 70 : 100,
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
                {order.createdAt.split("T")[1].split(".")[0]}
              </Typography>
            </Box>
          </Box>
        </Card>
      )}
    </Box>
  );
}

export default TodayOrderItem;
