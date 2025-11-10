import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import { getSubscription } from "../../utils/subscription";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import useUserStore from "../../stores/useUserStore";
import { SubscriptionDetailCard } from "../../components/customer/subcription/SubscriptionDetailCard";

// 구독권 상세 정보 컴포넌트

// 공통: 사용 내역 & 환불 정보 정규화
const normalizeUsageAndRefund = (raw) => {
  if (!raw || typeof raw !== "object") {
    return {
      usedAt: [],
      refundReasons: null,
      refundedAt: "",
      isRefunded: false,
    };
  }

  const usageHistoryList = Array.isArray(raw.usageHistoryList)
    ? raw.usageHistoryList
    : [];

  const usedAtFromHistory = usageHistoryList
    .map((u) => (u && u.usedAt ? u.usedAt : null))
    .filter(Boolean);

  const usedAt =
    usedAtFromHistory.length > 0
      ? usedAtFromHistory
      : Array.isArray(raw.usedAt)
      ? raw.usedAt
      : [];

  const refundReasons = raw.refundReasons ?? null;
  const refundedAt = raw.refundedAt ?? "";
  const isRefunded =
    typeof raw.isRefunded === "boolean"
      ? raw.isRefunded
      : !!(refundedAt && String(refundedAt).trim() !== "");

  return { usedAt, refundReasons, refundedAt, isRefunded };
};

// API 데이터를 카드 컴포넌트에서 쓰기 좋게 변환
const adaptToCardData = (s) => {
  const { usedAt, refundReasons, refundedAt, isRefunded } =
    normalizeUsageAndRefund(s);

  return {
    storeName: s?.store?.storeName ?? "",
    storeImg: s?.store?.storeImg ?? "",
    subscriptionType: s?.subscriptionType ?? "STANDARD",
    price: Number(s?.price ?? 0),
    subscriptionDesc: s?.subName ?? "",
    menuList: Array.isArray(s?.menu) ? s.menu : [],
    dailyRemainCount: s?.remainingCount ?? 0,
    maxDailyUsage: s?.maxDailyUsage ?? s?.remainingCount ?? 0,
    giverName: s?.sender,
    receiver: s?.receiver,
    subStart: s?.subStart,
    subEnd: s?.subEnd,
    usageStatus: s?.usageStatus,
    purchaseId: s?.purchaseId,
    paymentStatus: s?.paymentStatus,
    refundReasons,
    refundedAt,
    usedAt,
    isRefunded,
    giftMessage: s?.giftMessage ?? "",
    // --- forward receiverId, senderId, memberId if present ---
    receiverId: s?.receiverId,
    senderId: s?.senderId,
    memberId: s?.memberId,
  };
};

// 커스텀 다음 화살표 컴포넌트
function NextArrow(props) {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: "absolute",
        top: "50%",
        right: 0,
        transform: "translateY(-50%)",
        zIndex: 2,
        color: "black",
        backgroundColor: "white",
        boxShadow: 3,
        "&:hover": { backgroundColor: "rgba(255,255,255,0.8)" },
      }}
    >
      <ArrowForwardIosIcon fontSize="small" />
    </IconButton>
  );
}

// 커스텀 이전 화살표 컴포넌트
function PrevArrow(props) {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: "absolute",
        top: "50%",
        left: 0,
        transform: "translateY(-50%)",
        zIndex: 2,
        color: "black",
        backgroundColor: "white",
        boxShadow: 3,
        "&:hover": { backgroundColor: "rgba(255,255,255,0.8)" },
      }}
    >
      <ArrowBackIosNewIcon fontSize="small" />
    </IconButton>
  );
}

