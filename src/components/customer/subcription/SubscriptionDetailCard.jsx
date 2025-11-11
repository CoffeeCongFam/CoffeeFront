import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  MenuItem,
  Select,
  FormControl,
  IconButton,
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
import { postRefund } from "../../../utils/payments";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import HistoryIcon from "@mui/icons-material/History";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ImageIcon from "@mui/icons-material/Image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CommonAlert from "../../common/CommonAlert";
import CommonConfirm from "../../common/CommonConfirm";

// 구독권 상세 정보 컴포넌트
export const SubscriptionDetailCard = ({
  subscriptionData,
  isGifted = false,
  isExpired = false,
  actionsSlot = null,
  giftType,
  onRefundSuccess = null,
  isRefunded: isRefundedProp,
  purchaseId,
  hideCancel = false,
  headerExtra = null,
  size = "default",
}) => {
  const [selectedMenu, setSelectedMenu] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [refundAnchorEl, setRefundAnchorEl] = useState(null);
  const openRefundPopover = Boolean(refundAnchorEl);
  const handleOpenRefundPopover = (e) => setRefundAnchorEl(e.currentTarget);
  const handleCloseRefundPopover = () => setRefundAnchorEl(null);

  const [giftAnchorEl, setGiftAnchorEl] = useState(null);
  const openGiftPopover = Boolean(giftAnchorEl);
  const handleOpenGiftPopover = (e) => setGiftAnchorEl(e.currentTarget);
  const handleCloseGiftPopover = () => setGiftAnchorEl(null);

  // 확인창
  const [confirm, setConfirm] = useState({
    open: false,
    targetId: null,
  });

  // 경고창
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // 모바일용 "제공 메뉴" 메시지 Popover
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const openMenuPopover = Boolean(menuAnchorEl);
  const handleOpenMenuPopover = (e) => setMenuAnchorEl(e.currentTarget);
  const handleCloseMenuPopover = () => setMenuAnchorEl(null);
  // 모바일 상세 정보 확장 여부
  const [isMobileDetailExpanded, setIsMobileDetailExpanded] = useState(false);
  const isCompact = size === "compact";
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
    subscriptionStart,
    subscriptionEnd,
    subscriptionPeriod,
    giftMessage,
    paidAt,
  } = subscriptionData;

  // 구독 기간 및 남은 일 수 계산
  const parseDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d) ? null : d;
  };

  // subscriptionStart/subscriptionEnd 또는 subStart/subEnd 지원
  const startDate = parseDate(subStart || subscriptionStart);
  const endDate = parseDate(subEnd || subscriptionEnd);

  const formatDate = (d) => {
    if (!d) return "-";
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  };

  const subPeriodLabel =
    startDate && endDate
      ? `${formatDate(startDate)} ~ ${formatDate(endDate)}`
      : startDate
      ? `${formatDate(startDate)} ~ -`
      : "";

  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  let remainingDaysLabel = "-";
  if (endDate) {
    const diffMs = endDate.getTime() - todayMidnight.getTime();
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (remainingDays <= 0) {
      remainingDaysLabel = "만료";
    } else {
      remainingDaysLabel = `${remainingDays}일 남음`;
    }
  }
  // 선물 보낸 날짜 계산 및 포맷
  const paidDate = paidAt ? parseDate(paidAt) : null;
  const formattedPaidDate = paidDate ? formatDate(paidDate) : "-";

  const isGift = isGifted || giftType === "SENT" || giftType === "RECEIVED";

  const periodRangeLabel = subPeriodLabel;

  const periodSubLabel =
    isGift && subscriptionPeriod != null
      ? `${subscriptionPeriod}일 구독`
      : null;
  // 선물(보낸) 구독 기간 텍스트 helper
  const sentGiftPeriodLabel =
    subscriptionPeriod != null ? `${subscriptionPeriod}일 구독` : "-";

  const dailyRemainCount = subscriptionData.dailyRemainCount ?? 0;
  const isDailyUsedUp = dailyRemainCount <= 0;
  const menus = Array.isArray(menuNameList)
    ? menuNameList
    : Array.isArray(menuList)
    ? menuList
    : [];

  const normalizedMenus = menus
    .map((m) => {
      if (!m) return null;
      if (typeof m === "string") return m;
      if (typeof m === "object" && "menuName" in m) return m.menuName;
      return null;
    })
    .filter(Boolean);
  const resolvedMaxDaily = maxDailyUsage ?? subscriptionData.dailyRemainCount;
  const dailyLabel =
    giftType === "RECEIVED" ? "일일 잔여" : "일일 사용가능 횟수";
  const dailyContent = isDailyUsedUp
    ? `당일 사용횟수 소진`
    : `${resolvedMaxDaily ?? 0}잔`;

  const formattedPrice = price.toLocaleString();

  // ---- Refund Reasons & Button visibility ----
  const refundReasonsRaw = cardRefundReasons ?? null;
  const normalizedReasons = Array.isArray(refundReasonsRaw)
    ? refundReasonsRaw.map((r) => (r || "").toString().toUpperCase())
    : [];
  const refundedAt = cardRefundedAt ?? "";
  const isRefunded =
    typeof isRefundedProp === "boolean"
      ? isRefundedProp
      : typeof cardIsRefunded === "boolean"
      ? cardIsRefunded
      : !!(refundedAt && String(refundedAt).trim() !== "");

  const usedHistoryCount = Array.isArray(usedAt) ? usedAt.length : 0;
  const startDateForRefund =
    subStart || subscriptionStart
      ? new Date(subStart || subscriptionStart)
      : null;
  const todayForRefund = new Date();
  let diffDaysFromStart = 0;
  if (startDateForRefund && !isNaN(startDateForRefund)) {
    const diffMs = todayForRefund.getTime() - startDateForRefund.getTime();
    diffDaysFromStart = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
  const hasUsedHistory = usedHistoryCount > 0;
  const isOverSevenDays = diffDaysFromStart >= 8;

  let refundMessage = null;
  let isRefundable = true;

  if (normalizedReasons.length > 0) {
    isRefundable = false;
    const hasOver = normalizedReasons.includes("OVER_PERIOD");
    const hasUsed = normalizedReasons.includes("USED_ALREADY");

    if (hasOver && hasUsed) {
      refundMessage = "환불 기간 및 사용내역이 존재하여 환불이 불가능합니다.";
    } else if (hasOver) {
      refundMessage = "구매후 7일 경과하여 환불이 불가능합니다.";
    } else if (hasUsed) {
      refundMessage = "이미 사용한 구독권으로 환불이 불가능합니다.";
    } else {
      refundMessage = "환불이 불가능합니다.";
    }
  } else {
    if (hasUsedHistory && isOverSevenDays) {
      isRefundable = false;
      refundMessage = "환불 기간 및 사용내역이 존재하여 환불이 불가능합니다.";
    } else if (hasUsedHistory) {
      isRefundable = false;
      refundMessage = "이미 사용한 구독권으로 환불이 불가능합니다.";
    } else if (isOverSevenDays) {
      isRefundable = false;
      refundMessage = "구매후 7일 경과하여 환불이 불가능합니다.";
    }
  }

  const InfoBox = ({ title, content, subContent = null }) => (
    <Box
      sx={{
        flexGrow: 1,
        padding: 0.5,
        borderRadius: "8px",
        minHeight: "48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
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
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
        2,
        "0"
      )}`;
      if (!map[key]) map[key] = [];
      map[key].push(iso);
    });
    const sorted = Object.keys(map)
      .sort((a, b) => (a < b ? 1 : -1))
      .reduce((acc, k) => {
        acc[k] = map[k].sort((a, b) => (a < b ? 1 : -1));
        return acc;
      }, {});
    return sorted;
  };
  const usageByMonth = groupByMonth(usageDates);

  const shouldShowRefundButton = isRefundable && !hideCancel;

  const isUsageStatusExpired = subscriptionData?.usageStatus === "EXPIRED";

  const denyConfirmMessage =
    giftType === "RECEIVED"
      ? "정말 이 선물을 거절하시겠습니까?"
      : "정말 결제를 취소하시겠습니까?";

  const handleClickRefund = () => {
    setConfirm({
      open: true,
      targetId: purchaseId,
    });
  };

  const handleRefundOrDeny = async () => {
    const pid = purchaseId ?? subscriptionData?.purchaseId;

    if (!pid) {
      handleShowAlert("warning", "환불에 필요한 구매 id 가 없습니다.");
      // window.alert("환불에 필요한 purchaseId가 없습니다.");
      return;
    }

    try {
      const res = await postRefund(pid);

      if (res && res.success) {
        const refundedAtFromApi = res?.data?.refundedAt ?? null;
        if (typeof onRefundSuccess === "function") {
          onRefundSuccess(
            pid,
            refundedAtFromApi,
            subscriptionData?.memberSubscriptionId
          );
        }
      } else {
        handleShowAlert("error", "환불처리에 실패했습니다. 다시 시도해주세요");
        // window.alert(
        //   res?.message || "환불처리에 실패했습니다. 다시 시도해주세요"
        // );
      }
    } catch (e) {
      const message =
        e.message || "환불처리에 문제가 생겼습니다. 다시 시도해주세요";
      handleShowAlert("error", message);

      // window.alert(
      //   e?.message || "환불처리에 문제가 생겼습니다. 다시 시도해주세요"
      // );
    } finally {
      setConfirm({ open: false, targetId: null });
    }
  };

  // 경고창
  const handleShowAlert = (type, message) => {
    setAlert({
      open: true,
      message: message,
      severity: type,
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: { xs: 320, sm: 760 },
        margin: "auto",
        p: { xs: 2, sm: 2.5 },
        borderRadius: { xs: "16px", sm: "18px" },
        height: { xs: 480, sm: 460 },
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#fff7e6",
        border: "1px solid #ffe0b2",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          perspective: "1000px",
          filter: isExpired ? "grayscale(60%) blur(0px) opacity(0.85)" : "none",
        }}
      >
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
              justifyContent: "flex-start",
              p: 0,
              pointerEvents: isFlipped ? "none" : "auto",
            }}
          >
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                pr: 0.5,
                pb: 1,
                "&::-webkit-scrollbar": {
                  width: 4,
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#ccc",
                  borderRadius: 2,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 1.5, sm: 2 },
                  mt: 1,
                  minHeight: 0,
                }}
              >
                {/* LEFT STRIP: 이미지 + 타입 + 선물 정보 */}
                <Box
                  sx={{
                    flexBasis: { xs: "100%", sm: "32%" },
                    maxWidth: { xs: "100%", sm: "32%" },
                    minWidth: 0,
                    borderRadius: 2,
                    bgcolor: "#334336",
                    color: "#fff9f4",
                    p: { xs: 1.25, sm: 1.5 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      borderRadius: 2,
                      overflow: "hidden",
                      bgcolor: "#334336",
                      border: "1px solid #ffe0b2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: { xs: 1.25, sm: 1.5 },
                      aspectRatio: "3 / 4",
                      position: "relative",
                    }}
                  >
                    {storeImg && !imgError ? (
                      <Box
                        component="img"
                        src={storeImg}
                        alt={storeName || "구독권 이미지"}
                        onError={() => setImgError(true)}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <ImageIcon sx={{ fontSize: 56, color: "grey.400" }} />
                    )}

                    {isGift && giftType === "RECEIVED" && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 7,
                          left: 8,
                          px: 1,
                          py: 0.3,
                          borderRadius: 999,
                          bgcolor: "#334336",
                          border: "1px solid #ffe0b2",
                          maxWidth: "90%",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#fff9f4",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {"From. " + (subscriptionData?.giverName ?? "누군가")}
                        </Typography>
                      </Box>
                    )}
                    {isGift && giftType === "SENT" && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 7,
                          left: 8,
                          px: 1,
                          py: 0.3,
                          borderRadius: 999,
                          bgcolor: "#334336",
                          border: "1px solid #ffe0b2",
                          maxWidth: "90%",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#fff9f4",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {`For. ${subscriptionData?.receiver ?? "수신자"}`}
                        </Typography>
                      </Box>
                    )}
                    {/* 이미지 우측 상단: 선물 메시지 보기 버튼 */}
                    {isGift && giftMessage && giftMessage.trim() !== "" && (
                      <>
                        <Box
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            px: 1,
                            py: 0.5,
                            borderRadius: 999,
                            bgcolor: "#334336",
                            border: "1px solid #ffe0b2",
                            maxWidth: "90%",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                          onClick={handleOpenGiftPopover}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#fff9f4",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            💌
                          </Typography>
                        </Box>
                        <Popover
                          id={
                            openGiftPopover ? "gift-message-popover" : undefined
                          }
                          open={openGiftPopover}
                          anchorEl={giftAnchorEl}
                          onClose={handleCloseGiftPopover}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                          PaperProps={{ sx: { p: 1.5, maxWidth: 280, mt: 1 } }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.primary",
                              whiteSpace: "pre-line",
                            }}
                          >
                            {giftMessage}
                          </Typography>
                        </Popover>
                      </>
                    )}
                    {/* 모바일 전용: 이미지 위에 겹쳐지는 요약 정보 카드 (확장/축소) */}
                    <Box
                      sx={{
                        display: { xs: "flex", sm: "none" },
                        position: "absolute",
                        left: 8,
                        right: 8,
                        bottom: 8,
                        top: isMobileDetailExpanded ? 8 : "auto",
                        borderRadius: 2,
                        bgcolor: "#334336",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        px: 1.25,
                        py: 0.75,
                        boxShadow: "0 10px 30px rgba(51, 67, 54, 0.6)",
                        displayPrint: "none",
                        flexDirection: "column",
                        gap: 0.25,
                        maxHeight: "100%",
                        overflowY: "auto",
                      }}
                    >
                      {/* 상단: 타입 + 위로 펼침 버튼 + 잔여/일일 사용 횟수 */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255, 249, 244, 0.95)",
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                            fontWeight: 600,
                          }}
                        >
                          {subscriptionType || "Subscription"}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setIsMobileDetailExpanded((prev) => !prev)
                          }
                          sx={{
                            bgcolor: "#334336",
                            borderRadius: 999,
                            padding: 0.25,
                            "&:hover": {
                              bgcolor: "#334336",
                            },
                          }}
                        >
                          {isMobileDetailExpanded ? (
                            <ExpandMoreIcon
                              sx={{ fontSize: 18, color: "#fff9f4" }}
                            />
                          ) : (
                            <ExpandLessIcon
                              sx={{ fontSize: 18, color: "#fff9f4" }}
                            />
                          )}
                        </IconButton>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.2,
                            borderRadius: 999,
                            bgcolor: "#334336",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#fff9f4",
                              fontWeight: 600,
                              fontSize: "0.7rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {dailyContent}
                          </Typography>
                        </Box>
                      </Box>
                      {/* 매장 이름 */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#fff9f4",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          mt: 0.25,
                        }}
                      >
                        {storeName}
                      </Typography>
                      {/* 가격 + 구독 기간 요약 */}
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 249, 244, 0.85)",
                          fontWeight: 500,
                          mt: 0.25,
                        }}
                      >
                        ₩{formattedPrice}/월
                        {periodSubLabel && (
                          <>
                            {" \u2022 "}
                            {periodSubLabel}
                          </>
                        )}
                      </Typography>
                      {/* 확장 상태에서만 추가 상세정보 표시 */}
                      {isMobileDetailExpanded && (
                        <Box
                          sx={{
                            mt: 0.75,
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                          }}
                        >
                          {/* 구독/선물 정보 요약 */}
                          <Box>
                            {giftType === "SENT" ? (
                              <>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "rgba(255, 249, 244, 0.95)",
                                    fontWeight: 600,
                                  }}
                                >
                                  • 구독 기간
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#fff9f4", display: "block" }}
                                >
                                  {sentGiftPeriodLabel}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "rgba(255, 249, 244, 0.95)",
                                    fontWeight: 600,
                                    mt: 0.5,
                                  }}
                                >
                                  • 선물 보낸 날짜
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#fff9f4", display: "block" }}
                                >
                                  {formattedPaidDate}
                                </Typography>
                              </>
                            ) : (
                              <>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "rgba(255, 249, 244, 0.95)",
                                    fontWeight: 600,
                                  }}
                                >
                                  • 구독 기간
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#fff9f4", display: "block" }}
                                >
                                  {periodRangeLabel || "-"}
                                </Typography>
                                {remainingDaysLabel && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#fff9f4",
                                      opacity: 0.85,
                                    }}
                                  >
                                    {remainingDaysLabel}
                                  </Typography>
                                )}
                              </>
                            )}
                          </Box>
                          {/* 상세설명 */}
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "rgba(255, 249, 244, 0.95)",
                                fontWeight: 600,
                              }}
                            >
                              • 상세설명
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "rgba(255, 249, 244, 0.85)",
                                display: "block",
                                mt: 0.25,
                                whiteSpace: "pre-line",
                              }}
                            >
                              {subscriptionDesc || "-"}
                            </Typography>
                          </Box>
                          {/* 환불 불가 정보 */}
                          {!isRefundable && refundMessage && (
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ color: "#fecaca", fontWeight: 700 }}
                              >
                                환불 불가
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#fecaca",
                                  display: "block",
                                  mt: 0.25,
                                }}
                              >
                                {refundMessage}
                              </Typography>
                            </Box>
                          )}
                          {/* 제공 메뉴 리스트 */}
                          {normalizedMenus.length > 0 && (
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "rgba(255, 249, 244, 0.95)",
                                  fontWeight: 600,
                                }}
                              >
                                • 제공 메뉴
                              </Typography>
                              <Box sx={{ mt: 0.25 }}>
                                {normalizedMenus.map((menuName, idx) => (
                                  <Typography
                                    key={idx}
                                    variant="caption"
                                    sx={{
                                      color: "#fff9f4",
                                      display: "block",
                                      whiteSpace: "nowrap",
                                      textOverflow: "ellipsis",
                                      overflow: "hidden",
                                      pl: 1.5,
                                    }}
                                  >
                                    {menuName}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {subscriptionType && (
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 999,
                        bgcolor: "#334336",
                        border: "1px solid #ffe0b2",
                        mb: 1,
                        display: { xs: "none", sm: "inline-flex" },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          letterSpacing: 0.8,
                          textTransform: "uppercase",
                        }}
                      >
                        {subscriptionType}
                      </Typography>
                    </Box>
                  )}

                  {isGift && giftType === "SENT" && (
                    <Box sx={{ mt: 0.5, textAlign: "center" }}>
                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.85, lineHeight: 1.4 }}
                      ></Typography>
                    </Box>
                  )}
                </Box>

                {/* RIGHT AREA: 상세 정보 */}
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: { xs: "none", sm: "flex" },
                    flexDirection: "column",
                    mt: { xs: 1, md: 0 },
                  }}
                >
                  <Box
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          textTransform: "uppercase",
                          letterSpacing: 0.6,
                          mb: 0.3,
                        }}
                      >
                        {subscriptionType || "Subscription"}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          color: "#3B3026",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {storeName}
                      </Typography>
                    </Box>
                    {headerExtra && (
                      <Box sx={{ flexShrink: 0 }}>{headerExtra}</Box>
                    )}
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: "nowrap",
                        color: "#3B3026",
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>₩{formattedPrice}</span>
                      /월
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      mt: 1.5,
                      p: { xs: 1.25, sm: 1.5 },
                      borderRadius: 2,
                      bgcolor: "#fff9f4",
                      border: "1px solid #ffe0b2",
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                      },
                      columnGap: 1.5,
                      rowGap: 1,
                    }}
                  >
                    <InfoBox title="금액" content={`${formattedPrice}원`} />
                    {giftType === "SENT" ? (
                      <>
                        <InfoBox
                          title="구독 기간"
                          content={sentGiftPeriodLabel}
                        />
                        <InfoBox
                          title="선물 보낸 날짜"
                          content={formattedPaidDate}
                        />
                      </>
                    ) : (
                      <>
                        <InfoBox
                          title="구독 기간"
                          content={periodRangeLabel}
                          subContent={periodSubLabel}
                        />
                        <InfoBox
                          title="남은 일수"
                          content={remainingDaysLabel}
                        />
                      </>
                    )}
                    <InfoBox title={dailyLabel} content={dailyContent} />
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
                        sx={{ color: "#3B3026" }}
                        fontWeight="bold"
                      >
                        상세설명
                      </Typography>
                      {!isRefundable && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
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
                    {!isRefundable && (
                      <Popover
                        id={openRefundPopover ? "refund-popover" : undefined}
                        open={openRefundPopover}
                        anchorEl={refundAnchorEl}
                        onClose={handleCloseRefundPopover}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        PaperProps={{ sx: { p: 1, maxWidth: 280 } }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "error.main" }}
                        >
                          {refundMessage}
                        </Typography>
                      </Popover>
                    )}
                  </Box>

                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      mt: 1.5,
                      mb: 0.5,
                      display: { xs: "none", sm: "block" },
                    }}
                  >
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
                      {normalizedMenus.map((menuName, index) => (
                        <MenuItem key={index} value={menuName}>
                          {menuName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 1.5,
                mt: 1,
                pt: 1,
                borderTop: "1px solid #ffe0b2",
                flexShrink: 0,
                bgcolor: "#fff9f4",
                borderRadius: { xs: "0 0 16px 16px", sm: "0 0 18px 18px" },
                mx: { xs: -2, sm: -2.5 },
                mb: { xs: -2, sm: -2.5 },
                px: { xs: 2, sm: 2.5 },
                pb: { xs: 2, sm: 2.5 },
              }}
            >
              {actionsSlot ? (
                actionsSlot
              ) : (
                <>
                  {shouldShowRefundButton && (
                    <Button
                      variant="outlined"
                      sx={{
                        flex: 1,
                        borderColor: "#334336",
                        color: "#3B3026",
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
                        backgroundColor: "#334336",
                        color: "#fff9f4",
                        "&:hover": { backgroundColor: "#334336", opacity: 0.9 },
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
                  sx={{ boxShadow: "none", border: "1px solid #ffe0b2", mb: 1 }}
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
                          : `${d.getUTCFullYear()}-${String(
                              d.getUTCMonth() + 1
                            ).padStart(2, "0")}-${String(
                              d.getUTCDate()
                            ).padStart(2, "0")}`;
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
          </Box>
        </Box>
      </Box>
      {isUsageStatusExpired && !isFlipped && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(51, 67, 54, 0.5)",
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
            sx={{ color: "#fff9f4", textAlign: "center" }}
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
            bgcolor: "rgba(51, 67, 54, 0.5)",
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
            sx={{ color: "#fff9f4", textAlign: "center" }}
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

      <CommonConfirm
        open={confirm.open}
        onClose={() => setConfirm({ open: false, targetId: null })}
        onConfirm={handleRefundOrDeny}
        title="구독권 환불 확인"
        message={denyConfirmMessage}
        confirmText="삭제"
        cancelText="취소"
      />

      <CommonAlert
        open={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        severity={alert.severity}
        message={alert.message}
      />
    </Paper>
  );
};
