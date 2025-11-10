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
        bgcolor: "#fff9f4",
        color: "#334336",
        textAlign: "center",
        gap: 3,
        px: 2,
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: "#334336",
        }}
      />
      <Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#334336" }}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 1, whiteSpace: "pre-line", color: "#334336" }}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  );
}

export default Loading;
