import React, { useState } from 'react';
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
import MenuSelect from './MenuSelect';

// 모달 스타일 설정
const modalStyle = {
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: 600,
    borderRadius: 2,
  },
};

// 신규 구독권 등록 모달 컴포넌트
const ProductRegistModal = ({ open, allMenus, onClose, onRegister }) => {
  // 선택된 메뉴 ID 상태: 등록은 빈 배열에서 시작
  const [selectedMenuIds, setSelectedMenuIds] = useState([]);

  // 폼 상태 관리(초기값 설정)
  const [formData, setFormData] = useState({
    subscriptionName: '',
    price: 0,
    subscriptionDesc: '',
    subscriptionPeriod: 30,
    subscriptionStatus: 'ONSALE',
    remainSalesQuantity: 100,
    maxDailyUsage: 1,
    subscriptionType: 'BASIC',
    salesLimitQuantity: 100,
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          ? parseInt(value) || '' // 숫자 필드는 숫자로 변환
          : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // 브라우저에서 미리보기 URL 생성
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setPreviewUrl('');
    }
  };

  const handleSubmit = async () => {
    if (!formData.subscriptionName || formData.price <= 0) {
      console.warn('구독권 이름과 가격은 필수입니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 🚩 [수정] onRegister 호출 시 selectedMenuIds를 세 번째 인자로 전달
      await onRegister(formData, imageFile, selectedMenuIds);
    } catch (err) {
      console.error(err);
      // 에러 처리
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} sx={modalStyle} fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>새 구독권 등록</DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: 'grid', gap: 2 }}
        >
          {/* 이미지 등록 섹션 */}
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
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ marginBottom: 10 }}
            />
            {previewUrl && (
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
            )}
          </Box>

          {/* 기본 정보 입력 */}
          <TextField
            label="구독권 이름"
            name="subscriptionName"
            value={formData.subscriptionName}
            onChange={handleChange}
            fullWidth
            required
          />

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
                <MenuItem value="STANDARD">STANDARD</MenuItem>
                <MenuItem value="PREMIUM">PREMIUM</MenuItem>
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

          {/* 🚩 메뉴 선택 컴포넌트 삽입 */}
          <Divider />
          <MenuSelect
            allMenus={allMenus}
            selectedMenuIds={selectedMenuIds}
            setSelectedMenuIds={setSelectedMenuIds}
            subscriptionType={formData.subscriptionType}
          />
          <Divider />
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
              label="판매 가능 수량"
              name="salesLimitQuantity"
              type="number"
              value={formData.salesLimitQuantity}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0 }}
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
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant="contained"
          color="primary"
        >
          {isSubmitting ? '등록 중...' : '등록 완료'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ProductRegistModal;
