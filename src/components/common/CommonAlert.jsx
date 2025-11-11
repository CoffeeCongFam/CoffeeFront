import React from "react";
import { Snackbar, Alert } from "@mui/material";
import useAppShellMode from "../../hooks/useAppShellMode";

/**
 * CommonAlert
 * 여러 페이지에서 공통으로 사용할 수 있는 알림 컴포넌트
 *
 * Props:
 * - open (bool): 알림 표시 여부
 * - onClose (func): 닫기 핸들러
 * - severity (string): "success" | "error" | "warning" | "info"
 * - message (string): 표시할 메시지
 * - autoHideDuration (number): 자동 닫힘 시간(ms) (기본값 3000)
 * - anchorOrigin (object): 위치 설정 (기본값 { vertical: 'top', horizontal: 'center' })
 */

function CommonAlert({
  open,
  onClose,
  severity = "info",
  message = "",
  autoHideDuration = 3000,
  anchorOrigin = { vertical: "top", horizontal: "center" },
}) {
  const { isAppLike } = useAppShellMode();
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      sx={{
        width: isAppLike ? "auto" : "auto",
        maxWidth: isAppLike ? "400px" : "fit-content",
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{
          width: "100%",
          fontWeight: 500,
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

export default CommonAlert;
