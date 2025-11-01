import {
  Box,
  IconButton,
  Typography,
  Fade,
  Backdrop,
  Button,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ForwardIcon from "@mui/icons-material/Forward";
import ErrorIcon from "@mui/icons-material/Error";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SubscriptItem from "../../components/customer/purchase/SubscriptionItem";
import SearchGiftReceiver from "../../components/customer/purchase/SearchGiftReceiver";
import useAppShellMode from "../../hooks/useAppShellMode";

function GiftSubscriptionPage() {
  const { isAppLike } = useAppShellMode();
  const { subId } = useParams();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState({});
  const [isLoading, setIsLoading] = useState(false); // 결제 처리 로딩 상태
  const [payOpen, setPayOpen] = useState(false); // 결제 패널 열림/닫힘

  const [keyword, setKeyword] = useState(""); // 유저 전화번호 검색
  const [receiver, setReceiver] = useState(null); // 받는 사람
  const [searchOpen, setSearchOpen] = useState(true);
  const [searchResults, setSearchResults] = useState([]); // 검색 결과

  useEffect(() => {
    console.log(subId + "로 구독권 정보 가져오기");
    // TODO: 실제 API 호출
    setSubscription({
      subId: 3,
      store: {
        storeId: 1,
        storeName: "카페 모나카",
        storeImage: "https://picsum.photos/400/400",
      },
      price: 19900,
      subImage:
        "https://images.unsplash.com/photo-1603025014859-2aa06fae7a08?w=600&q=80",
      subName: "프리미엄 구독권",
      subType: "PREMIUM",
      isExpired: "N",
      limitEntity: 10,
      stock: 10,
      description: "구독권에 대한 간단한 설명",
      isGift: "Y",
      maxDailyUsage: 2, // 일일 사용 가능 횟수
      isSubscribed: "Y",
    });
  }, [subId]);

  function handleBack() {
    // 뒤로 가기 이동
    navigate(-1);
  }

  async function confirmPayment() {
    // 결제 진행
    setIsLoading(true);
    setPayOpen(false);

    try {
      // TODO: 실제 결제 처리 API 호출 (예: await api.purchase(subscription.subId))
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기 (로딩 효과)

      const purchaseId = 1; // 실제 purchaseId 받아오기
      navigate(`/me/purchase/${purchaseId}/complete`);
    } catch (error) {
      console.error("결제 실패:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearch(phone) {
    console.log("검색할 전화번호", phone);

    // TODO: 실제 API 호출로 교체
    // 여기선 더미로 필터된 목록처럼 만들게요
    const dummyMembers = [
      { id: 1, name: "김민지", phone: "010-1111-2222" },
      { id: 2, name: "박지현", phone: "010-1111-3333" },
      { id: 3, name: "정민선", phone: "010-9999-0000" },
    ];

    const filtered = dummyMembers.filter(
      (m) =>
        m.phone.includes(phone.replaceAll("-", "")) || m.phone.includes(phone)
    );

    setSearchResults(filtered);
  }

  function handleSelectReceiver(member) {
    setReceiver(member);
    searchOpen(false);
    // 선택 후 리스트 닫고 싶으면 비워도 됨
    // setSearchResults([]);
  }
  return (
    <>
      <Box
        sx={{
          p: 3,
          pb:  isAppLike ? "100px" : 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* 뒤로가기 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: 900,
          }}
        >
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>

        {/* 제목 */}
        <Box sx={{ textAlign: "center", mb: 2, width: "100%", maxWidth: 900 }}>
          <Typography variant="h6">선물하기</Typography>
        </Box>

        {/* 선택한 구독권 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: 900,
            mt: 2,
            gap: 2,
          }}
        >
          <SubscriptItem subscription={subscription} />

          {/* 보내는 사람 / 받는 사람 */}
          <Box
            sx={{
              display: "flex",
              flexDirection: isAppLike ? "column" : "row",
              gap: 2,
              width: "100%",
              maxWidth: "900px",
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            {/* 보내는 사람 */}
            <Box
              sx={{
                flex: 1,
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>보내는 사람</Typography>
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  backgroundColor: "#f6f6f6ff",
                  borderRadius: "10px",
                  // height: "100%",
                  height: "fit-content",
                  padding: "15px 25px",
                }}
              >
                <AccountCircleIcon />
                {"보내는 유저 이름"}
              </Box>
            </Box>

            <Box
              sx={{
                width: 40,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ForwardIcon />
            </Box>

            {/* 받는 사람 */}
            <Box
              sx={{
                flex: 1,
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>받는 사람</Typography>
              {/* 선택된 사람 출력 */}
              {receiver && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1.2,
                    borderRadius: 1,
                    backgroundColor: "#f4f4f4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    // height: "100%",
                    height: "fit-content",
                    padding: "15px 25px",
                  }}
                >
                  <Box sx={{ display: 'flex', gap: "10px"}}>
                  <AccountCircleIcon />
                  <Typography>{receiver.name}</Typography>
                  </Box>
                  <IconButton
                    onClick={() => {
                      setSearchOpen(true);
                      setReceiver(null);
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                </Box>
              )}
              {receiver === null && searchOpen && (
                <SearchGiftReceiver
                  keyword={keyword}
                  setKeyword={setKeyword}
                  handleSearch={handleSearch}
                />
              )}

              {/* 검색 결과 목록 */}
              {receiver === null && searchResults.length > 0 && (
                <Box
                  sx={{
                    mt: 1,
                    border: "1px solid #eee",
                    borderRadius: 1,
                    backgroundColor: "white",
                    maxHeight: 180,
                    overflowY: "auto",
                  }}
                >
                  {searchResults.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 1.2,
                        py: 1,
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "#f9f9f9",
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.phone}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        onClick={() => handleSelectReceiver(item)}
                      >
                        선택
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* 유의사항 */}
        <Box
          sx={{
            mt: 3,
            width: "100%",
            maxWidth: 900,
            bgcolor: "#fffef6",
            border: "1px solid #fff2c5",
            borderRadius: 2,
            py: 2,
            px: 5,
            textAlign: "left", // ✅ 내용은 왼쪽 정렬 유지 (가독성)
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <ErrorIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              유의사항
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              • 본 구독권은 {subscription?.store?.storeName} 매장 전용으로 사용
              가능합니다.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 결제일 기준 30일간 이용 가능하며, 중도 해지는 불가합니다.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 1일 {subscription?.maxDailyUsage}회 제공 기준이며, 일부 메뉴는
              추가 금액이 발생할 수 있습니다.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 선물하기로 받은 구독권은 양도가 제한될 수 있습니다.
            </Typography>
          </Box>
        </Box>

        {/* 하단 결제 버튼 */}
        <Box
          sx={{
            mt: 4,
            width: "100%",
            maxWidth: 900,
            display: "flex",
            justifyContent: "right",
          }}
        >
          <Button
            onClick={() => setPayOpen(true)}
            sx={{
              backgroundColor: "black",
              color: "white",
              px: 4,
              "&:hover": { backgroundColor: "#333" },
            }}
          >
            선물 보내기
          </Button>
        </Box>
      </Box>

      {/* ✅ 결제 선택 패널 */}
      <Backdrop
        open={payOpen}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        onClick={() => setPayOpen(false)}
      >
        <Fade in={payOpen}>
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              mx: "auto",
              maxWidth: 820,
              bgcolor: "#5e5e5e",
              borderRadius: "24px 24px 0 0",
              minHeight: 320,
              px: 3,
            }}
          >
            {/* 상단 닫기 */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <IconButton onClick={() => setPayOpen(false)}>
                <CloseIcon sx={{ color: "white" }} />
              </IconButton>
            </Box>

            {/* 카드 선택 영역 (더미) */}
            <Box
              sx={{
                bgcolor: "#dcdcdc",
                border: "4px solid rgba(255,128,0,0.4)",
                borderRadius: 4,
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
                color: "#666",
                mb: 2,
                cursor: "pointer",
              }}
            >
              신한 카드
            </Box>

            {/* 밑에 실제 결제 버튼 */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", pb: isAppLike ? 11 : 0 }}>
              <Box
                sx={{
                  bgcolor: "white",
                  color: "black",
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={confirmPayment}
              >
                결제 진행
              </Box>
            </Box>
          </Box>
        </Fade>
      </Backdrop>

      {/* 결제 로딩 화면 */}
      <Backdrop
        open={isLoading}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.modal + 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress color="inherit" />
        <Typography variant="body1" sx={{ mt: 1 }}>
          결제 진행 중입니다...
        </Typography>
      </Backdrop>
    </>
  );
}

export default GiftSubscriptionPage;
