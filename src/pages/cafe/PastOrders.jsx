import React, { useMemo, useState } from 'react';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  TextField,
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

const DUMMY_PAST_ORDERS = [
  // 오늘 날짜로 가정 (2025-10-30) - 최종 상태만 남김
  {
    orderNumber: 4541,
    memberId: 101,
    orderId: 12,
    orderType: '테이크아웃',
    orderStatus: 'CANCELED',
    menuId: '1',
    menuName: '아메리카노',
    createdAt: '2025-10-30T07:15:00.000Z',
    paymentType: '구독권 고정',
  },
  {
    orderNumber: 4457,
    memberId: 102,
    orderId: 11,
    orderType: '매장이용',
    orderStatus: 'COMPLETED',
    menuId: '2',
    menuName: '라떼',
    createdAt: '2025-10-30T06:30:00.000Z',
    paymentType: '구독권 고정',
  },
  // 어제 (2025-10-29)
  {
    orderNumber: 4114,
    memberId: 103,
    orderId: 10,
    orderType: '테이크아웃',
    orderStatus: 'COMPLETED',
    menuId: '2',
    menuName: '라떼',
    createdAt: '2025-10-29T08:20:00.000Z',
    paymentType: '구독권 고정',
  },
  {
    orderNumber: 2514,
    memberId: 104,
    orderId: 9,
    orderType: '매장이용',
    orderStatus: 'CANCELED',
    menuId: '1',
    menuName: '아메리카노',
    createdAt: '2025-10-29T07:10:00.000Z',
    paymentType: '구독권 고정',
  },
  // 그제 (2025-10-28)
  {
    orderNumber: 9114,
    memberId: 105,
    orderId: 8,
    orderType: '테이크아웃',
    orderStatus: 'REJECTED',
    menuId: '2',
    menuName: '라떼',
    createdAt: '2025-10-28T09:40:00.000Z',
    paymentType: '구독권 고정',
  },
  {
    orderNumber: 5814,
    memberId: 106,
    orderId: 7,
    orderType: '테이크아웃',
    orderStatus: 'COMPLETED',
    menuId: '1',
    menuName: '아메리카노',
    createdAt: '2025-10-28T05:40:00.000Z',
    paymentType: '구독권 고정',
  },
  // 기타 지난 주문들
  {
    orderNumber: 8714,
    memberId: 107,
    orderId: 6,
    orderType: '매장이용',
    orderStatus: 'COMPLETED',
    menuId: '1',
    menuName: '아메리카노',
    createdAt: '2025-09-30T04:00:00.000Z',
    paymentType: '구독권 고정',
  },
  {
    orderNumber: 6914,
    memberId: 108,
    orderId: 5,
    orderType: '테이크아웃',
    orderStatus: 'COMPLETED',
    menuId: '1',
    menuName: '아메리카노',
    createdAt: '2025-09-30T05:00:00.000Z',
    paymentType: '구독권 고정',
  },
  {
    orderNumber: 5254,
    memberId: 109,
    orderId: 4,
    orderType: '테이크아웃',
    orderStatus: 'COMPLETED',
    menuId: '1',
    menuName: '아메리카노',
    createdAt: '2025-08-30T02:00:00.000Z',
    paymentType: '구독권 고정',
  },
  {
    orderNumber: 8114,
    memberId: 110,
    orderId: 3,
    orderType: '매장이용',
    orderStatus: 'COMPLETED',
    menuId: '1',
    menuName: '아메리카노',
    createdAt: '2025-08-30T03:00:00.000Z',
    paymentType: '구독권 고정',
  },
  {
    orderNumber: 1114,
    memberId: 111,
    orderId: 2,
    orderType: '테이크아웃',
    orderStatus: 'COMPLETED',
    menuId: '1',
    menuName: '아메리카노',
    createdAt: '2025-07-30T01:00:00.000Z',
    paymentType: '구독권 고정',
  },
  {
    orderNumber: 4454,
    memberId: 112,
    orderId: 1,
    orderType: '매장이용',
    orderStatus: 'COMPLETED',
    menuId: '1',
    menuName: '아메리카노',
    createdAt: '2025-07-30T02:00:00.000Z',
    paymentType: '구독권 고정',
  },
];

