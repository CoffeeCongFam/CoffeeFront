import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';

// 모달 스타일 설정
const modalStyle = {
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: 700,
    borderRadius: 2,
  },
};

/**
 * 구독권 상세 조회 및 수정 모달 컴포넌트
 * @param {boolean} open 모달 열림/닫힘 상태
 * @param {object} subscription 현재 선택된 구독권 데이터
 * @param {function} onClose 모달 닫기 핸들러
 * @param {function} onSave 수정 완료 버튼 클릭 시 호출될 함수 (컨테이너의 handleUpdateSubscription과 연결)
 */
const ProductDetailEditModal = ({ open, subscription, onClose, onSave }) => {
  // 폼 상태를 subscription prop으로 초기화
  const [formData, setFormData] = useState(subscription);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(subscription.subscriptionImg);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // subscription prop이 변경될 때마다 폼 상태를 업데이트
  useEffect(() => {
    if (subscription) {
      setFormData(subscription);
      setPreviewUrl(subscription.subscriptionImg);
      setImageFile(null); // 새 모달 열리면 파일 초기화
    }
  }, [subscription]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'price' ||
        name === 'remainSalesQuantity' ||
        name === 'salesLimitQuantity' ||
        name === 'subscriptionPeriod' ||
        name === 'maxDailyUsage'
          ? parseInt(value) || ''
          : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // 브라우저에서 새 이미지 미리보기 URL 생성
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
    }
  };

  const handleRemoveImage = () => {
    // 이미지 파일 제거 및 미리보기 초기화
    setImageFile(null);
    setPreviewUrl('');
    // 데이터 필드에서 이미지 URL을 제거하여 Service 계층에 이미지 제거를 요청하도록 설정
    setFormData((prev) => ({
      ...prev,
      subscriptionImg: '',
    }));
  };

  const handleSubmit = async () => {
    if (!formData.subscriptionName || formData.price <= 0) {
      console.warn('구독권 이름과 가격은 필수입니다.');
      return;
    }

    setIsSubmitting(true);
    // 컨테이너로 ID, 수정된 데이터, 이미지 파일을 전달하여 수정 로직 실행
    await onSave(subscription.subscriptionId, formData, imageFile);
    setIsSubmitting(false);
  };

  // subscription prop이 없으면 모달을 렌더링하지 않음
  if (!subscription) return null;

  return (
    <Dialog open={open} onClose={onClose} sx={modalStyle} fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>구독권 상세/수정</DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: 'grid', gap: 2 }}
        >
          {/* 상단 정보 (ID 및 최종 수정일) */}
          <Box
            display="flex"
            justifyContent="space-between"
            mb={2}
            p={1}
            sx={{ backgroundColor: '#f5f5f5', borderRadius: 1 }}
          >
            <Typography variant="subtitle1" color="text.secondary">
              ID: {subscription.subscriptionId}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              최종 수정일: {subscription.modifyDate}
            </Typography>
          </Box>

          {/* 이미지 수정 섹션 */}
          <Box
            mb={2}
            sx={{
              border: '1px dashed #ccc',
              p: 2,
              borderRadius: 1,
              textAlign: 'center',
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              구독권 대표 이미지
            </Typography>
            {previewUrl ? (
              <Box sx={{ position: 'relative', mb: 1 }}>
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Image Preview"
                  sx={{
                    width: '100%',
                    height: 150,
                    objectFit: 'cover',
                    borderRadius: 1,
                    mt: 1,
                  }}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={handleRemoveImage}
                  variant="contained"
                  sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    backgroundColor: 'white',
                    '&:hover': { backgroundColor: '#ffebee' },
                    color: 'black',
                  }}
                >
                  이미지 삭제
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" color="text.disabled" sx={{ py: 2 }}>
                등록된 이미지가 없습니다.
              </Typography>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'block', width: '100%', marginTop: 10 }}
            />
          </Box>
          <Divider />

          {/* 기본 정보 수정 필드 */}
          <TextField
            label="구독권 이름"
            name="subscriptionName"
            value={formData.subscriptionName}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="가격 (원)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ min: 0 }}
          />
          <TextField
            label="설명"
            name="subscriptionDesc"
            value={formData.subscriptionDesc}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />

          {/* 판매 상태 및 수량 */}
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <FormControl fullWidth>
              <InputLabel>판매 상태</InputLabel>
              <Select
                label="판매 상태"
                name="subscriptionStatus"
                value={formData.subscriptionStatus}
                onChange={handleChange}
              >
                <MenuItem value="ONSALE">판매 중</MenuItem>
                <MenuItem value="SOLDOUT">품절</MenuItem>
                <MenuItem value="SUSPENDED">판매 중지</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="남은 판매 수량"
              name="remainSalesQuantity"
              type="number"
              value={formData.remainSalesQuantity}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Box>

          {/* 유형 및 기간 */}
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <FormControl fullWidth>
              <InputLabel>구독권 유형</InputLabel>
              <Select
                label="구독권 유형"
                name="subscriptionType"
                value={formData.subscriptionType}
                onChange={handleChange}
              >
                <MenuItem value="BASIC">BASIC</MenuItem>
                <MenuItem value="PREMIUM">PREMIUM</MenuItem>
                <MenuItem value="LIMITED">LIMITED</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="구독 기간 (일)"
              name="subscriptionPeriod"
              type="number"
              value={formData.subscriptionPeriod}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Box>

          <TextField
            label="일일 최대 사용 횟수"
            name="maxDailyUsage"
            type="number"
            value={formData.maxDailyUsage}
            onChange={handleChange}
            fullWidth
            inputProps={{ min: 1 }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isSubmitting} color="secondary">
          닫기
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant="contained"
          color="primary"
        >
          {isSubmitting ? '저장 중...' : '수정 완료'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDetailEditModal;
