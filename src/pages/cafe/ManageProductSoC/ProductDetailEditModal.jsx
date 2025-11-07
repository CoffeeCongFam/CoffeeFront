import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';

const modalStyle = {
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: 600,
    borderRadius: 2,
  },
};

const ProductDetailEditModal = ({ open, subscription, onClose, onSave }) => {
  const [formData, setFormData] = useState(subscription);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subscription) {
      setFormData(subscription);
    }
  }, [subscription]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const dataToSend = { subscriptionStatus: formData.subscriptionStatus };
    await onSave(subscription.subscriptionId, dataToSend);
    setIsSubmitting(false);
  };

  const InfoBox = ({ title, content, subContent = null }) => (
    <Box
      sx={{
        flexGrow: 1,
        padding: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        minHeight: '64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        border: '1px solid #E0E0E0',
      }}
    >
      <Typography
        variant="caption"
        color="textSecondary"
        fontWeight="bold"
        sx={{ mb: 0.25 }}
      >
        {title}
      </Typography>
      <Typography variant="body2" fontWeight="bold">
        {content}
      </Typography>
      {subContent && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
          {subContent}
        </Typography>
      )}
    </Box>
  );

  if (!subscription) return null;

  return (
    <Dialog open={open} onClose={onClose} sx={modalStyle} fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>구독권 상세 정보</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          {/* 이미지 */}
          <Box textAlign="center">
            {subscription.subscriptionImg ? (
              <img
                src={subscription.subscriptionImg}
                alt="구독 이미지"
                style={{
                  width: '100%',
                  height: 160,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            ) : (
              <Typography color="text.disabled" sx={{ py: 2 }}>
                이미지가 없습니다.
              </Typography>
            )}
          </Box>

          <Divider />

          {/* 구독권 메타 정보 (텍스트로 표시) */}
          <Box>
            <Box sx={{ mb: 1 }} variant="body1">
              <InfoBox title="이름" content={subscription.subscriptionName} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1 }} variant="body1">
              <InfoBox
                title="구독권 유형"
                content={subscription.subscriptionType}
              />
              <InfoBox
                title="가격"
                content={subscription.price?.toLocaleString() + '원'}
              />
            </Box>
            <Box sx={{ mb: 1 }} variant="body1">
              <InfoBox
                title="설명"
                content={subscription.subscriptionDesc || '없음'}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }} variant="body1">
              <InfoBox
                title="구독 기간"
                content={subscription.subscriptionPeriod + '일'}
              />
              <InfoBox
                title="일일 최대 사용 횟수"
                content={subscription.maxDailyUsage + '회'}
              />
              <InfoBox
                title="남은 판매 수량"
                content={
                  subscription.remainSalesQuantity +
                  ' / ' +
                  subscription.salesLimitQuantity
                }
              />
            </Box>
          </Box>

          <Divider />

          {/* 판매 상태만 수정 가능 */}
          <FormControl fullWidth>
            <InputLabel>판매 상태</InputLabel>
            <Select
              label="판매 상태"
              name="subscriptionStatus"
              value={formData.subscriptionStatus || ''}
              onChange={handleChange}
              // 구독권 상태 변경이 허용되지 않은 경우 비활성화
              disabled={!subscription.isStatusChangeAllowed}
            >
              <MenuItem value="ONSALE">판매 중</MenuItem>
              <MenuItem value="SOLDOUT">품절</MenuItem>
              <MenuItem value="SUSPENDED">판매 중지</MenuItem>
            </Select>
            {/* 비활성화된 경우 메시지 표시 */}
            {!subscription.isStatusChangeAllowed && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                아직 판매 중지/품절 처리가 불가능합니다. (허용일 :{' '}
                {subscription.isStatusChangeAllowDate} 이후)
              </Typography>
            )}
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <DialogActions sx={{ p: 3 }}>
          <Box>
            <Button
              onClick={onClose}
              disabled={isSubmitting}
              color="secondary"
              sx={{ mr: 1 }}
            >
              닫기
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="contained"
              color="primary"
            >
              {isSubmitting ? '저장 중...' : '판매 상태 수정'}
            </Button>
          </Box>
        </DialogActions>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDetailEditModal;
