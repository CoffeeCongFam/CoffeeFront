import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const subButtonStyle = {
  backgroundColor: "black",
  color: "white",
};
function CafeSubscriptionList({ subscriptions = [] }) {
  const navigate = useNavigate();
  // 선택된 필터 상태
  const [filter, setFilter] = useState("ALL");

  // 구독권에 실제 어떤 타입들이 있는지 데이터에서 뽑기
  const subscriptionTypes = useMemo(() => {
    const set = new Set();
    subscriptions.forEach((s) => {
      if (s.subType) set.add(s.subType);
    });
    return Array.from(set); // 예: ["STANDARD", "PREMIUM"]
  }, [subscriptions]);

  const handleFilterChange = (event, newValue) => {
    // MUI ToggleButtonGroup은 같은 버튼 다시 누르면 null 줄 수 있으니 방어
    if (newValue !== null) {
      setFilter(newValue);
    }
  };

  // 필터링된 목록
  const filteredList =
    filter === "ALL"
      ? subscriptions
      : subscriptions.filter((sub) => sub.subType === filter);

  // 타입 라벨 한글화
  const getTypeLabel = (type) => {
    switch (type) {
      case "STANDARD":
        return "스탠다드";
      case "BASIC":
        return "베이식";
      case "PREMIUM":
        return "프리미엄";
      default:
        return type;
    }
  };

  function goToPurchaseSub(subId) {
    // 구독 구매 페이지로 이동
    navigate(`/me/subscriptions/${subId}/purchase`);
  }

  function goToOrder(sub) {
    // 구독권으로 주문하기 페이지로 이동
    navigate("/me/order/new", {
      state: {
        subscription: sub,
      },
    });
  }

  return (
    <Box>
      {/* 필터 토글 */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          size="small"
        >
          <ToggleButton value="ALL">전체</ToggleButton>
          {/* 데이터에 있는 타입만 버튼으로 만들기 */}
          {["STANDARD", "BASIC", "PREMIUM"].map((type) =>
            subscriptionTypes.includes(type) ? (
              <ToggleButton key={type} value={type}>
                {getTypeLabel(type)}
              </ToggleButton>
            ) : null
          )}
        </ToggleButtonGroup>
      </Box>

      {/* 리스트 */}
      {filteredList && filteredList.length > 0 ? (
        filteredList.map((sub) => (
          <Box
            key={sub.subId || sub.id || sub.subName}
            sx={{
              p: 2,
              mb: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {sub.subName || sub.name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {sub.description}
            </Typography>
            <Typography variant="subtitle1">
              {sub.price?.toLocaleString()}원 / {sub.period || "1개월"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              타입: {getTypeLabel(sub.subType)}
            </Typography>

            {sub.isSubscribed === "Y" ? (
              <Button
                style={subButtonStyle}
                size="small"
                onClick={() => goToOrder(sub)}
              >
                구독권 사용하기
              </Button>
            ) : (
              <Button
                style={subButtonStyle}
                size="small"
                onClick={() => goToPurchaseSub(sub.subId)}
              >
                구독하기
              </Button>
            )}
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          이 조건에 맞는 구독권이 없습니다.
        </Typography>
      )}
    </Box>
  );
}

export default CafeSubscriptionList;
