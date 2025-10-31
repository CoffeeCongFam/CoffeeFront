// src/components/customer/purchase/SubscriptionDetailCard.jsx
import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CoffeeIcon from "@mui/icons-material/Coffee";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

function SubscriptionItem({ subscription }) {
  if (!subscription || !subscription.subId) return null;

  const typeLabel =
    subscription.subType === "PREMIUM"
      ? "프리미엄"
      : subscription.subType === "STANDARD"
      ? "스탠다드"
      : "베이직";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        width: "100%",
        alignItems: "center",
        py: 2.5,
        px: 5,
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.08)",
        backgroundColor: "white",
      }}
    >
      {/* 왼쪽 정보 */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {subscription.store?.storeName || "카페"}
        </Typography>

        {/* 간단한 혜택 설명 */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            color: "text.secondary",
            fontSize: "0.9rem",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CalendarMonthIcon fontSize="small" />
            <span>결제일 기준 30일 이용</span>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CoffeeIcon fontSize="small" />
            <span>매일 1잔 제공</span>
          </Box>
        </Box>

        {/* 상세 설명 */}
        {subscription.description && (
          <Typography variant="body2" color="text.secondary">
            {subscription.description}
          </Typography>
        )}
      </Box>

      {/* 오른쪽 가격/타입 */}
      <Box sx={{ textAlign: "right" }}>
        <Chip
          label={typeLabel}
          icon={<EmojiEventsIcon />}
          color="warning"
          size="small"
          sx={{ mb: 1, fontWeight: 600 }}
        />
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          ₩{subscription.price?.toLocaleString()}
          <Typography
            component="span"
            sx={{ fontSize: "1rem", fontWeight: 400, ml: 0.5 }}
          >
            /월
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
}

export default SubscriptionItem;
