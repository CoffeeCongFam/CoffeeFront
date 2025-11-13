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
import CommonAlert from "../../common/CommonAlert";
import CommonConfirm from "../../common/CommonConfirm";

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

  // 확인창
  const [confirm, setConfirm] = useState({
    open: false,
    targetId: null,
  });

  // 경고창
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });

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
      // 전체 보유 구독권 조회
      const allSubs = await fetchCustomerSubscriptions();

      // 현재 카페의 partnerStoreId와 일치하는 구독권만 필터링
      const subsForThisStore = (allSubs || []).filter(
        (sub) => sub.store.partnerStoreId === Number(storeId)
      );

      // 내 리뷰 목록 가져와서, 이미 리뷰한 구독권 제외
      let filteredSubs = subsForThisStore;
      try {
        const myReviewList = await fetchUserReview();
        const reviewsArray = Array.isArray(myReviewList)
          ? myReviewList
          : Array.isArray(myReviewList?.data)
          ? myReviewList.data
          : [];

        const reviewedIds = new Set(
          reviewsArray.map((review) => review.subscriptionId)
        );

        filteredSubs = subsForThisStore.filter(
          (sub) => !reviewedIds.has(sub.subId)
        );
      } catch (e) {
        console.error("내 리뷰 목록 로드 실패:", e);
      }

      setStoreSubscriptions(filteredSubs);
      console.log(
        `카페 ${storeId}의 보유 구독권 목록 (작성 가능만) > `,
        filteredSubs
      );

      return filteredSubs;
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
      handleShowAlert(
        "error",
        "해당 카페에서 리뷰를 작성할 수 있는 구독권이 없습니다."
      );
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
      // alert("로그인이 필요합니다.");
      handleShowAlert("error", "로그인이 필요합니다.");
      return;
    }
    if (!selectedSub) {
      // alert("리뷰를 작성할 구독권을 선택해주세요.");
      handleShowAlert("info", "리뷰를 작성할 구독권을 선택해주세요.");

      return;
    }
    if (!content || content.trim().length === 0) {
      handleShowAlert("info", "리뷰 내용을 작성해주세요.");

      // alert("리뷰 내용을 작성해주세요.");
      return;
    }
    if (rating === 0) {
      // alert("별점을 선택해주세요.");
      handleShowAlert("info", "평점을 입력해주세요.");
      return;
    }

    const payload = {
      memberId,
      partnerStoreId: Number(storeId),
      subscriptionId: selectedSub.subId,
      reviewContent: content,
      rating,
    };

    console.log(payload);

    try {
      // imageFile 을 두 번째 인자로 같이 넘김
      await createReview(payload, imageFile);
      await getReviewList();
      handleClose();
      handleShowAlert("info", "리뷰 작성이 완료되었습니다.");
    } catch (e) {
      console.error("리뷰 작성 실패: ", e);
    }
  };

  /**
   * 리뷰 삭제 처리 함수
   * @param {number} reviewId 삭제할 리뷰의 ID
   */
  // 삭제 요청 → 확인 모달만 띄움
  function handleDelete(reviewId) {
    setConfirm({
      open: true,
      targetId: reviewId,
    });
  }

  // 확인 버튼 눌렀을 때 실행
  async function handleConfirmDelete() {
    try {
      await deleteReview(confirm.targetId);
      handleShowAlert("success", "리뷰가 성공적으로 삭제되었습니다.");
      await getReviewList();
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
      handleShowAlert(
        "error",
        "리뷰 삭제에 실패했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setConfirm({ open: false, targetId: null });
    }
  }

  /*
    경고창
  */
  const handleShowAlert = (type, message) => {
    setAlert({
      open: true,
      message: message,
      severity: type,
    });
  };

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
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#ffe0b2",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#334336",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#334336",
                },
                "& .MuiSelect-select": {
                  color: "#334336",
                },
              }}
            >
              <MenuItem value="LATEST">최신순</MenuItem>
              <MenuItem value="RATING_DESC">평점 높은 순</MenuItem>
              <MenuItem value="RATING_ASC">평점 낮은 순</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="subtitle2" sx={{ color: "#334336" }}>
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
            borderColor: "#334336",
            color: "#334336",
            "&:hover": {
              borderColor: "#334336",
              bgcolor: "rgba(51, 67, 54, 0.05)",
            },
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
        <Box
          sx={{
            minHeight: "200px",
            // backgroundColor: "#f2f2f2",
            p: "1rem",
          }}
        >
          <Typography variant="body2" sx={{ color: "#334336" }}>
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
            px: 2,
            py: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#334336",
          }}
        >
          리뷰 작성하기
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "#334336",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <DialogContentText
            sx={{
              mb: 2,
              backgroundColor: "#fff9f4",
              py: 2,
              px: 3,
              borderRadius: "0.5rem",
              color: "#334336",
            }}
          >
            <span>
              <strong>{storeName}</strong>
            </span>
            은 어떠셨나요? <br />
            리뷰를 작성할 구독권을 선택하고 평가를 남겨주세요.
          </DialogContentText>

          {/* 구독권 선택 Select 컴포넌트 */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel
              id="select-subscription-label"
              sx={{ color: "#334336" }}
            >
              리뷰할 구독권 선택
            </InputLabel>
            <Select
              labelId="select-subscription-label"
              id="select-subscription"
              value={selectedSub ? selectedSub.subId : ""} // 선택된 ID를 값으로 사용
              label="리뷰할 구독권 선택"
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#ffe0b2",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#334336",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#334336",
                },
                "& .MuiSelect-select": {
                  color: "#334336",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#334336",
                },
              }}
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
                  handleShowAlert(
                    "warning",
                    "이미 리뷰를 작성한 구독권입니다."
                  );
                  // alert("이미 리뷰를 작성한 구독권입니다.");
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
            <Typography variant="subtitle2" sx={{ mb: 1, color: "#334336" }}>
              사진 첨부 (선택)
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
              }}
            >
              {/* 업로드 버튼 */}
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                component="label"
                size="small"
                sx={{
                  borderColor: "#334336",
                  color: "#334336",
                  "&:hover": {
                    borderColor: "#334336",
                    bgcolor: "rgba(51, 67, 54, 0.05)",
                  },
                }}
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
                <Typography variant="body2" sx={{ color: "#334336" }}>
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
                  border: "1px solid #ffe0b2",
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
                    bgcolor: "rgba(51, 67, 54, 0.5)",
                    color: "#fff9f4",
                    "&:hover": { bgcolor: "rgba(51, 67, 54, 0.7)" },
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
              placeholder="리뷰를 작성해주세요."
              required
              margin="dense"
              id="review"
              name="review"
              type="text"
              fullWidth
              multiline
              minRows={3}
              maxRows={8}
              variant="standard"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{
                "& .MuiInput-underline:before": {
                  borderBottomColor: "#ffe0b2",
                },
                "& .MuiInput-underline:hover:before": {
                  borderBottomColor: "#334336",
                },
                "& .MuiInput-underline:after": {
                  borderBottomColor: "#334336",
                },
                "& .MuiInputBase-input": {
                  color: "#334336",
                },
              }}
            />
          </form>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} sx={{ color: "#334336" }}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            form="review-form"
            variant="contained"
            sx={{
              bgcolor: "#334336",
              color: "#fff9f4",
              "&:hover": { bgcolor: "#334336", opacity: 0.9 },
            }}
          >
            작성 완료
          </Button>
        </DialogActions>
      </Dialog>

      <CommonAlert
        open={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        severity={alert.severity}
        message={alert.message}
      />
      <CommonConfirm
        open={confirm.open}
        onClose={() => setConfirm({ open: false, targetId: null })}
        onConfirm={handleConfirmDelete}
        title="리뷰 삭제 확인"
        message="이 리뷰를 정말 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
      />
    </Box>
  );
}

export default CafeReviewList;
