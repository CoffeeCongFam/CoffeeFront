import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

const STORE_API_URL = '/api/owners/stores'; // get, post 기본 경로
const PARTNER_STORE_ID = 1; // partnerStoreId는 patch 요청 시 필요(로그인 후 저장된 값 사용)

// 🚨 [가데이터 초기화]
const INITIAL_STORE_INFO = {
  success: true,
  data: {
    partnerStoreId: 1,
    storeName: '카페 모니카',
    storeTel: '010-1111-1111',
    tel: '010-1234-5678',
    roadAddress: '서울시 강남구 테헤란로 123',
    detailAddress: '1층 102호',
    businessNumber: '111-22-33333',
    detailInfo: '조용한 카페',
    businessStart: '09:00', // 영업시간 시작
    businessEnd: '20:00', // 영업 시간 끝
    breakTimeStart: null, // 브레이크 타임 시작
    breakTimeEnd: null, // 브레이크 타임 끝
    closedDays: ['월', '공휴일'], // 휴무일
    isClosed: 'N',
    // storeHours: [
    //   {
    //     dayOfWeek: 'MON',
    //     openTime: '09:00',
    //     closeTime: '18:00',
    //     isClosed: 'N',
    //   },
    //   {
    //     dayOfWeek: 'TUE',
    //     openTime: '09:00',
    //     closeTime: '18:00',
    //     isClosed: 'N',
    //   },
    //   {
    //     dayOfWeek: 'WED',
    //     openTime: '09:00',
    //     closeTime: '18:00',
    //     isClosed: 'N',
    //   },
    //   {
    //     dayOfWeek: 'THU',
    //     openTime: '09:00',
    //     closeTime: '18:00',
    //     isClosed: 'N',
    //   },
    //   {
    //     dayOfWeek: 'FRI',
    //     openTime: '09:00',
    //     closeTime: '18:00',
    //     isClosed: 'N',
    //   },
    //   {
    //     dayOfWeek: 'SAT',
    //     openTime: '10:00',
    //     closeTime: '17:00',
    //     isClosed: 'N',
    //   },
    //   {
    //     dayOfWeek: 'SUN',
    //     openTime: null,
    //     closeTime: null,
    //     isClosed: 'Y',
    //   },
    // ],
  },
  message: '요청이 성공적으로 처리되었습니다.',
};

