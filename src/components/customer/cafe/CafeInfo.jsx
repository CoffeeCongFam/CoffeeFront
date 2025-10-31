import { Box, Divider, Typography } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import React from "react";

function CafeInfo({ store }) {
  const subTitleStyle = {
    fontWeight: "bold",
    fontSize: "18px",
  };

  // 🔹 요일 매핑 테이블
  const dayMap = {
    MON: "월요일",
    TUE: "화요일",
    WED: "수요일",
    THU: "목요일",
    FRI: "금요일",
    SAT: "토요일",
    SUN: "일요일",
  };

  return (
    <Box
      sx={{
        py: 2,
        px: 1,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* 소개 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }} style={subTitleStyle}>
          카페 소개
        </Typography>
        <Typography variant="body2">{store.summary}</Typography>
      </Box>

      {/* 주소 및 연락처 */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }} style={subTitleStyle}>
          주소 및 연락처
        </Typography>

        {/* 주소 */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <LocationOnIcon
            fontSize="small"
            sx={{ mr: 1, color: "text.secondary" }}
          />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {store.address}
          </Typography>
        </Box>

        {/* 전화번호 */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {store.phone}
          </Typography>
        </Box>
      </Box>

      {/* 운영 시간 */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }} style={subTitleStyle}>
          운영 시간
        </Typography>
        <Box
          sx={{ px: 3, py: 2 }}
          style={{
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
          }}
        >
          {store.storeHours?.length ? (
            store.storeHours.map((day) => (
              <Box
                key={day.dayOfWeek}
                sx={{ mb: 0.5 }}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  color: "#474747dd",
                }}
              >
                <Typography
                  style={{
                    fontSize: "15px",
                    fontWeight: "normal",
                  }}
                >
                  <strong>{dayMap[day.dayOfWeek] || day.dayOfWeek}</strong>
                </Typography>
                <Typography style={{ fontSize: "15px" }}>
                  {day.isHoliday
                    ? "휴무"
                    : `${day.openTime} ~ ${day.closeTime}`}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              운영 시간이 아직 등록되지 않았습니다.
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 기타 설명 */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }} style={subTitleStyle}>
          기타 설명
        </Typography>
        <Typography variant="body2">
          {store.summary || "매장 설명이 없습니다."}
        </Typography>
      </Box>
    </Box>
  );
}

export default CafeInfo;
