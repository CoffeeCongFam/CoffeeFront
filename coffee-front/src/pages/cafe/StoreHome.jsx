import { Box, Button, Card, Grid, Typography } from '@mui/material';
import React, { useState } from 'react';
import OrderDetailModal from './OrderDetailModal';

function StoreHome() {
  // 가데이터
  const DUMMY_ORDERS = [
    {
      id: 1,
      type: '테이크아웃',
      status: 'REQUEST',
      menu: '핫 카페라떼(4)',
      time: '오전 09:11',
    },
    {
      id: 2,
      type: '매장이용',
      status: 'INPROGRESS',
      menu: '아이스 아메리카노(1)',
      time: '오전 09:10',
    },
    {
      id: 3,
      type: '매장이용',
      status: 'COMPLETED',
      menu: '아이스 아메리카노(1)',
      time: '오전 09:12',
    },
    {
      id: 4,
      type: '테이크아웃',
      status: 'RECEIVED',
      menu: '핫 아메리카노(3)',
      time: '오전 09:15',
    },
    {
      id: 5,
      type: '테이크아웃',
      status: 'CANCELED',
      menu: '아이스 라떼(2)',
      time: '오전 09:15',
    },
    {
      id: 6,
      type: '테이크아웃',
      status: 'REJECTED',
      menu: '오트라떼(12)',
      time: '오전 09:18',
    },
  ];

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
        order.id === orderId
          ? { ...order, status: nextStatus } // 해당 주문의 상태만 변경
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
    },
    // 🟢 낮은 우선순위 (픽업 대기)
    COMPLETED: {
      // 제조완료
      header: '#4CAF50', // 배경색 (초록)
      action: '#388E3C', // 버튼색 (진한 초록)
      name: '제조 완료',
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

  // Grid 시스템에서 전체 너비는 12 - 한 행에 3개 카드 넣으려면 각 카드에 md={4}
  return (
    <div sx={{ p: 3, flexGrow: 1 }}>
      <Typography variant="h5" gutterBottom>
        오늘의 주문 현황
      </Typography>

      {/* Grid Container : 전체 카드를 담는 컨테이너 */}
      <Grid container spacing={2}>
        {orders.map((order) => {
          const statusInfo =
            STATUS_COLORS[order.status] || STATUS_COLORS['CANCELED'];
          console.log(order.status);

          // 현재 상태에 따른 액션 정보 가져오기
          const actionDetails = getNextActionAndState(order.status);

          return (
            // Grid Item : 각 카드를 감싸는 아이템
            // xs = 12 : 가장 작은 화면에서는 한 줄에 1개 (12/12)
            // sm = 6 : 중간 화면(태블릿) 한 줄에 2개
            // md = 4 : 데스크톱 화면에서는 한 줄에 3개 (12/4)
            <Grid item xs={12} sm={6} md={4} key={order.id}>
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
                    <Typography>{order.type}</Typography>
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

                  <Typography>{order.menu}</Typography>

                  <Typography variant="body2" color="text.secondary">
                    {order.time}
                  </Typography>
                </Box>
                {/* 조건부 렌더링 : actionDetails가 있을 때만 버튼 표시? */}
                {actionDetails && (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() =>
                      handleStatusChange(order.id, actionDetails.nextStatus)
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
