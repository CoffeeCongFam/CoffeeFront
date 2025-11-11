import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  Chip,
  Divider,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CoffeeIcon from "@mui/icons-material/Coffee";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CakeIcon from "@mui/icons-material/Cake";
import {
  ExpandLess,
  ExpandMore,
  ConfirmationNumber,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useAppShellMode from "../../../hooks/useAppShellMode";
import SubTypeChip from "../../common/SubTypeChip";
import SubscriptionCard from "../../../components/customer/cafe/SubscriptionCard";

const subDescBoxStyle = {
  backgroundColor: "#F2F2F2",
  padding: "12px 14px",
  borderRadius: "8px",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem",
  justifyContent: "space-around",
};

function CafeSubscriptionList({ subscriptions = [] }) {
  const navigate = useNavigate();
  const { isAppLike } = useAppShellMode();

  const [filter, setFilter] = useState("ALL");
  const [openMenuId, setOpenMenuId] = useState(null); // 카드별 메뉴 열기
  const [openDescId, setOpenDescId] = useState(null); // 구독권 설명
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0); // 캐러셀 현재 인덱스

  // 필터나 데이터 변경 시 인덱스/스크롤 초기화 한 번 더 안전하게
  useEffect(() => {
    setCurrentIndex(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [filter, subscriptions]);

  // 타입별 개수 계산
  const counts = useMemo(() => {
    const base = {
      ALL: subscriptions.length,
      STANDARD: 0,
      BASIC: 0,
      PREMIUM: 0,
    };
    subscriptions.forEach((s) => {
      if (s.subscriptionType && base[s.subscriptionType] !== undefined) {
        base[s.subscriptionType] += 1;
      }
    });
    return base;
  }, [subscriptions]);

  // 실제 데이터에 있는 타입만 추출
  // const subscriptionTypes = useMemo(() => {
  //   const set = new Set();
  //   subscriptions.forEach((s) => {
  //     if (s.subscriptionType) set.add(s.subscriptionType);
  //   });
  //   return Array.from(set);
  // }, [subscriptions]);

  // 필터 적용
  const filteredList =
    filter === "ALL"
      ? subscriptions
      : subscriptions.filter((sub) => sub.subscriptionType === filter);

  const handleFilterChange = (_, newValue) => {
    if (newValue !== null) {
      setFilter(newValue);
      // // 필터 바꾸면 맨 앞으로 스크롤
      // if (scrollRef.current) {
      //   scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      // }
      setCurrentIndex(0);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
    }
  };

  // 좌우 스크롤
  // const scrollBy = (offset) => {
  //   if (!scrollRef.current) return;
  //   scrollRef.current.scrollBy({
  //     left: offset,
  //     behavior: "smooth",
  //   });
  // };

  // 좌우 페이지 이동 (슬라이드 단위)
  const goToPage = (direction) => {
    if (!scrollRef.current || filteredList.length === 0) return;
    const container = scrollRef.current;
    const width = container.clientWidth || 1;

    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = 0;
    if (newIndex > filteredList.length - 1) newIndex = filteredList.length - 1;

    setCurrentIndex(newIndex);
    container.scrollTo({
      left: newIndex * width,
      behavior: "smooth",
    });
  };

  // 스크롤 시 현재 인덱스 계산
  const handleScroll = (e) => {
    const container = e.target;
    const width = container.clientWidth || 1;
    const index = Math.round(container.scrollLeft / width);
    setCurrentIndex(index);
  };

  // 페이지 이동 함수들
  const goToPurchaseSub = (subscriptionId) => {
    navigate(`/me/subscriptions/${subscriptionId}/purchase`);
  };
  const goToOrder = (sub) => {
    navigate("/me/order/new", {
      state: { subscription: sub },
    });
  };
  const goToSendGift = (subscriptionId) => {
    navigate(`/me/subscriptions/${subscriptionId}/gift`);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "STANDARD":
        return "스탠다드";
      case "BASIC":
        return "베이직";
      case "PREMIUM":
        return "프리미엄";
      default:
        return type;
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      {/* 상단: 필터 + 화살표 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
          mb: 2,
          // alignItems: "center",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          size="small"
          sx={{ width: "100%" }}
        >
          <ToggleButton value="ALL">전체 ({counts.ALL})</ToggleButton>
          {/* {["STANDARD", "BASIC", "PREMIUM"].map((type) =>
            subscriptionTypes.includes(type) ? (
              <ToggleButton key={type} value={type}>
                {getTypeLabel(type)}
              </ToggleButton>
            ) : null
          )} */}

          {["STANDARD", "BASIC", "PREMIUM"].map((type) => (
            <ToggleButton key={type} value={type}>
              {getTypeLabel(type)} ({counts[type] || 0})
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* 우측 화살표는 항상 보이게 */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <IconButton
            onClick={() => goToPage(-1)}
            size="small"
            disabled={currentIndex === 0} // 첫 페이지면 비활성화
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>

          <Typography
            variant="caption"
            sx={{ minWidth: 56, textAlign: "center" }}
          >
            {filteredList.length === 0
              ? "0 / 0"
              : `${currentIndex + 1} / ${filteredList.length}`}
          </Typography>

          <IconButton
            onClick={() => goToPage(1)}
            size="small"
            disabled={currentIndex === filteredList.length - 1} // 마지막 페이지면 비활성화
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* 캐러셀 영역 */}
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          minHeight: "300px",
          py: 1,
          "&::-webkit-scrollbar": {
            height: isAppLike ? 0 : 6,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ccc",
            borderRadius: 8,
          },
        }}
        onScroll={handleScroll}
      >
        {filteredList.length === 0 && (
          <Box
            sx={{
              minHeight: "200px",
              width: "100%",
              // backgroundColor: "#f2f2f2",
              p: "1rem",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              이 조건에 맞는 구독권이 없습니다.
            </Typography>
          </Box>
        )}

        {filteredList.map((sub) => {
          const isSoldOut = sub.subscriptionStatus === "SOLDOUT";
          return (
            <Box
              key={sub.subscriptionId || sub.subName}
              sx={{
                scrollSnapAlign: "start",
                px: isAppLike ? 0 : "10%",
                flex: "0 0 100%",
              }}
            >
              {/* 카드 */}
              <Box
                key={sub.subscriptionId}
                sx={{
                  position: "relative",
                  border: isSoldOut ? "1px solid #ffcdd2" : "1px solid #e0e0e0",
                  borderRadius: 2,
                  backgroundColor: isSoldOut ? "#fafafa" : "white",
                  p: 2,
                  minHeight: 380,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  opacity: isSoldOut ? 0.7 : 1,
                }}
              >
                {/* SOLD OUT 뱃지 */}
                {/* {isSoldOut && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    px: 1.2,
                    py: 0.3,
                    borderRadius: 999,
                    backgroundColor: "#ffebee",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: "#c62828",
                    }}
                  >
                    SOLD OUT
                  </Typography>
                </Box>
              )} */}
                {isSoldOut && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(0, 0, 0, 0.44)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 2,
                      zIndex: 10,
                    }}
                  >
                    <Typography
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 999,
                        // bgcolor: "rgba(0,0,0,0.75)",
                        // color: "white",
                        color: "#ffffffff",
                        fontSize: "2rem",
                        fontWeight: 600,
                      }}
                    >
                      판매 완료
                    </Typography>
                  </Box>
                )}
                {/* 타입 / 이름 / 가격 */}
                <Box sx={{ textAlign: "center" }}>
                  <SubTypeChip type={sub.subscriptionType} />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      mt: "0.5rem",
                    }}
                  >
                    {sub.subscriptionName}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 28,
                      color: isSoldOut ? "text.disabled" : "inherit",
                    }}
                  >
                    ₩{sub.price?.toLocaleString()}
                    <Typography
                      component="span"
                      sx={{ fontSize: 14, ml: 0.5, fontWeight: 400 }}
                    >
                      /월
                    </Typography>
                  </Typography>
                </Box>
                 <Divider />
                 <Box
                    sx={{
                      display: "flex",
                      justifyContent:"space-between",
                      gap: 1.5,
                      flexWrap: "wrap",
                      color: "text.secondary",
                      fontSize: "0.9rem",
                      mb: 1
                    }}
                  >
                    <Box sx={{ fontSize:"0.8rem", flex: 1, display: "flex", alignItems: "center", gap: 0.3, backgroundColor:"#eeeeeeda", borderRadius:"1rem", px: '0.9rem', py: "1rem"}}>
                      <CalendarMonthIcon fontSize="small" />
                      <span>결제일부터 {sub?.subscriptionPeriod}일간</span>
                    </Box>
                    <Box sx={{ fontSize:"0.8rem", flex: 1, display: "flex", alignItems: "center", gap: 0.5, backgroundColor:"#eeeeeeda", borderRadius:"1rem", px: '0.9rem', py: "1rem"}}>
                      <CoffeeIcon fontSize="small" />
                      <span>매일 {sub?.maxDailyUsage}잔 이용</span>
                    </Box>
                  </Box>

                {/* 설명 3칸 - 모바일에서는 세로 */}
                
                {/* 잔여 구독권 수량 */}
                <List sx={{ py: 0 }}>
                  <ListItemButton
                    sx={{
                      borderRadius: 1,
                      gap: 1,
                    }}
                  >
                    {/* 왼쪽: 아이콘 + 라벨 */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flex: 1,
                      }}
                    >
                      <ListItemText
                        primary="잔여 구독권 수량"
                        primaryTypographyProps={{
                          fontSize: "0.9rem",
                          color: "#4d4d4d",
                        }}
                      />
                    </Box>

                    {/* 오른쪽: 개수 뱃지 */}
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.4,
                        borderRadius: 999,
                        bgcolor: isSoldOut ? "#b6b6b6ff" : "#f1f3f4",
                        minWidth: 54,
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "row",
                        gap: "0.3rem",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "#202124",
                        }}
                      >
                        {sub.remainSalesQuantity || 0} 개
                      </Typography>
                      <ConfirmationNumber
                        sx={{ fontSize: 20, color: "#4d4d4d" }}
                      />
                    </Box>
                  </ListItemButton>
                </List>

                {/* 간단 설명 */}
                <List sx={{ py: 0 }}>
                  <ListItemButton
                    onClick={() =>
                      setOpenDescId((prev) =>
                        prev === sub.subscriptionId ? null : sub.subscriptionId
                      )
                    }
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemText
                      primary="구독권 설명"
                      primaryTypographyProps={{
                        fontSize: "0.9rem",
                        color: "#4d4d4d",
                      }}
                    />
                    {openDescId === sub.subscriptionId ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </ListItemButton>
                  <Collapse
                    in={openDescId === sub.subscriptionId}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", whiteSpace: "pre-line" }}
                      >
                        {sub.subscriptionDesc || "설명 정보가 없습니다."}
                      </Typography>
                    </Box>
                  </Collapse>
                </List>

                {/* 이용 가능 메뉴 (접기) */}
                <List sx={{ py: 0 }}>
                  <ListItemButton
                    onClick={() =>
                      setOpenMenuId((prev) =>
                        prev === sub.subscriptionId ? null : sub.subscriptionId
                      )
                    }
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemText
                      primary="이용 가능 메뉴"
                      primaryTypographyProps={{
                        fontSize: "0.9rem",
                        color: "#4d4d4d",
                      }}
                    />
                    {openMenuId === sub.subscriptionId ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </ListItemButton>
                  <Collapse
                    in={openMenuId === sub.subscriptionId}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {(sub.menus || []).map((menu) => (
                        <ListItemButton key={menu.menuId} sx={{ pl: 4 }}>
                          <ListItemIcon key={menu.menuId} sx={{ minWidth: 32 }}>
                            {menu.menuType === "BEVERAGE" ? (
                              <CoffeeIcon fontSize="small" />
                            ) : (
                              <CakeIcon fontSize="small" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={menu.menuName}
                            primaryTypographyProps={{
                              fontSize: "0.8rem",
                              color: "#333",
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </List>

                {/* 버튼 영역 */}
                <Box
                  sx={{
                    mt: "auto",
                    display: "flex",
                    flexDirection: "row",
                    gap: 1,
                  }}
                >
                  <Button
                    fullWidth
                    size="small"
                    onClick={() => goToSendGift(sub.subscriptionId)}
                    startIcon={<CardGiftcardIcon />}
                    sx={{
                      backgroundColor: isSoldOut ? "#e0e0e0" : "black",
                      color: isSoldOut ? "text.disabled" : "white",
                      "&:hover": {
                        backgroundColor: isSoldOut ? "#e0e0e0" : "#222",
                      },
                    }}
                    disabled={sub.subscriptionStatus === "SOLDOUT"}
                  >
                    선물하기
                  </Button>

                  {sub.isSubscribed !== "Y" ? (
                    <Button
                      fullWidth
                      size="small"
                      onClick={() => goToPurchaseSub(sub.subscriptionId)}
                      startIcon={<CreditCardIcon />}
                      sx={{
                        backgroundColor: isSoldOut ? "#e0e0e0" : "black",
                        color: isSoldOut ? "text.disabled" : "white",
                        "&:hover": {
                          backgroundColor: isSoldOut ? "#e0e0e0" : "#222",
                        },
                      }}
                      disabled={sub.subscriptionStatus === "SOLDOUT"}
                    >
                      구매하기
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      size="small"
                      onClick={() => goToOrder(sub)}
                      startIcon={<CoffeeIcon />}
                      sx={{
                        backgroundColor: "black",
                        color: "white",
                        "&:hover": { backgroundColor: "#222" },
                      }}
                    >
                      주문하기
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default CafeSubscriptionList;
