import { Typography, Paper, Button } from '@mui/material';

// 가데이터
const DUMMY_PAST_ORDERS = [
  {
    // 🚩 임의의 4자리 숫자 ID
    id: 1538,
    type: '테이크아웃',
    status: 'REQUEST',
    menu: '핫 카페라떼(4)',
    createdAt: '2025-10-30T07:15:00.000Z', // KST 16:15
  },
  {
    id: 9201,
    type: '매장이용',
    status: 'INPROGRESS',
    menu: '아이스 아메리카노(1)',
    createdAt: '2025-10-30T06:30:00.000Z', // KST 15:30
  },

  // ----------------------------------------
  // 2. 어제 (Yesterday) - 2025-10-29
  // ----------------------------------------
  {
    id: 3450,
    type: '테이크아웃',
    status: 'COMPLETED',
    menu: '아이스 라떼(2)',
    createdAt: '2025-10-29T08:20:00.000Z', // KST 17:20
  },
  {
    id: 7112,
    type: '매장이용',
    status: 'RECEIVED',
    menu: '바닐라 라떼(1)',
    createdAt: '2025-10-29T07:10:00.000Z', // KST 16:10
  },

  // ----------------------------------------
  // 3. 그제 (Two Days Ago) - 2025-10-28
  // ----------------------------------------
  {
    id: 2045,
    type: '테이크아웃',
    status: 'REJECTED',
    menu: '오트라떼(12)',
    createdAt: '2025-10-28T09:40:00.000Z', // KST 18:40
  },
  {
    id: 8899,
    type: '테이크아웃',
    status: 'CANCELED',
    menu: '초코 프라페(1)',
    createdAt: '2025-10-28T05:40:00.000Z', // KST 14:40
  },

  // ----------------------------------------
  // 4. 한 달 전 (One Month Ago) - 2025-09-30
  // ----------------------------------------
  {
    id: 4103,
    type: '매장이용',
    status: 'RECEIVED',
    menu: '딸기 요거트 스무디(1)',
    createdAt: '2025-09-30T04:00:00.000Z',
  },
  {
    id: 6721,
    type: '테이크아웃',
    status: 'RECEIVED',
    menu: '아이스티(2)',
    createdAt: '2025-09-30T05:00:00.000Z',
  },

  // ----------------------------------------
  // 5. 두 달 전 (Two Months Ago) - 2025-08-30
  // ----------------------------------------
  {
    id: 1100,
    type: '테이크아웃',
    status: 'RECEIVED',
    menu: '콜드브루(2)',
    createdAt: '2025-08-30T02:00:00.000Z',
  },
  {
    id: 5507,
    type: '매장이용',
    status: 'RECEIVED',
    menu: '에이드(1)',
    createdAt: '2025-08-30T03:00:00.000Z',
  },

  // ----------------------------------------
  // 6. 세 달 전 (Three Months Ago) - 2025-07-30
  // ----------------------------------------
  {
    id: 9942,
    type: '테이크아웃',
    status: 'RECEIVED',
    menu: '에스프레소(3)',
    createdAt: '2025-07-30T01:00:00.000Z',
  },
  {
    id: 5005,
    type: '매장이용',
    status: 'RECEIVED',
    menu: '민트초코라떼(1)',
    createdAt: '2025-07-30T02:00:00.000Z',
  },
];

export default function PastOrders() {
  return (
    <div sx={{ p: 3, flexGrow: 1 }}>
      {/* 🚩 1. 기간/날짜 필터링 영역 (이미지 상단) */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Button>오늘</Button>
        <Button>어제</Button>
        <Button>그제</Button>

        <Button variant="contained" size="small" sx={{ ml: 'auto' }}>
          조회 🔍
        </Button>
      </Paper>
    </div>
  );
}
