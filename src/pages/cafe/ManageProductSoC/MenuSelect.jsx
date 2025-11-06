// ManageProductSoC/MenuSelect.jsx
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';

/**
 * 재사용 가능한 메뉴 다중 선택 컴포넌트
 * @param {Array<object>} allMenus - 전체 메뉴 목록
 * @param {Array<number>} selectedMenuIds - 현재 선택된 ID 배열
 * @param {function} setSelectedMenuIds - ID 배열을 업데이트하는 setter 함수
 * @param {string} subscriptionType - ProductDetailEditModal에서 전달받은 구독권 유형 ('BASIC', 'STANDARD', 'PREMIUM')
 */
const MenuSelect = ({
  allMenus,
  selectedMenuIds,
  setSelectedMenuIds,
  subscriptionType,
}) => {
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

  // 구독권 유형에 따라 표시할 메뉴 타입을 결정
  let allowedMenuTypes = [];
  if (subscriptionType === 'PREMIUM') {
    allowedMenuTypes = ['BEVERAGE', 'DESSERT'];
  } else if (subscriptionType === 'BASIC' || subscriptionType === 'STANDARD') {
    allowedMenuTypes = ['BEVERAGE'];
  }

  // 전체 메뉴 목록을 필터링
  const displayMenus = allMenus.filter((menu) =>
    allowedMenuTypes.includes(menu.menuType)
  );

  // 필터링된 메뉴가 없을 때 (예: STANDARD인데 BEVERAGE가 없거나, subscriptionType이 유효하지 않을 경우)
  if (displayMenus.length === 0) {
    // allowedMenuTypes가 비어있으면 '유효하지 않은 유형'으로 간주
    if (allowedMenuTypes.length === 0) {
      return (
        <Typography
          color="text.secondary"
          sx={{ p: 2, border: '1px dashed #eee' }}
        >
          구독권 유형이 설정되지 않았거나 유효하지 않습니다.{' '}
        </Typography>
      );
    } // 유효한 타입인데 메뉴가 없을 경우 (원래 목적의 메시지)

    const typeLabel = allowedMenuTypes.join(' 또는 ');
    return (
      <Typography
        color="text.secondary"
        sx={{ p: 2, border: '1px dashed #eee' }}
      >
        선택된 **{subscriptionType}** 구독권 유형에 맞는 메뉴(
        {typeLabel})가 없습니다.{' '}
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

      {displayMenus.map((menu) => (
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
