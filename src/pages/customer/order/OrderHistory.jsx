import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useAppShellMode from "../../../hooks/useAppShellMode";
import api from "../../../utils/api";
import OrderStatusButton from "../../../components/customer/order/OrderStatusButton";
import { fetchOrderDetail } from "../../../apis/customerApi";

function handleSubscriptionType(type) {
  switch (type) {
    case "STANDARD":
      return "일반 구독권";
    case "PREMIUM":
      return "프리미엄 구독권";
    default:
      return type || "구독권";
  }
}

// 기간 토글 변경 시 날짜 업데이트 함수
function getPresetRange(period) {
  const end = new Date(); // 오늘
  const start = new Date(end); // 복사

  if (period === "1M") {
    start.setMonth(start.getMonth() - 1);
  } else if (period === "1Y") {
    start.setFullYear(start.getFullYear() - 1);
  }

  const toYmd = (d) => d.toISOString().slice(0, 10); // yyyy-mm-dd

  return {
    startDate: toYmd(start),
    endDate: toYmd(end),
  };
}

function formatKoreanDateTime(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  const hh = `${d.getHours()}`.padStart(2, "0");
  const min = `${d.getMinutes()}`.padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

// 주문 상태 필터링용
const STATUS_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "REQUEST", label: "주문 요청" },
  { value: "INPROGRESS", label: "제조 중" },
  { value: "COMPLETED", label: "완료" },
  { value: "CANCELED", label: "주문 취소" },
  { value: "REJECTED", label: "매장 취소" },
];

async function fetchOrderHistoryApi({
  period,
  startDate,
  endDate,
  nextCursor,
}) {
  const params = { period };

  if (period === "CUSTOM") {
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
  }

  if (nextCursor) {
    params.nextCursor = nextCursor;
  }

  const res = await api.get("/me/orders", { params });
  return res.data;
}

