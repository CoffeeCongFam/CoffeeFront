import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "55%",
  transform: "translate(-50%, -50%)",
  width: "fit-content",
  minWidth: "360px",
  height: "200px",
  bgcolor: "background.paper",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

export default function OrderCancleCheckModal({ open, setOpen, setIsCancel }) {
  const handleClose = () => setOpen(false);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Box>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            주문을 취소하시겠습니까?
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            이미 제조가 시작된 경우, 취소가 어려울 수 있습니다.
          </Typography>
        </Box>

        {/* 🔹 하단 오른쪽 버튼 */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            sx={{
              color: "white",
              backgroundColor: "black",
              "&:hover": { backgroundColor: "#333" },
            }}
            onClick={() => {
              setIsCancel(true);
              setOpen(false);
            }}
          >
            취소 확인
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
