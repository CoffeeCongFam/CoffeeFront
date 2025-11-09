// 수정 모달
import React, { useState, useEffect, useRef } from 'react';
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
 * 기존 메뉴 수정을 위한 모달 컴포넌트
 */
export default function MenuEditModal({
  open,
  onClose,
  editingMenu,
  onUpdate,
}) {
  // 폼 상태: editingMenu가 존재하면 그 값으로 초기화, 아니면 빈 값으로 초기화
  const [formData, setFormData] = useState(
    editingMenu || {
      menuName: '',
      price: '',
      menuDesc: '',
      menuType: 'BEVERAGE',
      menuStatus: 'Y',
      partnerStoreId: 1,
      menuImg: defaultImageUrl,
    }
  );

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    editingMenu?.menuImg || defaultImageUrl
  );
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});

  // 🚩구독권 포함 여부 플래그 추충(백엔드에서 제공 가정)
  // 현재 판매 중인 구독권 중에 하나라도 포함되어 있으면 false
  // 이 메뉴가 어떤 구독권에도 포함되어 있지 않거나, 포함되어 있어도 그 구독권이 ONSALE 상태가 아닌 경우는 true
  const isSubscriptionActive = editingMenu?.updatable;
  const isBlocked = !isSubscriptionActive;

  // 💡 핵심: editingMenu 값이 변경될 때마다 폼 상태를 업데이트
  useEffect(() => {
    if (editingMenu) {
      setFormData({
        menuName: editingMenu.menuName || '',
        price: editingMenu.price.toString(), // 가격을 문자열로 변환하여 폼에 표시
        menuDesc: editingMenu.menuDesc || '',
        menuType: editingMenu.menuType || 'BEVERAGE',
        menuStatus: editingMenu.menuStatus || 'Y',
        partnerStoreId: editingMenu.partnerStoreId || 1,
        menuImg: editingMenu.menuImg || defaultImageUrl, // 기존 DB URL 저장
      });
      setImagePreview(editingMenu.menuImg || defaultImageUrl);
      setSelectedFile(null); // 수정 시작 시 새 파일은 없음
      setErrors({});
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [editingMenu]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    // (MenuRegistModal의 validate 함수와 동일)
    let tempErrors = {};
    let isValid = true;

    // 1. 메뉴명 (필수 입력)
    if (!formData.menuName.trim()) {
      tempErrors.menuName = '필수 입력 항목입니다. 메뉴명을 입력해야 합니다.';
      isValid = false;
    }

    // 2. 가격 (필수 입력 및 유효한 숫자)
    const priceValue = formData.price.trim();
    const priceNum = parseInt(priceValue, 10);

    if (!priceValue) {
      tempErrors.price = '필수 입력 항목입니다. 가격을 입력해주세요.';
      isValid = false;
    } else if (isNaN(priceNum) || priceNum < 0) {
      // 0원 이상 허용
      tempErrors.price =
        '유효하지 않은 가격입니다. 0 이상의 숫자만 입력 가능합니다.';
      isValid = false;
    } else if (priceValue.includes('.')) {
      tempErrors.price =
        '가격은 정수만 입력 가능합니다. 소수점을 제거해주세요.';
      isValid = false;
    }

    // 3. 메뉴 설명 (필수 입력)
    if (!formData.menuDesc.trim()) {
      tempErrors.menuDesc =
        '필수 입력 항목입니다. 메뉴 설명을 입력해야 합니다.';
      isValid = false;
    }

    // 수정 모달은 이미지 첨부가 필수가 아님 (기존 이미지를 유지할 수 있으므로)
    setErrors(tempErrors);
    return isValid;
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    // DB에 저장된 기존 이미지 URL을 다시 미리보기로 설정 (파일이 없는 상태)
    setImagePreview(formData.menuImg);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      // 파일을 선택하지 않고 취소했을 경우, 기존 DB 이미지로 돌아감
      handleClearImage();
    }
  };

  // 모달 닫기
  const resetFormAndClose = () => {
    // 메모리 해제: 새 파일을 선택했다가 취소할 경우에 대비
    if (selectedFile && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    onClose();
  };

  // 최종 수정 제출
  const handleSubmit = async () => {
    if (!editingMenu || !editingMenu.menuId) {
      alert('수정할 메뉴 정보가 없습니다.');
      return;
    }

    if (validate()) {
      try {
        // 서버 전송을 위한 데이터 객체 생성(formData를 복사해 사용)
        const dataToUpdate = {
          ...formData,
        };

        // 프론트 이미지 필드(menuImg)를 백엔드 필드(imageUrl)로 매핑해야 기존 걸 유지
        if (dataToUpdate.menuImg !== undefined) {
          dataToUpdate.imageUrl = dataToUpdate.menuImg;
          delete dataToUpdate.menuImg;
        }

        // 400 에러 방지 핵심 로직 : 수정 금지된 필드 제거해서 보내야함 (백엔드도 그렇게 작성되어있어서)
        if (isBlocked) {
          delete dataToUpdate.menuName; // 메뉴명 삭제
          delete dataToUpdate.menuType; // 메뉴 타입 삭제
          delete dataToUpdate.menuStatus; // 메뉴 상태 삭제
        }

        // 부모 컴포넌트의 onUpdate 함수 호출
        // ID, 메뉴 데이터(DB URL 포함), 새 파일(선택 사항) 전송
        await onUpdate(editingMenu.menuId, dataToUpdate, selectedFile);

        // 성공 시 모달 닫기 (onUpdate 성공 후 부모 컴포넌트에서 리스트 업데이트됨)
        resetFormAndClose();
      } catch (error) {
        console.error('메뉴 수정 중 에러 발생:', error);
        alert('메뉴 수정에 실패했습니다. (API 오류)');
      }
    }
  };

  // editingMenu가 없거나 모달이 닫혀있으면 렌더링하지 않음
  if (!open || !editingMenu) return null;

  return (
    <Dialog open={open} onClose={resetFormAndClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ bgcolor: 'warning.main', color: 'white', fontWeight: 'bold' }}
      >
        <Typography variant="h6" component="span" fontWeight="bold">
          메뉴 수정: {editingMenu.menuName}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        {/* 폼 UI는 등록 모달과 거의 동일합니다. */}

        {isBlocked && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              border: '1px solid #ff0000',
              backgroundColor: '#fff5f5',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="error" fontWeight="bold">
              ⚠️ 중요 알림: 현재 판매 중인 구독권에 포함된 메뉴입니다.
            </Typography>
            <Typography variant="caption" color="error">
              소비자 보호를 위해 **메뉴명, 타입, 활성 상태**는 구독권 판매 중지
              후 수정이 가능합니다.
            </Typography>
          </Box>
        )}

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
                // 어떤 구독권에라도 포함되어 있으면 비활성화
                // disabled={isSubscriptionActive}
                disabled={isBlocked}
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
              disabled={isBlocked}
              // 구독권에 포함되어 있으면 비활성화
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
                disabled={isBlocked}
                // 구독권에 포함되어 있으면 비활성화
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
                src={imagePreview}
                alt="Menu Preview"
                sx={{ width: 56, height: 56, flexShrink: 0 }}
                variant="rounded"
              />
              <Box flexGrow={1}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {selectedFile
                    ? `선택된 새 파일: ${selectedFile.name}`
                    : '기존 이미지를 사용하거나 새 파일을 선택하세요.'}
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
                  <Button
                    variant="outlined"
                    onClick={handleClearImage}
                    size="small"
                    color="error"
                    disabled={!selectedFile}
                  >
                    새 파일 선택 취소
                  </Button>
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
          color="warning"
          sx={{ minWidth: 120 }}
        >
          수정 완료
        </Button>
      </DialogActions>
    </Dialog>
  );
}
