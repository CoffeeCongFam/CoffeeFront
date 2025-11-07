import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  ButtonGroup,
  Tabs,
  Tab,
  Divider,
  MenuItem,
  Select,
  FormControl,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider as MuiDivider,
  Popover,
} from "@mui/material";
import { getSubscription } from "../../utils/subscription";
import { postRefund } from "../../utils/payments";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import RedeemIcon from "@mui/icons-material/Redeem";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HistoryIcon from "@mui/icons-material/History";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ImageIcon from "@mui/icons-material/Image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import useUserStore from "../../stores/useUserStore";

// 구독권 상세 정보 컴포넌트
export const SubscriptionDetailCard = ({
  subscriptionData,
  isGifted = false,
  isExpired = false,
  actionsSlot = null,
  giftType,
  onRefundSuccess = null,
  isRefunded: isRefundedProp, // isRefunded prop을 명시적으로 받도록 추가 (이름 충돌 방지)
  purchaseId, // purchaseId prop을 명시적으로 받도록 추가
}) => {
  const [selectedMenu, setSelectedMenu] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [refundAnchorEl, setRefundAnchorEl] = useState(null);
  const openRefundPopover = Boolean(refundAnchorEl);
  const handleOpenRefundPopover = (e) => setRefundAnchorEl(e.currentTarget);
  const handleCloseRefundPopover = () => setRefundAnchorEl(null);

  const {
    storeName,
    subscriptionType,
    price,
    subscriptionDesc,
    menuNameList,
    menuList,
    storeImg,
    maxDailyUsage,
    refundReasons: cardRefundReasons,
    refundedAt: cardRefundedAt,
    isRefunded: cardIsRefunded,
    usedAt,
    subStart,
    subEnd,
  } = subscriptionData;

  // 구독 기간 및 남은 일 수 계산
  const parseDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d) ? null : d;
  };

  const startDate = parseDate(subStart);
  const endDate = parseDate(subEnd);

  const formatDate = (d) => {
    if (!d) return "-";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  };

  const subPeriodLabel =
    startDate && endDate
      ? `${formatDate(startDate)} ~ ${formatDate(endDate)}`
      : startDate
      ? `${formatDate(startDate)} ~ -`
      : "-";

  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  let remainingLabel = "-";
  if (endDate) {
    const diffMs = endDate.getTime() - todayMidnight.getTime();
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (remainingDays <= 0) {
      remainingLabel = "만료";
    } else {
      remainingLabel = `${remainingDays}일 남음`;
    }
  }

  const dailyRemainCount = subscriptionData.dailyRemainCount ?? 0;
  const isDailyUsedUp = dailyRemainCount <= 0;
  const menus = Array.isArray(menuNameList)
    ? menuNameList
    : Array.isArray(menuList)
    ? menuList
    : [];
  const resolvedMaxDaily =
    maxDailyUsage ?? subscriptionData.dailyRemainCount;
  const dailyLabel =
    giftType === "RECEIVED" ? "일일 잔여" : "일일 사용가능 횟수";

  const formattedPrice = price.toLocaleString();

  // ---- Refund Reasons & Button visibility ----
  const refundReasons = cardRefundReasons ?? null;
  const isRefundable = refundReasons === null;
  const normalizedReasons = Array.isArray(refundReasons)
    ? refundReasons.map((r) => (r || "").toString().toUpperCase())
    : [];
  const refundedAt = cardRefundedAt ?? "";
  // prop으로 받은 isRefunded를 최우선으로 사용
  const isRefunded = typeof isRefundedProp === 'boolean'
    ? isRefundedProp
    : (typeof cardIsRefunded === "boolean" ? cardIsRefunded : !!(refundedAt && String(refundedAt).trim() !== ""));
  // const memberId = 1;
  let refundMessage = null;
  if (!isRefundable) {
    const hasOver = normalizedReasons.includes("OVER_PERIOD");
    const hasUsed = normalizedReasons.includes("USED_ALREADY");
    if (hasOver && hasUsed) {
      refundMessage = "환불 기간 및 사용내역이 존재하여 환불이 불가능합니다.";
    } else if (hasOver) {
      refundMessage = "구매후 7일 경과하여 환불이 불가능합니다.";
    } else if (hasUsed) {
      refundMessage = "이미 사용한 구독권으로 환불이 불가능합니다.";
    } else {
      // 알 수 없는 코드가 포함된 경우: 일반 불가 문구
      refundMessage = "환불이 불가능합니다.";
    }
  }

  // 금액 정보를 보여주는 박스 서브 컴포넌트
  const InfoBox = ({ title, content, subContent = null }) => (
    <Box
      sx={{
        flexGrow: 1,
        padding: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: "8px",
        minHeight: "64px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        border: "1px solid #E0E0E0",
      }}
    >
      <Typography
        variant="caption"
        color="textSecondary"
        fontWeight="bold"
        sx={{ mb: 0.25 }}
      >
        {title}
      </Typography>
      <Typography variant="body2" fontWeight="bold">
        {content}
      </Typography>
      {subContent && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
          {subContent}
        </Typography>
      )}
    </Box>
  );

  // ---- Usage grouping helper ----
  const usageDates = Array.isArray(usedAt)
    ? usedAt
    : Array.isArray(subscriptionData.usedAt)
    ? subscriptionData.usedAt
    : [];
  const groupByMonth = (dates) => {
    const map = {};
    dates.forEach((iso) => {
      const d = new Date(iso);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      if (!map[key]) map[key] = [];
      map[key].push(iso);
    });
    // sort months desc and days desc
    const sorted = Object.keys(map)
      .sort((a, b) => (a < b ? 1 : -1))
      .reduce((acc, k) => {
        acc[k] = map[k].sort((a, b) => (a < b ? 1 : -1));
        return acc;
      }, {});
    return sorted;
  };
  const usageByMonth = groupByMonth(usageDates);

  // ---- Cancel / Deny button visibility rules ----
  // 요구사항: refundReasons === null 이면 환불 가능 → 버튼 보임, 그 외에는 버튼 숨김
  const shouldShowRefundButton = isRefundable;

  const isUsageStatusExpired =
    subscriptionData?.usageStatus === "EXPIRED";

  // 환불/거절 확인 다이얼로그 후 실행하는 핸들러
  const handleClickRefund = () => {
    const message =
      giftType === "RECEIVED"
        ? "정말 이 선물을 거절하시겠습니까?"
        : "정말 결제를 취소하시겠습니까?";

    const confirmed = window.confirm(message);
    if (!confirmed) return;

    // 사용자가 확인을 눌렀을 때만 기존 환불/거절 로직 실행
    handleRefundOrDeny();
  };

  // 환불/거절 처리 핸들러 (purchaseId를 성공 콜백에 전달)
  const handleRefundOrDeny = async () => {
    // prop으로 받은 purchaseId를 우선 사용하고, 없으면 subscriptionData의 값을 사용
    const pid = purchaseId ?? subscriptionData?.purchaseId;

    if (!pid) {
      window.alert("환불에 필요한 purchaseId가 없습니다.");
      return;
    }

    try {
      const res = await postRefund(pid);

      if (res && res.success) {
        const refundedAtFromApi = res?.data?.refundedAt ?? null;
        console.log("refundedAtFromApi: ", refundedAtFromApi)
        if (typeof onRefundSuccess === "function") {
          onRefundSuccess(pid, refundedAtFromApi, subscriptionData?.memberSubscriptionId);
        }
      } else {
        window.alert(res?.message || "환불처리에 실패했습니다. 다시 시도해주세요");
      }
    } catch (e) {
      window.alert(
        e?.message || "환불처리에 문제가 생겼습니다. 다시 시도해주세요"
      );
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: "relative",
        width:350,
        maxWidth: 700,
        margin: "auto",
        padding: 2.5,
        borderRadius: "12px",
        height: "540px", // Slightly increased to fit image
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between", // 내부 요소들의 간격을 균등하게 배분
      }}
    >
      {/* Flip container */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          perspective: "1000px",
          filter: isExpired ? "grayscale(60%) blur(0px) opacity(0.85)" : "none",
        }}
      >
        {/* Card faces wrapper */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            transition: "transform 600ms ease",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT FACE */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 0, // already padded by Paper
              pointerEvents: isFlipped ? "none" : "auto",
            }}
          >
            {/* Image area with fallback */}
            <Box sx={{ position: "relative", mt: 1, mb: 1 }}>
              <Box
                sx={{
                  width: "100%",
                  height: 140,
                  borderRadius: "12px",
                  overflow: "hidden",
                  bgcolor: "#f5f5f5",
                  border: "1px solid #eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {storeImg && !imgError ? (
                  <Box
                    component="img"
                    src={storeImg}
                    alt={storeName || "구독권 이미지"}
                    onError={() => setImgError(true)}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <ImageIcon sx={{ fontSize: 72, color: "grey.400" }} />
                )}
              </Box>

              {/* Gift Labels overlay on image */}
              {isGifted && giftType !== "SENT" && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    backgroundColor: "rgba(255,255,255,0.95)",
                    padding: "6px 10px",
                    borderRadius: "12px",
                    boxShadow: 2,
                    zIndex: 3,
                  }}
                >
                  <RedeemIcon sx={{ color: "#ff6f00", fontSize: 22 }} />
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    {subscriptionData?.giverName
                      ? `${subscriptionData.giverName}님이 선물해주셨어요`
                      : "익명의 천사님이 선물해주셨어요"}
                  </Typography>
                </Box>
              )}
              {giftType === "SENT" && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    backgroundColor: "rgba(255,255,255,0.95)",
                    padding: "6px 10px",
                    borderRadius: "12px",
                    boxShadow: 2,
                    zIndex: 3,
                  }}
                >
                  <RedeemIcon sx={{ color: "#1976d2", fontSize: 22 }} />
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    {`For · ${subscriptionData?.receiver ?? "수신자"}`}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Title and price row */}
            <Box sx={{ textAlign: "center" }}>
              <Box sx={{ display: "inline-block" }}>
                <Chip
                  label={subscriptionType}
                  size="medium"
                  sx={{
                    fontWeight: "bold",
                    bgcolor:
                      subscriptionType === "BASIC"
                        ? "green"
                        : subscriptionType === "STANDARD"
                        ? "#ff9800"
                        : subscriptionType === "PREMIUM"
                        ? "#9c27b0"
                        : "grey.300",
                    color: "#fff",
                  }}
                />
              </Box>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ mt: 1, color: "#333" }}
              >
                {storeName}
              </Typography>
              <Typography
                variant="body1"
                fontWeight="light"
                sx={{ mt: 0.5, color: "#333" }}
              >
                <span style={{ fontWeight: "bold" }}>₩{formattedPrice}</span>/월
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, mt: 1, mb: 0.5 }}>
              <InfoBox title="금액" content={`${formattedPrice}원`} />
              <InfoBox
                title="남은 일수"
                content={subPeriodLabel}
                subContent={remainingLabel}
              />
              <InfoBox
                title={dailyLabel}
                content={`${resolvedMaxDaily ?? 0}잔`}
                subContent={isDailyUsedUp ? "당일 사용횟수 소진" : null}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography
                  variant="body2"
                  color="primary.main"
                  fontWeight="bold"
                >
                  상세설명
                </Typography>
                {!isRefundable && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      color="error"
                    >
                      환불 불가
                    </Typography>
                    <IconButton
                      aria-label="환불 불가 사유 보기"
                      size="small"
                      onClick={handleOpenRefundPopover}
                      sx={{ color: "error.main", p: 0 }}
                    >
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {subscriptionDesc}
              </Typography>
              {/* Popover is placed here to keep it close to the trigger */}
              {!isRefundable && (
                <Popover
                  id={openRefundPopover ? "refund-popover" : undefined}
                  open={openRefundPopover}
                  anchorEl={refundAnchorEl}
                  onClose={handleCloseRefundPopover}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  PaperProps={{ sx: { p: 1, maxWidth: 280 } }}
                >
                  <Typography variant="caption" sx={{ color: "error.main" }}>
                    {refundMessage}
                  </Typography>
                </Popover>
              )}
            </Box>

            <FormControl fullWidth variant="outlined">
              <Select
                value={selectedMenu}
                onChange={(e) => setSelectedMenu(e.target.value)}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
                size="small"
              >
                <MenuItem value="" disabled>
                  제공메뉴
                </MenuItem>
                {menus.map((menu, index) => (
                  <MenuItem key={index} value={menu.menuName}>
                    {menu.menuName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              {actionsSlot ? (
                actionsSlot
              ) : (
                <>
                  {shouldShowRefundButton && (
                    <Button
                      variant="outlined"
                      sx={{
                        flex: 1,
                        borderColor: "#E0E0E0",
                        color: "#757575",
                        fontWeight: "bold",
                      }}
                      onClick={handleClickRefund}
                    >
                      {giftType === "RECEIVED" ? "선물 거절" : "구독권 환불"}
                    </Button>
                  )}
                  {giftType !== "SENT" && (
                    <Button
                      variant="contained"
                      onClick={() => setIsFlipped(true)}
                      sx={{
                        flex: 1,
                        backgroundColor: "#424242",
                        "&:hover": { backgroundColor: "#616161" },
                        position: "relative",
                        zIndex: 6,
                        pointerEvents: "auto",
                      }}
                    >
                      사용 내역
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Box>

          {/* BACK FACE (Usage History) */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              display: "flex",
              flexDirection: "column",
              p: 0,
              pointerEvents: isFlipped ? "auto" : "none",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <HistoryIcon />
                <Typography variant="h6" fontWeight="bold">
                  사용 내역
                </Typography>
              </Box>
              <IconButton
                aria-label="close usage"
                onClick={() => setIsFlipped(false)}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <MuiDivider sx={{ mb: 1 }} />

            {/* Monthly grouped usage */}
            <Box sx={{ overflowY: "auto" }}>
              {Object.keys(usageByMonth).length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  사용 내역이 없습니다.
                </Typography>
              )}
              {Object.entries(usageByMonth).map(([month, days]) => (
                <Accordion
                  key={month}
                  disableGutters
                  sx={{ boxShadow: "none", border: "1px solid #eee", mb: 1 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarMonthIcon fontSize="small" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        {month}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <List dense>
                      {days.map((iso) => {
                        const d = new Date(iso);
                        const dateLabel = isNaN(d)
                          ? iso
                          : `${d.getFullYear()}-${String(
                              d.getMonth() + 1
                            ).padStart(2, "0")}-${String(d.getDate()).padStart(
                              2,
                              "0"
                            )}`;
                        return (
                          <ListItem key={iso} disablePadding sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                              <HistoryIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primaryTypographyProps={{ variant: "body2" }}
                              primary={dateLabel}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            {/* Back actions */}
            <Box
              sx={{
                mt: "auto",
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
              }}
            ></Box>
          </Box>
        </Box>
      </Box>
      {isUsageStatusExpired && !isFlipped && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(97, 97, 97, 0.5)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
            pointerEvents: "auto",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: "#fff", textAlign: "center" }}
          >
            구독권 만료
          </Typography>
        </Box>
      )}
      {isRefunded && !isFlipped && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(97, 97, 97, 0.5)",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
            pointerEvents: "auto",
            px: 2,
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: "#fff", textAlign: "center" }}
          >
            환불되었습니다.
          </Typography>
          {refundedAt && (
            <Typography
              variant="body2"
              sx={{ color: "#fff", textAlign: "center", mt: 1 }}
            >
              {`환불시각: ${new Date(refundedAt).toLocaleString("ko-KR")}`}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

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

  const usedAt = usedAtFromHistory.length > 0
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
  const { usedAt, refundReasons, refundedAt, isRefunded } = normalizeUsageAndRefund(s);

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
    infinite: currentList.length > 2,
    speed: 500,
    slidesToShow: 2,
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
          refundedAtFromApi ??
          removed.refundedAt ??
          new Date().toISOString(),
      };
      setExpiredList((prev) => [...prev, moved]);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Typography variant="h6" component="h2" fontWeight="bold">
          구독권
        </Typography>
      </Box>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ borderBottom: 1, borderColor: "divider", mt: 0.5, mb: 3 }}
      >
        <Tab value="all" label="사용 가능한 구독권" />
        <Tab value="expired" label="만료된 구독권" />
      </Tabs>
      {loading ? (
        <Typography>불러오는 중…</Typography>
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
              color: "black",
              backgroundColor: "white",
              boxShadow: 3,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.8)" },
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
              color: "black",
              backgroundColor: "white",
              boxShadow: 3,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.8)" },
            }}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
         <Box sx={{ mt: 6, textAlign: "center" }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                구독권 내역이 비어 있습니다.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                구독권 구매시 이곳에서 구독권을 확인할 수 있습니다.
              </Typography>
            </Box>
      )}
    </Container>
  );
};

export default SubscriptionPage;
