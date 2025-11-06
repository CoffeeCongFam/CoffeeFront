import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import axios from 'axios';

// 🚨 [필수 설정] 점주 ID 설정
// 실제 애플리케이션에서는 로그인 정보에서 가져와야 함
// ==========================================================
const PARTNER_STORE_ID = 1; // 예시로 사용할 점주 매장 ID

// 현재 시점의 'YYYY-MM-DDTHH:MM:SS.msZ' 타임스탬프를 반환하도록
/**
 * 현재 날짜를 기준으로 지정된 일/월 오프셋을 적용한 'YYYY-MM-DD' 형식의 문자열을 반환합니다.
 * @param {number} days - 날짜 오프셋 (예: -1은 어제, 0은 오늘)
 * @param {number} months - 월 오프셋 (예: -1은 한 달 전)
 * @returns {string} 예: '2025-11-02'
 */
const getOffsetDateString = (days, months) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0); // 시간을 정오로 고정하여 DST 문제 회피

  // 월 오프셋 적용 (연도 변경도 자동으로 처리됨)
  if (months) {
    date.setMonth(date.getMonth() + months);
  }
  // 날짜 오프셋 적용 (월 변경도 자동으로 처리됨)
  if (days) {
    date.setDate(date.getDate() + days);
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TODAY_DATE = getOffsetDateString(0, 0); // 오늘
const YESTERDAY_DATE = getOffsetDateString(-1, 0); // 어제
const DAY_BEFORE_YESTERDAY_DATE = getOffsetDateString(-2, 0); // 그제
const ONE_MONTH_AGO_DATE = getOffsetDateString(0, -1); // 한 달 전
const TWO_MONTHS_AGO_DATE = getOffsetDateString(0, -2); // 두 달 전

// ⭐️한국 시간(KST)으로 00:00~09:00 사이에 생성된 주문은 UTC 기준으로는 전날로 기록될
// DAILY_CUTOFF_HOUR_KST는 9로 유지 (KST 9시를 하루의 시작점으로 설정)
const DAILY_CUTOFF_HOUR_KST = 9;

// KST 주문 마감 시간을 정의합니다.
const DAILY_CLOSING_HOUR_KST = 22; // KST 22시 (오후 10시)

/**
 * ISO 8601 UTC 문자열을 KST 영업일 기준의 'YYYY-MM-DD' 날짜 문자열로 변환합니다.
 * ⭐️KST 09:00를 하루의 시작 시간으로 간주합니다.
 * ...
 */
const getKstBusinessDateStringFromUtc = (utcDateString) => {
  const date = new Date(utcDateString);
  const kstTime = date.getTime() + 9 * 60 * 60 * 1000;
  const businessDayAdjustedTime =
    kstTime - DAILY_CUTOFF_HOUR_KST * 60 * 60 * 1000;
  const businessDayDate = new Date(businessDayAdjustedTime);

  const year = businessDayDate.getUTCFullYear();
  const month = (businessDayDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = businessDayDate.getUTCDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// export const DUMMY_PAST_ORDERS_RESPONSE = {
//   success: true,
//   data: [
//     // ==========================================================
//     // 1. 오늘 주문 (2025-11-02 KST) - 3개
//     // ==========================================================
//     {
//       orderId: 101,
//       orderNumber: 7123,
//       // KST 15:30:00 -> UTC 06:30:00Z
//       createdAt: '2025-11-02T06:30:00.000Z',
//       orderStatus: 'COMPLETED',
//       memberSubscriptionId: 1,
//       subscriptionName: '카페 모니카 BASIC 구독권',
//       orderType: 'IN', // 매장 이용
//       tel: '010-1111-2222',
//       name: '홍길동',
//       menuList: [{ menuId: 1, quantity: 2, menuName: '아메리카노' }],
//     },
//     {
//       orderId: 102,
//       orderNumber: 7124,
//       // KST 12:05:00 -> UTC 03:05:00Z
//       createdAt: '2025-11-02T03:05:00.000Z',
//       orderStatus: 'CANCELED',
//       memberSubscriptionId: 2,
//       subscriptionName: '카페 모니카 PREMIUM 구독권',
//       orderType: 'OUT', // 테이크아웃
//       tel: '010-5555-4444',
//       name: '김철수',
//       menuList: [
//         { menuId: 21, quantity: 1, menuName: '카페라떼' },
//         { menuId: 32, quantity: 1, menuName: '브라우니' },
//       ],
//     },
//     {
//       orderId: 103,
//       orderNumber: 7125,
//       // KST 09:15:00 -> UTC 00:15:00Z
//       createdAt: '2025-11-02T00:15:00.000Z',
//       orderStatus: 'COMPLETED',
//       memberSubscriptionId: 3,
//       subscriptionName: '카페 모니카 DESSERT 구독권',
//       orderType: 'IN',
//       tel: '010-8888-7777',
//       name: '박영희',
//       menuList: [{ menuId: 10, quantity: 3, menuName: '에스프레소' }],
//     },

//     // ==========================================================
//     // 2. 어제 주문 (2025-11-01 KST) - 3개
//     // ==========================================================
//     {
//       orderId: 201,
//       orderNumber: 6511,
//       // KST 17:55:00 -> UTC 08:55:00Z
//       createdAt: '2025-11-01T08:55:00.000Z',
//       orderStatus: 'REJECTED',
//       memberSubscriptionId: 1,
//       subscriptionName: '카페 모니카 BASIC 구독권',
//       orderType: 'OUT',
//       tel: '010-9999-1111',
//       name: '최민수',
//       menuList: [{ menuId: 5, quantity: 1, menuName: '샌드위치' }],
//       rejectedReason: '매장 마감 임박으로 주문 거부',
//     },
//     {
//       orderId: 202,
//       orderNumber: 6512,
//       // KST 14:30:00 -> UTC 05:30:00Z
//       createdAt: '2025-11-01T05:30:00.000Z',
//       orderStatus: 'COMPLETED',
//       memberSubscriptionId: 2,
//       subscriptionName: '카페 모니카 PREMIUM 구독권',
//       orderType: 'IN',
//       tel: '010-2222-3333',
//       name: '이수진',
//       menuList: [{ menuId: 21, quantity: 2, menuName: '카페라떼' }],
//     },
//     {
//       orderId: 203,
//       orderNumber: 6513,
//       // KST 11:20:00 -> UTC 02:20:00Z
//       createdAt: '2025-11-01T02:20:00.000Z',
//       orderStatus: 'CANCELED',
//       memberSubscriptionId: 3,
//       subscriptionName: '카페 모니카 DESSERT 구독권',
//       orderType: 'OUT',
//       tel: '010-1111-2222',
//       name: '홍길동',
//       menuList: [
//         { menuId: 32, quantity: 1, menuName: '브라우니' },
//         { menuId: 12, quantity: 1, menuName: '마카롱' },
//       ],
//     },

//     // ==========================================================
//     // 3. 그제 주문 (2025-10-31 KST) - 3개
//     // ==========================================================
//     {
//       orderId: 301,
//       orderNumber: 5888,
//       // KST 16:00:00 -> UTC 07:00:00Z
//       createdAt: '2025-10-31T07:00:00.000Z',
//       orderStatus: 'COMPLETED',
//       memberSubscriptionId: 2,
//       subscriptionName: '카페 모니카 PREMIUM 구독권',
//       orderType: 'IN',
//       tel: '010-5555-4444',
//       name: '김철수',
//       menuList: [{ menuId: 1, quantity: 1, menuName: '아메리카노' }],
//     },
//     {
//       orderId: 302,
//       orderNumber: 5889,
//       // KST 13:30:00 -> UTC 04:30:00Z
//       createdAt: '2025-10-31T04:30:00.000Z',
//       orderStatus: 'REJECTED',
//       memberSubscriptionId: 3,
//       subscriptionName: '카페 모니카 DESSERT 구독권',
//       orderType: 'OUT',
//       tel: '010-8888-7777',
//       name: '박영희',
//       menuList: [{ menuId: 12, quantity: 1, menuName: '마카롱' }],
//       rejectedReason: '재료 소진으로 주문 거부',
//     },
//     {
//       orderId: 303,
//       orderNumber: 5890,
//       // KST 10:00:00 -> UTC 01:00:00Z
//       createdAt: '2025-10-31T01:00:00.000Z',
//       orderStatus: 'COMPLETED',
//       memberSubscriptionId: 1,
//       subscriptionName: '카페 모니카 BASIC 구독권',
//       orderType: 'IN',
//       tel: '010-9999-1111',
//       name: '최민수',
//       menuList: [
//         { menuId: 21, quantity: 1, menuName: '카페라떼' },
//         { menuId: 32, quantity: 1, menuName: '브라우니' },
//       ],
//     },

//     // ==========================================================
//     // 4. 한 달 전 주문 (2025-10-02 KST) - 3개
//     // ==========================================================
//     {
//       orderId: 401,
//       orderNumber: 4321,
//       // KST 18:00:00 -> UTC 09:00:00Z
//       createdAt: '2025-10-02T09:00:00.000Z',
//       orderStatus: 'CANCELED',
//       memberSubscriptionId: 3,
//       subscriptionName: '카페 모니카 DESSERT 구독권',
//       orderType: 'OUT',
//       tel: '010-2222-3333',
//       name: '이수진',
//       menuList: [{ menuId: 10, quantity: 1, menuName: '에스프레소' }],
//     },
//     {
//       orderId: 402,
//       orderNumber: 4322,
//       // KST 14:30:00 -> UTC 05:30:00Z
//       createdAt: '2025-10-02T05:30:00.000Z',
//       orderStatus: 'COMPLETED',
//       memberSubscriptionId: 1,
//       subscriptionName: '카페 모니카 BASIC 구독권',
//       orderType: 'IN',
//       tel: '010-1111-2222',
//       name: '홍길동',
//       menuList: [
//         { menuId: 1, quantity: 1, menuName: '아메리카노' },
//         { menuId: 5, quantity: 1, menuName: '샌드위치' },
//       ],
//     },
//     {
//       orderId: 403,
//       orderNumber: 4323,
//       // KST 08:45:00 -> UTC 23:45:00Z (전날 UTC)
//       createdAt: '2025-10-01T23:45:00.000Z',
//       orderStatus: 'COMPLETED',
//       memberSubscriptionId: 2,
//       subscriptionName: '카페 모니카 PREMIUM 구독권',
//       orderType: 'OUT',
//       tel: '010-5555-4444',
//       name: '김철수',
//       menuList: [{ menuId: 21, quantity: 2, menuName: '카페라떼' }],
//     },

//     // ==========================================================
//     // 5. 두 달 전 주문 (2025-09-02 KST) - 3개
//     // ==========================================================
//     {
//       orderId: 501,
//       orderNumber: 3101,
//       // KST 15:00:00 -> UTC 06:00:00Z
//       createdAt: '2025-09-02T06:00:00.000Z',
//       orderStatus: 'COMPLETED',
//       memberSubscriptionId: 3,
//       subscriptionName: '카페 모니카 DESSERT 구독권',
//       orderType: 'IN',
//       tel: '010-8888-7777',
//       name: '박영희',
//       menuList: [{ menuId: 32, quantity: 1, menuName: '브라우니' }],
//     },
//     {
//       orderId: 502,
//       orderNumber: 3102,
//       // KST 11:45:00 -> UTC 02:45:00Z
//       createdAt: '2025-09-02T02:45:00.000Z',
//       orderStatus: 'REJECTED',
//       memberSubscriptionId: 1,
//       subscriptionName: '카페 모니카 BASIC 구독권',
//       orderType: 'OUT',
//       tel: '010-9999-1111',
//       name: '최민수',
//       menuList: [{ menuId: 1, quantity: 1, menuName: '아메리카노' }],
//       rejectedReason: '직원 부재로 주문 거부',
//     },
//     {
//       orderId: 503,
//       orderNumber: 3103,
//       // KST 07:30:00 -> UTC 22:30:00Z (전날 UTC)
//       createdAt: '2025-09-01T22:30:00.000Z',
//       orderStatus: 'CANCELED',
//       memberSubscriptionId: 2,
//       subscriptionName: '카페 모니카 PREMIUM 구독권',
//       orderType: 'IN',
//       tel: '010-2222-3333',
//       name: '이수진',
//       menuList: [
//         { menuId: 21, quantity: 1, menuName: '카페라떼' },
//         { menuId: 12, quantity: 1, menuName: '마카롱' },
//       ],
//     },
//   ],
//   message: '과거 주문 내역 정적 데이터가 성공적으로 생성되었습니다.',
// };
// // 위에는 전부 가데이터 테스트 로직;

// menuList에서 menuName과 quantity를 조합해서 보여주는 식
const getFormattedMenuList = (menuList) => {
  if (!menuList || menuList.length === 0) return '메뉴 없음';

  // 메뉴 이름과 수량을 조합하여 문자열 배열 생성: ['아메리카노 (2개)', '브라우니 (1개)']
  const formattedItems = menuList.map((menu) => {
    return `${menu.menuName} (${menu.quantity}개)`;
  });

  // 쉼표와 공백으로 연결
  return formattedItems.join(', ');
};

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

// 🚨 메인 컴포넌트
export default function PastOrdersList() {
  const defaultDate = TODAY_DATE;
  const [selectedDate, setSelectedDate] = useState(defaultDate);

  // ⬅️ API 응답을 저장할 State
  const [orders, setOrders] = useState([]);

  // ⬅️ 로딩 상태를 관리할 State
  const [isLoading, setIsLoading] = useState(false);

  // ⬅️ 에러 상태를 관리할 State
  const [error, setError] = useState(null);

  // 날짜 입력 변경 핸들러
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  // ----------------------------------------------------------
  // 2. API 호출 함수 구현 (useCallback 사용)
  // ----------------------------------------------------------
  const fetchOrders = useCallback(async (date) => {
    if (!date) return;

    setIsLoading(true);
    setError(null);
    setOrders([]); // 새 요청 시 이전 데이터 초기화

    try {
      // 🚨 요청 URL 구성: /api/stores/orders/past/{partnerStoreId}?searchDate={YYYY-MM-DD}
      const url = `http://localhost:8080/api/stores/orders/past/${PARTNER_STORE_ID}?searchDate=${date}`;
      // PARTNER_STORE_ID는 하드코딩된 테스트용 점주 매장 코드

      const response = await axios.get(url);

      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        // 백엔드가 success: false와 message를 반환할 경우 처리
        throw new Error(
          response.data.message || '주문 내역 조회에 실패했습니다.'
        );
      }
    } catch (err) {
      console.error('주문 내역 조회 오류:', err);
      // 사용자에게 보여줄 에러 메시지 설정
      setError(
        '데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []); // 의존성 배열 비어있음

  // ----------------------------------------------------------
  // 3. side effect (selectedDate 변경) 처리
  // ----------------------------------------------------------
  useEffect(() => {
    // 선택된 날짜가 유효한 경우에만 API 호출
    if (selectedDate) {
      fetchOrders(selectedDate);
    }
  }, [selectedDate, fetchOrders]);

  // ----------------------------------------------------------
  // 4. 필터링 로직 수정 (가져온 데이터에 대해 영업시간 제한 필터 적용)
  // ----------------------------------------------------------
  const filteredOrders = useMemo(() => {
    // 로딩 중이거나 데이터가 없으면 빈 배열 반환
    if (isLoading || orders.length === 0) return [];

    // API에서 가져온 데이터에 대해 기존의 영업일/영업시간 필터링을 적용합니다.
    return (
      orders
        .filter((order) => {
          // 1. 영업일 기준으로 날짜 필터링 (API 호출 시 이미 1차 필터링되었지만, 안전을 위해 KST 영업일 일치 확인)
          const kstBusinessDateString = getKstBusinessDateStringFromUtc(
            order.createdAt
          );
          if (kstBusinessDateString !== selectedDate) {
            return false;
          }

          // 2. KST 주문 마감 시간(22:00) 초과 여부 확인
          const date = new Date(order.createdAt);
          const kstHour = date.getUTCHours() + 9;
          const normalizedKstHour = kstHour % 24;

          if (normalizedKstHour >= DAILY_CLOSING_HOUR_KST) {
            return false;
          }

          return true; // 두 조건을 모두 만족
        })
        // 최신 주문이 위로 오도록 시간 역순으로 정렬
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
  }, [orders, selectedDate, isLoading]); // orders, selectedDate, isLoading이 변경될 때만 재계산

  // ----------------------------------------------------------
  // 5. 렌더링 (로딩/에러/데이터 없음 상태 반영)
  // ----------------------------------------------------------
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
          {/* 제목 및 날짜 필터 영역 (수정 없음) */}
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
          {/* 로딩, 에러, 데이터 없음 상태 표시 */}
          <Box
            sx={{
              minHeight: 200,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isLoading ? (
              <Box display="flex" flexDirection="column" alignItems="center">
                <CircularProgress />
                <Typography sx={{ mt: 2, color: theme.palette.text.secondary }}>
                  주문 내역을 불러오는 중...
                </Typography>
              </Box>
            ) : error ? (
              <Typography color="error.main" variant="body1" fontWeight="bold">
                {error}
              </Typography>
            ) : (
              // 주문 리스트 테이블
              <TableContainer component={Paper} variant="outlined">
                <Table
                  sx={{ minWidth: 650 }}
                  aria-label="지난 주문 내역 테이블"
                >
                  <TableHead sx={{ backgroundColor: '#f8f8f8' }}>
                    <TableRow>
                      {[
                        '주문 번호',
                        '주문 유형',
                        '주문 상태',
                        '주문 시간',
                        '주문 메뉴',
                        '결제 구독권 유형',
                        '회원 이름',
                        '전화번호',
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
                      // ⬅️ filteredOrders 사용 (기존과 동일)
                      filteredOrders.map((order) => {
                        const statusProps = getStatusProps(order.orderStatus);
                        const formattedMenuString = getFormattedMenuList(
                          order.menuList
                        );
                        // KST로 변환하여 로컬 시간 표시
                        const kstTimeDisplay = new Date(
                          order.createdAt
                        ).toLocaleString('ko-KR', {
                          timeZone: 'Asia/Seoul',
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false,
                        });

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
                            <TableCell align="center">
                              {order.orderType}
                            </TableCell>
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
                              {/* ⬅️ 주문 시간 표시 포맷 개선 */}
                              {kstTimeDisplay}
                            </TableCell>
                            <TableCell align="center">
                              {formattedMenuString}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ color: theme.palette.text.secondary }}
                            >
                              {order.subscriptionName}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ color: theme.palette.text.secondary }}
                            >
                              {order.name}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ color: theme.palette.text.secondary }}
                            >
                              {order.tel}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          align="center"
                          sx={{ py: 4, color: theme.palette.text.disabled }}
                        >
                          선택한 날짜에 주문 내역이 없습니다. (KST 09:00 ~ 22:00
                          기준)
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </StyledPaper>
      </Box>
    </ThemeProvider>
  );
}
