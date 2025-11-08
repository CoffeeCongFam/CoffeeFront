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
import {
  fetchSubscriptionInfo,
  requestPurchase,
} from "../../../apis/customerApi";
import axios from "axios";
import useUserStore from "../../../stores/useUserStore";

function PurchaseSubscriptionPage() {
  const { subId } = useParams();
  const { authUser } = useUserStore();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false); // 결제 처리 로딩 상태
  const [payOpen, setPayOpen] = useState(false); // 결제 패널 열림/닫힘

  async function fetchSubData() {
    const subData = await fetchSubscriptionInfo(subId);
    console.log(subData);
    setSubscription(subData);
  }

  useEffect(() => {
    console.log(subId + "로 구독권 정보 가져오기");
    // 구독권 정보 가져오기
    fetchSubData();
  }, [subId]);

  function handleBack() {
    navigate(-1);
  }

  async function confirmPayment(pg = "danal_tpay") {
    setIsLoading(true);
    setPayOpen(false);

    try {
      // 서버에 주문(PENDING) 먼저 생성
      const payload = {
        subscriptionId: subscription.subscriptionId,
      };

      const created = await requestPurchase(payload);
      const merchantUid = created.merchantUid;

      const { IMP } = window;
      IMP.init("imp03140165");

      // PortOne 결제 요청
      IMP.request_pay(
        {
          pg,
          pay_method: "card",
          amount: subscription.price,
          name: subscription.subscriptionName,
          merchant_uid: merchantUid,
          buyer_name: authUser.name,
          buyer_email: authUser.email,
          buyer_tel: authUser.tel,
        },
        async (response) => {
          if (response.success) {
            console.log("결제 성공:", response);

            try {
              // 결제 검증 요청
              const validationRes = await axios.post(
                "/api/payments/validation",
                {
                  purchaseId: created.purchaseId,
                  impUid: response.imp_uid,
                  merchantUid: response.merchant_uid,
                }
              );

              console.log("검증 성공:", validationRes.data);

              // 결제 검증 완료 → 결제 확정
              navigate(`/me/purchase/${created.purchaseId}/complete`);
            } catch (error) {
              console.error("결제 검증 실패:", error);
              alert("결제 검증에 실패했습니다. 결제가 승인되지 않았습니다.");
              // navigate("/");
            }
          } else {
            // 결제 실패
            alert(`결제 실패: ${response.error_msg}`);
          }
        }
      );
    } catch (error) {
      console.error("결제 요청 오류:", error);
      alert("결제 요청 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }




  //   {
  //   isLoading ? <Loading></Loading> :
  // }

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
        minHeight: 420,
        px: 3,
        pt: 3,
      }}
    >
      {/* 상단 닫기 */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <IconButton onClick={() => setPayOpen(false)}>
          <CloseIcon sx={{ color: "white" }} />
        </IconButton>
      </Box>

      {/* 결제수단 선택 */}
      <Typography
        variant="subtitle1"
        sx={{ color: "white", fontWeight: 600, mb: 2 }}
      >
        결제 수단을 선택하세요
      </Typography>

      {/* 카드들 (6개 grid) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          mb: 3,
        }}
      >
        {[
          { label: "신용카드", pg: "danal_tpay" },
          { label: "휴대폰결제", pg: "danal_tpay" },
          { label: "카카오페이", pg: "kakaopay" },
          { label: "스마일페이", pg: "smilepay" },
          { label: "토스페이", pg: "tosspay" },
          { label: "페이코", pg: "payco" },
        ].map((method) => (
          <Box
            key={method.label}
            onClick={() => confirmPayment(method.pg)} // ✅ 클릭 시 해당 PG로 결제
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              mx: "auto",
              maxWidth: 820,
              bgcolor: "#5e5e5e",
              borderRadius: "24px 24px 0 0",
              minHeight: 420,
              px: 3,
              pt: 3,
            }}
          >
            {/* 상단 닫기 */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <IconButton onClick={() => setPayOpen(false)}>
                <CloseIcon sx={{ color: "white" }} />
              </IconButton>
            </Box>

            {/* 결제수단 선택 */}
            <Typography
              variant="subtitle1"
              sx={{ color: "white", fontWeight: 600, mb: 2 }}
            >
              결제 수단을 선택하세요
            </Typography>

            {/* 카드들 (6개 grid) */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
                mb: 3,
              }}
            >
              {[
                { label: "신용카드", pg: "danal_tpay" },
                { label: "휴대폰결제", pg: "danal_tpay" },
                { label: "카카오페이", pg: "kakaopay" },
                { label: "스마일페이", pg: "smilepay" },
                { label: "토스페이", pg: "tosspay" },
                { label: "페이코", pg: "payco" },
              ].map((method) => (
                <Box
                  key={method.label}
                  onClick={() => confirmPayment(method.pg)} // ✅ 클릭 시 해당 PG로 결제
                  sx={{
                    bgcolor: "#dcdcdc",
                    border: "4px solid rgba(255,128,0,0.4)",
                    borderRadius: 4,
                    height: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#555",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "#eaeaea",
                      transform: "scale(1.03)",
                      transition: "all 0.2s ease",
                    },
                  }}
                >
                  {method.label}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  </Fade>
</Backdrop>


      {/* ✅ 결제 로딩 화면 */}
      <Backdrop
        open={isPurchaseLoading}
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
