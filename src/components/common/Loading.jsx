import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

function Loading({
  title = "잠시만 기다려주세요",
  message = "따뜻한 커피를 준비 중이에요 ☕️",
}) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#faf8f5",
        color: "#6f4e37",
        textAlign: "center",
        gap: 3,
        px: 2,
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: "#6f4e37",
        }}
      />
      <Box>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 1, whiteSpace: "pre-line", color: "text.secondary" }}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  );
}

export default Loading;
