import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const MENU_TYPES = [
  { value: 'BEVERAGE', label: '음료' },
  { value: 'DESSERT', label: '디저트' },
];

const defaultImageUrl = 'https://placehold.co/40x40/CCCCCC/333333?text=New';

/**
 * 신규 메뉴 등록 모달 컴포넌트
 */
export default function MenuRegistModal({ open, onClose, onRegister }) {
  const [formData, setFormData] = useState({
    menuName: '',
    price: '',
    menuDesc: '',
    menuType: 'BEVERAGE',
    menuStatus: 'Y',
    partnerStoreId: 1, // 고정 값
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});

  // 폼 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // 폼 유효성 검사
  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.menuName.trim()) {
      tempErrors.menuName = '메뉴명을 입력해야 합니다.';
      isValid = false;
    }
    const priceNum = parseInt(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      tempErrors.price = '유효한 가격(숫자)을 입력해야 합니다.';
      isValid = false;
    }
    if (!formData.menuDesc.trim()) {
      tempErrors.menuDesc = '메뉴 설명을 입력해야 합니다.';
      isValid = false;
    }
    setErrors(tempErrors);
    return isValid;
  };

  // 이미지 초기화 핸들러 (중복 제거 후 하나의 정의만 남김)
  const handleClearImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // 파일 인풋 초기화
    }
  };

  // 파일 변경 핸들러 (중복 제거 후 하나의 정의만 남김)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // 파일 미리보기를 위해 URL 생성
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      handleClearImage();
    }
  };

  // 폼 초기화 및 모달 닫기
  const resetFormAndClose = () => {
    // 폼 초기화
    setFormData({
      menuName: '',
      price: '',
      menuDesc: '',
      menuType: 'BEVERAGE',
      menuStatus: 'Y',
      partnerStoreId: 1,
    });
    setErrors({});
    handleClearImage();
    // 메모리 해제: URL.createObjectURL로 생성된 URL은 사용 후 반드시 해제해야 합니다.
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    onClose();
  };

  // 최종 등록 제출
  const handleSubmit = async () => {
    if (validate()) {
      try {
        // 부모 컴포넌트의 onRegister 함수 호출 (API 연결 책임은 부모에게 있음)
        await onRegister(
          formData,
          selectedFile,
          imagePreview || defaultImageUrl // 현재 미리보기 URL 전송
        );

        // 성공 시 폼 초기화 및 닫기
        resetFormAndClose();
      } catch (error) {
        // onRegister에서 발생한 API 에러 처리
        console.error('메뉴 등록 중 에러 발생:', error);
        // ⚠️ window.alert 대신 사용자 정의 모달이나 Snackbar를 사용하는 것이 좋습니다.
        alert('메뉴 등록에 실패했습니다. (API 오류)');
      }
    }
  };

  return (
    <Dialog open={open} onClose={resetFormAndClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}
      >
        <Typography variant="h6" component="span" fontWeight="bold">
          신규 메뉴 등록
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          {/* 메뉴 활성 상태 (4/12) */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>메뉴 활성 상태</InputLabel>
              <Select
                name="menuStatus"
                value={formData.menuStatus}
                label="메뉴 활성 상태"
                onChange={handleChange}
              >
                <MenuItem value="Y">ACTIVE (판매 중)</MenuItem>
                <MenuItem value="N">INACTIVE (판매 중지)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* 메뉴명 (8/12) */}
          <Grid item xs={12} sm={8}>
            <TextField
              autoFocus
              size="small"
              name="menuName"
              label="메뉴명"
              fullWidth
              variant="outlined"
              value={formData.menuName}
              onChange={handleChange}
              error={!!errors.menuName}
              helperText={errors.menuName}
            />
          </Grid>

          {/* 가격 (6/12) */}
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              name="price"
              label="가격 (원)"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.price}
              onChange={handleChange}
              error={!!errors.price}
              helperText={errors.price}
            />
          </Grid>

          {/* 메뉴 타입 (6/12) */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>메뉴 타입</InputLabel>
              <Select
                name="menuType"
                value={formData.menuType}
                label="메뉴 타입"
                onChange={handleChange}
              >
                {MENU_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 메뉴 설명 (12/12) */}
          <Grid item xs={12}>
            <TextField
              name="menuDesc"
              label="메뉴 상세 설명"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.menuDesc}
              onChange={handleChange}
              error={!!errors.menuDesc}
              helperText={errors.menuDesc}
            />
          </Grid>

          {/* 메뉴 이미지 파일 첨부 (12/12) */}
          <Grid item xs={12}>
            <Box
              display="flex"
              alignItems="center"
              gap={2}
              mt={1}
              p={1}
              border="1px solid #ccc"
              borderRadius={1}
            >
              <Avatar
                src={imagePreview || defaultImageUrl}
                alt="Menu Preview"
                sx={{ width: 56, height: 56, flexShrink: 0 }}
                variant="rounded"
              />
              <Box flexGrow={1}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {selectedFile
                    ? `선택된 파일: ${selectedFile.name}`
                    : '메뉴 이미지를 첨부해주세요.'}
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    size="small"
                    color="primary"
                  >
                    파일 선택
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {selectedFile && (
                    <Button
                      variant="outlined"
                      onClick={handleClearImage}
                      size="small"
                      color="error"
                    >
                      삭제
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
        <Button
          onClick={resetFormAndClose}
          variant="outlined"
          color="error"
          sx={{ minWidth: 100 }}
        >
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          sx={{ minWidth: 120 }}
        >
          메뉴 등록 완료
        </Button>
      </DialogActions>
    </Dialog>
  );
}
