import { Box, Divider, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import ReviewItemCard from "./ReviewItemCard";
import { fetchStoreReviewList } from "../../../apis/commonApi";

function CafeReviewList({ storeId }) {
  // 카페 리뷰 리스트
  const [localReviews, setLocalReviews] = useState([]);

  async function getReviewList() {
    const data = await fetchStoreReviewList(storeId);
    setLocalReviews(data);
  }

  useEffect(() => {
    getReviewList();
  }, []);

  return (
    <Box>
      {localReviews && localReviews.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {localReviews.map((review, idx) => (
            <ReviewItemCard key={idx} review={review} />
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          아직 등록된 리뷰가 없습니다.
        </Typography>
      )}
    </Box>
  );
}

export default CafeReviewList;
