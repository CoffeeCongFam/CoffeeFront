// 데이터를 받아 테이블을 렌더링 하는 역할
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  // MenuRegistrationModal에서 사용되는 MUI 컴포넌트들
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
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { CloudUpload } from '@mui/icons-material';

const formatPrice = (price) => {
  // price가 유효한 숫자(0 포함)인지 확인합니다.
  if (typeof price === 'number' && !isNaN(price)) {
    // 0 미만의 값(DB/API 오류 가능성)도 포함하여 toLocaleString 처리
    return price.toLocaleString('ko-KR') + '원';
  }
  // 유효하지 않은 경우, 오류 대신 대체 텍스트를 반환합니다.
  return '가격 정보 없음';
  // 또는 '0원' 등으로 설정할 수도 있습니다.
};
const getMenuTypeLabel = (type) => {
  switch (type) {
    case 'BEVERAGE':
      return '음료';
    case 'DESSERT':
      return '디저트';
    default:
      return '기타';
  }
};

const getMenuStatusChipProps = (status) => {
  switch (status) {
    case 'Y':
      return { label: '판매 중', color: 'success' };
    case 'N':
      return { label: '판매 중지', color: 'error' };
    default:
      return { label: '상태 확인 필요', color: 'warning' };
  }
};

const tableHeaders = [
  { label: 'ID', align: 'center', width: '6%' },
  { label: '이미지', align: 'center', width: '8%' },
  { label: '메뉴명', align: 'left', width: '20%' },
  { label: '가격', align: 'right', width: '10%' },
  { label: '타입', align: 'center', width: '10%' },
  { label: '활성 상태', align: 'center', width: '12%' },
  { label: '설명', align: 'left', width: '24%' },
  { label: '관리', align: 'center', width: '10%' },
];

// 메뉴 리스트를 표시하는 테이블 컴포넌트
export default function MenuTable({ menuList, onEditClick }) {
  const sortedByCreatedAtMenuList = [...(menuList || [])].sort((a, b) => {
    const dataA = new Date(a.createdAt);
    const dataB = new Date(b.createdAt);

    // 내림차순 b - a
    return dataB - dataA;
  });

  return (
    <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
      <Table sx={{ minWidth: 1000 }} aria-label="메뉴 관리 테이블">
        <TableHead sx={{ backgroundColor: 'action.hover' }}>
          <TableRow>
            {tableHeaders.map((header) => (
              <TableCell
                key={header.label}
                align={header.align}
                sx={{
                  fontWeight: 'bold',
                  width: header.width,
                  color: 'text.primary',
                }}
              >
                {header.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {sortedByCreatedAtMenuList.length > 0 ? (
            sortedByCreatedAtMenuList.map((menu) => {
              const statusProps = getMenuStatusChipProps(menu.menuStatus);
              return (
                <TableRow key={menu.menuId} hover>
                  <TableCell align="center" sx={{ fontSize: '0.9rem' }}>
                    {menu.menuId}
                  </TableCell>
                  <TableCell align="center">
                    <Avatar
                      src={menu.menuImg}
                      alt={menu.menuName}
                      sx={{
                        width: 40,
                        height: 40,
                        margin: 'auto',
                        border: '1px solid #eee',
                      }}
                    />
                  </TableCell>
                  <TableCell align="left" sx={{ fontWeight: 'medium' }}>
                    {menu.menuName}
                  </TableCell>
                  <TableCell align="right">{formatPrice(menu.price)}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.9rem' }}>
                    {getMenuTypeLabel(menu.menuType)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      {...statusProps}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
                  >
                    {menu.menuDesc}
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      display="flex"
                      justifyContent="center" // 수평 중앙 정렬
                      alignItems="center" // 수직 중앙 정렬 (선택 사항, 깔끔한 정렬)
                      gap={1} // 버튼 사이 간격 (theme.spacing(1)에 해당)
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        // sx={{ mr: 1 }} // ⬅️ Box의 gap 속성을 사용하므로 제거합니다.
                        onClick={() => onEditClick(menu)} // ⬅️ 부모 함수 호출
                      >
                        수정
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={8}
                align="center"
                sx={{ py: 4, color: 'text.disabled' }}
              >
                등록된 메뉴가 없습니다. 메뉴를 등록해 주세요.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
