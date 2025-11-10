// components/customer/order/OrderProgressBar.jsx
import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";

const ORDER_PROGRESS = {
  REQUEST: 0,
  INPROGRESS: 33,
  COMPLETED: 66,
  RECEIVED: 100,
  REJECTED: 0,
  CANCELED: 0,
};

const labels = ["주문 접수", "제조 중", "픽업 대기", "수령 완료"];

function OrderProgressBar({ status }) {
  const value = ORDER_PROGRESS[status] ?? 0;

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      {/* 상단 프로그레스 바 */}
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 15,
          borderRadius: 3,
          bgcolor: "#e9ecef",
          "& .MuiLinearProgress-bar": {
            borderRadius: 3,
            bgcolor: "#222", // 진행 색
          },
        }}
      />

      {/* 아래 단계 라벨 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 1.2,
          px: 0.5,
        }}
      >
        {labels.map((label, idx) => {
          const stepValue = (idx + 1) * (100 / labels.length); // 각 단계의 % 기준
          const prevStepValue = idx * (100 / labels.length);
          const isCurrent =
            value >= prevStepValue && value < stepValue; // 현재 단계
          const isDone = value >= stepValue; // 완료된 단계

          return (
            <Typography
              key={label}
              variant="caption"
              sx={{
                fontSize: "0.9rem",
                fontWeight: (isCurrent||isDone) ? "bold" : "normal",
                color: isCurrent
                  ? "#000" // 현재 단계: 검정색
                  : isDone
                //   ? "text.secondary" // 완료된 단계: 진한 회색
                  ? "#000" // 완료된 단계: 진한 회색
                  : "#bbb", // 아직 안 온 단계: 연한 회색
              }}
            >
              {label}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
}

export default OrderProgressBar;
