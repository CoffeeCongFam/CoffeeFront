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
  Button,
} from "@mui/material";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { getReview, deleteReview } from "../../utils/review";
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
  const [deletingId, setDeletingId] = useState(null);
  const hasPropData = Array.isArray(propReviews) && propReviews.length > 0;

  // 간단한 날짜 파서/포맷터 (ISO 또는 yyyy-MM-dd HH:mm:ss 형태 가정)
  const toDate = (v) => (v ? new Date(v) : new Date(0)); // created_at|createdAt|updatedAt 모두 지원
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
      const da = toDate(a.created_at ?? a.createdAt ?? a.updatedAt);
      const db = toDate(b.created_at ?? b.createdAt ?? b.updatedAt);
      return order === "asc" ? da - db : db - da;
    });
  };

  // 원본 데이터 결정: props가 있으면 사용, 없으면 API(getReview) 호출
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoading(true);
        if (hasPropData) {
          if (!ignore) setLocalReviews(sortReviews(propReviews, sortOrder));
          return;
        }
        const res = await getReview();
        const arr = Array.isArray(res) ? res : res?.data ?? [];
        console.log('[ReviewPage] resolved reviews:', arr.length, arr);
        if (!ignore) setLocalReviews(sortReviews(arr, sortOrder));
      } catch (e) {
        console.error('[ReviewPage] getReview error:', e);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPropData, sortOrder, propReviews]);

  const handleDelete = async (reviewId) => {
    console.log(reviewId)
    if (!reviewId) {
      alert("리뷰 ID를 찾을 수 없습니다.");
      return;
    }
    try {
      setDeletingId(reviewId);
      const res = await deleteReview({ reviewId });
      if (res) {
        setLocalReviews((prev) =>
          prev.filter((rv) => (rv.reviewId ?? rv.review_id) !== reviewId)
        );
      } else {
        alert("삭제 실패하였습니다 다시 시도해주세요");
      }
    } catch (e) {
      console.error("[ReviewPage] deleteReview error:", e);
      alert("삭제 실패하였습니다 다시 시도해주세요");
    } finally {
      setDeletingId(null);
    }
  };

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
            <ReviewItemCard
              key={rv.reviewId ?? rv.review_id ?? `${rv.partnerStoreId ?? rv.partner_store_id}-${rv.createdAt ?? rv.created_at}`}
              review={rv}
              fmt={fmt}
              onDelete={handleDelete}
              deleting={deletingId === (rv.reviewId ?? rv.review_id)}
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

function ReviewItemCard({ review, fmt, onDelete, deleting }) {
  const {
    partnerStoreId,
    partner_store_id,
    partnerStoreName,
    subscriptionName,
    reviewContent,
    review_content,
    rating = 0,
    createdAt,
    created_at,
    reviewImg,
    reviewId,
    review_id,
  } = review || {};
  const id = reviewId ?? review_id;
  const storeId = partnerStoreId ?? partner_store_id;
  const storeLabel = partnerStoreName ? partnerStoreName : (storeId ? `매장 #${storeId}` : "알 수 없는 매장");
  const contentText = reviewContent ?? review_content ?? "";
  const createdVal = createdAt ?? created_at;

  // 이니셜 아바타 (매장명 첫 글자)
  const initial = useMemo(() => (storeId ? String(storeId).charAt(0) : "R"), [storeId]);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {reviewImg && (
            <Box
              component="img"
              src={reviewImg}
              alt="review"
              sx={{
                width: 84,
                height: 84,
                borderRadius: 1,
                objectFit: 'cover',
                flexShrink: 0
              }}
            />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {storeLabel}
              </Typography>
              {subscriptionName && (
                <Chip label={subscriptionName} size="small" />
              )}
              <Tooltip title={`${rating}점`}>
                <Rating value={Number(rating) || 0} precision={0.5} readOnly />
              </Tooltip>
              <Typography variant="caption" sx={{ color: "text.secondary", ml: "auto" }}>
                {createdVal ? fmt(new Date(createdVal)) : "-"}
              </Typography>
              <Box sx={{ ml: 1, display: "flex", justifyContent: "flex-end", flexGrow: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<DeleteOutline />}
                  onClick={() => onDelete(id)}
                  disabled={deleting}
                >
                  삭제
                </Button>
              </Box>
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {contentText}
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