import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import useUserStore from "../../stores/useUserStore";
import { useCallback, useState } from "react";
import api from "../../utils/api";
const STORE_API_URL = "/owners/stores"; // get, post 기본 경로
const today = new Date().toLocaleDateString("ko-KR");
const dateParts = today.split(".").map((part) => part.trim());
const month = dateParts[1];

export default function ManageStoreInfo({ storeInfo: initialStoreInfo }) {
  // Props로 받은 initialStoreInfo가 없을 경우 빈 객체로 초기화하여 오류 방지
  const [storeInfo, setStoreInfo] = useState(initialStoreInfo || {});
  const [originalStoreInfo, setOriginalStoreInfo] = useState(
    initialStoreInfo || {}
  );

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

    const DAY_LABELS = {
    MON: "월",
    TUE: "화",
    WED: "수",
    THU: "목",
    FRI: "금",
    SAT: "토",
    SUN: "일",
  };
  const DAY_ORDER = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  // Merge storeHours with defaults for all days
  const rawStoreHours = storeInfo.storeHours || [];
  const mergedStoreHours = DAY_ORDER.map((day) => {
    const found = rawStoreHours.find((hour) => hour.dayOfWeek === day);
    return (
      found || {
        dayOfWeek: day,
        openTime: null,
        closeTime: null,
        isClosed: null,
      }
    );
  });
  // 일반 텍스트 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStoreInfo((prev) => ({ ...prev, [name]: value }));
  };

  // 시간 입력 필드 표시 포맷 (예: "0900" → "09:00")
  const formatTimeDisplay = (value) => {
    if (!value) return isEditing ? "" : "-";
    const digits = String(value).replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}${digits.length > 2 ? ":" + digits.slice(2, 4) : ""}`;
  };

  // 요일별 영업시간 및 휴무일 변경 핸들러
  const _handleHoursChange = useCallback((dayOfWeek, field, value) => {
    setStoreInfo((prev) => ({
      ...prev,
      storeHours: prev.storeHours.map((hour) => {
        if (hour.dayOfWeek === dayOfWeek) {
          // isClosed 필드 처리
          if (field === "isClosed") {
            const newIsClosed = value ? "Y" : "N";
            // 휴무일('Y')이면 시간 필드는 null로 비워줍니다.
            if (newIsClosed === "Y") {
              return {
                ...hour,
                isClosed: newIsClosed,
                openTime: null,
                closeTime: null,
              };
            }
            // 휴무일 해제('N')이면 기본 시간(예: 09:00)을 설정하거나 null을 유지할 수 있습니다.
            return {
              ...hour,
              isClosed: newIsClosed,
              openTime: hour.openTime || "09:00", // 해제 시 기본값 설정 (필요에 따라 조정)
              closeTime: hour.closeTime || "18:00",
            };
          }
          // openTime/closeTime 필드 처리
          return { ...hour, [field]: value };
        }
        return hour;
      }),
    }));
  }, []);
    // 요일별 시간 입력 핸들러 (숫자만, 최대 4자리(HHMM) 저장)
  const handleDayTimeChange = (dayOfWeek, field) => (e) => {
    if (!isEditing) return;

    let input = e.target.value || "";
    let digits = input.replace(/\D/g, ""); // 숫자만
    if (digits.length > 4) {
      digits = digits.slice(0, 4);
    }

    _handleHoursChange(dayOfWeek, field, digits);
  };

  // 매장 정보 수정 (PATCH /api/owners/stores/{partnerStoreId})
  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);

    try {
      // storeInfo에서 partnerStoreId를 가져와 URL 경로에 사용
      const url = `${STORE_API_URL}/${storeInfo.partnerStoreId}`;

      // 실제 API에 맞게 수정할 데이터만 전송(PATCH)
      const dataToSend = { ...storeInfo };

      await axios.patch(url, dataToSend);

      // ✅ PATCH 요청 후 purchaseId를 Zustand로 업데이트
      const response = await api.get(STORE_API_URL); // 최신 데이터 다시 조회
      const updatedData = response.data.data;
      if (updatedData && updatedData.purchaseId) {
        const { setUser, authUser } = useUserStore.getState();
        setUser({
          ...authUser,
          purchaseId: updatedData.purchaseId,
        });
      }

      setSuccessMessage("매장 정보가 성공적으로 수정되었습니다.");
      setIsEditing(false); // 수정 모드 종료
      setOriginalStoreInfo(storeInfo); // 원본 데이터 업데이트
    } catch (err) {
      console.error("매장 정보 수정 실패 :", err);
      setError("정보 수정에 실패. 다시 시도해주세요");
    }
  };

  const handleCancel = () => {
    setStoreInfo(originalStoreInfo); // 원본 데이터로 되돌리기
    setIsEditing(false); // 수정 모드 종료
    setError(null);
  };

  return (
    <Box
      sx={{
        py: 4,
        px: 2,
        minHeight: "100vh",
      }}
    >
      <Box maxWidth={880} mx="auto">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
          }}
        >
        {/* 헤더 및 수정 버튼 */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Chip
                label="Store Owner Console"
                size="small"
                sx={{
                  borderRadius: 999,
                  fontWeight: 600,
                  bgcolor: "rgba(79, 70, 229, 0.08)",
                  color: "#4f46e5",
                  border: "1px solid rgba(79, 70, 229, 0.2)",
                }}
              />
            </Stack>
            <Typography variant="h5" component="h1" fontWeight={800}>
              매장 관리
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              오늘 기준 매장 정보를 한 번에 확인하고 수정해 보세요.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            size="medium"
            sx={{
              borderRadius: 999,
              px: 3,
              py: 1,
              fontWeight: 700,
              textTransform: "none",
              background:
                isEditing
                  ? "linear-gradient(135deg, #f97373 0%, #ef4444 100%)"
                  : "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #06b6d4 100%)",
              "&:hover": {
                transform: "translateY(-1px)",
              },
            }}
          >
            {isEditing ? "수정 취소" : "정보 수정"}
          </Button>
        </Box>

        {/* 알림 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* 매장 기본 정보 영역 */}
        <Typography
          variant="h6"
          mb={2}
          sx={{
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          매장 정보
          <Box
            component="span"
            sx={{
              width: 6,
              height: 6,
              borderRadius: "999px",
            }}
          />
        </Typography>
        <Grid container spacing={3}>
          {[
            {
              label: "매장 이름",
              name: "storeName",
              value: storeInfo.storeName || "-",
              disabled: true,
            }, // 이름은 보통 수정 불가
            { label: "매장 전화번호", name: "tel", value: storeInfo.tel || "-" },
            {
              label: "도로명 주소",
              name: "roadAddress",
              value: storeInfo.roadAddress || "-",
            },
            {
              label: "상세 주소",
              name: "detailAddress",
              value: storeInfo.detailAddress || "-",
            },
            {
              label: "사업자 번호",
              name: "businessNumber",
              value: storeInfo.businessNumber,
              disabled: true,
            }, // 번호는 보통 수정 불가
          ].map((field) => (
            <Grid item xs={12} sm={6} key={field.name}>
              <TextField
                fullWidth
                label={field.label}
                name={field.name}
                value={field.value || ""}
                onChange={isEditing ? handleChange : undefined}
                InputProps={{
                  readOnly: !isEditing || field.disabled,
                }}
                InputLabelProps={{
                  readOnly: !isEditing || field.disabled,
                  style: {
                    cursor: isEditing && !field.disabled ? "auto" : "default",
                  },
                }}
                variant="outlined"
                sx={{
                  pointerEvents: isEditing && !field.disabled ? "auto" : "none",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.9)",
                    "& fieldset": {
                      borderColor: "rgba(148, 163, 184, 0.4)",
                      pointerEvents: "none", // fieldset 자체의 이벤트도 막습니다.
                    },
                    "&:hover fieldset": {
                      borderColor: "#6366f1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4f46e5",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#4f46e5",
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>

        {/* 영업시간 영역 */}
        <Typography
          variant="h6"
          mt={4}
          mb={0.5}
          sx={{
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {month}월 영업시간 & 휴무일
          <Box
            component="span"
            sx={{
              width: 6,
              height: 6,
              borderRadius: "999px",
              bgcolor: "#0ea5e9",
            }}
          />
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          요일별 영업 시간을 입력하고, 쉬는 날은 버튼 하나로 간단하게 설정해 보세요.
        </Typography>
               <Box
          sx={{
            borderRadius: 3,
            p: 3,
            bgcolor: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          <Grid container spacing={2}>
            {mergedStoreHours.map((hour) => {
              const isClosed = hour.isClosed === "Y";
              const dayLabel = DAY_LABELS[hour.dayOfWeek] || hour.dayOfWeek;
              const hasTime = !!(hour.openTime || hour.closeTime);
              const isUndefinedStatus =
                !hasTime && (hour.isClosed === null || hour.isClosed === undefined);
              const statusLabel = isUndefinedStatus ? "미정" : isClosed ? "휴무" : "영업";
              const buttonVariant = isUndefinedStatus
                ? "outlined"
                : isClosed
                ? "outlined"
                : "contained";

              return (
                <Grid item xs={12} key={hour.dayOfWeek}>
                  <Box display="flex" alignItems="center" gap={2}>
                    {/* 요일 표시 */}
                    <Box sx={{ width: 40 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "text.primary" }}
                      >
                        {dayLabel}
                      </Typography>
                    </Box>

                    {/* 시작 시간 */}
                    <TextField
                      label="시작"
                      type="text"
                      placeholder="예: 09:00"
                      value={formatTimeDisplay(hour.openTime)}
                      onChange={handleDayTimeChange(hour.dayOfWeek, "openTime")}
                      InputLabelProps={{
                        shrink: true,
                        style: { cursor: isEditing ? "auto" : "default" },
                      }}
                      InputProps={{
                        readOnly: !isEditing || isClosed,
                        style: {
                          cursor:
                            isEditing && !isClosed ? "auto" : "default",
                        },
                      }}
                      inputProps={{
                        inputMode: "numeric",
                        maxLength: 5, // 09:00 형태
                      }}
                      variant="outlined"
                      sx={{
                        flex: 1,
                        pointerEvents:
                          isEditing && !isClosed ? "auto" : "none",
                        "& .MuiOutlinedInput-root": {
                          bgcolor: isEditing
                            ? "rgba(248, 250, 252, 0.9)"
                            : "rgba(239, 242, 245, 0.9)",
                          borderRadius: 3,
                          "& fieldset": {
                            borderColor: "rgba(148, 163, 184, 0.4)",
                          },
                          "&:hover fieldset": {
                            borderColor: "#0ea5e9",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#2563eb",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#2563eb",
                        },
                      }}
                    />

                    {/* 종료 시간 */}
                    <TextField
                      label="종료"
                      type="text"
                      placeholder="예: 18:00"
                      value={formatTimeDisplay(hour.closeTime)}
                      onChange={handleDayTimeChange(
                        hour.dayOfWeek,
                        "closeTime"
                      )}
                      InputLabelProps={{
                        shrink: true,
                        style: { cursor: isEditing ? "auto" : "default" },
                      }}
                      InputProps={{
                        readOnly: !isEditing || isClosed,
                        style: {
                          cursor:
                            isEditing && !isClosed ? "auto" : "default",
                        },
                      }}
                      inputProps={{
                        inputMode: "numeric",
                        maxLength: 5,
                      }}
                      variant="outlined"
                      sx={{
                        flex: 1,
                        pointerEvents:
                          isEditing && !isClosed ? "auto" : "none",
                        "& .MuiOutlinedInput-root": {
                          bgcolor: isEditing
                            ? "rgba(248, 250, 252, 0.9)"
                            : "rgba(239, 242, 245, 0.9)",
                          borderRadius: 3,
                          "& fieldset": {
                            borderColor: "rgba(148, 163, 184, 0.4)",
                          },
                          "&:hover fieldset": {
                            borderColor: "#0ea5e9",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#2563eb",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#2563eb",
                        },
                      }}
                    />

                    {/* 휴무/영업/미정 표시 버튼 */}
                    <Button
                      variant={buttonVariant}
                      onClick={() =>
                        isEditing &&
                        _handleHoursChange(
                          hour.dayOfWeek,
                          "isClosed",
                          !isClosed
                        )
                      }
                      size="small"
                      sx={{
                        borderRadius: 999,
                        px: 2.2,
                        py: 0.6,
                        fontWeight: 600,
                        textTransform: "none",
                        ...(isUndefinedStatus && {
                          bgcolor: "grey.100",
                          color: "grey.600",
                          borderColor: "grey.400",
                        }),
                      }}
                    >
                      {statusLabel}
                    </Button>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* 저장 버튼 */}
        {isEditing && (
          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              size="large"
              sx={{
                borderRadius: 999,
                px: 4,
                py: 1.2,
                fontWeight: 700,
                textTransform: "none",
                background:
                  "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #0ea5e9 100%)",
                "&:hover": {
                  transform: "translateY(-1px)",
                },
              }}
            >
              저장하기
            </Button>
          </Box>
        )}
        </Paper>
      </Box>
    </Box>
  );
}
