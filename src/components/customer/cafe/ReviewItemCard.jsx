import { DeleteOutline } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Rating,
  Stack,
  Tooltip,
  Typography,
  Avatar,
} from "@mui/material";
import React from "react";
import PhotoIcon from "@mui/icons-material/Photo";

import useUserStore from "../../../stores/useUserStore";

function ReviewItemCard({ review, handleDelete }) {
  const {
    memberId,
    partnerStoreId,
    partner_store_id,
    partnerStoreName,
    subscriptionName,
    reviewContent,
    review_content,
    rating = 0,
    reviewImg,
  } = review || {};
  const storeId = partnerStoreId ?? partner_store_id;
  const storeLabel = partnerStoreName
    ? partnerStoreName
    : storeId
    ? `매장 #${storeId}`
    : "알 수 없는 매장";
  const contentText = reviewContent ?? review_content ?? "";
  // const createdVal = createdAt ?? created_at;

  const { authUser } = useUserStore();

  // 이니셜 아바타 (매장명 첫 글자)
  // const initial = useMemo(() => (storeId ? String(storeId).charAt(0) : "R"), [storeId]);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {reviewImg ? (
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
          ) : (
            <Avatar
              sx={{
                width: 84,
                height: 84,
                borderRadius: 1,
                objectFit: "cover",
                flexShrink: 0,
              }}
            >
              <PhotoIcon />
            </Avatar>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              // justifyContent={"space-between"}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#334336" }}
              >
                {storeLabel}
              </Typography>
              {subscriptionName && (
                <Chip label={subscriptionName} size="small" />
              )}
              <Tooltip title={`${rating}점`}>
                <Rating value={Number(rating) || 0} precision={0.5} readOnly />
              </Tooltip>

              <Box
                sx={{
                  ml: 1,
                  display: "flex",
                  justifyContent: "flex-end",
                  flexGrow: 1,
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#334336", ml: "auto" }}
                >
                  {review.updatedAt ? `${review.updatedAt}` : review.createdAt}
                </Typography>
                {memberId === authUser.memberId && (
                  <Button
                    onClick={() => handleDelete(review.reviewId)}
                    sx={{ fontSize: "0.8rem", color: "#334336" }}
                  >
                    삭제
                  </Button>
                )}
              </Box>
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-wrap", color: "#334336" }}
            >
              {contentText}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default ReviewItemCard;
