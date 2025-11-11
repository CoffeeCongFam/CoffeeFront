import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

/**
 * 공통 확인 모달
 * @param {boolean} open - 다이얼로그 열림 여부
 * @param {function} onClose - 닫기 이벤트
 * @param {function} onConfirm - 확인 버튼 클릭 시 실행 함수
 * @param {string} title - 다이얼로그 제목
 * @param {string} message - 메시지 내용
 * @param {string} confirmText - 확인 버튼 텍스트 (기본값: 확인)
 * @param {string} cancelText - 취소 버튼 텍스트 (기본값: 취소)
 */
function CommonConfirm({
  open,
  onClose,
  onConfirm,
  title = "확인",
  message = "이 작업을 진행하시겠습니까?",
  confirmText = "확인",
  cancelText = "취소",
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      sx={{
        "& .MuiDialog-paper": { borderRadius: 3, p: 1.5 },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", color: "#334336" }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "#334336", mt: 1 }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 2.5,
          pb: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            color: "#334336",
            borderColor: "#334336",
            "&:hover": { bgcolor: "rgba(51,67,54,0.05)" },
          }}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{
            bgcolor: "#334336",
            "&:hover": { bgcolor: "#2a3a2e" },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CommonConfirm;
