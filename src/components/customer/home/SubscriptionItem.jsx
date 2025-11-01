import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import React from "react";
import { useNavigate } from "react-router-dom";

function SubscriptionItem({ today, item, handleOrderClick }) {
  const navigate = useNavigate();
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
        width: "100%",
        minWidth: "250px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        m: "0 auto",
        borderRadius: "10px",
        overflow: "hidden",
        bgcolor: "white",
        cursor: "pointer",
      }}
      onClick={() => navigate(`/me/store/${item.store.storeId}`)}
    >
      {/* 상단 이미지 */}
      <Box sx={{ width: "100%", bgcolor: "#e9e9e9" }}>
        <CardMedia
          component="img"
          sx={{
            width: "100%",
            height: 100,
            objectFit: "cover",
            backgroundColor: "#ddd",
          }}
          image={item.store.storeImage}
          alt={item.store.storeName}
        />
      </Box>

      {/* 본문 */}
      <CardContent sx={{ width: "100%", p: 2, pt: 1.5 }}>
        {/* 1줄 : 카페 이름 + 구독권 뱃지 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight="700">
            {item.store.storeName}
          </Typography>

          <Chip
            icon={<StarBorderIcon sx={{ color: "white" }} />}
            label={item.subName}
            size="small"
            style={{ fontSize: "10px", width: "fit-content" }}
            sx={{
              bgcolor: "black",
              color: "white",
              "& .MuiChip-icon": { mr: 0 },
              borderRadius: "16px",
            }}
          />
        </Box>

        {/* 이용 기간 (가운데 정렬, 회색) */}
        <Typography
          variant="body2"
          sx={{ fontSize: "12px", textAlign: "right", color: "grey.600" }}
        >
          {item.subStart} ~ {item.subEnd}
        </Typography>

        {/* 남은 이용일 (가운데, 핑크) */}
        <Typography
          sx={{
            fontSize: "12px",
            textAlign: "right",
            mt: 0.5,
            color: "#ff1493", // 핫핑크 쪽
            fontWeight: 500,
          }}
        >
          남은 이용일: {getRemainingDays(today, item.subEnd)}일
        </Typography>
      </CardContent>

      {/* 하단 버튼 */}
      <Box sx={{ width: "100%", px: 2, pb: 2 }}>
        {item.remainingCount > 0 ? (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleOrderClick(item);
            }}
            fullWidth
            sx={{
              backgroundColor: "black",
              color: "white",
              borderRadius: "6px",
              "&:hover": { backgroundColor: "#333" },
            }}
          >
            주문하기
          </Button>
        ) : (
          <Button
            disabled
            fullWidth
            sx={{
              backgroundColor: "#f0f0f0",
              color: "#888",
              borderRadius: "6px",
            }}
          >
            오늘 이용 완료
          </Button>
        )}
      </Box>
    </Card>
  );
}

export default SubscriptionItem;
