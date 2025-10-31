import { Box, IconButton, Typography, Divider } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function CompletePurchasePage() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();

  const [purchase, setPurchase] = useState(null);

  useEffect(() => {
    // TODO: purchaseId 로 실제 결제 완료 내역 조회
    // 예시 더미 데이터
    setPurchase({
      purchaseId,
      storeName: "카페 모나카",
      subName: "스탠다드",
      amount: 19900,
      cycle: "1개월",
      nextBillingDate: "2025.10.26",
      paidAt: "2025.10.26 13:28",
      approvalNo: "2342389819",
      payMethod: "[신한] 카드",
    });
  }, [purchaseId]);

  function handleBack() {
    // 결제 완료 후에는 그냥 내 구독 목록 /me/subscriptions 로 보내도 됨
    navigate("/me/subscriptions");
  }

  if (!purchase) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton onClick={() => handleBack()} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* 상단 상태 메시지 */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h6">결제가 완료되었습니다.</Typography>
      </Box>

      {/* 실제 내용 카드 */}
      <Box
        sx={{
          maxWidth: 520,
          mx: "auto",
          bgcolor: "white",
          borderRadius: 1.5,
          p: 4,
          boxShadow: 0,
          backgroundColor: "lemonchiffon",
        }}
      >
        {/* 상단 매장명 */}
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#555", mb: 4 }}>
          {purchase.storeName}
        </Typography>

        {/* 구독 정보 */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          구독 정보
        </Typography>

        <Row label="카페명" value={purchase.storeName} />
        <Row label="구독권명" value={purchase.subName} />
        <Row label="금액" value={`${purchase.amount.toLocaleString()} 원`} />
        <Row label="결제 주기" value={purchase.cycle} />
        <Row label="다음 결제 예정일" value={purchase.nextBillingDate} />

        <Divider sx={{ my: 3 }} />

        {/* 결제 정보 */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          결제 정보
        </Typography>

        <Row
          label="결제 금액"
          value={`${purchase.amount.toLocaleString()} 원`}
        />
        <Row label="승인 일시" value={purchase.paidAt} />
        <Row label="승인 번호" value={purchase.approvalNo} />
        <Row label="결제 수단" value={purchase.payMethod} />
      </Box>

      {/* 하단 확인 버튼 영역 */}
      <Box
        sx={{
          mt: "auto",
          py: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          onClick={() => navigate("/me")}
          sx={{
            bgcolor: "black",
            color: "white",
            px: 5,
            py: 1.4,
            borderRadius: 3,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          확인
        </Box>
      </Box>
    </Box>
  );
}

// 한 줄 라벨/값 컴포넌트
function Row({ label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mb: 1.2,
        gap: 2,
      }}
    >
      <Typography sx={{ color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}

export default CompletePurchasePage;