const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    error: {
      main: '#d32f2f',
    },
    success: {
      main: '#388e3c',
    },
  },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: 'auto',
  marginTop: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
}));

// 주문 상태를 사용자 친화적 한글 변환 및 색상 지정
const getStatusProps = (orderStatus) => {
  switch (orderStatus) {
    case 'COMPLETED':
      return { label: '수령 완료', color: theme.palette.success.main };
    case 'CANCELED':
      return { label: '주문 취소', color: theme.palette.error.main };
    case 'REJECTED':
      return { label: '주문 거부', color: theme.palette.error.main };
    default:
      return { label: '알 수 없음', color: theme.palette.text.secondary };
  }
};

// ISO 시간 문자열을 KST HH:MM 형식으로 변환
const formatTimeKST = (isoString) => {
  const date = new Date(isoString);
  // UTC 시간을 기준으로 9시간을 더하여 KST 시간
  const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

  const hours = kstDate.getUTCHours().toString().padStart(2, '0');
  const minutes = kstDate.getUTCMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
};

// 메인 컴포넌트
export default function PastOrdersList() {
  // 더미 데이터에 포함된 날짜 중 하나를 기본값으로 설정
  const defaultDate = '2025-10-29';
  const [selectedDate, setSelectedDate] = useState(defaultDate);

  // 날짜 입력 변경 핸들러
  const handleDateChange = (e) => {
    // 오타 수정: e.target.value
    setSelectedDate(e.target.value);
  };

  // 선택된 날짜에 따라 주문 내역을 필터링 및 정렬
  const filteredOrders = useMemo(() => {
    if (!selectedDate) return [];

    return (
      DUMMY_PAST_ORDERS.filter((order) =>
        // ISO 문자열의 시작(YYYY-MM-DD)이 선택된 날짜와 일치하는지 확인
        order.createdAt.startsWith(selectedDate)
      )
        // 시간 역순으로 정확히 정렬합니다.
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    );
  }, [selectedDate]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          padding: 2,
        }}
      >
        <StyledPaper elevation={8}>
          {/* 제목 및 날짜 필터 영역 */}
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            mb={4}
            gap={2}
          >
            <Typography variant="h5" component="h1" fontWeight="bold">
              지난 주문 내역 ({selectedDate.replace(/-/g, '.')})
            </Typography>

            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1" color="text.secondary">
                날짜 선택:
              </Typography>
              {/* MUI TextField를 사용하여 Date Picker 기능 구현 */}
              <TextField
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                size="small"
                sx={{ width: { xs: '100%', sm: 180 } }}
              />
            </Box>
          </Box>

          {/* 주문 리스트 테이블 */}
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 650 }} aria-label="지난 주문 내역 테이블">
              <TableHead sx={{ backgroundColor: '#f8f8f8' }}>
                <TableRow>
                  {[
                    '주문 번호',
                    '유형',
                    '상태',
                    '시간',
                    '주문 메뉴',
                    '결제 방식',
                    '회원 ID',
                  ].map((header) => (
                    <TableCell
                      key={header}
                      align="center"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        color: theme.palette.text.primary,
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const statusProps = getStatusProps(order.orderStatus);
                    return (
                      <TableRow
                        key={order.orderId}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell align="center">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell align="center">{order.orderType}</TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            color: statusProps.color,
                            fontWeight: 'medium',
                          }}
                        > 
                          {statusProps.label}
                        </TableCell>
                        <TableCell align="center">
                          {formatTimeKST(order.createdAt)}
                        </TableCell>
                        <TableCell align="center">{order.menuName}</TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {order.paymentType}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {order.memberId}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 4, color: theme.palette.text.disabled }}
                    >
                      선택한 날짜에 주문 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </StyledPaper>
      </Box>
    </ThemeProvider>
  );
}
