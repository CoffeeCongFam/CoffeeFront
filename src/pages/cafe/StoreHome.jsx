import { Box, Button, Card, Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OrderDetailModal from './OrderDetailModal';
import { ChevronLeft } from '@mui/icons-material';

const BASE_URL = 'http://localhost:8080';

const partnerStoreId = 1;

// export const DUMMY_TODAY_ORDERS_RESPONSE = {
//   success: true,
//   data: [
//     // ----------------------------------------
//     // 1. 요청 (REQUEST) - 접수 대기 중 (가장 최근 주문)
//     // ----------------------------------------
//     {
//       orderId: 21,
//       memberSubscriptionId: 1,
//       dailyRemainCount: 1, // 일 잔여 횟수
//       orderType: 'OUT', // 테이크아웃
//       orderStatus: 'REQUEST',
//       rejectedReason: null,
//       orderNumber: 1009,
//       createdAt: '2025-10-31T04:25:00.000Z',
//       tel: '010-1234-5678',
//       name: '홍길동',
//       menuList: [
//         { menuId: 21, quantity: 2, menuName: '카페라떼', price: 9000 },
//         { menuId: 32, quantity: 1, menuName: '브라우니', price: 4000 },
//       ],
//     },
//     // ----------------------------------------
//     // 2. 제조 중 (INPROGRESS)
//     // ----------------------------------------
//     {
//       orderId: 19,
//       memberSubscriptionId: 1,
//       dailyRemainCount: 1, // 일 잔여 횟수
//       orderType: 'IN', // 매장이용
//       orderStatus: 'INPROGRESS',
//       rejectedReason: null,
//       orderNumber: 1007,
//       createdAt: '2025-10-31T04:15:00.000Z',
//       tel: '010-5555-4444',
//       name: '김철수',
//       menuList: [
//         { menuId: 1, quantity: 1, menuName: '아메리카노', price: 3500 },
//       ],
//     },
//     // ----------------------------------------
//     // 3. 완료 (COMPLETED) - 픽업 대기 중
//     // ----------------------------------------
//     {
//       orderId: 17,
//       memberSubscriptionId: 2,
//       dailyRemainCount: 2, // 일 잔여 횟수
//       orderType: 'OUT',
//       orderStatus: 'COMPLETED',
//       rejectedReason: null,
//       orderNumber: 1005,
//       createdAt: '2025-10-31T04:05:00.000Z',
//       tel: '010-8888-7777',
//       name: '박영희',
//       menuList: [
//         { menuId: 21, quantity: 1, menuName: '바닐라 라떼', price: 5000 },
//         { menuId: 41, quantity: 1, menuName: '딸기 케이크', price: 6000 },
//       ],
//     },
//   ],
//   message: '요청이 성공적으로 처리되었습니다.',
// };

const getOrderTypeLabel = (typeCode) => {
  switch (typeCode) {
    case 'IN':
      return '매장 내 이용';
    case 'OUT':
      return '테이크아웃';
    default:
      return '정보 없음';
  }
};

const getFormattedMenuList = (menuList) => {
  if (!menuList || menuList.length === 0) return '메뉴 없음';

  // 메뉴 이름과 수량을 조합하여 문자열 배열 생성: ['아메리카노 (2개)', '브라우니 (1개)']
  const formattedItems = menuList.map((menu) => {
    return `${menu.menuName} (${menu.quantity}개)`;
  });

  // 쉼표와 공백으로 연결
  return formattedItems.join(', ');
};

// order 데이터만 받고 그 안에 다 있으면 그것만 뿌려주고 prop 내려주면 되니까 편할건데?
function StoreHome() {
  const [orders, setOrders] = useState([]);

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

  // 오늘의 주문 목록 조회 GET
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/stores/orders/today/${partnerStoreId}`
          // 하드코딩 partnerStoreId 테스트용**
        );

        // 백엔드 응답 구조에 맞게 resposne.data.data
        if (response.data && response.data.data) {
          setOrders(response.data.data);
          console.log(
            '✅ GET 성공, 데이터 로드 완료:',
            response.data.data.length,
            '개'
          );
        } else {
          setOrders(response.data.data || []);
          console.log('✅ GET 성공, 하지만 반환된 주문 데이터가 없습니다.');
        }
      } catch (error) {
        console.error('오늘의 주문 목록 로딩 실패:', error);
      }
    };
    fetchOrders();
  }, []);

  // ⭐️ 주문 거부 로직 : 주문 거부 API를 호출하고 상태를 업데이트하는 함수
  // 거절 사유 코드(rejectReasonCode)를 추가로 받는다.
  const handleModalOrderReject = async (
    orderId,
    nextStatus,
    rejectedReasonText
  ) => {
    try {
      // nextStatus는 'REJECTED'

      // 백엔드 요청
      const response = await axios.patch(
        `${BASE_URL}/api/stores/orders/reject/${orderId}`,
        {
          rejectedReason: rejectedReasonText,
        }
      );

      // 성공 시 FE 상태 업데이트
      if (response.status === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? {
                  ...order,
                  orderStatus: 'REJECTED',
                  rejectedReason: rejectedReasonText,
                }
              : order
          )
        );
        console.log(
          `주문 ID ${orderId} 거절 처리 완료 (사유 : ${rejectedReasonText})`
        );
        handleModalClose();
      }
    } catch (error) {
      console.error(`주문 거부 API 호출 오류:`, error);
      alert(`주문 거부 처리중 오류가 발생했습니다.`);
    }
  };

  // ⭐️버튼 클릭 시 orders 상태를 실제로 업데이트 하는 함수
  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      // 백엔드 요청
      const response = await axios.patch(
        `${BASE_URL}/api/stores/orders/${orderId}`,
        {
          orderStatus: nextStatus,
        }
      );

      // 성공 시 FE 상태 업데이트
      if (response.status === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            if (order.orderId === orderId) {
              return {
                ...order,
                orderStatus: nextStatus,
                dailyRemainCount: Math.max(0, order.dailyRemainCount - 1),
              };
            }
            return order;
          })
        );
        console.log(`주문 ID ${orderId} 상태가 ${nextStatus}로 변경완료`);
      }
    } catch (error) {
      console.error(`주문 상태 변경 API 호출 오류 :`, error);
      alert(`주문 상태 변경에 실패했습니다.`);
    }
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

          // 포맷된 메뉴 목록 문자열
          const formattedMenuString = getFormattedMenuList(order.menuList);

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
                    <Box sx={{ border: 1, padding: 1 }}>
                      {order.orderNumber}
                    </Box>
                    <Typography>
                      {getOrderTypeLabel(order.orderType)}
                    </Typography>
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
                  <Typography>{formattedMenuString}</Typography>
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
      {modalState.selectedOrder && (
        <OrderDetailModal
          open={modalState.open}
          onClose={handleModalClose}
          order={modalState.selectedOrder}
          statusColors={STATUS_COLORS}
          onReject={handleModalOrderReject}
        />
      )}
    </div>
  );
}

export default StoreHome;
