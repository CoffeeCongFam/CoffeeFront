// src/pages/home/SplashScreen.jsx (경로는 너 코드 기준으로 맞춰줘)
import React, { forwardRef } from "react";
import { Box, Typography } from "@mui/material";
import monkeyLogo from "../../assets/coffeiensLogoTitle.png";

// forwardRef 로 감싸고, ref를 Box에 넘겨주기
const SplashScreen = forwardRef(function SplashScreen(props, ref) {
  return (
    <Box
      ref={ref}
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        background: "linear-gradient(135deg, #f6e4d1, #f4d1b0)",
      }}
    >
      <Box
        sx={{
          mb: 3,
          "@keyframes float": {
            "0%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-6px)" },
            "100%": { transform: "translateY(0)" },
          },
          animation: "float 1.8s ease-in-out infinite",
        }}
      >
        <img
          src={monkeyLogo}
          alt="COFFIENS"
          style={{ width: 180, height: "auto" }}
        />
      </Box>
      <Typography
        variant="subtitle1"
        sx={{ color: "#6f4e37", fontWeight: 500, letterSpacing: "0.04em" }}
      >
        우리는 생각한다. 고로 커피를 마신다… ☕
      </Typography>
    </Box>
  );
});

export default SplashScreen;
