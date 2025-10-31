import { Box, Divider, Typography } from "@mui/material";
import React from "react";

function CafeInfo({ store }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        운영 시간
      </Typography>
      {store.storeHours?.length ? (
        store.storeHours.map((day) => (
          <Box key={day.dayOfWeek} sx={{ mb: 0.5 }}>
            <strong>{day.dayOfWeek}</strong>{" "}
            {day.isHoliday ? "휴무" : `${day.openTime} ~ ${day.closeTime}`}
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          운영 시간이 아직 등록되지 않았습니다.
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>
        매장 소개
      </Typography>
      <Typography variant="body2">
        {store.summary || "매장 설명이 없습니다."}
      </Typography>
    </Box>
  );
}

export default CafeInfo;
