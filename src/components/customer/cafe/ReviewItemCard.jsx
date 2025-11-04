import { DeleteOutline } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Rating,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { Button } from "react-scroll";

const fmt = (d) =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);

function ReviewItemCard({ review }) {
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
  } = review || {};
  const storeId = partnerStoreId ?? partner_store_id;
  const storeLabel = partnerStoreName
    ? partnerStoreName
    : storeId
    ? `매장 #${storeId}`
    : "알 수 없는 매장";
  const contentText = reviewContent ?? review_content ?? "";
  const createdVal = createdAt ?? created_at;

  // 이니셜 아바타 (매장명 첫 글자)
  // const initial = useMemo(() => (storeId ? String(storeId).charAt(0) : "R"), [storeId]);

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
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {storeLabel}
              </Typography>
              {subscriptionName && (
                <Chip label={subscriptionName} size="small" />
              )}
              <Tooltip title={`${rating}점`}>
                <Rating value={Number(rating) || 0} precision={0.5} readOnly />
              </Tooltip>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", ml: "auto" }}
              >
                {createdVal ? fmt(new Date(createdVal)) : "-"}
              </Typography>
              <Box
                sx={{
                  ml: 1,
                  display: "flex",
                  justifyContent: "flex-end",
                  flexGrow: 1,
                }}
              ></Box>
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

export default ReviewItemCard;
