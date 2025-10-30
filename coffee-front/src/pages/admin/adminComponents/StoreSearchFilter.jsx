// StoreManagePage에 있는 검색 필터 영역
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';

// 공통 스타일: 회색 라벨을 위한 Box 컴포넌트
const LabelBox = ({ children, sx = {} }) => (
  <Box
    sx={{
      minWidth: '80px',
      bgcolor: '#bdbdbd',
      p: 1,
      textAlign: 'center',
      border: '1px solid #757575',
      color: 'black',
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default function StoreSearchFilter({ onSearch }) {
  const [searchParams, setSearchParams] = useState({
    storeId: '',
    storeName: '',
    roadAddress: '',
    storeStatus: 'ALL', // 기본값은 전체
  });

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchClick = () => {
    onSearch(searchParams); // 부모 컴포넌트(StoreManagePage)로 검색 매개변수 전달
  };

  // 매장 상태 옵션
  const statusOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'PENDING', label: '승인 전' },
    { value: 'ACTIVE', label: '영업 중' },
    { value: 'CLOSED', label: '영업 종료' },
    { value: 'TERMINATION', label: '계약 종료' },
  ];

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: '#e0e0e0', // 이미지의 회색 배경
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2, // 필터 행(row) 간의 간격
      }}
    >
      {/* 1. 매장 ID 및 매장명 */}
      <Box
        sx={{
          display: 'flex',
          gap: 2.5,
          alignItems: 'center',
          flexWrap: 'wrap', // flexWrap : 'wrap'이 줄바꿈 허용으로 아무리 화면을 줄여도 삐져나오지 않게
        }}
      >
        {/* 매장ID */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LabelBox>매장ID</LabelBox>
          <TextField
            name="storeId"
            value={searchParams.storeId}
            onChange={handleParamChange}
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, bgcolor: 'white' }}
          />
        </Box>

        {/* 매장명 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LabelBox>매장명</LabelBox>
          <TextField
            name="storeName"
            value={searchParams.storeName}
            onChange={handleParamChange}
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, bgcolor: 'white' }}
          />
        </Box>
      </Box>

      {/* 2. 지역 (도로명 주소) */}
      <Box sx={{ display: 'flex', gap: 0.1, alignItems: 'center' }}>
        <LabelBox>지역</LabelBox>
        {/* 도로명 주소 검색 필드 */}
        <TextField
          name="roadAddress"
          value={searchParams.roadAddress}
          onChange={handleParamChange}
          variant="outlined"
          size="small"
          placeholder="도로명 주소를 입력하세요"
          sx={{ flexGrow: 0.5, bgcolor: 'white', minWidth: '200px' }}
        />
      </Box>

      {/* 3. 매장 상태 (Select) */}
      <Box sx={{ display: 'flex', gap: 0.1, alignItems: 'center' }}>
        <LabelBox>매장상태</LabelBox>
        <FormControl
          variant="outlined"
          size="small"
          sx={{ minWidth: 120, bgcolor: 'white' }}
        >
          <Select
            name="storeStatus"
            value={searchParams.storeStatus}
            onChange={handleParamChange}
            displayEmpty
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 검색 버튼 */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={handleSearchClick}
          sx={{
            bgcolor: '#757575', // 이미지의 회색 버튼 색상
            color: 'white',
            p: '8px 40px',
            '&:hover': { bgcolor: '#616161' },
          }}
        >
          검색
        </Button>
      </Box>
    </Box>
  );
}
