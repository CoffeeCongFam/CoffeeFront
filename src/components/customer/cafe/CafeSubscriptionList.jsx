import React, { useMemo, useState, useRef } from "react";
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
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CoffeeIcon from "@mui/icons-material/Coffee";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
  ExpandLess,
  ExpandMore,
  ConfirmationNumber,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useAppShellMode from "../../../hooks/useAppShellMode";
import SubTypeChip from "../../common/SubTypeChip";

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

  // 실제 데이터에 있는 타입만 추출
  const subscriptionTypes = useMemo(() => {
    const set = new Set();
    subscriptions.forEach((s) => {
      if (s.subscriptionType) set.add(s.subscriptionType);
    });
    return Array.from(set);
  }, [subscriptions]);

  // 필터 적용
  const filteredList =
    filter === "ALL"
      ? subscriptions
      : subscriptions.filter((sub) => sub.subscriptionType === filter);

  const handleFilterChange = (_, newValue) => {
    if (newValue !== null) {
      setFilter(newValue);
      // 필터 바꾸면 맨 앞으로 스크롤
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
    }
  };

  // 좌우 스크롤
  const scrollBy = (offset) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: offset,
      behavior: "smooth",
    });
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
          alignItems: "center",
        }}
      >
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          size="small"
        >
          <ToggleButton value="ALL">전체</ToggleButton>
          {["STANDARD", "BASIC", "PREMIUM"].map((type) =>
            subscriptionTypes.includes(type) ? (
              <ToggleButton key={type} value={type}>
                {getTypeLabel(type)}
              </ToggleButton>
            ) : null
          )}
        </ToggleButtonGroup>

        {/* 우측 화살표는 항상 보이게 */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <IconButton onClick={() => scrollBy(-320)} size="small">
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => scrollBy(320)} size="small">
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
          py: 1,
          "&::-webkit-scrollbar": {
            height: isAppLike ? 0 : 6,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ccc",
            borderRadius: 8,
          },
        }}
      >
        {filteredList.length === 0 && (
          <Typography color="text.secondary">
            이 조건에 맞는 구독권이 없습니다.
          </Typography>
        )}

        {filteredList.map((sub) => (
          <Box
            key={sub.subscriptionId || sub.subscriptionId || sub.subName}
            sx={{
              scrollSnapAlign: "start",
              px: isAppLike ? 0 : "10%",
              flex: "0 0 100%",
              // flex: isAppLike ? "0 0 100%" : "0 0 340px",
            }}
          >
            {/* 카드 */}
            <Box
              key={sub.subscriptionId}
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                backgroundColor: "white",
                p: 2,
                minHeight: 380,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {/* 타입 / 이름 / 가격 */}
              <Box sx={{ textAlign: "center" }}>
                <SubTypeChip type={sub.subscriptionType} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mt: "0.5rem" }}
                >
                  {sub.subscriptionName}
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 28 }}>
                  ₩{sub.price?.toLocaleString()}
                  <Typography
                    component="span"
                    sx={{ fontSize: 14, ml: 0.5, fontWeight: 400 }}
                  >
                    /월
                  </Typography>
                </Typography>
              </Box>

              {/* 설명 3칸 - 모바일에서는 세로 */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    // xs: "1fr",
                    xs: "repeat(3, minmax(0, 1fr))",
                    sm: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 1,
                }}
              >
                <Box sx={subDescBoxStyle}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                    금액
                  </Typography>
                  <Box>
                    <Typography
                      sx={{
                        textAlign: "right",
                        fontSize: { xs: "0.8rem", sm: "1rem" },
                      }}
                    >
                      월 {sub.price?.toLocaleString()}원
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 10,
                        color: "#ff39caff",
                        textAlign: "right",
                      }}
                    >
                      한 잔당 약 ₩
                      {sub.price
                        ? Math.round(sub.price / 30).toLocaleString()
                        : 0}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={subDescBoxStyle}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                    구독 주기
                  </Typography>

                  <Typography
                    sx={{
                      textAlign: "right",
                      fontSize: { xs: "0.8rem", sm: "1rem" },
                    }}
                  >
                    1개월
                  </Typography>
                </Box>

                <Box sx={subDescBoxStyle}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                    사용 가능
                  </Typography>
                  <Typography
                    sx={{
                      textAlign: "right",
                      fontSize: { xs: "0.8rem", sm: "1rem" },
                    }}
                  >
                    매일, 하루 {sub.maxDailyUsage}잔
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 10,
                      color: "#ff39caff",
                      textAlign: "right",
                    }}
                  >
                    결제일로부터 시작
                  </Typography>
                </Box>
              </Box>

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
                      bgcolor: "#f1f3f4",
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
                    {(sub.menuList || []).map((menu) => (
                      <ListItemButton key={menu} sx={{ pl: 4 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CoffeeIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={menu}
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
                    backgroundColor: "black",
                    color: "white",
                    "&:hover": { backgroundColor: "#222" },
                  }}
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
                      backgroundColor: "black",
                      color: "white",
                      "&:hover": { backgroundColor: "#222" },
                    }}
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
        ))}
      </Box>
    </Box>
  );
}

export default CafeSubscriptionList;
