import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
} from "@mui/material";
import React from "react";

function SubscriptionItem({ today, item, handleOrderClick }) {
  // 남은 일수 계산
  function getRemainingDays(today, subEnd) {
    const todayDate = new Date(today);
    const endDate = new Date(subEnd);
    const diffTime = endDate - todayDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  return (
    <Card
      sx={{
        width: 250,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        margin: "0 auto",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Box sx={{ width: "100%" }}>
        <CardMedia
          component="img"
          sx={{
            width: "100%",
            height: 70,
            objectFit: "cover",
          }}
          image={item.store.storeImage}
          alt={item.store.storeName}
        />
        <CardContent sx={{ p: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {item.subName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.store.storeName}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{ fontSize: "10px", textAlign: "right", mt: 0.5 }}
          >
            {item.subStart} ~ {item.subEnd}
          </Typography>
          <Typography
            color="error"
            sx={{ fontSize: "12px", textAlign: "right", mt: 0.5 }}
          >
            남은 이용일: {getRemainingDays(today, item.subEnd)}일
          </Typography>
        </CardContent>
      </Box>

      {/* 하단 버튼 */}
      <Box sx={{ width: "100%", p: 1 }}>
        {item.remainingCount > 0 ? (
          <Button
            onClick={() => handleOrderClick(item)}
            size="small"
            fullWidth
            sx={{
              backgroundColor: "black",
              color: "white",
              "&:hover": { backgroundColor: "#333" },
            }}
          >
            주문하기
          </Button>
        ) : (
          <Button
            disabled
            size="small"
            fullWidth
            sx={{ backgroundColor: "#f0f0f0", color: "#888" }}
          >
            오늘 이용 완료
          </Button>
        )}
      </Box>
    </Card>
  );
}

export default SubscriptionItem;
