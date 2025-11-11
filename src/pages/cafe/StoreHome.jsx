import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material';
import api, { TokenService } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import OrderDetailModal from './OrderDetailModal';
import useUserStore from '../../stores/useUserStore';
import useNotificationStore from '../../stores/useNotificationStore';

// 상태 변경 확인을 위한 다이얼로그 컴포넌트
const ConfirmDialog = ({ open, onClose, onConfirm, title, content }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onConfirm}
          color="primary"
          variant="contained"
          autoFocus
        >
          확인
        </Button>
        <Button onClick={onClose} color="primary">
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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
  const partnerStoreId = useUserStore((state) => state.partnerStoreId);
  const setRefreshOrderList = useNotificationStore(
    (state) => state.setRefreshOrderList
  );
  // 주문 조회를 실시간 알림이 오면, 리렌더링 되게 만드는 상태변수

  const [orders, setOrders] = useState([]);

  // 상태 변경 확인 - 팝업 관리용 상태
  const [confirmState, setConfirmState] = useState({
    open: false,
    orderId: null,
    nextStatus: null,
    title: '',
    content: '',
  });

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
  const fetchOrders = async () => {
    try {
      // 백엔드 ID가 Long 타입(>0)이므로, 0이나 null을 거르는 것이 안전합니다.
      if (!partnerStoreId || partnerStoreId <= 0) {
        console.log(
          '⚠️ partnerStoreId가 유효하지 않아 주문 로딩을 건너뜁니다:',
          partnerStoreId
        );
        return;
      }

      const response = await api.get(`/stores/orders/today/${partnerStoreId}`);

      // 백엔드 응답 구조에 맞게 resposne.data.data
      if (response.data && response.data.data) {
        setOrders(response.data.data);
        console.log(
          '✅ GET 성공, 주문 조회 데이터 로드 완료:',
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

  // 컴포넌트 마운트 시 최초 로딩
  useEffect(() => {
    fetchOrders();

    setRefreshOrderList(fetchOrders);
    // 갱신 함수를 Zustand 스토어에 등록??

    // 컴포넌트 언마운트 시 등록된 함수 해제
    return () => {
      setRefreshOrderList(null);
    };
  }, [partnerStoreId, setRefreshOrderList]);

  // ⭐️ 주문 거부 로직 : 주문 거부 API를 호출하고 상태를 업데이트하는 함수
  // 거절 사유 코드(rejectReasonCode)를 추가로 받는다.
  const handleModalOrderReject = async (orderId, rejectedReasonText) => {
    try {
      // nextStatus는 'REJECTED'

      // 백엔드 요청
      const response = await api.patch(`/stores/orders/reject/${orderId}`, {
        rejectedReason: rejectedReasonText,
      });

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
      }
    } catch (error) {
      console.error(`주문 거부 API 호출 오류:`, error);
      alert(`주문 거부 처리중 오류가 발생했습니다.`);
    }
  };

  // 팝업을 띄우는 함수
  const handleConfirmOpen = (orderId, currentStatus, orderNumber) => {
    const actionDetails = getNextActionAndState(currentStatus);
    if (!actionDetails) return; // 버튼 없는 상태(픽업완료 RECEIVED, 거부 REJECTED)는 팝업 띄울 필요 없음

    // 팝업 메시지
    let newTitle = '';
    let newContent = '';

    switch (actionDetails.nextStatus) {
      case 'INPROGRESS':
        newTitle = '주문 접수 확인';
        newContent = `주문번호 #${orderNumber}를 접수하시고, 제조를 시작하시겠습니까?`;
        break;
      case 'COMPLETED':
        newTitle = '제조 완료 알림 확인';
        newContent = `주문번호 #${orderNumber}의 제조가 완료되었습니다.`;
        break;
      case 'RECEIVED':
        newTitle = '수령 완료 처리 확인';
        newContent = `주문번호 #${orderNumber}을 고객에게 전달했습니다. 수령 완료 처리하고 주문을 마감하시겠습니까?`;
        break;
      default:
        newTitle = actionDetails.title; // 기본값
        newContent = `주문 번호 #${orderNumber}의 상태를 ${actionDetails.label}(으)로 변경하시겠습니까?`;
        break;
    }

    setConfirmState({
      open: true,
      orderId: orderId,
      nextStatus: actionDetails.nextStatus,
      title: newTitle,
      content: newContent,
    });
  };

  // 팝업 닫기 함수
  const handleConfirmClose = () => {
    setConfirmState({
      open: false,
      orderId: null,
      nextStatus: null,
      title: '',
      content: '',
    });
  };

  // ⭐️버튼 클릭 시 orders 상태를 실제로 업데이트 하는 함수
  const handleStatusChange = async () => {
    // 팝업 닫고,
    handleConfirmClose();

    const { orderId, nextStatus } = confirmState;

    if (!orderId || !nextStatus) return;

    try {
      // 백엔드 요청
      const response = await api.patch(`/stores/orders/${orderId}`, {
        orderStatus: nextStatus,
      });

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
      <Typography variant="h5" gutterBottom sx={{ color: '#334336' }}>
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

          if (
            ['REQUEST', 'INPROGRESS', 'COMPLETED'].includes(order.orderStatus)
          ) {
            return (
              <Grid item xs={12} sm={6} md={4} key={order.orderId}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '16px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    transform: 'translateY(0)',
                    '&:hover': {
                      backgroundColor: '#f9fafb',
                      transform: 'translateY(-4px) scale(1.02)', // 살짝 떠오름
                      boxShadow: '0 6px 14px rgba(0,0,0,0.08)', // 부드러운 그림자 강조
                    },
                  }}
                  onClick={() => handleModalOpen(order)}
                >
                  <Box sx={{ p: 2.5 }}>
                    {/* 상태 라벨 */}
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: statusInfo.header || '#0064FF',
                        color: '#fff',
                        fontWeight: 600,
                        px: 1.2,
                        py: 0.3,
                        borderRadius: '8px',
                        mb: 1.5,
                        display: 'inline-block',
                        fontSize: '0.75rem',
                      }}
                    >
                      {statusInfo.name}
                    </Typography>

                    {/* 주문 번호 + 타입 */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: '#1e1e1e',
                        }}
                      >
                        #{order.orderNumber}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                        }}
                      >
                        {getOrderTypeLabel(order.orderType)}
                      </Typography>
                    </Box>

                    {/* 메뉴 목록 */}
                    <Typography
                      sx={{
                        fontSize: '0.9rem',
                        color: '#374151',
                        mb: 0.5,
                      }}
                    >
                      {formattedMenuString}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: '#9ca3af', fontSize: '0.8rem' }}
                    >
                      {new Date(order.createdAt).toLocaleString()}
                    </Typography>
                  </Box>

                  {/* 상태 변경 버튼 */}
                  {actionDetails && (
                    <Button
                      fullWidth
                      variant="contained"
                      disableElevation
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmOpen(
                          order.orderId,
                          order.orderStatus,
                          order.orderNumber
                        );
                      }}
                      sx={{
                        bgcolor: statusInfo.action || '#0064FF',
                        color: 'white',
                        borderRadius: '0 0 16px 16px',
                        py: 1.2,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: '#333',
                        },
                      }}
                    >
                      {actionDetails.label}
                    </Button>
                  )}
                </Card>
              </Grid>
            );
          }
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

      <ConfirmDialog
        open={confirmState.open}
        onClose={handleConfirmClose}
        onConfirm={handleStatusChange} // '확인' 버튼 누를 시 실제 API 호출 함수 실행
        title={confirmState.title}
        content={confirmState.content}
      />
    </div>
  );
}

export default StoreHome;
