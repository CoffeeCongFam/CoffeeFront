import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useRouteError } from "react-router-dom";

function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();
  const status = error?.status || 500;

  console.error("ERROR 확인>>> ", error);

  let message = "페이지를 불러오는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.";

  if (status === 404) {
    message =
      "죄송합니다. 페이지를 찾을 수 없습니다.\n존재하지 않는 주소를 입력하셨거나 요청하신 페이지의 주소가 변경·삭제되었습니다.";
  } else if (status === 500) {
    message = "죄송합니다. 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  } else if (error?.message?.includes("NetworkError")) {
    message = "네트워크 오류 : 인터넷 연결을 확인해주세요.";
  }

  return (
    <Box
      sx={{
        margin: 0,
        height: "100vh",   
        minHeight: "100vh",     
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#fafafa",
        textAlign: "center",
        px: 2,
      }}
    >
      <Typography variant="h3" gutterBottom>
        😵‍💫 {status} ERROR
      </Typography>

      {/* 줄바꿈 처리 */}
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, whiteSpace: "pre-line" }}
      >
        {message}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
        <Button
          variant="outlined"
          sx={{
            color: "#6f4e37",
            borderColor: "#6f4e37",
            "&:hover": {
              borderColor: "#5a3e2d",
              backgroundColor: "#f5ebe0",
            },
            textTransform: "none",
          }}
          onClick={() => window.history.back()}
        >
          이전으로 가기
        </Button>

        <Button
          variant="outlined"
          sx={{
            color: "#6f4e37",
            borderColor: "#6f4e37",
            "&:hover": {
              borderColor: "#5a3e2d",
              backgroundColor: "#f5ebe0",
            },
            textTransform: "none",
          }}
          onClick={() => navigate("/")}
        >
          홈으로 가기
        </Button>
      </Box>
    </Box>
  );
}

export default ErrorPage;
