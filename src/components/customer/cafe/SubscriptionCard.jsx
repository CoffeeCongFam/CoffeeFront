import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import CoffeeIcon from "@mui/icons-material/Coffee";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";

export default function SubscriptionCard({ subscription }) {
  if (!subscription) return null;

  const {
    store,
    subscriptionName,
    subscriptionType,
    price,
    subscriptionPeriod,
    maxDailyUsage,
    remainSalesQuantity,
    subscriptionStatus,
  } = subscription;

  const isSoldOut = subscriptionStatus === "SOLDOUT";

  const getTypeLabel = (type) => {
    switch (type) {
      case "STANDARD":
        return "스탠다드";
      case "BASIC":
        return "베이직";
      case "PREMIUM":
        return "프리미엄";
      default:
        return type || "";
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        gap: 2,
        alignItems: "center",
        width: "100%",
        // maxWidth: 360,
        height: "100%",
        minHeight: "fit-content",
        p: 2.5,
        borderRadius: "18px",
        background: isSoldOut
          ? "linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)"
          : "linear-gradient(135deg, #FFE39F 0%, #FFD25E 100%)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        opacity: isSoldOut ? 0.8 : 1,
        overflow: "hidden",
      }}
    >
      {/* 왼쪽: 아이콘/썸네일 영역 */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "14px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.4)",
          flexShrink: 0,
        }}
      >
        <CoffeeIcon sx={{ fontSize: 48, color: "#b26700" }} />
      </Box>

      {/* 오른쪽: 정보 영역 */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* 상단: 매장명 + 타입 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 0.5,
            gap: 1,
          }}
        >
           <Typography
          sx={{
            fontSize: "1.05rem",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontWeight: 700,
            color: "#4a3426",
            mb: 0.5,
          }}
        >
          <StarIcon sx={{ fontSize: 20, color: "#d89f00" }} />
          <Box
            component="span"
            sx={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {subscriptionName}
          </Box>
        </Typography>

          <Chip
            label={getTypeLabel(subscriptionType)}
            size="small"
            sx={{
              backgroundColor: "rgba(255,255,255,0.7)",
              color: "#5a3e2b",
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          />
        </Box>

        {/* 구독권 이름 */}
       

        {/* 가격 / 주기 / 사용 가능 */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 0.5,
            mb: 0.5,
          }}
        >
          {/* 금액 */}
          <Box
            sx={{
              borderRadius: 1.5,
              px: 1,
              py: 0.5,
              backgroundColor: "rgba(255,255,255,0.7)",
            }}
          >
            <Typography
              sx={{ fontSize: 11, color: "#795548", fontWeight: 500 }}
            >
              금액
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                textAlign: "right",
                fontWeight: 700,
                color: "#4a3426",
              }}
            >
              ₩{price?.toLocaleString()}/월
            </Typography>
          </Box>

          {/* 구독 주기 */}
          <Box
            sx={{
              borderRadius: 1.5,
              px: 1,
              py: 0.5,
              backgroundColor: "rgba(255,255,255,0.7)",
            }}
          >
            <Typography
              sx={{ fontSize: 11, color: "#795548", fontWeight: 500 }}
            >
              구독 주기
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                textAlign: "right",
                fontWeight: 600,
                color: "#4a3426",
              }}
            >
              {subscriptionPeriod}일
            </Typography>
          </Box>

          {/* 사용 가능 */}
          <Box
            sx={{
              borderRadius: 1.5,
              px: 1,
              py: 0.5,
              backgroundColor: "rgba(255,255,255,0.7)",
            }}
          >
            <Typography
              sx={{ fontSize: 11, color: "#795548", fontWeight: 500 }}
            >
              사용 가능
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                textAlign: "right",
                fontWeight: 600,
                color: "#4a3426",
              }}
            >
              매일 {maxDailyUsage}잔
            </Typography>
          </Box>
        </Box>

        {/* 하단: 잔여 수량 / 상태 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 0.5,
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.2,
              py: 0.3,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.8)",
            }}
          >
            <ConfirmationNumberIcon sx={{ fontSize: 16, color: "#5d4037" }} />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: "#3e2723",
              }}
            >
              잔여 {remainSalesQuantity ?? 0}개
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 600,
              color: isSoldOut ? "#b71c1c" : "#2e7d32",
            }}
          >
            {isSoldOut ? "판매 종료" : "판매 중"}
          </Typography>
        </Box>
      </Box>

      {/* SOLD OUT 오버레이 */}
      {isSoldOut && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Typography
            sx={{
              px: 2.5,
              py: 0.8,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.8)",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            판매 완료
          </Typography>
        </Box>
      )}
    </Box>
  );
}
