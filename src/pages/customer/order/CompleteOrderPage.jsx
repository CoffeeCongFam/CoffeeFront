import {
  Box,
  Typography,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React, { useEffect, useState } from "react";
import OrderStepper from "../../../components/customer/order/OrderStepper";
import OrderCheckModal from "../../../components/customer/order/OrderCancleCheckModal";
import { useNavigate, useParams } from "react-router-dom";
import useAppShellMode from "../../../hooks/useAppShellMode";
import api from "../../../utils/api";

import {
  fetchOrderDetail,
  requestCancelOrder,
} from "../../../apis/customerApi";

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
  const [openCancel, setOpenCancel] = React.useState(false); // 주문 취소 확인 모달
  const [isCancel, setIsCancel] = useState(false);

  // 주문 정보 초기화
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await fetchOrderDetail(orderId);
        if (!mounted) return;

        if (data) {
          setOrderInfo(data);
        } else {
          // 서버가 null 주면 더미라도 넣기
          setOrderInfo(makeDummy(orderId));
        }
      } catch (err) {
        console.error(err);
        setOrderInfo(makeDummy(orderId));
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  // dummy 데이터로 초기화
  function makeDummy(orderId) {
    return {
      orderId,
      orderNumber: 4277,
      orderStatus: "REQUEST",
      store: { storeId: 1, storeName: "카페 모나카" },
      subscription: { subscriptionId: 1, subscriptionType: "BASIC" },
      menuList: [
        {
          menuId: 1,
          menuName: "아메리카노",
          menuType: "BEVERAGE",
          quantity: 1,
        },
      ],
      totalQuantity: 1,
      payAmount: 0,
      createdAt: new Date().toISOString(),
      canceledAt: null,
    };
  }

  // 주문 취소
  async function handleCancelOrder() {
    try {
      const res = await requestCancelOrder(orderId);
      if (res !== null) {
        setOrderInfo((prev) => ({
          ...prev,
          orderStatus: "CANCELED",
          canceledAt: new Date().toISOString(),
        }));
        console.log(`✅ ${orderId}번 주문 취소 성공`);
      } else {
        alert("주문 취소에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (e) {
      console.error("❌ 주문 취소 오류:", e);
      alert("서버와의 통신 중 오류가 발생했습니다.");
    } finally {
      console.error("✅ ${orderId}번 주문 취소 성공");
      setOpenCancel(false);
      navigate("/me/order");
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
      navigate("/me/order");
    }
  }

  return (
    <Box sx={{ px: isAppLike ? 3 : 30, py: 3, pb: 10 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton onClick={() => handleBack()} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* 상단 상태 메시지 */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          {isLoading
            ? "주문 내역 불러오는 중..."
            : orderStatusMessage(orderInfo.orderStatus)}
        </Typography>
      </Box>
      {!isLoading ? (
        <>
          {/* 스텝퍼 */}
          <OrderStepper orderStatus={orderInfo.orderStatus} />

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
            <Typography
              variant="h6"
              textAlign="center"
              mb={2}
              fontWeight={"bold"}
            >
              주문 번호 {orderInfo.orderNumber}번
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* 주문 정보 섹션 */}
            <Typography variant="subtitle2" gutterBottom>
              주문 정보
            </Typography>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography color="text.secondary">카페명</Typography>
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
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography color="text.secondary">결제 금액</Typography>
              <Typography>
                {orderInfo.payAmount?.toLocaleString()} 원
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
                <Typography>{m.quantity} 잔</Typography>
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