// 구독권 목록을 보여주는 페이지 컴포넌트
const SubscriptionPage = () => {
  const { authUser } = useUserStore();
  const CURRENT_MEMBER_ID = authUser?.memberId ?? 1;
  const sliderRef = useRef(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'expired'
  const [availableList, setAvailableList] = useState([]); // 사용 가능한 구독권
  const [expiredList, setExpiredList] = useState([]); // 만료/비활성 구독권 (NOT_ACTIVATED 포함)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getSubscription(); // API 호출
        // API가 { success, data, message }를 반환하므로 .data를 붙여서 사용
        const arr = Array.isArray(res?.data) ? res.data : [];
        // 조건 정정:
        // 사용 가능: isExpired 값이 "EXPIRED"가 아닌 모든 구독권
        // 만료: isExpired 값이 "EXPIRED"인 구독권만
        const norm = (v) => (v ?? "").toString().toUpperCase();
        const isExpired = (s) => norm(s?.isExpired) === "EXPIRED";
        const hasRefundedAt = (s) => {
          const v = s?.refundedAt;
          return v != null && String(v).trim() !== "";
        };
        const avail = arr.filter((s) => !isExpired(s) && !hasRefundedAt(s));
        const exp   = arr.filter((s) => isExpired(s) || hasRefundedAt(s));
        console.log(
          "[Subscription] available:",
          avail.length,
          "expired:",
          exp.length,
          { raw: res, list: arr }
        );
        if (mounted) {
          setAvailableList(avail);
          setExpiredList(exp);
        }
      } catch (e) {
        if (mounted) setError(e?.message || "구독권 조회에 실패했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const currentList = activeTab === "all" ? availableList : expiredList;
  const settings = {
    dots: true,
    infinite: currentList.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [{ breakpoint: 600, settings: { slidesToShow: 1 } }],
  };

  // 환불 성공시: 사용가능 목록에서 제거하고 만료 목록에 추가
  const handleRefundSuccess = (pid, refundedAtFromApi) => {
    const pidStr = String(pid);
    let removed = null;

    setAvailableList((prev) => {
      const idx = prev.findIndex((s) => String(s?.purchaseId) === pidStr);
      if (idx === -1) return prev;
      removed = prev[idx];
      return prev.filter((_, i) => i !== idx);
    });

    if (removed) {
      const moved = {
        ...removed,
        isExpired: "CANCELLED",
        paymentStatus: "REFUNDED",
        refundReasons: removed.refundReasons ?? null,
        refundedAt:
          refundedAtFromApi ?? removed.refundedAt ?? new Date().toISOString(),
      };
      setExpiredList((prev) => [...prev, moved]);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, borderRadius: 2, border: "1px solid #ffe0b2", p: 2, backgroundColor: "white" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Typography variant="h6" component="h2" color="#334336" fontWeight="bold">
          구독권
        </Typography>
      </Box>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ 
          borderBottom: 1, 
          borderColor: "#ffe0b2", 
          mt: 0.5, 
          mb: 3,
          "& .MuiTab-root": {
            color: "#3B3026",
          },
          "& .Mui-selected": {
            color: "#334336",
            fontWeight: 600,
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#334336",
          },
        }}
      >
        <Tab value="all" label="사용 가능한 구독권" />
        <Tab value="expired" label="만료된 구독권" />
      </Tabs>
      {loading ? (
        <Typography sx={{color: "#334336"}}>불러오는 중…</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : currentList.length > 0 ? (
        <Box
          sx={{
            position: "relative",
            padding: "0 44px 72px",
            "& .slick-list": { overflow: "hidden", paddingBottom: "24px" },
            "& .slick-dots": { bottom: "-36px" },
          }}
        >
          <Slider ref={sliderRef} {...settings}>
            {currentList.map((s, index) => {
              const cardData = adaptToCardData(s);
              // Gift/ownership classification rules
              const rid = s?.receiverId;
              const sid = s?.senderId;
              const mid = s?.memberId ?? CURRENT_MEMBER_ID;

              let giftType;
              let isGifted = false;
              if (mid === rid && mid === sid) {
                // 본인 구매
                giftType = undefined; // OWNED
                isGifted = false;
              } else if (mid === rid && mid !== sid) {
                // 받은 선물
                giftType = "RECEIVED";
                isGifted = true;
              } else if (mid !== rid && mid === sid) {
                // 보낸 선물
                giftType = "SENT";
                isGifted = true;
              } else {
                // 불명확: 기본값
                giftType = undefined;
                isGifted = false;
              }
              return (
                <Box key={s.subId ?? index} sx={{ padding: "0 8px" }}>
                  <SubscriptionDetailCard
                    subscriptionData={cardData}
                    isGifted={isGifted}
                    isExpired={activeTab === "expired"}
                    giftType={giftType}
                    onRefundSuccess={handleRefundSuccess}
                  />
                </Box>
              );
            })}
          </Slider>
          <IconButton
            onClick={() => sliderRef.current?.slickPrev()}
            sx={{
              position: "absolute",
              top: "40%",
              left: 0,
              transform: "translateY(-50%)",
              zIndex: 2,
              color: "#334336",
              backgroundColor: "#fff9f4",
              border: "1px solid #334336",
              boxShadow: 3,
              "&:hover": { backgroundColor: "#fff9f4" },
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => sliderRef.current?.slickNext()}
            sx={{
              position: "absolute",
              top: "40%",
              right: 0,
              transform: "translateY(-50%)",
              zIndex: 2,
              color: "#334336",
              backgroundColor: "#fff9f4",
              border: "1px solid #334336",
              boxShadow: 3,
              "&:hover": { backgroundColor: "#fff9f4" },
            }}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography variant="subtitle1" sx={{ mb: 1, color: "#334336" }}>
            구독권 내역이 비어 있습니다.
          </Typography>
          <Typography variant="body2" sx={{ color: "#334336" }}>
            구독권 구매시 이곳에서 구독권을 확인할 수 있습니다.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default SubscriptionPage;
