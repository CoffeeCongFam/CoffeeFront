import { Chip } from "@mui/material";
import React from "react";

// 매장 상태
const STATUS_MAP = {
  PREPARING: {
    label: "정보 없음",
    sx: {
      backgroundColor: "#fff9f4",
      color: "#334336",
      fontWeight: 500,
    },
  },
  OPEN: {
    label: "영업중",
    sx: {
      backgroundColor: "#fff9f4",
      color: "#334336",
      fontWeight: 600,
    },
  },
  CLOSED: {
    label: "영업종료",
    sx: {
      backgroundColor: "#fff9f4",
      color: "#334336",
      fontWeight: 500,
    },
  },
  HOLIDAY: {
    label: "휴무일",
    sx: {
      backgroundColor: "#fff9f4",
      color: "#334336",
      fontWeight: 600,
    },
  },
};

// 매장 상태 칩
function CafeStatusChip({ status }) {
  const config = STATUS_MAP[status] || {
    label: "정보없음",
    sx: { backgroundColor: "#fff9f4", color: "#334336" },
  };

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        textAlign: "center",
        fontSize: "0.75rem",
        width: "fit-content",
        ...config.sx,
      }}
    />
  );
}

export default CafeStatusChip;
