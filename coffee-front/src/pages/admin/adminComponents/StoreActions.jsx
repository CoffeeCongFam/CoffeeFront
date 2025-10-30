import React, { useState } from 'react';
import { Box, Button, Select, MenuItem, FormControl } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// * 테이블 상단에 위치하는 액션 버튼들과 정렬(Select)필터 구현

// 공통 스타일: 액션 버튼 스타일
const ActionButton = ({ label, onClick }) => (
  <Button
    variant="contained"
    onClick={onClick}
    sx={{
      bgcolor: '#bdbdbd',
      color: 'black',
      textTransform: 'none', // 텍스트 소문자 유지
      '&:hover': { bgcolor: '#a1a1a1' },
    }}
  >
    {label}
  </Button>
);

export default function StoreActions({ onStatusChange, onSortChange }) {
  const [sortBy, setSortBy] = useState('approvedDateDesc');

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    onSortChange(e.target.value);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
      {/* 1. 액션 버튼 그룹 */}
      <ActionButton
        label="매장상태변경"
        onClick={() => onStatusChange('changeStatus')}
      />
      <ActionButton
        label="가입승인"
        onClick={() => onStatusChange('approve')}
      />
      <ActionButton label="가입반려" onClick={() => onStatusChange('reject')} />
      <ActionButton
        label="수수료설정"
        onClick={() => onStatusChange('commission')}
      />

      {/* 2. 정렬 필터 (오른쪽 정렬) */}
      <Box sx={{ marginLeft: 'auto' }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            IconComponent={ArrowDropDownIcon}
            sx={{
              bgcolor: '#bdbdbd', // 버튼과 유사한 색상
              color: 'black',
              textTransform: 'none',
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
              },
            }}
          >
            <MenuItem value="approvedDateDesc">승인날짜순 (최신)</MenuItem>
            <MenuItem value="approvedDateAsc">승인날짜순 (오래된)</MenuItem>
            {/* 다른 정렬 옵션 추가 가능 */}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
