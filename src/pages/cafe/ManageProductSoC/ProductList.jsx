import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import PendingIcon from '@mui/icons-material/Pending';

// 구독권 상태에 따른 스타일 정의
const getStatusProps = (status) => {
  switch (status) {
    case 'ONSALE':
      return {
        label: '판매 중',
        color: 'success',
        icon: <CheckCircleIcon fontSize="small" />,
      };
    case 'SOLDOUT':
      return {
        label: '품절',
        color: 'error',
        icon: <CloseIcon fontSize="small" />,
      };
    case 'SUSPENDED':
      return {
        label: '판매 중지',
        color: 'warning',
        icon: <PendingIcon fontSize="small" />,
      };
    default:
      return { label: '알 수 없음', color: 'default', icon: null };
  }
};

/**
 * 구독권 목록을 그리드 형태로 렌더링하는 컨테이너 컴포넌트
 * 이 컴포넌트는 List 역할(배열 반복)과 Card 역할(단일 항목 표시)을 모두 수행합니다.
 * @param {Array<object>} subscriptions 구독권 데이터 배열 (ManageProduct에서 받아옴)
 * @param {function} onCardClick 카드 클릭 시 상세 모달을 여는 핸들러
 */
const ProductList = ({ subscriptions, onCardClick }) => {
  // 🚩 subscriptions 배열이 비어 있을 때의 UI
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Box
        sx={{
          p: 5,
          textAlign: 'center',
          border: '2px dashed #eee',
          borderRadius: 2,
          mt: 4,
          bgcolor: 'grey.50',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          현재 등록된 구독권 상품이 없습니다.
        </Typography>
        <Typography color="text.secondary">
          새 구독권 등록 버튼을 눌러 상품을 추가하세요.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        // 반응형 Grid 설정: 화면 크기에 따라 최소 300px 크기의 카드를 유연하게 배치
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 3,
        mt: 4,
      }}
    >
      {/* 🚩 subscriptions 배열을 순회하며 개별 카드를 렌더링합니다. */}
      {subscriptions
        .filter((subscription) => !subscription.deletedAt)
        .map((subscription) => {
          // 단일 구독권 객체에 대한 카드 렌더링 로직 (기존 코드를 그대로 사용)
          const statusProps = getStatusProps(subscription.subscriptionStatus);
          return (
            <Paper
              key={subscription.subscriptionId} // key는 배열 반복 시 필수
              elevation={3}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
                cursor: 'pointer',
                position: 'relative',
                height: '100%', // Grid 내에서 높이 통일
              }}
              onClick={() => onCardClick(subscription)} // 클릭 시 부모로 이벤트 전달
            >
              {/* 상단 이미지 */}
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={
                    subscription.subscriptionImg ||
                    'https://placehold.co/400x150/6c757d/ffffff?text=No+Image'
                  }
                  alt={subscription.subscriptionName}
                  sx={{
                    width: '100%',
                    height: 150,
                    objectFit: 'cover',
                    borderBottom: `4px solid ${
                      statusProps.color === 'success' ? '#4CAF50' : '#E0E0E0'
                    }`,
                  }}
                />

                {/* 상태 Chip */}
                <Chip
                  label={statusProps.label}
                  color={statusProps.color}
                  icon={statusProps.icon}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    fontWeight: 'bold',
                  }}
                />
              </Box>

              {/* 본문 정보 */}
              <Box
                p={2}
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                flexGrow={1}
              >
                <div>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {subscription.subscriptionName}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1, height: 40, overflow: 'hidden' }}
                  >
                    {subscription.subscriptionDesc}
                  </Typography>
                </div>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={2}
                  pt={1}
                  borderTop="1px solid #eee"
                >
                  <Typography
                    variant="h5"
                    color="primary"
                    sx={{ fontWeight: 'extrabold' }}
                  >
                    {subscription.price.toLocaleString()}원
                  </Typography>
                  <Box textAlign="right">
                    <Typography variant="caption" color="text.secondary">
                      남은 수량
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 'bold' }}
                      color={
                        subscription.remainSalesQuantity > 0
                          ? 'text.primary'
                          : 'error'
                      }
                    >
                      {subscription.remainSalesQuantity.toLocaleString()} 개 /
                      {subscription.salesLimitQuantity} 개
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          );
        })}
    </Box>
  );
};

export default ProductList;
