import { Box, Button, Card, Grid, Typography } from '@mui/material';
import React, { useState } from 'react';
import OrderDetailModal from './OrderDetailModal';

const DUMMY_ORDERS = [
  // ----------------------------------------
  // 1. 요청 (REQUEST) - 접수 대기 중 (가장 최근 주문)
  // ----------------------------------------
  {
    orderNumber: 1009, // 화면에 크게 표시될 주문 번호 (카운터 역할)
    memberId: 156,
    orderId: 21,
    orderType: '테이크아웃',
    orderStatus: 'REQUEST', // 🚩 주문 접수 대기 중
    menuId: '2',
    menuName: '라떼',
    createdAt: '2025-10-31T04:25:00.000Z', // KST 13:25
    paymentType: '구독권 고정',
  },
  {
    orderNumber: 1008,
    memberId: 155,
    orderId: 20,
    orderType: '매장이용',
    orderStatus: 'REQUEST', // 🚩 주문 접수 대기 중
    menuId: '2',
    menuName: '라떼',
    createdAt: '2025-10-31T04:20:00.000Z', // KST 13:20
    paymentType: '구독권 고정',
  },

  // ----------------------------------------
  // 2. 제조 중 (INPROGRESS)
  // ----------------------------------------
  {
    orderNumber: 1007,
    memberId: 154,
    orderId: 19,
    orderType: '테이크아웃',
    orderStatus: 'INPROGRESS', // 🚩 제조 중
    menuId: '2',
    menuName: '라떼',
    createdAt: '2025-10-31T04:15:00.000Z', // KST 13:15
    paymentType: '구독권 고정',
  },
  {
    orderNumber: 1006,
    memberId: 153,
    orderId: 18,
    orderType: '매장이용',
    orderStatus: 'INPROGRESS', // 🚩 제조 중
    menuId: '2',
    menuName: '라떼',
    createdAt: '2025-10-31T04:10:00.000Z', // KST 13:10
    paymentType: '구독권 고정',
  },

  // ----------------------------------------
  // 3. 준비 완료 (READY)
  // ----------------------------------------
  {
    orderNumber: 1005,
    memberId: 152,
    orderId: 17,
    orderType: '테이크아웃',
    orderStatus: 'READY', // 🚩 준비 완료 (픽업 대기)
    menuId: '2',
    menuName: '라떼',
    createdAt: '2025-10-31T04:05:00.000Z', // KST 13:05
    paymentType: '구독권 고정',
  },
  {
    orderNumber: 1004,
    memberId: 151,
    orderId: 16,
    orderType: '매장이용',
    orderStatus: 'READY', // 🚩 준비 완료 (픽업 대기)
    menuId: '2',
    menuName: '라떼',
    createdAt: '2025-10-31T04:00:00.000Z', // KST 13:00
    paymentType: '구독권 고정',
  },

  // ----------------------------------------
  // 4. 취소/거부 (CANCELED, REJECTED)
  // ----------------------------------------
  {
    orderNumber: 1003,
    memberId: 150,
    orderId: 15,
    orderType: '테이크아웃',
    orderStatus: 'CANCELED', // 🚩 취소된 주문
    menuId: '1',
    menuName: '아메리카노',
    createdAt: '2025-10-31T03:55:00.000Z', // KST 12:55
    paymentType: '구독권 고정',
  },
  {
    orderNumber: 1002,
    memberId: 149,
    orderId: 14,
    orderType: '매장이용',
    orderStatus: 'REJECTED', // 🚩 거부된 주문
    menuId: '1',
    menuName: '아메리카노',
    createdAt: '2025-10-31T03:50:00.000Z', // KST 12:50
    paymentType: '구독권 고정',
  },

  // ----------------------------------------
  // 5. 완료 (COMPLETED)
  // ----------------------------------------
  {
    orderNumber: 1001,
    memberId: 148,
    orderId: 13,
    orderType: '테이크아웃',
    orderStatus: 'COMPLETED', // 🚩 완료된 주문
    menuId: '1',
    menuName: '아메리카노',
    createdAt: '2025-10-31T03:45:00.000Z', // KST 12:45
    paymentType: '구독권 고정',
  },
];

