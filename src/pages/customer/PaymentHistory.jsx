import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";

// 샘플/로컬 더미 데이터 (있으면 사용)
import sendGiftList from "../../data/customer/sendGiftList";
import refundGiftList from "../../data/customer/refundGiftList";

const isRefunded = (it) => Boolean(it?.refundAt || it?.status === "REFUNDED" || it?.refunded === true);

/**
 * PaymentHistory
 * - 결제 내역 확인 페이지 (MUI 전용 UI)
 * - 최신순/오래된순 정렬 가능
 * - 우선 props.paymentList, 없으면 sendGiftList, 그것도 없으면 /api/payments/me 호출
 */
export default function PaymentHistory({ paymentList }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc"); // desc: 최신순, asc: 오래된순
  const [tab, setTab] = useState("refunded"); // all | refunded | paid

  const hasPropData = Array.isArray(paymentList);
  const hasLocalSeed = Array.isArray(sendGiftList) || Array.isArray(refundGiftList);

  // 날짜 유틸
  const toDate = (v) => (v ? new Date(v) : new Date(0));
  const fmtDate = (d) =>
    new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  const fmtPrice = (n) =>
    typeof n === "number"
      ? new Intl.NumberFormat("ko-KR").format(n)
      : n ?? "-";

  const sortByPaidAt = (arr, order) =>
    [...arr].sort((a, b) => {
      const da = toDate(a.paidAt || a.createdAt);
      const db = toDate(b.paidAt || b.createdAt);
      return order === "asc" ? da - db : db - da;
    });

  // 표준화: 서로 다른 키를 결제 아이템 공통 형태로 정규화
  const normalize = (raw = []) =>
    raw.map((v, i) => ({
      id: v.id ?? i,
      storeName: v.storeName ?? v.merchantName ?? "알 수 없는 매장",
      productName: v.productName ?? v.itemName ?? "상품",
      price: typeof v.price === "number" ? v.price : Number(v.price) || 0,
      subscriptionPeriod: v.subscriptionPeriod ?? v.period ?? null,
      paidAt: v.paidAt ?? v.createdAt ?? null,
      purchaseType: v.purchaseType ?? v.method ?? "결제",
      sender: v.sender ?? v.buyer ?? undefined,
      receiver: v.receiver ?? undefined,
      refundAt: v.refundAt ?? v.refundedAt ?? v.refundDate ?? null,
      status: v.status ?? (v.refundAt || v.refundedAt || v.refundDate ? "REFUNDED" : undefined),
    }));

  // 데이터 로드
  useEffect(() => {
    let ignore = false;
    async function load() {
      // 1) props 우선
      if (hasPropData) {
        const n = normalize(paymentList);
        setItems(sortByPaidAt(n, sortOrder));
        return;
      }
      // 2) 로컬 더미 (sendGiftList + refundGiftList 병합)
      if (hasLocalSeed) {
        const merged = [
          ...(Array.isArray(sendGiftList) ? sendGiftList : []),
          ...(Array.isArray(refundGiftList) ? refundGiftList : []),
        ];
        if (merged.length > 0) {
          const n = normalize(merged);
          setItems(sortByPaidAt(n, sortOrder));
          return;
        }
      }
      // 3) API 호출
      setLoading(true);
      try {
        const res = await fetch(`/api/payments/me?sort=${sortOrder}`);
        if (!res.ok) throw new Error("결제내역을 불러오지 못했습니다.");
        const data = await res.json();
        if (!ignore) setItems(sortByPaidAt(normalize(data || []), sortOrder));
      } catch (e) {
        if (!ignore) setItems([]);
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPropData, sortOrder, paymentList]);

  // 정렬 변경 시(프롭 데이터/로컬 데이터의 경우) 재정렬
  useEffect(() => {
    if (hasPropData) {
      setItems((prev) => sortByPaidAt(prev, sortOrder));
    } else if (hasLocalSeed) {
      setItems((prev) => sortByPaidAt(prev, sortOrder));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]);

  const visibleItems = tab === "refunded" ? items.filter(isRefunded) : items;
  const empty = !loading && visibleItems.length === 0;

  return (
    <Box sx={{ p: 2, mt: 4 }}>
      <Header sortOrder={sortOrder} onChangeOrder={setSortOrder} />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: 1, borderColor: "divider", mt: 0.5 }}
      >
        <Tab value="all" label={`전체조회 (${items.length})`} />
        <Tab value="refunded" label={`환불된 내역 (${items.filter(isRefunded).length})`} />
      </Tabs>

      {loading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {empty && <EmptyState />}

      {!loading && !empty && (
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {visibleItems.map((it) => (
            <PaymentItemCard
              key={it.id ?? `${it.storeName}-${it.paidAt}`}
              item={it}
              fmtDate={fmtDate}
              fmtPrice={fmtPrice}
              refunded={isRefunded(it)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

function Header({ sortOrder, onChangeOrder }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mb: 2, px: 1 }}
    >
      <Box sx={{ ml: 2 }}>
        <Typography variant="h6" component="h2">
          결제 내역
        </Typography>
      </Box>
      <Box sx={{ mr: 2 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="pay-sort-label">정렬</InputLabel>
          <Select
            labelId="pay-sort-label"
            label="정렬"
            value={sortOrder}
            onChange={(e) => onChangeOrder(e.target.value)}
          >
            <MenuItem value="desc">최신순</MenuItem>
            <MenuItem value="asc">오래된순</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Stack>
  );
}

function PaymentItemCard({ item, fmtDate, fmtPrice, refunded }) {
  const {
    storeName,
    productName,
    price,
    subscriptionPeriod,
    paidAt,
    purchaseType,
    sender,
    receiver,
    refundAt,
    refundReason,
  } = item || {};

  const initial = useMemo(() => (storeName ? storeName.charAt(0) : "?"), [storeName]);

  return (
    <Card
      variant="outlined"
      sx={
        refunded
          ? { borderColor: "error.main", bgcolor: "#fff5f5" }
          : undefined
      }
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* <Avatar>{initial}</Avatar> */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* 상단 메타 */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {storeName}
              </Typography>
              <Chip size="small" label={productName} />
              {purchaseType && (
                <Tooltip title="결제 수단">
                  <Chip size="small" color="default" label={purchaseType} />
                </Tooltip>
              )}
              {refunded && (
                <Chip size="small" color="error" label="환불완료" />
              )}
              {refunded && refundReason && (
                <Chip size="small" variant="outlined" color="error" label={`사유: ${refundReason}`} />
              )}
              <Typography variant="caption" sx={{ color: "text.secondary", ml: "auto" }}>
                {paidAt ? fmtDate(new Date(paidAt)) : "-"}
              </Typography>
            </Stack>

            <Divider sx={{ my: 1 }} />

            {/* 본문 정보 */}
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              {refundAt && (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  환불 일시: {fmtDate(new Date(refundAt))}
                </Typography>
              )}
              <Typography variant="body2">
                결제 금액: <b>{fmtPrice(price)}</b>원
              </Typography>
              {sender && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  보낸 사람: {sender}
                </Typography>
              )}
              {receiver && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  받는 사람: {receiver}
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Box sx={{ mt: 6, textAlign: "center" }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        결제 내역이 비어 있어요
      </Typography>
      <Typography variant="body2" color="text.secondary">
        결제 또는 선물하기를 진행하면 이곳에서 내역을 확인할 수 있어요.
      </Typography>
    </Box>
  );
}
