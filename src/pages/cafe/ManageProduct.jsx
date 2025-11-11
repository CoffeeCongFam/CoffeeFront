// `ManageProduct.jsx`: 데이터를 불러와 상태를 관리하고, 모든 자식 컴포넌트의 동작을 제어합니다.
// `ProductList.jsx`: 개별 카드를 렌더링합니다.
// `ProductRegistModal.jsx` / `ProductDetailEditModal.jsx`**: 등록 및 수정 UI를 제공합니다.
// `ProductService.js`: 가상의 백엔드 API 호출 및 데이터 처리 로직을 담당합니다.

// 상태 관리와 비즈니스 로직(API 호출, 모달 제어)를 담당하는 컨테이너 역할
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
// 🚩 모든 서브 컴포넌트와 서비스가 같은 디렉토리에 있다고 가정합니다.
import ProductList from "./ManageProductSoC/ProductList";
import ProductDetailEditModal from "./ManageProductSoC/ProductDetailEditModal";
import ProductRegistModal from "./ManageProductSoC/ProductRegistModal";
import {
  fetchSubscriptions,
  registerSubscription,
  updateSubscription,
  fetchAllMenus,
} from "./ManageProductSoC/ProductService";
import useUserStore from "../../stores/useUserStore";

/**
 * 구독권 관리 페이지 (컨테이너 컴포넌트)
 * - 데이터 상태 관리 (subscriptions)
 * - API 호출 로직 (fetch, register, update)
 * - 모달 제어 로직
 */
export default function ManageProduct() {
  const partnerStoreId = useUserStore((state) => state.partnerStoreId);
  // 1. 상태 관리
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allMenus, setAllMenus] = useState([]); // 매장의 전체 메뉴 리스트

  // 모달 관리 상태
  const [isRegistModalOpen, setIsRegistModalOpen] = useState(false);
  const [isDetailEditModalOpen, setIsDetailEditModalOpen] = useState(false);

  // 현재 상세/수정 모달에 보여줄 선택된 구독권 데이터
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  // 🚩 loadSubscriptions 함수 (로그 추가)
  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSubscriptions();
      setSubscriptions(data);
    } catch (err) {
      console.error("구독권 목록 로드 실패:", err);
      setError("구독권 목록을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🚩 메뉴 로드 함수
  const loadAllMenus = useCallback(async () => {
    try {
      const menuData = await fetchAllMenus(partnerStoreId);
      setAllMenus(menuData);
    } catch (err) {
      console.error("전체 메뉴 목록 로드 실패:", err); // 메뉴 로드 실패는 별도 에러 처리 또는 무시
    }
  }, []);

  // 3. 컴포넌트 마운트 시 데이터 로드 로직 통합
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 🚩 메뉴 로딩과 구독권 로딩을 병렬로 처리 (두 함수를 모두 호출)
        await Promise.all([
          loadSubscriptions(), // 기존 구독권 로드
          loadAllMenus(), // **새로 추가된 메뉴 로드**
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [loadSubscriptions, loadAllMenus]);

  // 4. 모달 제어 핸들러
  const handleOpenRegistModal = () => setIsRegistModalOpen(true);
  const handleCloseRegistModal = () => setIsRegistModalOpen(false);

  // ProductList에서 카드를 클릭했을 때 호출됨
  const handleOpenDetailEditModal = (subscription) => {
    setSelectedSubscription(subscription);
    setIsDetailEditModalOpen(true);
  };
  const handleCloseDetailEditModal = () => {
    setIsDetailEditModalOpen(false);
    setSelectedSubscription(null); // 모달 닫을 때 선택된 구독권 초기화
  };

  // 5. 등록 로직
  const handleRegisterSubscription = async (data, imageFile, menuIds) => {
    setIsLoading(true);

    const dataToSend = {
      ...data,
      menuIds: menuIds, // 백엔드로 보낼 menuIds 추가됨
    };

    try {
      const success = await registerSubscription(dataToSend, imageFile);
      // 새로운 구독권을 리스트 상태에 추가(중복 방어 로직 추가)

      if (success) {
        // null 객체를 추가하는 대신,
        await loadSubscriptions(); // 구독권 리스트 전체를 다시 불러오는 함수
        handleCloseRegistModal(); // 성공 시 모달 닫기
      }
    } catch (err) {
      console.error("구독권 등록 실패:", err);
      setError("구독권 등록 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 6. 수정 로직
  const handleUpdateSubscription = async (id, updatedData) => {
    const confirmed = window.confirm("정말 이 구독권을 수정하시겠습니까?");
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await updateSubscription(id, updatedData);

      if (response.status === 200) {
        await loadSubscriptions();
        handleCloseDetailEditModal();
      }
    } catch (err) {
      console.error(`구독권 수정 실패 (ID: ${id}):`, err);
      setError("구독권 수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        mb: 4,
        borderRadius: 2,
        border: "1px solid #ffe0b2",
        p: 2,
        backgroundColor: "white",
      }}
    >
      <Box
        mb={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          sx={{ color: "#334336" }}
        >
          구독권 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenRegistModal}
          disabled={isLoading}
          sx={{
            height: 56,
            bgcolor: "#334336",
            color: "#fff9f4",
            "&:hover": {
              bgcolor: "#334336",
              opacity: 0.9,
            },
            "&:disabled": {
              bgcolor: "#ccc",
              color: "#666",
            },
          }}
        >
          새 구독권 등록
        </Button>
      </Box>

      {/* 에러 메시지 표시 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 로딩 상태 표시 */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress sx={{ color: "#334336" }} />
        </Box>
      )}

      {/* 구독권 리스트 표시 */}
      {!isLoading && subscriptions && (
        <ProductList
          subscriptions={subscriptions}
          onCardClick={handleOpenDetailEditModal} // 카드를 클릭하면 상세 모달 열기
          isLoading={isLoading}
        />
      )}

      {/* 등록 모달 */}
      {isRegistModalOpen && (
        <ProductRegistModal
          open={isRegistModalOpen}
          onClose={handleCloseRegistModal}
          allMenus={allMenus}
          onRegister={handleRegisterSubscription}
        />
      )}

      {/* 상세 조회 및 수정 통합 모달 */}
      {selectedSubscription && (
        <ProductDetailEditModal
          open={isDetailEditModalOpen}
          subscription={selectedSubscription}
          onClose={handleCloseDetailEditModal}
          allMenus={allMenus}
          onSave={handleUpdateSubscription} // 수정 완료 버튼 클릭 시 호출
        />
      )}
    </Container>
  );
}
