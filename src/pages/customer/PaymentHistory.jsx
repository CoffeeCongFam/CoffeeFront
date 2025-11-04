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
  Button,
} from "@mui/material";

import { postRefund, getPayments } from "../../utils/payments";

// 현재 API에서는 환불 완료 여부를 별도 필드로 제공하지 않음.
// 환불 사유(refundReasons)는 "환불 불가 사유"를 의미하므로, 실제 환불 완료 여부 판단에는 사용하지 않는다.
const isRefunded = (_it) => false;

/**
 * PaymentHistory
 * - 결제 내역 확인 페이지 (MUI 전용 UI)
 * - 최신순/오래된순 정렬 가능
 * - 우선 props.paymentList, 없으면 /api/payments 호출
 */
export default function PaymentHistory({ paymentList }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc"); // desc: 최신순, asc: 오래된순
  const [tab, setTab] = useState("all");

  const hasPropData = Array.isArray(paymentList);

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

  // 표준화: getPayments 반환 형태를 결제 아이템 공통 형태로 정규화
  const normalize = (raw = []) =>
    raw.map((v, i) => {
      const rawPaidAt = v.paidAt ?? v.createdAt ?? null;
      const rowKey = `${String(v.purchaseId ?? "noPid")}|${String(rawPaidAt ?? "noDate")}|${i}`;
      return {
        id: i,
        purchaseId: v.purchaseId ?? null,
        storeName: v.storeName ?? "개인 카페", // API에 매장명이 없으므로 필요시 백엔드 확장
        productName: v.subscriptionName ?? "구독권",
        price: typeof v.paymentAmount === "number" ? v.paymentAmount : Number(v.paymentAmount) || 0,
        subscriptionPeriod: v.subscriptionPeriod ?? null, // 제공되지 않음
        paidAt: rawPaidAt,
        purchaseType: v.purchaseType ?? "결제",
        sender: v.sender,
        receiver: v.receiver,
        isGift: v.isGift, // 'Y' | 'N'
        refundReasons: v.refundReasons ?? null, // null | string[]
        paymentStatus: v.paymentStatus,
        memberSubscriptionId: v.memberSubscriptionId,
        subscriptionId: v.subscriptionId,
        refunded: false, // 로컬 상태로 환불 완료 여부 트래킹
        rowKey,
      };
    });

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
      // 2) API 호출 (getPayments)
      setLoading(true);
      try {
        const data = await getPayments(); // 기대 형태: 배열
        const n = normalize(Array.isArray(data) ? data : []);
        if (!ignore) setItems(sortByPaidAt(n, sortOrder));
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
    } else {
      setItems((prev) => sortByPaidAt(prev, sortOrder));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]);

  const refundedCount = useMemo(
    () => items.filter(it => it.refunded === true || it.paymentStatus === 'REFUNDED').length,
    [items]
  );

  const visibleItems = useMemo(
    () => items.filter(it => tab === 'all' ? true : (it.refunded === true || it.paymentStatus === 'REFUNDED')),
    [items, tab]
  );

  const empty = !loading && visibleItems.length === 0;

  const handleRefund = async (purchaseId, rowKey) => {
    if (!purchaseId) {
      window.alert("구매번호(purchaseId)를 찾을 수 없어 환불을 진행할 수 없습니다. 백엔드 응답을 확인해주세요.");
      return;
    }
    try {
      const res = await postRefund(purchaseId); // expects: { success: boolean, data: any, message: string }
      const success = res && res.success === true;
      if (success) {
        setItems((prev) =>
          prev.map((it) =>
            it.rowKey === rowKey
              ? { ...it, refunded: true }
              : it
          )
        );
      } else {
        const msg =
          (res && typeof res.message === "string" && res.message.trim()) ||
          "환불 과정에 문제가 발생했습니다. 다시 시도해주세요";
        window.alert(msg);
      }
    } catch (e) {
      console.error(e);
      window.alert("환불 과정에 문제가 발생했습니다. 다시 시도해주세요");
    }
  };

  return (
    <Box sx={{ p: 2, mt: 4 }}>
      <Header sortOrder={sortOrder} onChangeOrder={setSortOrder} />

      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v)}
        sx={{ borderBottom: 1, borderColor: "divider", mt: 0.5 }}
      >
        <Tab value="all" label={`전체조회 (${items.length})`} />
        <Tab value="refunded" label={`환불내역 (${refundedCount})`} />
      </Tabs>

      {loading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {empty && <EmptyState />}

      {!loading && !empty && (
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {visibleItems.map((it, idx) => (
            <PaymentItemCard
              key={it.rowKey}
              item={it}
              fmtDate={fmtDate}
              fmtPrice={fmtPrice}
              onRefund={handleRefund}
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

function PaymentItemCard({ item, fmtDate, fmtPrice, onRefund }) {
  const {
    id,
    purchaseId,
    storeName,
    productName,
    price,
    subscriptionPeriod,
    paidAt,
    purchaseType,
    sender,
    receiver,
    refundReasons,
    isGift,
    refunded,
    paymentStatus,
  } = item || {};

  const isRefundedDisplay = refunded === true || paymentStatus === 'REFUNDED';

  const reasons = Array.isArray(refundReasons) ? refundReasons.map(r => (r || '').toString().toUpperCase()) : null;
  const refundable = refundReasons === null && !isRefundedDisplay;
  const canRefund = Boolean(purchaseId) && refundable;
  let refundMessage = null;
  if (!refundable && Array.isArray(reasons)) {
    const hasOver = reasons.includes("OVER_PERIOD");
    const hasUsed = reasons.includes("USED_ALREADY");
    if (hasOver && hasUsed) {
      refundMessage = "환불 기간 및 사용내역이 존재하여 환불이 불가능합니다.";
    } else if (hasOver) {
      refundMessage = "구매후 7일 경과하여 환불이 불가능합니다.";
    } else if (hasUsed) {
      refundMessage = "사용내역이 있는 구독권으로 환불이 불가능합니다.";
    } else {
      refundMessage = "환불이 불가능합니다.";
    }
  }

  const initial = useMemo(() => (storeName ? storeName.charAt(0) : "?"), [storeName]);

  return (
    <Card
      variant="outlined"
      sx={undefined}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* <Avatar>{initial}</Avatar> */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* 상단 메타 */}
            <Stack direction="row" alignItems="center" sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', minWidth: 0, flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {storeName}
                </Typography>
                <Chip size="small" label={productName} />
                {purchaseType && (
                  <Tooltip title="결제 수단">
                    <Chip size="small" color="default" label={purchaseType} />
                  </Tooltip>
                )}
                {isRefundedDisplay && (
                  <Chip size="small" color="error" label="환불완료" />
                )}
                {paidAt && (
                  <Typography variant="caption" color="text.secondary">
                    결제일시: {fmtDate(new Date(paidAt))}
                  </Typography>
                )}
              </Box>
              {canRefund && (
                <Box sx={{ ml: 'auto', display: 'flex' }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    onClick={() => onRefund(purchaseId, item.rowKey)}
                  >
                    결제 취소
                  </Button>
                </Box>
              )}
            </Stack>

            <Divider sx={{ my: 1 }} />

            {/* 본문 정보 */}
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
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

            {/* 환불 가/부 표시 및 액션 */}
            {!refundable && refundMessage && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <b>환불 불가 사유 :</b> {refundMessage}
                </Typography>
              </Box>
            )}
            
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
