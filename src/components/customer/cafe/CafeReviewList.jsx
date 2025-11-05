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
  FormControl, // 추가: Select를 감싸기 위해 사용
  InputLabel, // 추가: Select의 라벨로 사용
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState } from "react";
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
  const [open, setOpen] = useState(false); // 리뷰 작성 모달
  // 현재 매장과 관련된 보유 구독권만 저장하는 상태
  const [storeSubscriptions, setStoreSubscriptions] = useState([]);
  // 사용자가 선택한 구독권 (리뷰 작성 시 사용)
  const [selectedSub, setSelectedSub] = useState(null);

  const authUser = useUserStore((state) => state.authUser);
  const memberId = authUser?.memberId || authUser?.id;

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");

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
   * ✅ 현재 카페의 구독권만 필터링하여 로드하는 함수 (수정)
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

  useEffect(() => {
    getReviewList();
    loadUserSubscriptionsForStore(); // 컴포넌트 로드 시 구독권 목록도 로드
  }, [storeId]);

  /**
   * 리뷰 작성 버튼 클릭 핸들러 (수정)
   * 보유 구독권 여부 확인 후 모달 열기
   */
  function handleCreateReview() {
    if (storeSubscriptions.length === 0) {
      alert("해당 카페에 대한 구매 내역이 없어 리뷰를 작성하실 수 없습니다.");
      return;
    }
    // 모달 열기 전에 상태 초기화 (선택된 구독권, 평점, 내용)
    setSelectedSub(null);
    setRating(0);
    setContent("");
    handleOpen();
  }

  function handleOpen() {
    setOpen(true);
  }
  function handleClose() {
    setOpen(false);
  }

  const handleSubmit = async () => {
    if (!memberId) {
      alert("로그인이 필요합니다.");
      return;
    }
    // ✅ 선택된 구독권 확인 로직 추가
    if (!selectedSub) {
      alert("리뷰를 작성할 구독권을 선택해주세요.");
      return;
    }
    // 필수 필드 (reviewContent) 유효성 검사
    if (!content || content.trim().length === 0) {
      alert("리뷰 내용을 작성해주세요.");
      return;
    }
    if (rating === 0) {
      alert("별점을 선택해주세요.");
      return;
    }

    console.log(selectedSub.subId);
    const payload = {
      memberId, // 유저 id
      partnerStoreId: Number(storeId),
      subscriptionId: selectedSub.subId, // 선택된 구독권 ID
      reviewContent: content, // 백엔드 필드 이름과 일치
      rating,
      reviewImg: "https://picsum.photos/400/400",
    };
    console.log(payload);

    try {
      await createReview(payload);
      await getReviewList(); // 리스트 새로고침
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
    <Box>
      <Button variant="contained" onClick={handleCreateReview} sx={{ mb: 2 }}>
        리뷰 작성
      </Button>

      {localReviews && localReviews.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {localReviews.map((review, idx) => (
            <ReviewItemCard
              key={review.reviewId || idx}
              review={review}
              handleDelete={handleDelete}
              currentUserId={memberId}
            />
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          아직 등록된 리뷰가 없습니다.
        </Typography>
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
