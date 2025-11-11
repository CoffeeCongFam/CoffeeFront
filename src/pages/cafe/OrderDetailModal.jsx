import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // 닫기 아이콘
import { useState } from "react";

// 주문 거부 사유 리스트
const REFUSAL_REASONS = [
  {
    code: "soldOut",
    label: "재료소진",
  },
  {
    code: "closed",
    label: "영업준비중",
  },
  {
    code: "other",
    label: "개인 사유",
  },
];

// 모달 컴포넌트 - 상세 정보 확인, 거절 사유 버튼, 접수거절 버튼

const DetailField = ({ label, value, isStatus = false }) => {
  let content;

  if (isStatus) {
    // 주문 상태 필드인 경우 (객체 전달됨): value.name을 렌더링
    content = (
      <Typography
        sx={{
          // ⭐ 레이블과의 간격 조정을 위해 mt를 제거하고 ml을 추가 ⭐
          ml: 1,
          bgcolor: value.header,
          color: "white",
          p: "2px 8px",
          borderRadius: 1,
          fontWeight: "bold",
        }}
      >
        {value.name} {/* 🌟 객체에서 문자열(name)만 사용 🌟 */}
      </Typography>
    );
  } else {
    // 일반 필드인 경우 (문자열/숫자 전달 예상)
    // 🌟 방어 코드: value가 null/undefined/객체가 아닐 때만 렌더링 🌟
    const isRenderable = value !== null && typeof value !== "object";
    content = (
      <Typography sx={{ ml: 1 }}>
        {isRenderable ? value : "데이터 없음"}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
      <Typography
        variant="body2"
        sx={{ width: 80, color: "text.secondary", fontWeight: "bold" }}
      >
        {label} :
      </Typography>
      {content}
    </Box>
  );
};

export default function OrderDetailModal({
  open,
  onClose,
  order,
  statusColors,
  onReject,
}) {
  console.log(order);
  // 주문 거부 사유
  const [selectedReasonCode, setSelectedReasonCode] = useState(null);

  // 주문 상세 및 거절 처리 모달
  // order 객체가 없으면 렌더링하지 않음
  if (!order) return null;

  const statusInfo = statusColors[order.orderStatus];

  // 주문 거부 사유 선택 핸들러
  const handleSelectReason = (code) => {
    setSelectedReasonCode(code);
  };

  // 최종 주문 거부 버튼 활성화 로직
  const isSubmitEnabled = selectedReasonCode !== null;

  // 접수 거절 버튼은 REQUEST, INPROGRESS 상태일 때만 표시
  const showRejectBtn = order.orderStatus === "REQUEST";

  // 거절 버튼 클릭 핸들러 : 부모로부터 전달받은 onReject 함수를 호출하고 모달을 닫는다.
  const handleReject = () => {
    // 선택된 코드에 해당하는 객체를 찾고
    const selectedReason = REFUSAL_REASONS.find(
      (r) => r.code === selectedReasonCode
    );

    // 해당 객체의 Label을 가져옴
    const reasonTextToSend = selectedReason
      ? selectedReason.label
      : "시스템 문제 이슈";

    // 실제 사유 텍스트까지 부모에게 전달
    onReject(order.orderId, "REJECTED", reasonTextToSend);

    // 선택 상태 초기화
    setSelectedReasonCode(null);

    // 여기서 모달 닫기
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#334336",
          color: "white",
          p: 2,
        }}
      >
        <Typography fontWeight="bold">주문 상세내역</Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        {/* A01 주문 번호 및 타입 */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              border: "1px solid #9e9e9e",
              p: 1,
              mr: 2,
              width: 70,
              height: 40,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="body1" fontWeight="bold">
              {order.orderNumber}
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight="bold">
            {order.orderType}
          </Typography>
        </Box>

        {/* 상세 정보 필드 */}
        <DetailField
          label="주문일시"
          value={new Date(order.createdAt).toLocaleString()}
        />
        <DetailField label="주문자" value={order.name} />
        <DetailField label="전화번호" value={order.tel} />
        <DetailField label="주문상태" value={statusInfo} isStatus={true} />

        {/* 메뉴 및 수량 영역 */}
        <Box sx={{ mt: 3, borderTop: "1px solid #eee", pt: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body1" fontWeight="bold">
              메뉴
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              수량
            </Typography>
          </Box>

          {/* 🚩 menuList 배열을 순회하여 각 메뉴 항목을 렌더링합니다. */}
          {order.menuList.map((menuItem) => (
            <Box
              key={menuItem.menuId}
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="body2">{menuItem.menuName}</Typography>
              <Typography variant="body2">{menuItem.quantity}</Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      {/* 하단 버튼 영역 */}
      <Box sx={{ p: 2, borderTop: "1px solid #eee" }}>
        {showRejectBtn && (
          <>
            <Box sx={{ display: "flex", p: 2, gap: 6 }}>
              {REFUSAL_REASONS.map((reason) => {
                return (
                  <Button
                    key={reason.code}
                    // 선택된 버튼 시각적 강조
                    variant={
                      selectedReasonCode === reason.code
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => handleSelectReason(reason.code)}
                    sx={{
                      ...(selectedReasonCode === reason.code
                        ? {
                            bgcolor: "#334336",
                            color: "#fff9f4",
                            "&:hover": {
                              bgcolor: "#334336",
                              opacity: 0.9,
                            },
                          }
                        : {
                            borderColor: "#334336",
                            color: "#334336",
                            "&:hover": {
                              borderColor: "#334336",
                              bgcolor: "rgba(51, 67, 54, 0.05)",
                            },
                          }),
                    }}
                  >
                    {reason.label}
                  </Button>
                );
              })}
            </Box>

            <Button
              fullWidth
              variant="contained"
              // 🌟 거절 버튼 클릭 시 handleReject 호출
              onClick={handleReject}
              disabled={!isSubmitEnabled}
              sx={{
                bgcolor: "#334336",
                color: "#fff9f4",
                "&:hover": {
                  bgcolor: "#334336",
                  opacity: 0.9,
                },
                "&:disabled": {
                  bgcolor: "#ccc",
                  color: "#666",
                },
              }}
            >
              접수 거절
            </Button>
          </>
        )}
      </Box>
    </Dialog>
  );
}
