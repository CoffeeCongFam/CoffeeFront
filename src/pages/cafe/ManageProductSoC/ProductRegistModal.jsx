import React, { useCallback, useState } from 'react';
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
    price: '', // 유효성 검사를 위해 초기값을 문자열로
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
  const [errors, setErrors] = useState({});

  // 에러 초기화 로직
  const clearError = (name) => {
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value, // 숫자 필드도 문자열 그대로 저장
    }));
    // 입력 시 해당 필드의 에러 메시지 제거
    clearError(name);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 기존 URL 해제 : URL.createObjectURL()이 호출될 때마다 브라우저 메모리에 해당 파일에 대한 참조(Reference)가 생성
      // 이 참조는 자동으로 해제되지 않음
      // 웹 브라우저의 메모리 최적화와 누수 방지를 위해 사용
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      setImageFile(file);
      // 브라우저에서 미리보기 URL 생성
      setPreviewUrl(URL.createObjectURL(file));
      // 이미지 변경 시 에러 초기화
      clearError('imageFile');
    } else {
      setImageFile(null);
      setPreviewUrl('');
    }
  };

  // 🚩 메뉴 선택 변경 시 에러 초기화
  const handleMenuSelectChange = useCallback(
    (ids) => {
      setSelectedMenuIds(ids);
      clearError('selectedMenuIds');
    },
    [setSelectedMenuIds]
  );

  // 🚩 유효성 검사 로직
  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    // 헬퍼 함수: 숫자 필드 검증
    const validateNumberField = (field, label, minValue = 0) => {
      const val = String(formData[field]).trim();
      const num = parseInt(val, 10);

      if (!val) {
        tempErrors[
          field
        ] = `필수 입력 항목입니다. ${label}을(를) 입력해주세요.`;
        isValid = false;
      } else if (isNaN(num) || num < minValue) {
        tempErrors[
          field
        ] = `유효하지 않은 값입니다. ${label}은(는) ${minValue} 이상의 숫자여야 합니다.`;
        isValid = false;
      } else if (val.includes('.')) {
        tempErrors[field] = `${label}은 정수만 입력 가능합니다.`;
        isValid = false;
      } else if (field === 'price' && num <= 0) {
        tempErrors[field] = '가격은 0원보다 커야 합니다.';
        isValid = false;
      }
    };

    // 1. 구독권 이름 (필수)
    if (!formData.subscriptionName.trim()) {
      tempErrors.subscriptionName =
        '필수 입력 항목입니다. 구독권 이름을 입력해주세요.';
      isValid = false;
    }

    // 2. 가격 (필수, 숫자, 0 초과)
    validateNumberField('price', '가격', 1);

    // 3. 구독 기간 (필수, 숫자, 1 이상 - 0은 시연 용도)
    validateNumberField('subscriptionPeriod', '구독 기간', 0);

    // 4. 판매 수량 (필수, 숫자, 0 이상)
    validateNumberField('salesLimitQuantity', '판매 가능 수량', 0);

    // 5. 일일 최대 사용 횟수 (필수, 숫자, 1 이상)
    validateNumberField('maxDailyUsage', '일일 최대 사용 횟수', 1);

    // 7. 메뉴 선택 (필수, 1개 이상)
    if (selectedMenuIds.length === 0) {
      tempErrors.selectedMenuIds =
        '필수 항목입니다. 구독권에 포함될 메뉴를 1개 이상 선택해주세요.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    const validationPassed = validate();
    console.log('유효성 검사 결과:', validationPassed);
    console.log('발생한 에러 객체:', errors);

    // 유효성 검사
    if (!validate()) {
      return; // 실패 시 API 호출 중단
    }

    setIsSubmitting(true);
    try {
      // 🚩 숫자 필드를 숫자로 변환
      const dataToRegister = {
        ...formData,
        price: parseInt(formData.price, 10),
        subscriptionPeriod: parseInt(formData.subscriptionPeriod, 10),
        remainSalesQuantity: parseInt(formData.salesLimitQuantity, 10), // 등록 시 remain을 salesLimit과 동일하게 설정
        salesLimitQuantity: parseInt(formData.salesLimitQuantity, 10),
        maxDailyUsage: parseInt(formData.maxDailyUsage, 10),
      };

      await onRegister(dataToRegister, imageFile, selectedMenuIds);

      // 성공 시 폼 초기화 및 닫기
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      onClose();
      alert(`구독권 [${formData.subscriptionName}] 등록 완료!`);
    } catch (err) {
      console.error(err);
      alert('구독권 등록에 실패했습니다. (API 오류)');
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
          {/* 1. 이미지 등록 섹션 */}
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
              구독권 대표 이미지 (선택사항)
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

            {/* 🚩 이미지 파일 에러 메시지 */}
            {!!errors.imageFile && (
              <Typography
                color="error"
                variant="caption"
                sx={{ mt: 1, display: 'block' }}
              >
                {errors.imageFile}
              </Typography>
            )}
          </Box>
          {/* 2. 기본 정보 입력 */}
          <TextField
            label="구독권 이름"
            name="subscriptionName"
            value={formData.subscriptionName}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.subscriptionName}
            helperText={errors.subscriptionName}
          />
          {/* 3. 유형 및 기간 */}
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
              required
              error={!!errors.subscriptionPeriod}
              helperText={errors.subscriptionPeriod}
            />
          </Box>

          {/* 4. 메뉴 선택 컴포넌트 */}
          <Divider />
          <MenuSelect
            allMenus={allMenus}
            selectedMenuIds={selectedMenuIds}
            setSelectedMenuIds={handleMenuSelectChange} // 🚩 유효성 에러 초기화 로직이 포함된 핸들러 사용
            subscriptionType={formData.subscriptionType}
          />
          {/* 🚩 메뉴 선택 에러 메시지 */}
          {!!errors.selectedMenuIds && (
            <Typography
              color="error"
              variant="caption"
              sx={{ mt: -1, display: 'block', px: 2 }}
            >
              {errors.selectedMenuIds}
            </Typography>
          )}
          <Divider />

          {/* 5. 가격 */}
          <TextField
            label="가격 (원)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.price}
            helperText={errors.price}
          />

          {/* 6. 설명 */}
          <TextField
            label="설명"
            name="subscriptionDesc"
            value={formData.subscriptionDesc}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth // 설명은 필수가 아니므로 에러 체크 안 함
          />

          {/* 7. 판매 상태 및 수량 */}
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
              required
              error={!!errors.salesLimitQuantity}
              helperText={errors.salesLimitQuantity}
            />
          </Box>

          {/* 8. 일일 최대 사용 횟수 */}
          <TextField
            label="일일 최대 사용 횟수"
            name="maxDailyUsage"
            type="number"
            value={formData.maxDailyUsage}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.maxDailyUsage}
            helperText={errors.maxDailyUsage}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          sx={{ color: "#334336" }}
        >
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant="contained"
          sx={{
            bgcolor: "#334336",
            color: "#fff9f4",
            "&:hover": {
              bgcolor: "#334336",
              opacity: 0.9,
            },
            "&:disabled": {
              bgcolor: "#ccc",
              color: "#666",
            },
          }}
        >
          {isSubmitting ? '등록 중...' : '등록 완료'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ProductRegistModal;
