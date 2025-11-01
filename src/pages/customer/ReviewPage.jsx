import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Chip,
  Rating,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import reviewSeed from "../../data/customer/review";
/**
 * ReviewPage
 * - 내가 작성한 리뷰 내역을 간단히 확인하는 페이지
 * - 최신순/오래된순 정렬 선택 가능 (MUI Select)
 * - 데이터는 props.reviewList를 우선 사용하고, 없으면 /api/reviews/me 로 fetch 시도
 */
export default function ReviewPage({ reviewList: propReviews }) {
  const [localReviews, setLocalReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' 최신순, 'asc' 오래된순
  const hasPropData = Array.isArray(propReviews) && propReviews.length >= 0;

  // 간단한 날짜 파서/포맷터 (ISO 또는 yyyy-MM-dd HH:mm:ss 형태 가정)
  const toDate = (v) => (v ? new Date(v) : new Date(0));
  const fmt = (d) =>
    new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);

  const sortReviews = (arr, order) => {
    return [...arr].sort((a, b) => {
      const da = toDate(a.created_at || a.createdAt);
      const db = toDate(b.created_at || b.createdAt);
      return order === "asc" ? da - db : db - da;
    });
  };

  // 원본 데이터 결정 (props 우선, 없으면 reviewSeed)
  useEffect(() => {
    let ignore = false;
    function load() {
      const source = hasPropData ? propReviews : (Array.isArray(reviewSeed) ? reviewSeed : []);
      if (!ignore) setLocalReviews(sortReviews(source, sortOrder));
    }
    load();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPropData, sortOrder, propReviews]);

  // props로 들어온 경우에는 로컬 정렬만 수행
  useEffect(() => {
    if (hasPropData) {
      setLocalReviews(sortReviews(propReviews, sortOrder));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder, propReviews]);

  const empty = !loading && localReviews.length === 0;

  return (
    <Box sx={{ p: 2, mt: 4 }}>
      <Header sortOrder={sortOrder} onChangeOrder={setSortOrder} />
      {loading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {empty && (
        <EmptyState />
      )}

      {!loading && !empty && (
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {localReviews.map((rv) => (
            <ReviewItemCard key={rv.review_id ?? `${rv.partner_store_id}-${rv.created_at}`} review={rv} fmt={fmt} />
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
          내가 작성한 리뷰
        </Typography>
      </Box>
      <Box sx={{ mr: 2 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="sort-label">정렬</InputLabel>
          <Select
            labelId="sort-label"
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

function ReviewItemCard({ review, fmt }) {
  const {
    partner_store_id,
    review_content = "",
    rating = 0,
    created_at,
  } = review || {};
  const storeLabel = partner_store_id ? `매장 #${partner_store_id}` : "알 수 없는 매장";

  // 이니셜 아바타 (매장명 첫 글자)
  const initial = useMemo(() => (partner_store_id ? String(partner_store_id).charAt(0) : "R"), [partner_store_id]);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* <Avatar>{initial}</Avatar> */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {storeLabel}
              </Typography>
              <Tooltip title={`${rating}점`}>
                <Rating value={Number(rating) || 0} precision={0.5} readOnly />
              </Tooltip>
              <Typography variant="caption" sx={{ color: "text.secondary", ml: "auto" }}>
                {created_at ? fmt(new Date(created_at)) : "-"}
              </Typography>
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {review_content}
            </Typography>
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
        아직 작성한 리뷰가 없어요
      </Typography>
      <Typography variant="body2" color="text.secondary">
        주문 후 매장에서 받은 서비스와 음료에 대해 리뷰를 남겨보세요.
      </Typography>
    </Box>
  );
}