export default function ManageStoreInfo() {
  const [storeInfo, setStoreInfo] = useState(INITIAL_STORE_INFO);
  const [originalStoreInfo, setOriginalStoreInfo] =
    useState(INITIAL_STORE_INFO);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // 매장 정보 조회 (GET /api/owners/stores)
  const getStoreInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      // 토큰 기반 조회 : {partnerStoreId}가 URL에 필요 없음(서버가 처리)
      const response = await axios.get(STORE_API_URL);

      const data = response.data.data;
      setStoreInfo(data);
      setOriginalStoreInfo(data); // 원본 데이터 저장 (취소 시 복구용)
    } catch (err) {
      console.log('매장 정보 조회 실패. 더미 데이터 사용.', err);
      setError('매장 정보를 불러오지 못했습니다. 더미 데이터를 표시.');
      // API 실패 시, 미리 설정된 INITIAL_STORE_INFO 사용
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getStoreInfo();
  }, [getStoreInfo]);

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStoreInfo((prev) => ({ ...prev, [name]: value }));
  };

  // 휴무일 토글 핸들러
  const handleClosedDayToggle = (e, newClosedDays) => {
    setStoreInfo((prev) => ({ ...prev, closedDays: newClosedDays }));
  };

  // 매장 정보 수정 (PATCH /api/owners/stores/{partnerStoreId})
  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 🚨 PARTNER_STORE_ID(response를 써야하는데)를 URL 경로에 사용
      const url = `${STORE_API_URL}/${PARTNER_STORE_ID}`;

      // 실제 API에 맞게 수정할 데이터만 전송(PATCH)
      const dataToSend = { ...storeInfo };

      await axios.patch(url, dataToSend);

      setSuccessMessage('매장 정보가 성공적으로 수정되었습니다.');
      setIsEditing(false); // 수정 모드 종료
      setOriginalStoreInfo(storeInfo); // 원본 데이터 업데이트
    } catch (err) {
      console.error('매장 정보 수정 실패 :', err);
      setError('정보 수정에 실패. 다시 시도해주세요');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setStoreInfo(originalStoreInfo); // 원본 데이터로 되돌리기
    setIsEditing(false); // 수정 모드 종료
    setError(null);
  };

  // 렌더링
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>정보를 불러오는 중입니다...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3} maxWidth={800} margin="auto">
      <Paper elevation={4} sx={{ p: 4 }}>
        {/* 헤더 및 수정 버튼 */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" component="h1" fontWeight="bold">
            가게 관리
          </Typography>
          <Button
            variant="contained"
            color={isEditing ? 'error' : 'primary'}
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            size="small"
          >
            {isEditing ? '수정 취소' : '정보 수정'}
          </Button>
        </Box>

        {/* 알림 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* 매장 기본 정보 영역 */}
        <Typography
          variant="h6"
          mb={2}
          sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}
        >
          기본 정보
        </Typography>
        <Grid container spacing={3}>
          {[
            {
              label: '가게 이름',
              name: 'storeName',
              value: storeInfo.storeName,
              disabled: true,
            }, // 이름은 보통 수정 불가
            { label: '가게 전화번호', name: 'tel', value: storeInfo.tel },
            {
              label: '점주 전화번호',
              name: 'businessNumber',
              value: storeInfo.businessNumber,
            },
            {
              label: '도로명 주소',
              name: 'roadAddress',
              value: storeInfo.roadAddress,
            },
            {
              label: '상세 주소',
              name: 'detailAddress',
              value: storeInfo.detailAddress,
            },
            {
              label: '사업자 번호',
              name: 'businessLicenseId',
              value: storeInfo.businessLicenseId,
              disabled: true,
            }, // 번호는 보통 수정 불가
          ].map((field) => (
            <Grid item xs={12} sm={6} key={field.name}>
              <TextField
                fullWidth
                label={field.label}
                name={field.name}
                value={field.value || ''}
                onChange={handleChange}
                InputProps={{
                  readOnly: !isEditing || field.disabled,
                }}
                variant={isEditing ? 'outlined' : 'standard'}
              />
            </Grid>
          ))}
        </Grid>

        {/* 영업시간 영역 */}
        <Typography
          variant="h6"
          mt={4}
          mb={2}
          sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}
        >
          영업시간 및 휴무일
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="영업 시작 시간"
              name="businessStart"
              type="time"
              value={storeInfo.businessStart || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: !isEditing }}
              variant={isEditing ? 'outlined' : 'standard'}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="영업 종료 시간"
              name="businessEnd"
              type="time"
              value={storeInfo.businessEnd || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: !isEditing }}
              variant={isEditing ? 'outlined' : 'standard'}
            />
          </Grid>
          {/* 휴무일 토글 버튼 (피그마 디자인 반영) */}
          <Grid item xs={12}>
            <Typography variant="body1" gutterBottom sx={{ mt: 1 }}>
              휴무일 설정:
            </Typography>
            <ToggleButtonGroup
              value={storeInfo.closedDays}
              onChange={handleClosedDayToggle}
              aria-label="휴무일"
              disabled={!isEditing}
            >
              {['월', '화', '수', '목', '금', '토', '일', '공휴일'].map(
                (day) => (
                  <ToggleButton
                    key={day}
                    value={day}
                    size="small"
                    sx={{
                      fontWeight: 'bold',
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                      },
                    }}
                  >
                    {day}
                  </ToggleButton>
                )
              )}
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        {/* 저장 버튼 */}
        {isEditing && (
          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={isLoading}
              size="large"
            >
              저장하기
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
