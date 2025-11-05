import React from "react";
import { Chip } from "@mui/material";

function SubTypeChip({ type }) {
  let style = {};
  let emoji = "";
  let label = "";

  switch (type) {
    case "BASIC":
      emoji = "☕";
      label = "베이직";
      style = {
        backgroundColor: "#e0e0e0", // 연회색
        color: "#424242", // 진한 회색 텍스트
        border: "1px solid #bdbdbd",
      };
      break;

    case "STANDARD":
      emoji = "🍃";
      label = "스탠다드";
      style = {
        backgroundColor: "#c8e6c9", // 그린톤 (연초록)
        color: "#1b5e20", // 짙은 초록 텍스트
        border: "1px solid #81c784",
      };
      break;

    case "PREMIUM":
      emoji = "👑";
      label = "프리미엄";
      style = {
        background: "linear-gradient(135deg, #FFD700 0%, #FFF8DC 100%)", // 금색 그라데이션
        color: "#6d4c00", // 황금 갈색 텍스트
        border: "1px solid #fbc02d",
        fontWeight: 700,
      };
      break;

    default:
      emoji = "❓";
      label = type || "UNKNOWN";
      style = {
        backgroundColor: "#eeeeee",
        color: "#616161",
      };
  }

  return (
    <Chip
      label={`${emoji} ${label}`}
      size="small"
      sx={{
        fontWeight: 600,
        letterSpacing: 0.3,
        ...style,
      }}
    />
  );
}

export default SubTypeChip;