// order 데이터만 받고 그 안에 다 있으면 그것만 뿌려주고 prop 내려주면 되니까 편할건데?
function StoreHome() {
  const [orders, setOrders] = useState(DUMMY_ORDERS);

  // 모달 상태 정의
  const [modalState, setModalState] = useState({
    open: false,
    selectedOrder: null, // 선택된 order 객체 전체
  });

  // 상세 모달 닫기 함수
  const handleModalClose = () => {
    setModalState({ open: false, selectedOrder: null });
  };
  // 상세 모달 열기 함수
  const handleModalOpen = (order) => {
    setModalState({ open: true, selectedOrder: order });
  };

  // 모달에서 최종 '주문 거부'를 눌렀을 때 실행되는 함수
  const handleModalOrderReject = (orderId, nextStatus) => {
    handleStatusChange(orderId, nextStatus); // 상태 업데이트
    handleModalClose();
    console.log(`거절 처리 요청: ID ${orderId}, 다음 상태: ${nextStatus}`);
  };

  // 버튼 클릭 시 orders 상태를 실제로 업데이트 하는 함수
  const handleStatusChange = (orderId, nextStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.orderId === orderId
          ? { ...order, orderStatus: nextStatus } // 해당 주문의 상태만 변경
          : order
      )
    );
    // 실제 백엔드 API 호출 로직은 여기다 추가해야 함
    console.log(`주문 ID : ${orderId}를 ${nextStatus}로 변경 요청`);
  };

  // 현재 주문 상태를 기반으로 다음 수행 동작과 다음 상태를 결정하는 함수
  const getNextActionAndState = (currentStatus) => {
    switch (currentStatus) {
      case 'REQUEST':
        return {
          label: '주문 접수하기',
          nextStatus: 'INPROGRESS', // 접수 후 -> 제조중으로
          color: '#FF9800',
        };

      case 'INPROGRESS':
        return {
          label: '제조 완료',
          nextStatus: 'COMPLETED', // 제조중 -> 제조 완료
          color: '#1976D2',
        };

      case 'COMPLETED':
        // 제조 완료 상태에는 고객이 오고, 고객의 주문 번호만 확인하고 건네준다.
        // 따라서 수령 완료 버튼을 표시하고 수령 완료로 처리하려면 점주만 '수령 완료 처리' 버튼을 누르게 정의
        return {
          label: '수령 완료 처리',
          nextStatus: 'RECEIVED', // 제조 완료 -> 수령 완료
          color: '#388E3C',
        };

      default:
        return null; // REJECTED, CANCELED, RECEIVED는 버튼이 없다.
    }
  };

  // 주문 상태별 색상 정의
  const STATUS_COLORS = {
    // 🔴 높은 우선순위 (급함)
    REQUEST: {
      // 접수중
      header: '#FFC107', // 배경색 (밝게)
      action: '#FF9800', // 버튼색 (주황 계열)
      name: '접수중',
      priority: 1, // 가장 앞
    },
    REJECTED: {
      // 주문 거부(점주가)
      header: '#F44336', // 배경색 (경고/빨강)
      action: '#D32F2F', // 버튼색 (빨강 계열)
      name: '주문 거부',
    },
    // 🟠 중간 우선순위 (진행 중)
    INPROGRESS: {
      // 제조중
      header: '#2196F3', // 배경색 (파랑)
      action: '#1976D2', // 버튼색 (진한 파랑)
      name: '제조중',
      priority: 2,
    },
    // 🟢 낮은 우선순위 (픽업 대기)
    COMPLETED: {
      // 제조완료
      header: '#4CAF50', // 배경색 (초록)
      action: '#388E3C', // 버튼색 (진한 초록)
      name: '제조 완료',
      priority: 3,
    },
    // ⚫️ 매우 낮은 우선순위 (종료/처리 완료)
    RECEIVED: {
      // 수령완료
      header: '#616161', // 배경색 (짙은 회색)
      action: '#424242', // 버튼색 (아주 짙은 회색)
      name: '수령 완료',
    },
    CANCELED: {
      // 주문 취소(고객이)
      header: '#9E9E9E', // 배경색 (차분한 회색)
      action: '#757575', // 버튼색 (중간 회색)
      name: '주문 취소',
    },
  };

  // 주문 상태와 주문 접수 시간에 따라 주문들을 sorting(오름차순)
  const sortedOrders = [...orders].sort((a, b) => {
    const priorityA = STATUS_COLORS[a.orderStatus]?.priority || 1000;
    // 1. STATUS_COLORS[a.status]가 존재하면 -> .priority 값을 가져오고,
    // 2. STATUS_COLORS[a.status]가 null 또는 undefined라면 -> *코드를 멈추지 않고 즉시 undefined를 반환
    const priorityB = STATUS_COLORS[b.orderStatus]?.priority || 1000;

    // 🚩 우선순위 값 확인
    console.log(`A 상태: ${a.orderStatus}, A 우선순위: ${priorityA}`);
    console.log(`B 상태: ${b.orderStatus}, B 우선순위: ${priorityB}`);

    // 1차 정렬 : 우선순위 비교(낮은 숫자일수록 앞으로)
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    // 2차 정렬 : 우선순위가 같을수록 주문 시간(createdAt)비교
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();

    return timeA - timeB;
  });

  // Grid 시스템에서 전체 너비는 12 - 한 행에 3개 카드 넣으려면 각 카드에 md={4}
  return (
    <div sx={{ p: 3, flexGrow: 1 }}>
      <Typography variant="h5" gutterBottom>
        오늘의 주문 현황
      </Typography>

      {/* Grid Container : 전체 카드를 담는 컨테이너 */}
      <Grid container spacing={2}>
        {sortedOrders.map((order) => {
          const statusInfo =
            STATUS_COLORS[order.orderStatus] || STATUS_COLORS['CANCELED'];
          console.log(order.orderStatus);

          // 현재 상태에 따른 액션 정보 가져오기
          const actionDetails = getNextActionAndState(order.orderStatus);

          return (
            // Grid Item : 각 카드를 감싸는 아이템
            // xs = 12 : 가장 작은 화면에서는 한 줄에 1개 (12/12)
            // sm = 6 : 중간 화면(태블릿) 한 줄에 2개
            // md = 4 : 데스크톱 화면에서는 한 줄에 3개 (12/4)
            <Grid item xs={12} sm={6} md={4} key={order.orderId}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <Box sx={{ p: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: statusInfo.header,
                      color: 'white',
                      p: '2px 8px',
                    }}
                  >
                    {statusInfo.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* 타입, 상세보기 버튼 */}
                    <Box sx={{ border: 1, padding: 1 }}>A01</Box>
                    <Typography>{order.orderType}</Typography>
                    <Box sx={{ mt: 1, textAlign: 'right' }}>
                      {/* 상세보기 버튼 */}
                      <Button
                        onClick={() => handleModalOpen(order)}
                        variant="outlined"
                        size="small"
                        color="primary"
                      >
                        상세 <br />
                        보기
                      </Button>
                    </Box>
                  </Box>

                  <Typography>{order.menuName}</Typography>

                  <Typography variant="body2" color="text.secondary">
                    {new Date(order.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                {/* 조건부 렌더링 : actionDetails가 있을 때만 버튼 표시? */}
                {actionDetails && (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() =>
                      handleStatusChange(
                        order.orderId,
                        actionDetails.nextStatus
                      )
                    }
                    sx={{ bgcolor: statusInfo.action, color: 'white' }}
                  >
                    {actionDetails.label}
                  </Button>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* 상세 모달 렌더링 및 로직 연결 - props 주는 식으로 */}
      <OrderDetailModal
        open={modalState.open}
        onClose={handleModalClose}
        order={modalState.selectedOrder}
        statusColors={STATUS_COLORS}
        onReject={handleModalOrderReject}
      />
    </div>
  );
}

export default StoreHome;
