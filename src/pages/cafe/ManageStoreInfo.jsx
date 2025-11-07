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
import { SearchRounded } from "@mui/icons-material";
import axios from "axios";
import useUserStore from "../../stores/useUserStore";
import { useCallback, useState } from "react";
import api from "../../utils/api";
const STORE_API_URL = "/owners/stores"; // get, post 기본 경로
const today = new Date().toLocaleDateString("ko-KR");
const dateParts = today.split(".").map((part) => part.trim());
const month = dateParts[1];

const JAVASCRIPT_API_KEY = import.meta.env.VITE_JAVASCRIPT_API_KEY;

const loadDaumPostcodeScript = () =>
  new Promise((resolve, reject) => {
    if (window.daum && window.daum.Postcode) {
      resolve();
      return;
    }
    const existing = document.querySelector("script[data-daum-postcode]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.defer = true;
    script.setAttribute("data-daum-postcode", "true");
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });

const loadKakaoMapsSdk = () =>
  new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      resolve(true);
      return;
    }
    const existing = document.querySelector("script[data-kakao-maps]");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${JAVASCRIPT_API_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-kakao-maps", "true");
    script.onload = () => resolve(true);
    script.onerror = reject;
    document.body.appendChild(script);
  });

export default function ManageStoreInfo({ storeInfo: initialStoreInfo }) {
  // Props로 받은 initialStoreInfo가 없을 경우 빈 객체로 초기화하여 오류 방지
  const [storeInfo, setStoreInfo] = useState(initialStoreInfo || {});
  const [originalStoreInfo, setOriginalStoreInfo] = useState(
    initialStoreInfo || {}
  );

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleClickAddressSearch = async () => {
    try {
      await loadDaumPostcodeScript();
      // eslint-disable-next-line no-undef
      new window.daum.Postcode({
        oncomplete: async function (data) {
          let addr = "";
          if (data.userSelectedType === "R") {
            // 도로명 주소 전체 (로, 길, 번길 포함)
            addr = data.roadAddress;

            // 도로명 이름이 잘린 경우 도로명+건물번호 형태로 보완
            if (data.roadname && data.buildingCode && !addr.includes(data.roadname)) {
              addr = `${data.roadname} ${data.buildingCode}`;
            }

            // 건물명이나 법정동명 추가
            if (data.buildingName) {
              addr += ` ${data.buildingName}`;
            } else if (data.bname) {
              addr += ` ${data.bname}`;
            }
          } else {
            addr = data.jibunAddress;
          }

          // 도로명 주소와 우편번호 상태 업데이트
          setStoreInfo((prev) => ({
            ...prev,
            postcode: data.zonecode,
            roadAddress: addr,
          }));

          try {
            const ok = await loadKakaoMapsSdk();
            if (!ok) {
              console.warn("Kakao Maps SDK key 미설정으로 지오코딩을 생략합니다.");
            } else {
              window.kakao.maps.load(() => {
                try {
                  const geocoder = new window.kakao.maps.services.Geocoder();
                  geocoder.addressSearch(addr, function (result, status) {
                    if (status === window.kakao.maps.services.Status.OK) {
                      const coordinateX = result[0].x;
                      const coordinateY = result[0].y;

                      setStoreInfo((prev) => ({
                        ...prev,
                        xPoint: coordinateX,
                        yPoint: coordinateY,
                      }));
                    }
                  });
                } catch (innerErr) {
                  console.error("주소 지오코딩 중 오류 발생", innerErr);
                }
              });
            }
          } catch (mapErr) {
            console.error("Kakao Maps SDK 로드 실패", mapErr);
          }
        },
      }).open();
    } catch (e) {
      console.error("주소 검색 스크립트 로드 실패", e);
    }
  };

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

    // 매장 전화번호: 숫자만 저장하고, 화면에서는 하이픈 포함 포맷으로 표시
    if (name === "tel") {
      let digits = value.replace(/\D/g, "");
      // 최대 11자리까지만 허용 (예: 01012345678)
      if (digits.length > 11) {
        digits = digits.slice(0, 11);
      }
      setStoreInfo((prev) => ({ ...prev, tel: digits }));
      return;
    }

    setStoreInfo((prev) => ({ ...prev, [name]: value }));
  };

  // 시간 입력 필드 표시 포맷 (예: "0900" → "09:00")
  const formatTimeDisplay = (value) => {
    if (!value) return isEditing ? "" : "-";
    const digits = String(value).replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}${digits.length > 2 ? ":" + digits.slice(2, 4) : ""}`;
  };

  // 전화번호 표시용 (실제 저장은 숫자만, 화면엔 하이픈 포함)
  const formatPhoneDisplay = (value) => {
    if (!value) return "";
    const digits = String(value).replace(/\D/g, "");
    if (digits.length <= 3) return digits;

    // 서울 국번(02) 처리
    if (digits.startsWith("02")) {
      if (digits.length <= 5) {
        return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      }
      return `${digits.slice(0, 2)}-${digits.slice(2, digits.length - 4)}-${digits.slice(-4)}`;
    }

    // 휴대폰/일반 지역번호 처리 (010, 031 등)
    if (digits.length <= 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    return `${digits.slice(0, 3)}-${digits.slice(3, digits.length - 4)}-${digits.slice(-4)}`;
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
      <Box maxWidth={1200} mx="auto">
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
          {/* 1행: 매장 이름 / 매장 전화번호 / 사업자 번호 */}
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            label="매장 이름"
            name="storeName"
            value={storeInfo.storeName || ""}
            onChange={isEditing ? handleChange : undefined}
            InputProps={{
              readOnly: !isEditing,
            }}
            inputProps={{
              style: { textAlign: "center" },   // ✅ 중앙 정렬
            }}
            InputLabelProps={{
              readOnly: !isEditing,
              style: {
                cursor: isEditing ? "auto" : "default",
              },
            }}
            variant="outlined"
            sx={{
              pointerEvents: isEditing ? "auto" : "none",
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.9)",
                "& fieldset": {
                  borderColor: "rgba(148, 163, 184, 0.4)",
                  pointerEvents: "none",
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

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="매장 전화번호"
            name="tel"
            value={formatPhoneDisplay(storeInfo.tel)}
            onChange={isEditing ? handleChange : undefined}
            InputProps={{
              readOnly: !isEditing,
            }}
            inputProps={{
              style: { textAlign: "center" },   // ✅ 중앙 정렬
            }}
            InputLabelProps={{
              readOnly: !isEditing,
              style: {
                cursor: isEditing ? "auto" : "default",
              },
            }}
            variant="outlined"
            sx={{
              pointerEvents: isEditing ? "auto" : "none",
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.9)",
                "& fieldset": {
                  borderColor: "rgba(148, 163, 184, 0.4)",
                  pointerEvents: "none",
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

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="사업자 번호"
            name="businessNumber"
            value={storeInfo.businessNumber || ""}
            InputProps={{
              readOnly: true,
            }}
            inputProps={{
              style: { textAlign: "center" },   // ✅ 중앙 정렬
            }}
            InputLabelProps={{
              readOnly: true,
              style: {
                cursor: "default",
              },
            }}
            variant="outlined"
            sx={{
              pointerEvents: "none",
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.9)",
                "& fieldset": {
                  borderColor: "rgba(148, 163, 184, 0.4)",
                  pointerEvents: "none",
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
          {/* 2행: 도로명 주소 / 상세 주소 */}
        <Grid item xs={12} sm={9}>
          <Box
            sx={{
              position: "relative",
              "&:hover .address-search-btn": {
                opacity: 1,
                transform: "translateY(-50%) translateX(0)",
              },
            }}
          >
            <TextField
              fullWidth
              label="도로명 주소"
              name="roadAddress"
              value={storeInfo.roadAddress || ""}
              // 도로명 주소는 항상 직접 수정 불가, 검색 버튼으로만 변경
              InputProps={{
                readOnly: true,
              }}
              inputProps={{
                style: { textAlign: "center" },   // ✅ 중앙 정렬
              }}
              InputLabelProps={{
                readOnly: true,
                style: {
                  cursor: "default",
                },
              }}
              variant="outlined"
              sx={{
                pointerEvents: "none",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.9)",
                  pr: 11, // 우측에 버튼 겹칠 공간
                  "& fieldset": {
                    borderColor: "rgba(148, 163, 184, 0.4)",
                    pointerEvents: "none",
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
            {isEditing && (
              <Button
                className="address-search-btn"
                variant="contained"
                onClick={handleClickAddressSearch}
                size="small"
                startIcon={<SearchRounded sx={{ fontSize: 18 }} />}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 8,
                  transform: "translateY(-50%) translateX(6px)",
                  borderRadius: 999,
                  px: 1.6,
                  py: 0.4,
                  fontSize: "0.75rem",
                  textTransform: "none",
                  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.18)",
                  opacity: 0,
                  transition:
                    "opacity 0.18s ease-out, transform 0.18s ease-out, box-shadow 0.18s ease-out",
                  zIndex: 3,
                }}
              >
                주소 검색
              </Button>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="상세 주소"
            name="detailAddress"
            value={storeInfo.detailAddress || ""}
            onChange={isEditing ? handleChange : undefined}
            InputProps={{
              readOnly: !isEditing,
            }}
            inputProps={{
              style: { textAlign: "center" },   // ✅ 중앙 정렬
            }}
            InputLabelProps={{
              readOnly: !isEditing,
              style: {
                cursor: isEditing ? "auto" : "default",
              },
            }}
            variant="outlined"
            sx={{
              pointerEvents: isEditing ? "auto" : "none",
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.9)",
                "& fieldset": {
                  borderColor: "rgba(148, 163, 184, 0.4)",
                  pointerEvents: "none",
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
