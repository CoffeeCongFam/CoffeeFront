import {
  Box,
  Typography,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
  Button,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React, { useEffect, useState } from "react";
import OrderStepper from "../../../components/customer/order/OrderStepper";
import OrderCheckModal from "../../../components/customer/order/OrderCancleCheckModal";
import { useNavigate, useParams } from "react-router-dom";
import useAppShellMode from "../../../hooks/useAppShellMode";

import {
  fetchOrderDetail,
  requestCancelOrder,
} from "../../../apis/customerApi";
import OrderProgressBar from "../../../components/customer/order/OrderProgressBar";

function orderStatusMessage(status) {
  switch (status) {
    case "REQUEST":
      return "주문이 접수 중이에요.";
    case "INPROGRESS":
      return "음료가 제조 중입니다...";
    case "COMPLETED":
      return "메뉴가 제조 완료되었습니다.";
    case "RECEIVED":
      return "수령이 완료된 주문입니다.";
    case "REJECTED":
      return "해당 주문이 매장에서 거부되었습니다.";
    case "CANCELED":
      return "해당 주문은 취소되었습니다.";
    default:
      return "주문 상태를 불러오는 중입니다.";
  }
}

function handleSubscriptionType(type) {
  switch (type) {
    case "BASIC":
      return "베이직";
    case "STANDARD":
      return "스탠다드";
    case "PREMIUM":
      return "프리미엄";
  }
}

function CompleteOrderPage() {
  const { orderId } = useParams();
  const { isAppLike } = useAppShellMode();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState(null);
  const [openCancel, setOpenCancel] = useState(false); // 주문 취소 확인 모달

  async function updateOrderDetail() {
    try {
      console.log("업데이트 요청");
      const data = await fetchOrderDetail(orderId);

      console.log("업데이트 후>>", data);

      if (data) {
        setOrderInfo(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 주문 정보 초기화
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await fetchOrderDetail(orderId);
        if (!mounted) return;

        if (data) {
          setOrderInfo(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [orderId]);
  // orderInfo 갱신으로 계속 요청되는 문제 수정

  // 주문 취소
  async function handleCancelOrder() {
    try {
      await requestCancelOrder(orderId);

      // 서버에서 최종 상태 다시 확인
      const data = await fetchOrderDetail(orderId);
      if (data) {
        setOrderInfo(data);
      }

      console.log(`✅ ${orderId}번 주문 취소 + 상태 갱신 완료`);
    } catch (e) {
      console.error("❌ 주문 취소 오류:", e);
      alert("서버와의 통신 중 오류가 발생했습니다.");
    } finally {
      setOpenCancel(false);
    }
  }

  // #TODO. 2) SSE로 상태 실시간 받기
  // useEffect(() => {
  //   if (!orderId) return;

  //   const es = new EventSource(`/api/orders/${orderId}/sse`);

  //   es.onmessage = (e) => {
  //     const data = JSON.parse(e.data);
  //     setOrderInfo((prev) =>
  //       prev
  //         ? {
  //             ...prev,
  //             ...data,
  //             orderStatus: data.status ?? prev.orderStatus,
  //           }
  //         : prev
  //     );
  //   };

  //   es.onerror = () => {
  //     es.close();
  //   };

  //   return () => {
  //     es.close();
  //   };
  // }, [orderId]); //

  function handleBack() {
    if (orderInfo.orderStatus === "CANCELED") {
      navigate("/me");
    } else {
      navigate(-1);
    }
  }
  function handleGoHome() {
    navigate("/me");
  }

  return (
    <Box sx={{ px: isAppLike ? 3 : 12, py: 3, pb: 10 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton onClick={() => handleBack()} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* 상단 상태 메시지 */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          {
            isLoading && "주문 내역 불러오는 중..."
            // : orderStatusMessage(orderInfo.orderStatus)
          }
        </Typography>
      </Box>

      {!isLoading ? (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
            }}
          >
            {orderInfo.orderStatus === "CANCELED" ? (
              "취소"
            ) : (
              <CheckCircleRoundedIcon
                sx={{ fontSize: isAppLike ? "2rem" : "3rem", mb: 1 }}
              />
            )}

            <Typography fontSize="2rem" textAlign="center" fontWeight="bold">
              주문 번호 {orderInfo.orderNumber}번
            </Typography>
            <Box sx={{ mt: 2, mb: 4, width: isAppLike ? "100%" : "70%" }}>
              <OrderProgressBar status={orderInfo.orderStatus} />
            </Box>
          </Box>

          {/* 스텝퍼 */}
          {/* <OrderStepper orderStatus={orderInfo.orderStatus} /> */}

          {/* 주문 카드 */}
          <Box
            sx={{
              mt: 4,
              mx: "auto",
              maxWidth: 420,
              backgroundColor: "white",
              borderRadius: 2,
              p: 3,
              boxShadow: 1,
            }}
          >
            {/* 제목 */}
            {/* <Typography
              variant="h6"
              textAlign="center"
              mb={2}
              fontWeight={"bold"}
            >
              주문 번호 {orderInfo.orderNumber}번
            </Typography> */}

            <Divider sx={{ mb: 2 }} />

            {/* 주문 정보 섹션 */}
            <Typography variant="subtitle2" gutterBottom>
              주문 정보
            </Typography>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography color="text.secondary" onClick={() => ""}>
                카페명
              </Typography>
              <Typography>{orderInfo.store.storeName}</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography color="text.secondary">주문 번호</Typography>
              <Typography>{orderInfo.orderNumber}</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography color="text.secondary">구독권명</Typography>
              <Typography>
                {handleSubscriptionType(
                  orderInfo.subscription.subscriptionType
                )}
              </Typography>
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography color="text.secondary">주문 일시</Typography>
              <Typography>
                {new Date(orderInfo.createdAt).toLocaleString()}
              </Typography>
            </Box>
            {orderInfo.orderStatus === "CANCELED" && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography color="text.secondary">취소 일시</Typography>
                <Typography>
                  {new Date(orderInfo.canceledAt).toLocaleString()}
                </Typography>
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* 주문 메뉴 섹션 */}
            <Typography variant="subtitle2" gutterBottom>
              주문 메뉴
            </Typography>

            {orderInfo.menuList.map((m) => (
              <Box
                key={m.menuId}
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography>{m.menuName}</Typography>
                <Typography>{m.quantity} 개</Typography>
              </Box>
            ))}

            <Box sx={{ mt: 3, textAlign: "right" }}>
              <Chip
                onClick={() => setOpenCancel(!openCancel)}
                label={
                  orderInfo.orderStatus === "CANCELED"
                    ? "주문 취소 완료"
                    : "주문 취소"
                }
                disabled={orderInfo.orderStatus !== "REQUEST"}
                style={{
                  width: "fit-content",
                  backgroundColor: "black",
                  color: "white",
                }}
              />
            </Box>
          </Box>
          <Box
            sx={{
              mt: 4,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/me/order")}
              sx={{ minWidth: 180 }}
            >
              주문 내역 보기
            </Button>
            <Button
              variant="contained"
              onClick={handleGoHome}
              sx={{
                minWidth: 180,
                bgcolor: "black",
                "&:hover": { bgcolor: "#222" },
              }}
            >
              홈으로 가기
            </Button>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
          <Typography color="text.secondary">
            주문 내역을 불러오는 중입니다...
          </Typography>
        </Box>
      )}

      <OrderCheckModal
        open={openCancel}
        setOpen={setOpenCancel}
        setIsCancel={handleCancelOrder}
      />
    </Box>
  );
}

export default CompleteOrderPage;

{
  /*  */
}
