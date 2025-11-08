import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Rating,
  TextField,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

import PhotoCamera from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState, useMemo } from "react";
import ReviewItemCard from "./ReviewItemCard";
import { fetchStoreReviewList } from "../../../apis/commonApi";
import {
  createReview,
  deleteReview,
  fetchCustomerSubscriptions,
  fetchUserReview,
} from "../../../apis/customerApi";
import useUserStore from "../../../stores/useUserStore";
import { DeleteOutline } from "@mui/icons-material";

function CafeReviewList({ storeName, storeId }) {
  const [localReviews, setLocalReviews] = useState([]);
  const [sortOption, setSortOption] = useState("LATEST"); // 정렬 옵션) LATEST | RATING_DESC | RATING_ASC
  const [open, setOpen] = useState(false); // 리뷰 작성 모달
  // 현재 매장과 관련된 보유 구독권만 저장하는 상태
  const [storeSubscriptions, setStoreSubscriptions] = useState([]);
  // 사용자가 선택한 구독권 (리뷰 작성 시 사용)
  const [selectedSub, setSelectedSub] = useState(null);

  const authUser = useUserStore((state) => state.authUser);
  const memberId = authUser?.memberId || authUser?.id;

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    getReviewList();
    loadUserSubscriptionsForStore(); // 컴포넌트 로드 시 구독권 목록도 로드
  }, [storeId]);

  /**
   * 리뷰 목록을 새로 불러오는 함수 (삭제/작성 후 재사용)
   */
  async function getReviewList() {
    try {
      const data = await fetchStoreReviewList(storeId);
      setLocalReviews(data);
    } catch (e) {
      console.error("리뷰 목록 로드 실패:", e);
    }
  }

  /**
   * 현재 카페의 구독권만 필터링하여 로드하는 함수 (수정)
   */
  async function loadUserSubscriptionsForStore() {
    try {
      // 1. 전체 보유 구독권 조회
      const allSubs = await fetchCustomerSubscriptions();

      // 2. 현재 카페의 partnerStoreId와 일치하는 구독권만 필터링
      const subsForThisStore = (allSubs || []).filter(
        (sub) => sub.store.partnerStoreId === Number(storeId)
      );

      setStoreSubscriptions(subsForThisStore);
      console.log(`카페 ${storeId}의 보유 구독권 목록 > `, subsForThisStore);

      return subsForThisStore;
    } catch (e) {
      console.error("구독권 로드 실패:", e);
      setStoreSubscriptions([]);
      return [];
    }
  }

  /*
    리뷰 목록 정렬 함수
  */
  const sortedReviews = useMemo(() => {
    const arr = [...localReviews];

    switch (sortOption) {
      case "RATING_DESC": // 평점 높은 순
        return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "RATING_ASC": // 평점 낮은 순
        return arr.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      case "LATEST": // 최신순
      default:
        // createdAt 같은 날짜 필드가 있다면 그걸 기준으로 정렬
        // 필드 이름이 다르면 여기를 실제 필드명으로 바꿔줘야 함 (ex. reviewDate, createdDate 등등)
        return arr.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  }, [localReviews, sortOption]);

  /**
   * 리뷰 작성 버튼 클릭 핸들러
   * 보유 구독권 여부 확인 후 모달 열기
   */
  function handleCreateReview() {
    if (storeSubscriptions.length === 0) {
      alert("해당 카페에 대한 구매 내역이 없어 리뷰를 작성하실 수 없습니다.");
      return;
    }
    // 모달 열기 전에 상태 초기화
    setSelectedSub(null);
    setRating(0);
    setContent("");
    setImageFile(null);
    setImagePreview(null);
    handleOpen();
  }

  function handleOpen() {
    setOpen(true);
  }
  function handleClose() {
    setOpen(false);
    setImageFile(null);
    setImagePreview(null);
  }

  const handleSubmit = async () => {
    if (!memberId) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!selectedSub) {
      alert("리뷰를 작성할 구독권을 선택해주세요.");
      return;
    }
    if (!content || content.trim().length === 0) {
      alert("리뷰 내용을 작성해주세요.");
      return;
    }
    if (rating === 0) {
      alert("별점을 선택해주세요.");
      return;
    }

    const payload = {
      memberId,
      partnerStoreId: Number(storeId),
      subscriptionId: selectedSub.subId,
      reviewContent: content,
      rating,
      reviewImg: null,
    };

    console.log(payload);

    try {
      await createReview(payload);
      await getReviewList();
      handleClose();
      alert("리뷰 작성이 완료되었습니다.");
    } catch (e) {
      console.error("리뷰 작성 실패: ", e);
      alert("리뷰 작성에 실패했습니다. 서버 로그를 확인해주세요.");
    }
  };

  /**
   * 리뷰 삭제 처리 함수
   * @param {number} reviewId 삭제할 리뷰의 ID
   */
  async function handleDelete(reviewId) {
    const isConfirmed = window.confirm("정말로 이 리뷰를 삭제하시겠습니까?");

    if (!isConfirmed) {
      return;
    }

    try {
      await deleteReview(reviewId);
      alert("리뷰가 성공적으로 삭제되었습니다.");
      await getReviewList(); // 리뷰 목록 리로딩
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
      alert("리뷰 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
            gap: 1,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              size="small"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              displayEmpty
            >
              <MenuItem value="LATEST">최신순</MenuItem>
              <MenuItem value="RATING_DESC">평점 높은 순</MenuItem>
              <MenuItem value="RATING_ASC">평점 낮은 순</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
            리뷰 {localReviews.length}개
          </Typography>
        </Box>
        <Button
          variant="outlined"
          sx={{
            justifyContent: "flex-end",
            width: "fit-content",
            float: "right",
            mb: 2,
          }}
          onClick={handleCreateReview}
        >
          리뷰 작성
        </Button>
      </Box>

      {/* 정렬된 리뷰 목록을 렌더링 */}
      {sortedReviews && sortedReviews.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {sortedReviews.map((review, idx) => (
            <ReviewItemCard
              key={review.reviewId || idx}
              review={review}
              handleDelete={handleDelete}
              currentUserId={memberId}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ minHeight: "200px", backgroundColor: "#f2f2f2", p: "1rem" }}>
          <Typography variant="body2" color="text.secondary">
            아직 등록된 리뷰가 없습니다.
          </Typography>
        </Box>
      )}

      {/* 리뷰 작성 모달 */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          리뷰 작성하기
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <DialogContentText sx={{ mb: 2 }}>
            **{storeName}**은 어떠셨나요? <br />
            리뷰를 작성할 구독권을 선택하고 평가를 남겨주세요.
          </DialogContentText>

          {/* 구독권 선택 Select 컴포넌트 */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="select-subscription-label">
              리뷰할 구독권 선택
            </InputLabel>
            <Select
              labelId="select-subscription-label"
              id="select-subscription"
              value={selectedSub ? selectedSub.subId : ""} // 선택된 ID를 값으로 사용
              label="리뷰할 구독권 선택"
              onChange={async (e) => {
                // 선택된 ID에 해당하는 구독권 객체를 selectedSub에 저장
                const subId = e.target.value;
                const selected = storeSubscriptions.find(
                  (sub) => sub.subId === subId
                );
                // 작성 리뷰 필터링해서 이미 작성했으면 x
                const myReviewList = await fetchUserReview();

                const isReviewed = myReviewList.find(
                  (review) => review.subscriptionId === selected.subId
                );
                if (isReviewed) {
                  alert("이미 리뷰를 작성한 구독권입니다.");
                  return;
                }

                setSelectedSub(selected);
              }}
              required
            >
              {storeSubscriptions.map((sub) => (
                <MenuItem key={sub.subId} value={sub.subId}>
                  {sub.subName} ({sub.purchaseId})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Rating
            name="simple-controlled"
            value={rating}
            onChange={(_, newValue) => {
              setRating(newValue);
            }}
            sx={{ mb: 2 }}
            required
          />
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              사진 첨부 (선택)
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* 업로드 버튼 */}
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                component="label"
                size="small"
              >
                사진 선택
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }}
                />
              </Button>

              {/* 선택된 파일명 */}
              {imageFile && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {imageFile.name}
                </Typography>
              )}
            </Box>

            {/* 미리보기 + 삭제 버튼 */}
            {imagePreview && (
              <Box
                sx={{
                  mt: 1.5,
                  position: "relative",
                  width: 120,
                  height: 120,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid #e0e0e0",
                }}
              >
                <Box
                  component="img"
                  src={imagePreview}
                  alt="리뷰 이미지 미리보기"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    bgcolor: "rgba(0,0,0,0.5)",
                    color: "white",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                  }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
          <form id="review-form">
            <TextField
              autoFocus
              placeholder="리뷰를 작성해주세요. (필수)"
              required
              margin="dense"
              id="review"
              name="review"
              type="text"
              fullWidth
              multiline
              minRows={3}
              variant="standard"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </form>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>취소</Button>
          <Button onClick={handleSubmit} form="review-form" variant="contained">
            작성 완료
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CafeReviewList;
