import * as React from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";

export default function OrderCancelCheckDialog({ open, setOpen, setIsCancel }) {
  const handleClose = () => setOpen(false);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="order-cancel-dialog-title"
      aria-describedby="order-cancel-dialog-description"
    >
      {/* 타이틀 + 닫기 아이콘 */}
      <DialogTitle
        id="order-cancel-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1.5,
        }}
      >
        <Typography variant="h6" component="span">
          주문을 취소하시겠어요?
        </Typography>
        <IconButton size="small" onClick={handleClose} aria-label="닫기">
          <ClearRoundedIcon />
        </IconButton>
      </DialogTitle>

      {/* 내용 */}
      <DialogContent
        dividers
        sx={{
          py: 2,
        }}
      >
        <Typography
          id="order-cancel-dialog-description"
          variant="body2"
          color="text.secondary"
        >
          이미 제조가 시작된 경우, 취소가 어려울 수 있습니다.
        </Typography>
      </DialogContent>

      {/* 하단 버튼 */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
        }}
      >
        {/* 필요하면 “돌아가기” 버튼도 추가 가능 */}
        {/* <Button onClick={handleClose}>돌아가기</Button> */}

        <Button
          sx={{
            color: "white",
            backgroundColor: "black",
            "&:hover": { backgroundColor: "#333" },
          }}
          onClick={() => {
            setIsCancel();
            setOpen(false);
          }}
        >
          취소 확인
        </Button>
      </DialogActions>
    </Dialog>
  );
}
