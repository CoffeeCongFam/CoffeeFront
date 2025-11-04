import {
  Box,
  IconButton,
  Typography,
  Fade,
  Backdrop,
  Button,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ErrorIcon from "@mui/icons-material/Error";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SubscriptItem from "../../../components/customer/purchase/SubscriptionItem";
import { fetchSubscriptionInfo } from "../../../apis/customerApi";

function PurchaseSubscriptionPage() {
  const { subId } = useParams();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState({});
  const [isLoading, setIsLoading] = useState(false); // 결제 처리 로딩 상태
  const [payOpen, setPayOpen] = useState(false); // 결제 패널 열림/닫힘

  async function fetchSubData() {
    const subData = await fetchSubscriptionInfo(subId);
    console.log(subData);
    return subData;
  }

  useEffect(() => {
    console.log(subId + "로 구독권 정보 가져오기");
    // TODO: 실제 API 호출

    // 구독권 정보 가져오기
    const data = fetchSubData();
    console.log(data);
    setSubscription(data);
  }, [subId]);

  function handleBack() {
    navigate(-1);
  }

  //결제 진행 함수 (로딩 + 완료 페이지 이동)
  async function confirmPayment() {
    setIsLoading(true);
    setPayOpen(false);

    // {
    //     "subscriptionId" : 2,
    //     "purchaseType" : "CREDIT_CARD",
    //     "receiverMemberId" : 2,
    //     "giftMessage" : "선물 줄게"
    // }

    // //구매일 경우 receiverMemberId, giftMessage는 Null로 처리

    try {
      // TODO: 실제 결제 처리 API 호출 (예: await api.purchase(subscription.subId))
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기 (로딩 효과)

      const purchaseId = 1; // 실제 purchaseId 받아오기
      navigate(`/me/purchase/${purchaseId}/complete`);
    } catch (error) {
      console.error("결제 실패:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Box sx={{ p: 3, pb: 10 }}>
        {/* 뒤로가기 */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>

        {/* 제목 */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="h6">구독하기</Typography>
        </Box>

        {/* 선택한 구독권 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            mt: 2,
          }}
        >
          <Box sx={{ width: "100%", maxWidth: "900px" }}>
            <SubscriptItem subscription={subscription} />
          </Box>
        </Box>

        {/* 유의사항 */}
        <Box
          sx={{
            mt: 3,
            width: "100%",
            maxWidth: "900px",
            mx: "auto",
            bgcolor: "#fffef6",
            border: "1px solid #fff2c5",
            borderRadius: 2,
            py: 2,
            px: 5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <ErrorIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              유의사항
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              • 본 구독권은 {subscription?.store?.storeName} 매장 전용으로 사용
              가능합니다.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 결제일 기준 30일간 이용 가능하며, 중도 해지는 불가합니다.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 1일 1회 제공 기준이며, 일부 메뉴는 추가 금액이 발생할 수
              있습니다.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 선물하기로 받은 구독권은 양도가 제한될 수 있습니다.
            </Typography>
          </Box>
        </Box>

        {/* 하단 결제 버튼 */}
        <Box
          sx={{
            mt: 2,
            width: "100%",
            maxWidth: "900px",
            mx: "auto",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={() => setPayOpen(true)}
            sx={{
              backgroundColor: "black",
              color: "white",
              px: 4,
              "&:hover": { backgroundColor: "#333" },
            }}
          >
            결제하기
          </Button>
        </Box>
      </Box>

      {/* 결제 선택 패널 */}
      <Backdrop
        open={payOpen}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        onClick={() => setPayOpen(false)}
      >
        <Fade in={payOpen}>
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              mx: "auto",
              maxWidth: 820,
              bgcolor: "#5e5e5e",
              borderRadius: "24px 24px 0 0",
              minHeight: 320,
              px: 3,
            }}
          >
            {/* 상단 닫기 */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <IconButton onClick={() => setPayOpen(false)}>
                <CloseIcon sx={{ color: "white" }} />
              </IconButton>
            </Box>

            {/* 카드 선택 영역 (더미) */}
            <Box
              sx={{
                bgcolor: "#dcdcdc",
                border: "4px solid rgba(255,128,0,0.4)",
                borderRadius: 4,
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
                color: "#666",
                mb: 2,
                cursor: "pointer",
              }}
            >
              신한 카드
            </Box>

            {/* 밑에 실제 결제 버튼 */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Box
                sx={{
                  bgcolor: "white",
                  color: "black",
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={confirmPayment}
              >
                결제 진행
              </Box>
            </Box>
          </Box>
        </Fade>
      </Backdrop>

      {/* ✅ 결제 로딩 화면 */}
      <Backdrop
        open={isLoading}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.modal + 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress color="inherit" />
        <Typography variant="body1" sx={{ mt: 1 }}>
          결제 진행 중입니다...
        </Typography>
      </Backdrop>
    </>
  );
}

export default PurchaseSubscriptionPage;
