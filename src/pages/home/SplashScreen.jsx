// src/pages/home/SplashScreen.jsx (경로는 너 코드 기준으로 맞춰줘)
import React, { forwardRef } from "react";
import { Box, Typography } from "@mui/material";
import monkeyLogo from "../../assets/newMainLogo.png";

// #f6e4d1, #f4d1b0
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
        background: "linear-gradient(135deg, #334336, #55635a)",
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
          style={{ width: 200, height: "auto" }}
        />
      </Box>
      <Typography
        variant="subtitle1"
        sx={{ color: "#f6e4d1", fontWeight: 500, letterSpacing: "0.04em" }}
      >
        인간의 진화는 커피로 완성된다...☕️
      </Typography>
    </Box>
  );
});

export default SplashScreen;
