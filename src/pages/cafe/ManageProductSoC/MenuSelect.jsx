// ManageProductSoC/MenuSelect.jsx
import React from 'react';
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';

/**
 * 재사용 가능한 메뉴 다중 선택 컴포넌트
 * @param {Array<object>} allMenus - 전체 메뉴 목록
 * @param {Array<number>} selectedMenuIds - 현재 선택된 ID 배열
 * @param {function} setSelectedMenuIds - ID 배열을 업데이트하는 setter 함수
 */
const MenuSelect = ({ allMenus, selectedMenuIds, setSelectedMenuIds }) => {
  // 체크박스 변경 핸들러
  const handleToggle = (menuId) => {
    if (selectedMenuIds.includes(menuId)) {
      // 이미 있으면 제거 (선택 해제)
      setSelectedMenuIds(selectedMenuIds.filter((id) => id !== menuId));
    } else {
      // 없으면 추가 (선택)
      setSelectedMenuIds([...selectedMenuIds, menuId]);
    }
  };

  if (!allMenus || allMenus.length === 0) {
    return (
      <Typography
        color="text.secondary"
        sx={{ p: 2, border: '1px dashed #eee' }}
      >
        등록된 메뉴가 없습니다. 메뉴 등록이 필요합니다.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid #ddd',
        borderRadius: 1,
        maxHeight: 200,
        overflowY: 'auto',
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        구독권 포함 메뉴 선택 (다중 선택, 소비자에겐 '택 1' 옵션으로 제공)
      </Typography>

      {allMenus.map((menu) => (
        <FormControlLabel
          key={menu.menuId}
          control={
            <Checkbox
              checked={selectedMenuIds.includes(menu.menuId)}
              onChange={() => handleToggle(menu.menuId)}
              size="small"
            />
          }
          label={`${menu.menuName}`}
          sx={{ width: '100%', m: 0, justifyContent: 'space-between' }}
        />
      ))}
    </Box>
  );
};

export default MenuSelect;
