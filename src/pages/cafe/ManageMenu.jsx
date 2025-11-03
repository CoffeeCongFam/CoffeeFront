import React, { useState } from "react";
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
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

// 🚩 더미 데이터
const DUMMY_STORE_MENUS = [
  {
    menuId: "M001",
    partnerStoreId: "S001",
    menuName: "아메리카노",
    price: 3500,
    menuImg: "https://placehold.co/40x40/4CAF50/FFFFFF?text=☕",
    menuDesc: "가장 기본적인 에스프레소 추출 음료입니다.",
    menuStatus: "ACTIVE",
    menuType: "BEVERAGE",
    createdAt: "2025-10-10T09:00:00Z",
    updatedAt: "2025-10-31T14:44:25.581717",
  },
  {
    menuId: "M002",
    partnerStoreId: "S001",
    menuName: "카페 라떼",
    price: 4500,
    menuImg: "https://placehold.co/40x40/2196F3/FFFFFF?text=🥛",
    menuDesc: "신선한 우유와 에스프레소의 부드러운 조화.",
    menuStatus: "ACTIVE",
    menuType: "BEVERAGE",
    createdAt: "2025-10-10T09:05:00Z",
    updatedAt: "2025-10-31T14:44:25.581717",
  },
  {
    menuId: "M003",
    partnerStoreId: "S001",
    menuName: "민트 초코 라떼",
    price: 5500,
    menuImg: "https://placehold.co/40x40/FF9800/FFFFFF?text=🍫",
    menuDesc: "민트와 초콜릿의 상쾌하고 달콤한 만남.",
    menuStatus: "INACTIVE",
    menuType: "BEVERAGE",
    createdAt: "2025-10-15T15:30:00Z",
    updatedAt: "2025-10-31T14:44:25.581717",
  },
  {
    menuId: "M004",
    partnerStoreId: "S001",
    menuName: "플레인 크로와상",
    price: 3000,
    menuImg: "https://placehold.co/40x40/607D8B/FFFFFF?text=🥐",
    menuDesc: "겉은 바삭하고 속은 촉촉한 기본 크로와상입니다.",
    menuStatus: "ACTIVE",
    menuType: "DESSERT",
    createdAt: "2025-10-20T11:00:00Z",
    updatedAt: "2025-10-31T14:44:25.581717",
  },
  {
    menuId: "M005",
    partnerStoreId: "S001",
    menuName: "클래식 브라우니",
    price: 4000,
    menuImg: "https://placehold.co/40x40/795548/FFFFFF?text=🧁",
    menuDesc: "진한 초콜릿의 풍미가 가득한 브라우니.",
    menuStatus: "ACTIVE",
    menuType: "DESSERT",
    createdAt: "2025-10-20T11:05:00Z",
    updatedAt: "2025-10-31T14:44:25.581717",
  },
];

// =========================================================
// 3. 유틸리티 함수
// =========================================================

const formatPrice = (price) => price.toLocaleString("ko-KR") + "원";

const getMenuTypeLabel = (type) => {
  switch (type) {
    case "BEVERAGE":
      return "음료";
    case "DESSERT":
      return "디저트";
    default:
      return "기타";
  }
};

const getMenuStatusChipProps = (status) => {
  switch (status) {
    case "ACTIVE":
      return { label: "판매 중", color: "success" };
    case "INACTIVE":
      return { label: "판매 중지", color: "error" };
    default:
      return { label: "상태 확인 필요", color: "warning" };
  }
};

// =========================================================
// 4. 메뉴 등록 모달 컴포넌트
// =========================================================

const MENU_TYPES = [
  { value: "BEVERAGE", label: "음료" },
  { value: "DESSERT", label: "디저트" },
];

/**
 * 메뉴 등록 모달 컴포넌트
 */
