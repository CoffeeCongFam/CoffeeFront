import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// 분리된 컴포넌트와 서비스 임포트
import MenuTable from './ManageMenuSoC/MenuTable';
import MenuRegistModal from './ManageMenuSoC/MenuRegistModal';
import MenuEditModal from './ManageMenuSoC/MenuEditModal';
import useUserStore from '../../stores/useUserStore';

// axios 전까지만 갖다 쓰는 용 ***
// const CURRENT_STORE_ID = 1;

// axios 로직을 담고 있는 서비스 함수 임포트
import {
  fetchStoreMenus,
  registerMenu,
  updateMenu,
} from './ManageMenuSoC/MenuService';

// 🚩 ManageMenu.jsx는 컨테이너로 모든 CRUD 관련 API 호출(axios 사용) 밑 상태 관리

export default function ManageMenu() {
  const partnerStoreId = useUserStore((state) => state.partnerStoreId);
  const [menuList, setMenuList] = useState([]);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

  // 수정 관련 상태 (수정 모달 구현 시 사용)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);

  // 1. 메뉴 리스트 조회 (READ)
  const loadMenus = async (storeId) => {
    if (!storeId || storeId <= 0) {
      console.log(
        '⚠️ partnerStoreId 로드 대기 중이거나 유효하지 않아 메뉴 로드를 건너뜁니다.'
      );
      return;
    }

    try {
      // API 호출: 매장 메뉴 조회
      const data = await fetchStoreMenus(storeId);
      setMenuList(
        data.filter((menu) => {
          return !menu.deletedAt;
        })
      );
    } catch (error) {
      console.error('메뉴 리스트 로딩 실패:', error);
      // alert("메뉴 목록을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    // 🚨 partnerStoreId가 로드된 후에만 loadMenus 실행
    if (partnerStoreId && partnerStoreId > 0) {
      loadMenus(partnerStoreId);
    }
  }, [partnerStoreId]);

  // 2. 신규 메뉴 등록 (CREATE)
  const handleRegisterMenu = async (formData, selectedFile) => {
    // menuService.js의 registerMenu가 FormData를 처리합니다.
    try {
      // API 호출: 메뉴 등록

      const success = await registerMenu(formData, selectedFile);

      if (success) {
        await loadMenus(partnerStoreId);
        // 등록 성공 시, 전체 메뉴 리스트를 다시 불러와
      }
    } catch (error) {
      console.error('메뉴 등록 실패:', error);
      throw error; // 모달에서 catch하여 실패 알림
    }
  };

  // 3. 메뉴 수정 클릭 핸들러 (UPDATE - Start)
  const handleEditClick = (menu) => {
    setEditingMenu(menu);
    setIsEditModalOpen(true);
  };

  // 5. 메뉴 수정 완료 핸들러 (UPDATE - End)
  const handleUpdateMenu = async (menuId, formData, selectedFile) => {
    try {
      // API 호출: 메뉴 수정
      const success = await updateMenu(menuId, formData, selectedFile);

      if (success) {
        // 🚩 [핵심 수정] 수정 성공 시, 전체 메뉴 리스트를 다시 불러옵니다.
        await loadMenus(partnerStoreId);
        // 모달 닫기
        setIsEditModalOpen(false);
      } else {
        throw new Error('서버에서 수정 실패 응답');
      }
    } catch (error) {
      console.error('메뉴 수정 실패:', error);
      alert('메뉴 수정에 실패했습니다.');
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, minHeight: '100vh', bgcolor: 'background.default' }}
    >
      {/* 상단 헤더 및 버튼 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          메뉴 관리
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setIsRegModalOpen(true)} // ⬅️ 모달 상태 관리
          sx={{ fontWeight: 'bold' }}
        >
          메뉴 등록
        </Button>
      </Box>

      {/* 메뉴 리스트 테이블 (MenuTable 컴포넌트로 분리) */}
      <MenuTable
        menuList={menuList}
        onEditClick={handleEditClick} // ⬅️ 수정 로직 연결
      />

      {/* 🌟 신규 메뉴 등록 모달 */}
      <MenuRegistModal
        open={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        onRegister={handleRegisterMenu} // ⬅️ 등록 API 연결
      />

      {/* 🛠️ 메뉴 수정 모달  */}
      <MenuEditModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editingMenu={editingMenu}
        onUpdate={handleUpdateMenu}
      />
    </Container>
  );
}
