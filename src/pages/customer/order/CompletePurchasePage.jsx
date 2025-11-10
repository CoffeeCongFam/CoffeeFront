import { Box, IconButton, Typography, Divider, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ForwardIcon from "@mui/icons-material/Forward";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios"; 
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import WalletIcon from "@mui/icons-material/Wallet";
import { fetchPurchaseInfo } from "../../../apis/customerApi";
import formatDate from "../../../utils/formatDate";
import Loading from "../../../components/common/Loading";

function CompletePurchasePage() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();

  const [purchase, setPurchase] = useState(null);
  const [searchParams] = useSearchParams();
  const impUid = searchParams.get("imp_uid");
  const merchantUid = searchParams.get("merchant_uid");
  const successParam  = searchParams.get("imp_success");  // "true" | "false" | null

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [validateError, setValidateError] = useState(null);


  
  const fmtPrice = (n) =>
    typeof n === "number" ? new Intl.NumberFormat("ko-KR").format(n) : n ?? "0";


  async function getPurchaseInfo() {
    const data = await fetchPurchaseInfo(purchaseId);
    setPurchase(data);
  }

  useEffect(() => {
  async function run() {
    try {
      // 1) success / impUid / merchantUid 가 없는 경우: 기존 PC 흐름 (콜백 기반)
      if (!impUid || !merchantUid || successParam === null) {
        await getPurchaseInfo();
        return;
      }

      // 2) success === false 인 경우: 결제 실패
      if (successParam === "false") {
        setValidateError("결제가 취소되었거나 실패했습니다.");
        return;
      }

      // 3) success=true + impUid/merchantUid 있으면 우선 서버 검증
      setValidating(true);
      setValidateError(null);

      await axios.post("/api/payments/validation", {
        purchaseId,
        impUid,
        merchantUid,
      });

      // 검증이 통과하면 실제 결제/구독 정보 조회
      await getPurchaseInfo();
    } catch (err) {
      console.error("결제 검증 실패: ", err);
      setValidateError(
        "결제 검증에 실패했습니다. 결제가 승인되지 않았습니다."
      );
    } finally {
      setValidating(false);
      setLoading(false);   // ✅ 어떤 경우든 여기서 false 됨
    }
  }

  run();
}, [purchaseId, impUid, merchantUid, successParam]);


  function handleBack() {
    navigate(-1);
  }

  // if (!purchase) return null;
   if (validating || loading) {
    return (
      <Box sx={{ width: "100vw", height: "100vh" }}>
        <Loading
          title={"결제 처리 중"}
          message={"결제 정보를 확인하고 있습니다..."}
        />
      </Box>
    );
  }

  if (validateError) {
    return (
      <Box sx={{ p: 3, textAlign: "center" , height:"100%", alignContent: "center", pb: 12}}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          결제 실패
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {validateError}
        </Typography>
        <Button
          onClick={() => navigate(-1)}
          sx={{
            bgcolor: "black",
            color: "white",
            px: "4rem",
            borderRadius: "3rem",
            cursor: "pointer",
            fontWeight: 600,
            display: "inline-block",
          }}
        >
          뒤로가기
        </Button>
      </Box>
    );
  }

  // 검증은 통과했는데 purchase 정보가 없는 경우
  if (!purchase) {
    console.log(purchase);

    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          결제 정보를 찾을 수 없습니다.
        </Typography>
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
            display: "inline-block",
          }}
        >
          홈으로
        </Box>
      </Box>
    );
  }

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
        {/* <Row label="결제 주기" value={purchase.cycle} /> */}
        {/* <Row label="다음 결제 예정일" value={purchase.nextBillingDate} /> */}

        <Divider sx={{ my: 3 }} />

        {/* 결제 정보 */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          결제 정보
        </Typography>

        <Row label="승인 일시" value={formatDate(purchase.paidAt)} />
        <Row label="승인 번호" value={purchase.merchantUid} />
        <Row label="결제 금액" value={fmtPrice(purchase.paymentAmount)} />
        <Row label="결제 수단" value={purchase.purchaseType} />
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
