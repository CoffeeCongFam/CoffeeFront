import { Box, IconButton, Typography, Divider } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ForwardIcon from "@mui/icons-material/Forward";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import WalletIcon from "@mui/icons-material/Wallet";
import { fetchPurchaseInfo } from "../../../apis/customerApi";

function CompletePurchasePage() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();

  const [purchase, setPurchase] = useState(null);

  async function getPurchaseInfo() {
    const data = await fetchPurchaseInfo(purchaseId);
    setPurchase(data);
  }

  useEffect(() => {
    // TODO: purchaseId 로 실제 결제 완료 내역 조회
    getPurchaseInfo();
  }, [purchaseId]);

  function handleBack() {
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
        <Typography variant="h6">
          {purchase.isGift === "Y"
            ? "선물이 전달되었습니다."
            : "결제가 완료되었습니다."}
        </Typography>
        {purchase.isGift === "Y" ? <CardGiftcardIcon /> : <WalletIcon />}
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
        {purchase.isGift === "Y" && (
          <Box
            sx={{
              display: "flex",
              flex: 1,
              justifyContent: "space-around",
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
              }}
            >
              <Typography fontWeight={"bold"}>보내는 사람</Typography>
              <Typography>{purchase?.sender}</Typography>
            </Box>
            <Box
              sx={{
                width: 40,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ForwardIcon />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
              }}
            >
              <Typography fontWeight={"bold"}>받는 사람</Typography>
              <Typography>{purchase?.receiver}</Typography>
            </Box>
          </Box>
        )}
        {purchase?.isGift === "Y" && (
          <Box
            sx={{
              textAlign: "center",
              backgroundColor: "#fff48dd7",
              px: "1rem",
              py: "1rem",
              borderRadius: "1rem",
            }}
          >
            <Typography>{purchase.giftMessage}</Typography>
          </Box>
        )}
        <Divider sx={{ my: 3 }} />

        {/* 구독 정보 */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          구독 정보
        </Typography>

        <Row label="카페명" value={purchase.storeName} />
        <Row label="구독권명" value={purchase.subscriptionName} />
        {/* <Row
          label="금액"
          value={`${purchase?.paymentAmount?.toLocaleString()} 원`}
        /> */}
        <Row label="결제 주기" value={purchase.cycle} />
        <Row label="다음 결제 예정일" value={purchase.nextBillingDate} />

        <Divider sx={{ my: 3 }} />

        {/* 결제 정보 */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          결제 정보
        </Typography>

        <Row label="승인 일시" value={purchase.paidAt} />
        <Row label="승인 번호" value={purchase.purchaseId} />
        <Row label="결제 수단" value={purchase.paymentStatus} />
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
