// src/components/customer/purchase/SubscriptionDetailCard.jsx
import React from "react";
import { Box, Typography, Chip, Divider } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CoffeeIcon from "@mui/icons-material/Coffee";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SubTypeChip from "../../common/SubTypeChip";
import LocationPinIcon from "@mui/icons-material/LocationPin";

function SubscriptionItem({ subscription, isAppLike }) {
  console.log("ITEM에서 받음", subscription);
  if (!subscription || !subscription.subscriptionId) return null;

  if (isAppLike) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          border: "1px solid rgba(0,0,0,0.15)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          px: 3,
          py: 2,
          bgcolor: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            mb: 2.5,
          }}
        >
          {/* 구독 타입 */}
          <SubTypeChip type={subscription.subscriptionType} />

          <Box sx={{ mt: 1.3 }}>
            {/* 구독 이름 - 강조 */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "1.15rem",
                color: "#222", // 진한 텍스트
                mt: 0.5,
              }}
            >
              {subscription?.subscriptionName}
            </Typography>
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
        <Divider />
        {/* 매장명 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.6,
            mt: 2,
            mb: 1.5,
          }}
        >
          <LocationPinIcon
            sx={{ fontSize: 18, color: "text.secondary", mb: "1px" }}
          />
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary", //
              fontWeight: 400,
            }}
          >
            {subscription?.storeName}
          </Typography>
        </Box>
        {/* 간단한 혜택 설명 */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            color: "text.secondary",
            fontSize: "0.9rem",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CalendarMonthIcon fontSize="small" />
            <span>결제일 기준 {subscription?.subscriptionPeriod}일 이용</span>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CoffeeIcon fontSize="small" />
            <span>매일 {subscription?.maxDailyUsage}잔 이용</span>
          </Box>
        </Box>

        {/* 상세 설명 */}
        {/* {subscription.subscriptionDesc && (
          <Typography variant="body2" color="text.secondary">
            {subscription.subscriptionDesc}
          </Typography>
        )} */}
      </Box>
    );
  }

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
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#334336" }}>
          {subscription?.storeName || "카페 이름"}{" "}
          {subscription?.subscriptionName}
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
            <span>결제일 기준 {subscription?.subscriptionPeriod}일 이용</span>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CoffeeIcon fontSize="small" />
            <span>매일 {subscription?.maxDailyUsage}잔 이용</span>
          </Box>
        </Box>

        {/* 상세 설명 */}
        {subscription.subscriptionDesc && (
          <Typography variant="body2" color="text.secondary">
            {subscription.subscriptionDesc}
          </Typography>
        )}
      </Box>

      {/* 오른쪽 가격/타입 */}
      <Box sx={{ textAlign: "right" }}>
        {/* <Chip
          label={typeLabel}
          icon={<EmojiEventsIcon />}
          color="warning"
          size="small"
          sx={{ mb: 1, fontWeight: 600 }}
        /> */}
        <SubTypeChip type={subscription.subscriptionType} />
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#334336" }}>
          ₩{subscription.price?.toLocaleString()}
          <Typography
            component="span"
            sx={{
              fontSize: "1rem",
              fontWeight: 400,
              ml: 0.5,
              color: "#334336",
            }}
          >
            /월
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
}

export default SubscriptionItem;
