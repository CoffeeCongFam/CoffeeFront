import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Collapse,
  Chip,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CoffeeIcon from "@mui/icons-material/Coffee";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { useNavigate } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  ExpandLess,
  ExpandMore,
  StarBorder,
  Troubleshoot,
} from "@mui/icons-material";

const subButtonStyle = {
  backgroundColor: "black",
  color: "white",
  width: "100%",
};

const subDescBoxStyle = {
  backgroundColor: "#F2F2F2",
  padding: "2% 3%",
  borderRadius: "8px",
  width: "100%",
};

function getChipStyle(type) {
  switch (type) {
    case "BASIC":
      return { bgcolor: "#E0E0E0", color: "#333" };
    case "STANDARD":
      return { bgcolor: "#E6F4EA", color: "#9ae39eff" };
    case "PREMIUM":
      return { bgcolor: "#FFF3CD", color: "#cfc123ff" };
    default:
      return { bgcolor: "#F1F3F4", color: "#5F6368" };
  }
}

function CafeSubscriptionList({ subscriptions = [] }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("ALL");
  const [currentIndex, setCurrentIndex] = useState(0);

  const [oepnMenu, setOpenMenu] = useState(false); // 이용 가능 메뉴 리스트

  // 실제 데이터에 있는 타입만
  const subscriptionTypes = useMemo(() => {
    const set = new Set();
    subscriptions.forEach((s) => {
      if (s.subType) set.add(s.subType);
    });
    return Array.from(set);
  }, [subscriptions]);

  // 필터 변경
  const handleFilterChange = (event, newValue) => {
    if (newValue !== null) {
      setFilter(newValue);
      setCurrentIndex(0); // ✅ 필터 바꾸면 첫 번째로 리셋
    }
  };

  // 필터링된 목록
  const filteredList =
    filter === "ALL"
      ? subscriptions
      : subscriptions.filter((sub) => sub.subType === filter);

  // 현재 보여줄 구독권
  const currentSub =
    filteredList.length > 0 ? filteredList[currentIndex] : null;

  // 타입 라벨 한글화
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

  function goToPurchaseSub(subId) {
    // 구독권 구매 페이지로 이동
    navigate(`/me/subscriptions/${subId}/purchase`);
  }

  function goToOrder(sub) {
    // 구독권 자동 선택, 주문하기로 이동
    navigate("/me/order/new", {
      state: {
        subscription: sub,
      },
    });
  }
  function goToSendGift(subId) {
    // 선물하기로 이동
    navigate(`/me/subscriptions/${subId}/gift`);
  }

  // 캐러셀 이동
  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? filteredList.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === filteredList.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Box sx={{ minHeight: "400px", position: "relative" }}>
      {/* 필터 */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
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
      </Box>

      {/* 캐러셀 영역 */}
      {currentSub ? (
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* 왼쪽 화살표 */}
          <IconButton
            onClick={handlePrev}
            disabled={filteredList.length <= 1}
            sx={{ flexShrink: 0 }}
          >
            <ChevronLeftIcon />
          </IconButton>

          {/* 카드 하나만 */}
          <Box
            key={currentSub.subId || currentSub.id || currentSub.subName}
            sx={{
              flexGrow: 1,
              px: 2,
              pt: 2,
              pb: 4,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              backgroundColor: "white",
            }}
          >
            {/* 상단 제목 + 인덱스 표시 */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {filteredList.length > 0
                  ? `${currentIndex + 1} / ${filteredList.length}`
                  : null}
              </Typography>
            </Box>

            <Box sx={{ textAlign: "center", mb: 1 }}>
              <Chip
                label={getTypeLabel(currentSub.subType)}
                style={{ marginBottom: "13px" }}
                size="small"
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "12px",
                  ...getChipStyle(currentSub.subType),
                }}
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {currentSub.subName || currentSub.name}
              </Typography>
              <Typography
                // variant="h5"
                sx={{ fontWeight: 800, fontSize: "32px" }}
              >
                ₩{currentSub.price?.toLocaleString()}
                <Typography
                  component="span"
                  sx={{ fontSize: "1rem", fontWeight: 400, ml: 0.5 }}
                >
                  /월
                </Typography>
              </Typography>
            </Box>

            {/* 설명 3칸 */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: "10px",
                width: "100%",
                justifyContent: "space-around",
                mt: 2,
              }}
            >
              <Box style={subDescBoxStyle}>
                <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  금액
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "right",
                    gap: "5px",
                  }}
                >
                  <Typography>
                    월 {currentSub.price?.toLocaleString()}원
                  </Typography>
                  <Typography sx={{ fontSize: "10px", color: "#ff39caff" }}>
                    한 잔당 약 ₩
                    {currentSub.price
                      ? Math.round(currentSub.price / 30).toLocaleString()
                      : 0}
                    원
                  </Typography>
                </Box>
              </Box>

              <Box style={subDescBoxStyle}>
                <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  구독 주기
                </Typography>
                <Box>
                  <Typography sx={{ textAlign: "right" }}>1개월</Typography>
                </Box>
              </Box>

              <Box style={subDescBoxStyle}>
                <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  사용 가능 일수
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "right",
                    gap: "5px",
                  }}
                >
                  <Typography sx={{ textAlign: "right" }}>
                    매일, 하루 {currentSub.maxDailyUsage} 잔
                  </Typography>
                  <Typography sx={{ fontSize: "10px", color: "#ff39caff" }}>
                    결제일로부터 시작
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {currentSub.description}
              </Typography>
            </Box>

            {/* 이용 가능 메뉴 */}
            <List>
              <ListItemButton onClick={() => setOpenMenu(!oepnMenu)}>
                <ListItemText
                  primary="이용 가능 메뉴"
                  primaryTypographyProps={{
                    fontSize: "0.9rem", // 🔹 주 텍스트 크기 (기본 16px)
                    // fontWeight: 600,
                    color: "#4d4d4dff",
                  }}
                />
                {oepnMenu ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={oepnMenu} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {currentSub.menuList.map((menu) => {
                    return (
                      <ListItemButton sx={{ pl: 4 }}>
                        <ListItemIcon>
                          <CoffeeIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={menu}
                          primaryTypographyProps={{
                            fontSize: "0.8rem",
                            fontWeight: 300,
                            color: "#333",
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </List>
            {/* 버튼 */}
            <Box sx={{ mt: 2 }}>
              {currentSub.isSubscribed !== "Y" ? (
                <Box
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <Button
                    style={subButtonStyle}
                    size="small"
                    onClick={() => goToSendGift(currentSub.subId)}
                    startIcon={<CardGiftcardIcon />}
                  >
                    구독권 선물하기
                  </Button>
                  <Button
                    style={subButtonStyle}
                    size="small"
                    onClick={() => goToPurchaseSub(currentSub.subId)}
                    startIcon={<CreditCardIcon />}
                  >
                    구독권 구매하기
                  </Button>
                </Box>
              ) : (
                <Button
                  style={subButtonStyle}
                  size="small"
                  onClick={() => goToOrder(currentSub)}
                  startIcon={<CoffeeIcon />}
                >
                  구독권 사용하기
                </Button>
              )}
            </Box>
          </Box>

          {/* 오른쪽 화살표 */}
          <IconButton
            onClick={handleNext}
            disabled={filteredList.length <= 1}
            sx={{ flexShrink: 0 }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          이 조건에 맞는 구독권이 없습니다.
        </Typography>
      )}
    </Box>
  );
}

export default CafeSubscriptionList;
