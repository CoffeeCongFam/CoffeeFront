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
  Chip,
} from "@mui/material";
import useAppShellMode from "../../../hooks/useAppShellMode";
import api from "../../../utils/api";
import orderHistoryList from "../../../data/customer/orderHistoryList";
import OrderStatusButton from "../../../components/customer/order/OrderStatusButton";
import { fetchOrderDetail } from "../../../apis/customerApi";

function handleSubscriptionType(type) {
  switch (type) {
    case "STANDARD":
      return "일반 구독권";
    case "PREMIUM":
      return "프리미엄 구독권";
    // 실제 백엔드 enum에 맞게 수정해서 쓰면 됨
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

// /api/customer/orders?period=1M -> 한달
// /api/customer/orders?period=1Y -> 1년
// /api/customer/orders?period=CUSTOM&startDate=2025-11-06&endDate=2025-11-07 -> 기간설정

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

  console.log(params);

  const res = await api.get("/me/orders", { params });

  // 응답 구조: { success, data: { ordersList, nextCursor, hasNext }, message }
  return res.data;
}

function OrderHistory() {
  const { isAppLike } = useAppShellMode();

  const [period, setPeriod] = useState("1M");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [orders, setOrders] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);

  const [sortOrder, setSortOrder] = useState("DESC"); // 정렬

  // 모달 상태
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // 정렬된 리스트 메모이제이션
  const sortedOrders = useMemo(() => {
    const copy = [...orders];
    copy.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === "DESC" ? bTime - aTime : aTime - bTime;
    });
    return copy;
  }, [orders, sortOrder]);

  // 1개월 / 1년 선택 시 자동 조회 + 날짜 자동 세팅
  useEffect(() => {
    if (period === "CUSTOM") return;

    const { startDate, endDate } = getPresetRange(period);
    setStartDate(startDate);
    setEndDate(endDate);

    loadOrders({ reset: true, period });
  }, [period]);

  // 첫 로딩은 1개월 기준
  useEffect(() => {
    loadOrders({ reset: true, period: "1M" });
  }, []);

  async function loadOrders({ reset, period: selectedPeriod, cursor = null }) {
    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsMoreLoading(true);
      }
      console.log("주문 내역 조회");

      // 주문 내역 조회
      const res = await fetchOrderHistoryApi({
        period: selectedPeriod,
        startDate: selectedPeriod === "CUSTOM" ? startDate : undefined,
        endDate: selectedPeriod === "CUSTOM" ? endDate : undefined,
        nextCursor: cursor ?? null,
      });

      const { ordersList, nextCursor: newCursor, hasNext } = res.data;

      if (reset) {
        setOrders(ordersList || []);
      } else {
        setOrders((prev) => [...prev, ...(ordersList || [])]);
      }

      setNextCursor(newCursor || null);
      setHasNext(!!hasNext);
    } catch (err) {
      console.log(err);
      setOrders(orderHistoryList);
      setNextCursor(null);
      setHasNext(false);
    } finally {
      setIsLoading(false);
      setIsMoreLoading(false);
    }
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

  function handlePeriodChange(_event, value) {
    if (!value) return;
    setPeriod(value);
  }

  function handleCustomSearch() {
    if (!startDate || !endDate) {
      alert("조회할 시작일과 종료일을 모두 선택해주세요.");
      return;
    }
    if (startDate > endDate) {
      alert("시작일이 종료일보다 클 수 없습니다.");
      return;
    }
    // CUSTOM 기준으로 새로 조회
    loadOrders({ reset: true, period: "CUSTOM" });
  }

  function handleLoadMore() {
    if (!hasNext || !nextCursor) return;
    loadOrders({ reset: false, period, cursor: nextCursor });
  }

  return (
    <Box
      sx={{
        px: isAppLike ? 2 : 12,
        py: isAppLike ? 2 : 5,
        pb: isAppLike ? 9 : 8,
        minHeight: "100%",
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // 데스크탑도 무조건 column
          gap: 1.5,
          mb: 2,
        }}
      >
        {/* 제목 */}
        <Typography
          sx={{
            fontSize: { xs: "1.5rem", md: "1.9rem" },
            fontWeight: "bold",
            lineHeight: 1.1,
            mb: "2%",
          }}
        >
          주문 내역
          {/* 나의 주문 현황 */}
        </Typography>
      </Box>

      {/* 기간 선택 영역 */}
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

        {/* 기간 설정일 때만 날짜 입력 활성화 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            alignItems: { xs: "stretch", sm: "center" },
            mb: 2,
          }}
        >
          <TextField
            label="시작일"
            type="date"
            // size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={period !== "CUSTOM"}
            sx={{ flex: 1 }}
            disabledFuture
          />
          <Typography sx={{ display: { xs: "none", sm: "block" } }}>
            ~
          </Typography>
          <TextField
            label="종료일"
            type="date"
            // size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={period !== "CUSTOM"}
            sx={{ flex: 1 }}
          />

          <Button
            variant="contained"
            sx={{
              whiteSpace: "nowrap",
            }}
            disabled={period !== "CUSTOM"}
            onClick={handleCustomSearch}
          >
            조회
          </Button>
        </Box>
      </Box>
      {/* 총 개수 + 정렬 영역 */}
      {!isLoading && orders.length > 0 && (
        <Box
          sx={{
            mb: 1.5,
            pl: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            전체 {orders.length}건
          </Typography>

          <TextField
            select
            size="small"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            sx={{ width: 140 }}
          >
            <MenuItem value="DESC">최신순</MenuItem>
            <MenuItem value="ASC">오래된 순</MenuItem>
          </TextField>
        </Box>
      )}

      {/* 주문 리스트 영역 */}
      <Box>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 5,
            }}
          >
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Box
            sx={{
              bgcolor: "#f5f5f5",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
            }}
          >
            <Typography>해당 기간에 주문 내역이 없습니다.</Typography>
          </Box>
        ) : (
          <>
            <List>
              {sortedOrders.map((order) => (
                <React.Fragment key={order.orderId}>
                  <ListItemButton
                    // 기존: onClick={() => navigate(`/me/order/${order.orderId}`)}
                    onClick={() => handleClickOrder(order)}
                  >
                    <ListItemText
                      primary={`${order.storeName} ${order.subscriptionName}`}
                      secondary={formatKoreanDateTime(order.createdAt)}
                    />
                    <OrderStatusButton status={order.orderStatus} />
                  </ListItemButton>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>

            {/* 더보기 버튼 */}
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

      {/* 주문 상세 모달 */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent
          sx={{
            p: 0,
            // bgcolor: "#f5f5f5"
          }}
        >
          {isDetailLoading || !selectedOrder ? (
            <Box
              sx={{
                py: 4,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box
              sx={{
                mt: 0,
                mx: "auto",
                maxWidth: 420,
                // backgroundColor: "white",
                // borderRadius: 2,
                p: 3,
                // boxShadow: 1,
              }}
            >
              {/* 제목 */}
              <Typography
                variant="h6"
                textAlign="center"
                mb={2}
                fontWeight={"bold"}
              >
                주문 번호 {selectedOrder.orderNumber}번
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {/* 주문 정보 섹션 */}
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
                <Typography color="text.secondary">카페명</Typography>
                <Typography>{selectedOrder.store.storeName}</Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography color="text.secondary">주문 번호</Typography>
                <Typography>{selectedOrder.orderNumber}</Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography color="text.secondary">구독권명</Typography>
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
                <Typography color="text.secondary">주문 일시</Typography>
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
                  <Typography color="text.secondary">취소 일시</Typography>
                  <Typography>
                    {new Date(selectedOrder.canceledAt).toLocaleString()}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ mb: 2 }} />

              {/* 주문 메뉴 섹션 */}
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
                  <Typography>{m.quantity} 잔</Typography>
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
                    // onClick={() => { /* 주문 취소 로직 추가 예정 */ }}
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
