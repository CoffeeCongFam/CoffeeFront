// ManageProductSoC/MenuSelect.jsx
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Grid,
} from '@mui/material';

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

  // 판매중인 상태('Y")인 메뉴만 필터링
  const activeMenus = allMenus.filter((menu) => menu.menuStatus === 'Y');

  // 활성 메뉴가 전혀 없다면 메시지를 띄운다.
  if (activeMenus.length === 0) {
    return (
      <Typography
        color="error"
        sx={{
          p: 2,
          border: '1px dashed #ff9999',
          backgroundColor: '#d62d2dff',
        }}
      >
        현재 판매중인 메뉴가 없습니다. 메뉴 관리 페이지에서 메뉴를 활성화해야
        구독권에 포함될 수 있습니다.
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

  // 필터링된 활성 메뉴 목록(activeMenus)을 타입별로 필터링 및 그룹화
  const groupedMenus = allowedMenuTypes.reduce((acc, type) => {
    acc[type] = allMenus.filter((menu) => menu.menuType === type);
    return acc;
  }, {});

  const hasDisplayMenus = Object.values(groupedMenus).some(
    (list) => list.length > 0
  );

  // 필터링된 메뉴가 없을 때의 처리
  if (!hasDisplayMenus) {
    if (allowedMenuTypes.length === 0) {
      return (
        <Typography
          color="text.secondary"
          sx={{ p: 2, border: '1px dashed #eee' }}
        >
          구독권 유형이 설정되지 않았거나 유효하지 않습니다.{' '}
        </Typography>
      );
    }

    const typeLabel = allowedMenuTypes
      .map((type) =>
        type === 'BEVERAGE' ? '음료' : type === 'DESSERT' ? '디저트' : type
      )
      .join(' 또는 ');

    return (
      <Typography
        color="text.secondary"
        sx={{ p: 2, border: '1px dashed #eee' }}
      >
        선택된 **{subscriptionType}** 구독권 유형에 맞는 메뉴({typeLabel})가
        없습니다.{' '}
      </Typography>
    );
  }

  const menuTypeLabels = {
    BEVERAGE: '음료',
    DESSERT: '디저트',
  };

  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid #ddd',
        borderRadius: 1,
        maxHeight: 400, // 높이를 조금 늘려 두 종류의 메뉴를 표시하기 쉽게 조정
        overflowY: 'auto',
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        구독권 포함 메뉴 선택 (다중 선택, 소비자에겐 '택 1' 옵션으로 제공)
      </Typography>

      {/* 타입별 그룹 렌더링 */}
      {Object.entries(groupedMenus).map(([menuType, menus]) => {
        if (menus.length === 0) return null; // 해당 타입 메뉴가 없으면 건너뛰기

        return (
          <Box key={menuType} sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{ mt: 1, borderBottom: '1px solid #eee', pb: 0.5 }}
            >
              {menuTypeLabels[menuType] || menuType}
            </Typography>

            {/* Grid 컨테이너: 가로 나열, 자동으로 다음 줄로 래핑, 간격 적용 */}
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {menus.map((menu) => (
                // Grid Item: 전체 12칸 중 4칸(모바일: 12칸)을 차지하여 3개씩 나열되도록 설정
                <Grid item key={menu.menuId} xs={12} sm={6} md={4} lg={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedMenuIds.includes(menu.menuId)}
                        onChange={() => handleToggle(menu.menuId)}
                        size="small"
                      />
                    }
                    label={`${menu.menuName}`}
                    // 체크박스가 라벨과 함께 깔끔하게 보이도록 Box 전체를 사용
                    sx={{ width: '100%', m: 0, justifyContent: 'flex-start' }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
};

export default MenuSelect;