function OrderHistory() {
  const { isAppLike } = useAppShellMode();

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [period, setPeriod] = useState("1M");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [orders, setOrders] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);

  const [sortOrder, setSortOrder] = useState("DESC");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 상세 모달
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // 모바일용 기간 설정 다이얼로그 상태
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftPeriod, setDraftPeriod] = useState("1M");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");

  // 기간 텍스트 (상단 요약용)
  const rangeLabel = useMemo(() => {
    if (!startDate || !endDate) return "기간 선택";
    const fmt = (d) => d.replaceAll("-", ".");
    return `${fmt(startDate)} ~ ${fmt(endDate)}`;
  }, [startDate, endDate]);

  // 필터 + 정렬 적용된 리스트
  const filteredAndSortedOrders = useMemo(() => {
    const filtered =
      statusFilter === "ALL"
        ? orders
        : orders.filter((o) => o.orderStatus === statusFilter);

    const copy = [...filtered];
    copy.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === "DESC" ? bTime - aTime : aTime - bTime;
    });
    return copy;
  }, [orders, sortOrder, statusFilter]);

  // 초기: 1개월 범위 세팅 + 조회
  useEffect(() => {
    const { startDate: s, endDate: e } = getPresetRange("1M");
    setPeriod("1M");
    setStartDate(s);
    setEndDate(e);
    loadOrders({ reset: true, period: "1M", start: s, end: e });
  }, []);

  // 공통 주문 조회 함수: 항상 start/end를 인자로 받도록 변경
  async function loadOrders({ reset, period: selectedPeriod, cursor = null, start, end }) {
    try {
      if (reset) setIsLoading(true);
      else setIsMoreLoading(true);

      const res = await fetchOrderHistoryApi({
        period: selectedPeriod,
        startDate: selectedPeriod === "CUSTOM" ? start : undefined,
        endDate: selectedPeriod === "CUSTOM" ? end : undefined,
        nextCursor: cursor ?? null,
      });

      const { ordersList, nextCursor: newCursor, hasNext } = res.data;

      if (reset) setOrders(ordersList || []);
      else setOrders((prev) => [...prev, ...(ordersList || [])]);

      setNextCursor(newCursor || null);
      setHasNext(!!hasNext);
    } catch (err) {
      console.log(err);
      setNextCursor(null);
      setHasNext(false);
    } finally {
      setIsLoading(false);
      setIsMoreLoading(false);
    }
  }

  // 데스크탑용 기간 토글 변경
  function handlePeriodChange(_event, value) {
    if (!value) return;
    setPeriod(value);

    if (value === "CUSTOM") {
      // 날짜는 입력 후 '조회' 버튼에서 처리
      return;
    }

    const { startDate: s, endDate: e } = getPresetRange(value);
    setStartDate(s);
    setEndDate(e);
    loadOrders({ reset: true, period: value, start: s, end: e });
  }

  // 데스크탑용 기간설정 조회
  function handleCustomSearch() {
    if (!startDate || !endDate) {
      alert("조회할 시작일과 종료일을 모두 선택해주세요.");
      return;
    }
    if (startDate > endDate) {
      alert("시작일이 종료일보다 클 수 없습니다.");
      return;
    }
    if (endDate > todayStr || startDate > todayStr) {
      alert("미래 날짜는 선택할 수 없습니다.");
      return;
    }

    setPeriod("CUSTOM");
    loadOrders({ reset: true, period: "CUSTOM", start: startDate, end: endDate });
  }

  // 무한 스크롤용 더보기
  function handleLoadMore() {
    if (!hasNext || !nextCursor) return;
    loadOrders({ reset: false, period, cursor: nextCursor, start: startDate, end: endDate });
  }

  async function handleClickOrder(order) {
    try {
      setIsDetailLoading(true);
      const detail = await fetchOrderDetail(order.orderId);
      if (!detail) {
        alert("주문 상세를 불러오지 못했습니다.");
        return;
      }
      setSelectedOrder(detail);
      setDetailOpen(true);
    } catch (e) {
      console.error(e);
      alert("주문 상세를 불러오지 못했습니다.");
    } finally {
      setIsDetailLoading(false);
    }
  }

  // 모바일: 상단 바 클릭 시 다이얼로그 오픈
  function openFilterDialog() {
    setDraftPeriod(period);
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
    setFilterOpen(true);
  }

  // 모바일: 다이얼로그 안 토글 변경
  function handleDraftPeriodChange(_e, value) {
    if (!value) return;
    setDraftPeriod(value);

    if (value === "1M" || value === "1Y") {
      const { startDate: s, endDate: e } = getPresetRange(value);
      setDraftStartDate(s);
      setDraftEndDate(e);
    }
  }

  // 모바일: 다이얼로그에서 조회 버튼
  function handleApplyFilter() {
    let newStart = draftStartDate;
    let newEnd = draftEndDate;

    // 1M / 1Y 에서 혹시라도 비어있으면 다시 세팅
    if (draftPeriod === "1M" || draftPeriod === "1Y") {
      const { startDate: s, endDate: e } = getPresetRange(draftPeriod);
      newStart = s;
      newEnd = e;
    }

    if (draftPeriod === "CUSTOM") {
      if (!newStart || !newEnd) {
        alert("조회할 시작일과 종료일을 모두 선택해주세요.");
        return;
      }
      if (newStart > newEnd) {
        alert("시작일이 종료일보다 클 수 없습니다.");
        return;
      }
      if (newEnd > todayStr || newStart > todayStr) {
        alert("미래 날짜는 선택할 수 없습니다.");
        return;
      }
    }

    setPeriod(draftPeriod);
    setStartDate(newStart);
    setEndDate(newEnd);

    loadOrders({ reset: true, period: draftPeriod, start: newStart, end: newEnd });
    setFilterOpen(false);
  }

  return (
    <Box
      sx={{
        px: isAppLike ? 2 : 12,
        py: isAppLike ? 2 : 5,
        pb: isAppLike ? 9 : 8,
        minHeight: "100%",
        borderRadius: 2,
        border: "1px solid #ffe0b2",
        backgroundColor: "white",
        m: isAppLike ? 2 : 4,
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "1.5rem", md: "1.9rem" },
            fontWeight: "bold",
            lineHeight: 1.1,
            mb: "2%",
            color: "#334336",
          }}
        >
          주문 내역
        </Typography>
      </Box>

      {/* 모바일: 상단 고정 요약 바 (전체 / 날짜) */}
      {isAppLike && (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            bgcolor: "background.paper",
            mb: 2,
            borderBottom: "1px solid #eee",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 1.5,
              alignItems: "center",
              px: 1,
              py: 1.5,
            }}
          >
            <TextField
              label="시작일"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={period !== "CUSTOM"}
              sx={{ flex: 1 }}
              inputProps={{ max: todayStr }}
            />
            <Typography sx={{ display: { xs: "none", sm: "block" }, color: "#334336" }}>
              ~
            </Typography>
            <TextField
              label="종료일"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={period !== "CUSTOM"}
              sx={{ flex: 1 }}
              inputProps={{ max: todayStr }}
            />

            <Button
              variant="contained"
              onClick={handleCustomSearch}
              disabled={period !== "CUSTOM"}
              sx={{
                whiteSpace: "nowrap",
                bgcolor: "#334336",
                color: "#fff9f4",
                "&:hover": {
                  bgcolor: "#334336",
                  opacity: 0.9,
                },
              }}
            >
              조회
            </Button>
          </Box>
        </Box>
      )}

      {/* 데스크탑: 기존 기간 선택 영역 유지 */}
      {!isAppLike && (
        <Box
          sx={{
            borderRadius: 2,
            border: "1px solid #eee",
            p: 2,
            mb: 3,
            width: "100%",
          }}
        >
          {/* 상단 기간 버튼 */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              gap: 1,
              mb: 5,
              flex: 1,
            }}
          >
            <ToggleButtonGroup
              value={period}
              exclusive
              onChange={handlePeriodChange}
              sx={{
                flex: 1,
                width: "100%",
                "& .MuiToggleButton-root": {
                  flex: 1,
                },
              }}
            >
              <ToggleButton value="1M">1개월</ToggleButton>
              <ToggleButton value="1Y">1년</ToggleButton>
              <ToggleButton value="CUSTOM">기간 설정</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* 기간 설정 */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", sm: "row" },
              gap: 1.5,
              alignItems: { xs: "stretch", sm: "center" },
              mb: 2,
            }}
          >
            <TextField
              label="시작일"
              type="date"
              size={isAppLike ? "small" : "medium"}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={period !== "CUSTOM"}
              sx={{ flex: 1 }}
              inputProps={{ max: todayStr }}
            />
            <Typography sx={{ display: { xs: "none", sm: "block", color: "#334336" } }}>~</Typography>
            <TextField
              label="종료일"
              type="date"
              size={isAppLike ? "small" : "medium"}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={period !== "CUSTOM"}
              sx={{ flex: 1 }}
              inputProps={{ max: todayStr }}
            />

            <Button
              variant="contained"
              sx={{ whiteSpace: "nowrap" }}
              disabled={period !== "CUSTOM"}
              onClick={handleCustomSearch}
            >
              조회
            </Button>
          </Box>
        </Box>
      )}

      {/* 총 개수 + 정렬/상태 필터 */}
      {!isLoading && orders.length > 0 && (
        <Box
          sx={{
            mb: 1.5,
            pl: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "#334336" }}>
            전체 {orders.length}건
            {statusFilter !== "ALL" && ` · 필터된 ${filteredAndSortedOrders.length}건`}
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ width: 120 }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              sx={{ width: 120 }}
            >
              <MenuItem value="DESC">최신순</MenuItem>
              <MenuItem value="ASC">오래된 순</MenuItem>
            </TextField>
          </Box>
        </Box>
      )}

      {/* 주문 리스트 */}
      <Box>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 5,
            }}
          >
            <CircularProgress sx={{ color: "#334336" }} />
          </Box>
        ) : filteredAndSortedOrders.length === 0 ? (
          <Box
            sx={{
              bgcolor: "#f5f5f5",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: "#334336" }}>해당 기간에 주문 내역이 없습니다.</Typography>
          </Box>
        ) : (
          <>
            <List>
              {filteredAndSortedOrders.map((order) => (
                <React.Fragment key={order.orderId}>
                  <ListItemButton
                    // 기존: onClick={() => navigate(`/me/order/${order.orderId}`)}
                    onClick={() => handleClickOrder(order)}
                  >
                    <ListItemText sx={{ color: "#334336" }}
                      primary={`${order.storeName} ${order.subscriptionName}`}
                      secondary={formatKoreanDateTime(order.createdAt)}
                    />
                    <OrderStatusButton status={order.orderStatus} />
                  </ListItemButton>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>

            {hasNext && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 2,
                  mb: 4,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={isMoreLoading}
                >
                  {isMoreLoading ? "불러오는 중..." : "이전 내역 더보기"}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* 모바일: 기간 설정 다이얼로그 */}
      {isAppLike && (
        <Dialog
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ fontWeight: "bold" }}>기간 설정</DialogTitle>
          <DialogContent sx={{ pt: 1, pb: 3 }}>
            <Box sx={{ mb: 3 }}>
              <ToggleButtonGroup
                value={draftPeriod}
                exclusive
                onChange={handleDraftPeriodChange}
                sx={{
                  width: "100%",
                  "& .MuiToggleButton-root": {
                    flex: 1,
                  },
                }}
              >
                <ToggleButton value="1M">1개월</ToggleButton>
                <ToggleButton value="1Y">1년</ToggleButton>
                <ToggleButton value="CUSTOM">기간 설정</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "center",
                mb: 2,
              }}
            >
              <TextField
                label="시작일"
                type="date"
                size="small"
                value={draftStartDate}
                onChange={(e) => setDraftStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={draftPeriod !== "CUSTOM"}
                sx={{ flex: 1 }}
                inputProps={{ max: todayStr }}
              />
              <Typography>~</Typography>
              <TextField
                label="종료일"
                type="date"
                size="small"
                value={draftEndDate}
                onChange={(e) => setDraftEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={draftPeriod !== "CUSTOM"}
                sx={{ flex: 1 }}
                inputProps={{ max: todayStr }}
              />
            </Box>

            <Box sx={{ mt: 5, textAlign: "center" }}>
              <Button
                fullWidth
                
                variant="contained"
                onClick={handleApplyFilter}
                sx={{ px: 8, borderRadius: 999, backgroundColor: "black" }}
              >
                조회
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {/* 주문 상세 모달 */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {isDetailLoading || !selectedOrder ? (
            <Box
              sx={{
                py: 4,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress size={24} sx={{ color: "#334336" }} />
            </Box>
          ) : (
            <Box sx={{ mx: "auto", maxWidth: 420, p: 3 }}>
              <Typography
                variant="h6"
                textAlign="center"
                mb={2}
                fontWeight={"bold"}
              >
                주문 번호 {selectedOrder.orderNumber}번
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                주문 정보
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography sx={{ color: "#334336" }}>카페명</Typography>
                <Typography>{selectedOrder.store.storeName}</Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography sx={{ color: "#334336" }}>주문 번호</Typography>
                <Typography>{selectedOrder.orderNumber}</Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography sx={{ color: "#334336" }}>구독권명</Typography>
                <Typography>
                  {handleSubscriptionType(
                    selectedOrder.subscription.subscriptionName
                  )}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography sx={{ color: "#334336" }}>주문 일시</Typography>
                <Typography>
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </Typography>
              </Box>

              {selectedOrder.orderStatus === "CANCELED" && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography sx={{ color: "#334336" }}>취소 일시</Typography>
                  <Typography>
                    {new Date(selectedOrder.canceledAt).toLocaleString()}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ mb: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                주문 메뉴
              </Typography>

              {selectedOrder.menuList?.map((m) => (
                <Box
                  key={m.menuId}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>{m.menuName}</Typography>
                  <Typography>{m.quantity} 개</Typography>
                </Box>
              ))}

              <Box sx={{ mt: 3, textAlign: "right" }}>
                {selectedOrder.orderStatus === "CANCELED" && (
                  <Chip
                    label={"주문 취소 완료"}
                    disabled={selectedOrder.orderStatus !== "REQUEST"}
                    sx={{
                      width: "fit-content",
                      bgcolor: "black",
                      color: "white",
                    }}
                  />
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default OrderHistory;
