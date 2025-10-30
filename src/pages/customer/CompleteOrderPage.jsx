import { Box, Typography, Divider, Chip, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React, { useEffect, useState } from "react";
import OrderStepper from "../../components/customer/order/OrderStepper";
import OrderCheckModal from "../../components/customer/order/OrderCancleCheckModal";
import { useNavigate, useParams } from "react-router-dom";

function orderStatusMessage(status) {
  switch (status) {
    case "REQUEST":
      return "주문을 접수하고 있어요.";
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

function CompleteOrderPage() {
  const { orderId } = useParams();

  const navigate = useNavigate();

  const [orderInfo, setOrderInfo] = useState(null);

  const [openCancel, setOpenCancel] = React.useState(false); // 주문 취소 확인 모달

  const [isCancel, setIsCancel] = useState(false);

  useEffect(() => {
    if (isCancel === true) {
      // 주문 취소 요청
      // const payload = {};
      handleCancelOrder(orderId);
      console.log(orderId + "번 주문 취소 요청 성공");
    }
  }, [isCancel]);

  async function handleCancelOrder(orderId) {
    try {
      // await api.post(`/api/orders/${orderId}/cancel`);
      const now = new Date();
      setOrderInfo((prev) => ({
        ...prev,
        orderStatus: "CANCELED",
        canceledAt: now.toISOString(),
      }));
      setIsCancel(true);
    } catch (e) {
      console.error(e);
    }
  }

  // 주문 정보 초기화
  useEffect(() => {
    // TODO: orderId 로 조회
    setOrderInfo({
      orderId: 500,
      orderStatus: "REQUEST",
      store: {
        storeId: 1,
        storeName: "카페 모나카",
      },
      subscription: {
        subId: 1,
        subName: "스탠다드",
      },
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
      createdAt: "2025-10-26T13:28:00Z",
      canceledAt: null,
    });
  }, [orderId]);

  if (!orderInfo) return null;

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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => handleBack()} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* 상단 상태 메시지 */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="h6">
          {orderStatusMessage(orderInfo.orderStatus)}
        </Typography>
      </Box>

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
        <Typography variant="h6" textAlign="center" mb={2}>
          주문 번호 {orderInfo.orderId}번
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* 주문 정보 섹션 */}
        <Typography variant="subtitle2" gutterBottom>
          주문 정보
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography color="text.secondary">카페명</Typography>
          <Typography>{orderInfo.store.storeName}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography color="text.secondary">주문 번호</Typography>
          <Typography>{orderInfo.orderId}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography color="text.secondary">구독권명</Typography>
          <Typography>{orderInfo.subscription.subName}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography color="text.secondary">결제 금액</Typography>
          <Typography>{orderInfo.payAmount?.toLocaleString()} 원</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography color="text.secondary">주문 일시</Typography>
          <Typography>
            {new Date(orderInfo.createdAt).toLocaleString()}
          </Typography>
        </Box>
        {orderInfo.orderStatus === "CANCELED" && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
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

      <OrderCheckModal
        open={openCancel}
        setOpen={setOpenCancel}
        setIsCancel={setIsCancel}
      />
    </Box>
  );
}

export default CompleteOrderPage;

{
  /*  */
}
