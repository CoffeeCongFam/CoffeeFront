import { Box, Divider, Typography } from "@mui/material";
import React from "react";

function CafeReviewList({ store }) {
  // 카페 리뷰 리스트

  return (
    <Box>
      {store.reviews && store.reviews.length > 0 ? (
        store.reviews.map((review) => (
          <Box key={review.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {review.nickname || "익명"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              {review.content}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {review.createdAt}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          아직 등록된 리뷰가 없습니다.
        </Typography>
      )}
    </Box>
  );
}

export default CafeReviewList;