function MenuRegistrationModal({ open, onClose, onRegister }) {
  const [formData, setFormData] = useState({
    menuName: "",
    price: "",
    menuDesc: "",
    menuType: "BEVERAGE",
    menuImg: "https://placehold.co/40x40/CCCCCC/333333?text=New", // 기본 이미지 placeholder
    menuStatus: "ACTIVE",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.menuName.trim()) {
      tempErrors.menuName = "메뉴명을 입력해야 합니다.";
      isValid = false;
    }

    const priceNum = parseInt(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      tempErrors.price = "유효한 가격(숫자)을 입력해야 합니다.";
      isValid = false;
    }

    if (!formData.menuDesc.trim()) {
      tempErrors.menuDesc = "메뉴 설명을 입력해야 합니다.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      const newMenu = {
        ...formData,
        price: parseInt(formData.price),
        // menuId와 partnerStoreId는 시퀀스/PK 원칙에 따라 임시로 할당 (실제 DB에서 처리)
        menuId: `M${Date.now()}`,
        partnerStoreId: "S001", // 현재 로그인된 점주 ID로 가정
        createdAt: new Date().toISOString(),
      };

      onRegister(newMenu);
      // 성공 후 폼 초기화
      setFormData({
        menuName: "",
        price: "",
        menuDesc: "",
        menuType: "BEVERAGE",
        menuImg: "https://placehold.co/40x40/CCCCCC/333333?text=New",
        menuStatus: "ACTIVE",
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ bgcolor: "primary.main", color: "white", fontWeight: "bold" }}
      >
        <Typography variant="h6" component="span" fontWeight="bold">
          신규 메뉴 등록
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          {/* 메뉴 활성 상태 (등록 시 무조건 ACTIVE) */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="menu-status-label">메뉴 활성 상태</InputLabel>
              <Select
                labelId="menu-status-label"
                id="menuStatus"
                name="menuStatus"
                value={formData.menuStatus}
                label="메뉴 활성 상태"
                onChange={handleChange}
                disabled
              >
                <MenuItem value="ACTIVE">ACTIVE (판매 중)</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE (판매 중지)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* 메뉴명 */}
          <Grid item xs={12}>
            <TextField
              autoFocus
              margin="dense"
              id="menuName"
              name="menuName"
              label="메뉴명"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.menuName}
              onChange={handleChange}
              error={!!errors.menuName}
              helperText={errors.menuName}
            />
          </Grid>

          {/* 가격 */}
          <Grid item xs={7}>
            <TextField
              margin="dense"
              id="price"
              name="price"
              label="가격 (원)"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.price}
              onChange={handleChange}
              error={!!errors.price}
              helperText={errors.price}
              inputProps={{ min: 1 }}
            />
          </Grid>

          {/* 메뉴 타입 */}
          <Grid item xs={5}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="menu-type-label">메뉴 타입</InputLabel>
              <Select
                labelId="menu-type-label"
                id="menuType"
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

          {/* 메뉴 설명 */}
          <Grid item xs={12}>
            <TextField
              margin="dense"
              id="menuDesc"
              name="menuDesc"
              label="메뉴 상세 설명"
              type="text"
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

          {/* 메뉴 이미지 URL */}
          <Grid item xs={12}>
            <TextField
              margin="dense"
              id="menuImg"
              name="menuImg"
              label="메뉴 이미지 URL"
              type="url"
              fullWidth
              variant="outlined"
              value={formData.menuImg}
              onChange={handleChange}
              helperText="등록된 이미지는 40x40 픽셀로 표시됩니다. (임시 이미지)"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: "1px solid #eee" }}>
        <Button onClick={onClose} variant="outlined" color="error">
          취소
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          메뉴 등록 완료
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// =========================================================
// 5. 메인 컴포넌트
// =========================================================

export default function ManageMenu() {
  const [menuList, setMenuList] = useState(DUMMY_STORE_MENUS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 모달 열기/닫기 핸들러
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // 메뉴 등록 완료 처리 핸들러
  const handleRegisterMenu = (newMenuData) => {
    // 실제로는 여기서 API 호출 (POST)을 수행합니다.
    console.log("새 메뉴 등록 시도:", newMenuData);

    // 프론트엔드 더미 데이터에 추가 (최신 등록 메뉴를 맨 위에)
    setMenuList((prev) => [newMenuData, ...prev]);
  };

  const tableHeaders = [
    { label: "ID", align: "center", width: "6%" },
    { label: "이미지", align: "center", width: "8%" },
    { label: "메뉴명", align: "left", width: "20%" },
    { label: "가격", align: "right", width: "10%" },
    { label: "타입", align: "center", width: "10%" },
    { label: "활성 상태", align: "center", width: "12%" },
    { label: "설명", align: "left", width: "24%" },
    { label: "관리", align: "center", width: "10%" },
  ];

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, minHeight: "100vh", bgcolor: "#f5f5f5" }}
    >
      {/* 상단 헤더 및 버튼 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold">
          메뉴 관리
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleOpenModal}
        >
          메뉴 등록
        </Button>
      </Box>

      {/* 메뉴 리스트 테이블 */}
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 1000 }} aria-label="메뉴 관리 테이블">
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              {tableHeaders.map((header) => (
                <TableCell
                  key={header.label}
                  align={header.align}
                  sx={{ fontWeight: "bold", width: header.width }}
                >
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {menuList.length > 0 ? (
              menuList.map((menu) => {
                const statusProps = getMenuStatusChipProps(menu.menuStatus);
                return (
                  <TableRow
                    key={menu.menuId}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell align="center">{menu.menuId}</TableCell>
                    <TableCell align="center">
                      <Avatar
                        src={menu.menuImg}
                        alt={menu.menuName}
                        sx={{ width: 40, height: 40, margin: "auto" }}
                      />
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: "medium" }}>
                      {menu.menuName}
                    </TableCell>
                    <TableCell align="right">
                      {formatPrice(menu.price)}
                    </TableCell>
                    <TableCell align="center">
                      {getMenuTypeLabel(menu.menuType)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        {...statusProps}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                    >
                      {menu.menuDesc}
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined" sx={{ mr: 1 }}>
                        수정
                      </Button>
                      <Button size="small" variant="outlined" color="error">
                        삭제
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                  sx={{ py: 4, color: "text.disabled" }}
                >
                  등록된 메뉴가 없습니다. 메뉴를 등록해 주세요.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 🌟 메뉴 등록 모달 */}
      <MenuRegistrationModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onRegister={handleRegisterMenu}
      />
    </Container>
  );
}
