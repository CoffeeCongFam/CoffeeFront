import {
  Box,
  IconButton,
  Typography,
  Fade,
  Backdrop,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ErrorIcon from "@mui/icons-material/Error";
import CloseIcon from "@mui/icons-material/Close";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SubscriptItem from "../../../components/customer/purchase/SubscriptionItem";
import {
  fetchSubscriptionInfo,
  requestPurchase,
} from "../../../apis/customerApi";
import axios from "axios";
import useUserStore from "../../../stores/useUserStore";
import useAppShellMode from "../../../hooks/useAppShellMode";

// 결제수단 로고 이미지 import
import kakaopayImg from "../../../assets/kakaopay.png";
import tosspayImg from "../../../assets/tosspay.png";
import naverpayImg from "../../../assets/naverpay.png";
import paycoImg from "../../../assets/payco.png";
// import useAppShellMode from "../../../hooks/useAppShellMode";

function PurchaseSubscriptionPage() {
  const { isAppLike } = useAppShellMode();
  const { subId } = useParams();
  const { authUser } = useUserStore();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  async function fetchSubData() {
    const subData = await fetchSubscriptionInfo(subId);
    setSubscription(subData);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchSubData();
  }, [subId]);

  function handleBack() {
    navigate(-1);
  }

  async function confirmPayment(pg = "danal_tpay") {
    setIsPurchaseLoading(true);
    setPayOpen(false);

    try {
      const payload = { subscriptionId: subscription.subscriptionId };
      const created = await requestPurchase(payload);
      const merchantUid = created.merchantUid;

      const { IMP } = window;
      if (!IMP) throw new Error("PortOne SDK가 로드되지 않았습니다.");

      // (모바일에서는) m_redirect_url = 결제 완료 후 돌아올 내 사이트 주소 필요
      const redirectUrl = `${window.location.origin}/me/purchase/${created.purchaseId}/complete`;

      IMP.init("imp03140165");

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
          m_redirect_url: redirectUrl, // 리다이렉트
        },
        async (response) => {
          if (response.success) {
            try {
              const validationRes = await axios.post(
                "/api/payments/validation",
                {
                  purchaseId: created.purchaseId,
                  impUid: response.imp_uid,
                  merchantUid: response.merchant_uid,
                }
              );
              console.log("검증 성공:", validationRes.data);
              navigate(`/me/purchase/${created.purchaseId}/complete`);
            } catch (error) {
              console.error("결제 검증 실패:", error);
              alert("결제 검증에 실패했습니다. 결제가 승인되지 않았습니다.");
            }
          } else {
            alert(`결제 실패: ${response.error_msg}`);
          }
          setIsPurchaseLoading(false);
        }
      );
    } catch (error) {
      alert("결제 요청 중 문제가 발생했습니다.", error);
      setIsPurchaseLoading(false);
    }
  }

  // ✅ 결제 수단 정보 (디자인 강화)
  const paymentMethods = [
    {
      label: "신용/체크카드",
      pg: "danal_tpay",
      icon: <CreditCardIcon sx={{ fontSize: 28, color: "#334336" }} />,
      color: "#4A90E2",
      bgColor: "#E8F4FF",
    },
    {
      label: "휴대폰 결제",
      pg: "danal_tpay",
      icon: <PhoneAndroidIcon sx={{ fontSize: 28, color: "#334336" }} />,
      color: "#7B68EE",
      bgColor: "#F0EDFF",
    },
    {
      label: "카카오페이",
      pg: "kakaopay",
      icon: kakaopayImg,
      color: "#FEE500",
      bgColor: "#FFF9C4",
      textColor: "#3C1E1E",
      imgStyle: { width: 100, height: "auto" },
    },
    {
      label: "토스페이",
      pg: "tosspay",
      icon: tosspayImg,
      color: "#0064FF",
      bgColor: "#F4F8FF",
      imgStyle: { width: 120, height: "auto" },
    },
    {
      label: "네이버페이",
      pg: "naverco",
      icon: naverpayImg,
      color: "#03C75A",
      bgColor: "#E8F9F0",
      imgStyle: { width: 70, height: "auto" },
    },
    {
      label: "페이코",
      pg: "payco",
      icon: paycoImg,
      color: "#FF5046",
      bgColor: "#FFEAE8",
      imgStyle: { width: 200, height: "auto" },
    },
  ];

  return (
    <>
      <Box
        sx={{
          p: 3,
          pb: isAppLike ? "100px" : 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* 상단 헤더 */}
        {/* 뒤로가기 + 제목 한 줄에 배치 (제목 가운데 정렬) */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 900,
            mb: isAppLike ? 1 : 5,
            height: 48,
          }}
        >
          {/* 뒤로가기 버튼: 왼쪽 고정 */}
          <IconButton
            onClick={handleBack}
            sx={{
              position: "absolute",
              left: 0,
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          {/* 제목: 중앙 정렬 */}
          <Typography
            variant="h6"
            sx={{ textAlign: "center", flexGrow: 1, fontWeight: "bold" }}
          >
            구독하기
          </Typography>
        </Box>

        {/* 구독권 정보 */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Box sx={{ width: "100%", maxWidth: "900px" }}>
            <SubscriptItem subscription={subscription} isAppLike={isAppLike} />
          </Box>
        </Box>

        {/* 유의사항 */}
        <Box
          sx={{
            mt: 8,
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
            <Typography
              variant="subtitle2"
              sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#334336" }}
            >
              유의사항
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography
              variant="body2"
              sx={{ fontSize: "0.8rem" }}
              color="text.secondary"
            >
              • 본 구독권은 {subscription?.store?.storeName} 매장 전용으로 사용
              가능합니다.
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.8rem" }}
            >
              • 결제일 기준 30일간 이용 가능하며, 중도 해지는 불가합니다.
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.8rem" }}
            >
              • 1일 {subscription?.maxDailyUsage}회 제공 기준이며, 일부 메뉴는
              추가 금액이 발생할 수 있습니다.
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.8rem" }}
            >
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
            justifyContent: isAppLike ? "center" : "flex-end",
          }}
        >
          <Button
            fullWidth={isAppLike}
            onClick={() => setPayOpen(true)}
            sx={{
              borderRadius: isAppLike ? "2rem" : "0.5rem",
              backgroundColor: "#334336",
              color: "white",
              px: 4,
              maxWidth: isAppLike ? 480 : "none",
              "&:hover": { backgroundColor: "#333" },
            }}
          >
            결제하기
          </Button>
        </Box>
      </Box>

      {/* ✅ 결제수단 선택 패널 */}
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
              bottom: isAppLike ? "56px" : 0,
              left: 0,
              right: 0,
              mx: "auto",
              maxWidth: 820,
              bgcolor: "white",
              borderRadius: "24px 24px 0 0",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
              px: 3,
              pt: 2,
              pb: isAppLike ? "80px" : 4,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 4,
                bgcolor: "#E0E0E0",
                borderRadius: 2,
                mx: "auto",
                mb: 2,
              }}
            />

            {/* 닫기 */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
              <IconButton
                onClick={() => setPayOpen(false)}
                size="small"
                sx={{
                  color: "#666",
                  "&:hover": { bgcolor: "#f5f5f5" },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* 안내 */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 0.5, color: "#334336" }}
              >
                결제 수단 선택
              </Typography>
              <Typography variant="body2" color="text.secondary">
                안전하고 편리한 결제 수단을 선택하세요
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* ✅ 결제 수단 그리드 */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))", // 3열 고정
                gridAutoRows: 110, // 각 행 높이를 110px로 고정
                columnGap: 1.5,
                rowGap: 1.5,
                gap: 1.5,
                width: "100%",
              }}
            >
              {paymentMethods.map((method) => (
                <Box
                  key={method.label}
                  onClick={() => {
                    setSelectedMethod(method.label);
                    setTimeout(() => confirmPayment(method.pg), 200);
                  }}
                  sx={{
                    bgcolor: method.bgColor,
                    border: `2px solid ${
                      selectedMethod === method.label
                        ? method.color
                        : "transparent"
                    }`,
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: `0 4px 12px ${method.color}40`,
                      borderColor: method.color,
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  {/* 아이콘 */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 40,
                    }}
                  >
                    {React.isValidElement(method.icon) ? (
                      method.icon
                    ) : (
                      <img
                        src={method.icon}
                        alt={method.label}
                        style={{
                          ...method.imgStyle,
                          objectFit: "contain",
                          filter:
                            method.label === "토스페이"
                              ? "drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
                              : "none",
                        }}
                      />
                    )}
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: method.textColor || "#333",
                      fontSize: 13,
                    }}
                  >
                    {method.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box
              sx={{
                bgcolor: "#F8F9FA",
                borderRadius: 2,
                px: 2,
                pt: 1,
                mt: 2,
                pb: 10,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", lineHeight: 1.5 }}
              >
                🔒 모든 결제는 안전하게 암호화되어 처리됩니다
              </Typography>
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
        <CircularProgress sx={{ color: "#334336" }} />
        <Typography variant="body1" sx={{ mt: 1, color: "#334336" }}>
          결제 진행 중입니다...
        </Typography>
      </Backdrop>
    </>
  );
}

export default PurchaseSubscriptionPage;
