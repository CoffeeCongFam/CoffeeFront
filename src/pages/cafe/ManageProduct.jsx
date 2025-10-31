import { Button, Card, Grid, Typography } from '@mui/material';
import { useState } from 'react';
import { Form } from 'react-router-dom';

export const DUMMY_SUBSCRIPTIONS = [
  {
    subscriptionId: 'S001',
    subscriptionName: '베이직 커피 구독권',
    price: 19900,
    subscriptionDesc: '베이직 음료 1일 1회 이용 가능하며, 한 달간 지속됩니다.',
    subscriptionPeriod: 30, // 30일
    createdAt: '2025-10-01T10:00:00Z',
    subscriptionStatus: 'ONSALE', // 판매 중
    remainSalesQuantity: 50,
    maxDailyUsage: 1,
    subscriptionType: 'BASIC',
    subscriptionImg:
      'https://placehold.co/400x200/4CAF50/FFFFFF?text=BASIC+Subscription',
    totalSale: 120,
    salesLimitQuantity: 100,
  },
  {
    subscriptionId: 'S002',
    subscriptionName: '스탠다드 라떼 패키지',
    price: 39900,
    subscriptionDesc:
      '모든 음료 1일 1회 이용 가능하며, 90일간 유효합니다. (디저트 제외)',
    subscriptionPeriod: 90, // 90일 (3개월)
    createdAt: '2025-09-15T14:30:00Z',
    subscriptionStatus: 'SOLDOUT', // 품절
    remainSalesQuantity: 0,
    maxDailyUsage: 1,
    subscriptionType: 'STANDARD',
    subscriptionImg:
      'https://placehold.co/400x200/FF9800/FFFFFF?text=STANDARD+Subscription',
    totalSale: 50,
    salesLimitQuantity: 50,
  },
  {
    subscriptionId: 'S003',
    subscriptionName: '프리미엄 무제한 구독',
    price: 59900,
    subscriptionDesc: '모든 메뉴 1일 2회까지 이용 가능한 최고급 구독권입니다.',
    subscriptionPeriod: 30, // 30일
    createdAt: '2025-10-25T08:15:00Z',
    subscriptionStatus: 'SUSPENDED', // 판매 중지
    remainSalesQuantity: 44,
    maxDailyUsage: 2,
    subscriptionType: 'PREMIUM',
    subscriptionImg:
      'https://placehold.co/400x200/2196F3/FFFFFF?text=PREMIUM+Subscription',
    totalSale: 5,
    salesLimitQuantity: 50,
  },
];

export default function ManageProduct() {
  const [subStatus, setSubStatus] = useState(DUMMY_SUBSCRIPTIONS);

  return (
    <div>
      <h2>구독권</h2>
      <Form>
        <Button>구독권 등록</Button>
      </Form>
      <Grid sx={{ display: 'flex' }}>
        {subStatus.map((sub) => {
          return (
            <Card>
              {sub.subscriptionImg} {sub.subscriptionName}
              <br />
              <Typography>{sub.subscriptionPeriod}</Typography>
              <br />
              <Typography>{sub.price}</Typography>
            </Card>
          );
        })}
      </Grid>
    </div>
  );
}
