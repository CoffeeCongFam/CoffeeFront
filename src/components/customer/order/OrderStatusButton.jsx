import { Button, Chip } from "@mui/material";
import React from "react";

const STATUS_STYLES = {
  REQUEST: {
    label: "주문 접수 중",
    color: "#616161", // 회색
    bg: "#f5f5f5",
  },
  INPROGRESS: {
    label: "제조 중",
    color: "#1976d2", // 파랑
    bg: "#e3f2fd",
  },
  COMPLETED: {
    label: "제조 완료",
    color: "#2e7d32", // 초록
    bg: "#e8f5e9",
  },
  RECEIVED: {
    label: "수령 완료",
    color: "#6d4c41", // 갈색
    bg: "#efebe9",
  },
  REJECTED: {
    label: "주문 거부",
    color: "#d32f2f", // 빨강
    bg: "#ffebee",
  },
};


function OrderStatusButton({ status, onClick }) {
  const style = STATUS_STYLES[status] || {
    label: "알 수 없음",
    color: "#9e9e9e",
    bg: "#eeeeee",
  };

  return (
    <Chip
      label={style.label}
      onClick={onClick}
      // size="small"
      sx={{
        fontWeight: 600,
        color: style.color,
        backgroundColor: style.bg,
        border: "none",
        fontSize: "0.9rem"
      }}
    />
  );
}

export default OrderStatusButton;