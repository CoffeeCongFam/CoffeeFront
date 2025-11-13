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
import { SearchRounded, PhotoCamera, Delete } from "@mui/icons-material";
import useUserStore from "../../stores/useUserStore";
import { useCallback, useState, useRef, useEffect } from "react";
import { postStoreHourInfo, patchStoreInfo } from "../../utils/store";
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

export default function ManageStoreInfo({ storeInfo: initialStoreInfo, syncStoreInfo }) {
  const [storeInfo, setStoreInfo] = useState(initialStoreInfo || {});
  const [originalStoreInfo, setOriginalStoreInfo] = useState(
    initialStoreInfo || {}
  );

  const [isEditingStoreInfo, setIsEditingStoreInfo] = useState(false);
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [imagePreview, setImagePreview] = useState(initialStoreInfo?.storeImg || null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [hoursErrors, setHoursErrors] = useState({});
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  useEffect(() => {
    if (!initialStoreInfo) return;

    // 수정 중일 때는 부모에서 내려온 값으로 덮어쓰지 않도록 보호
    if (isEditingStoreInfo || isEditingHours) return;

    setStoreInfo((prev) => ({
      ...prev,
      ...initialStoreInfo,
      // storeHours는 로컬에 변경된 값이 있으면 그 값을 유지
      storeHours:
        prev.storeHours && prev.storeHours.length > 0
          ? prev.storeHours
          : initialStoreInfo.storeHours || [],
          ...(isImageDeleted && { storeImg: null }),
    }));

    setOriginalStoreInfo((prev) => ({
      ...prev,
      ...initialStoreInfo,
      // 원본도 동일한 기준으로 유지/초기화
      storeHours:
        prev.storeHours && prev.storeHours.length > 0
          ? prev.storeHours
          : initialStoreInfo.storeHours || [],
          ...(isImageDeleted && { storeImg: null }),
    }));

    setImagePreview((prev) => {
    // ✅ 삭제 플래그가 켜져 있으면 서버에서 이미지 URL이 내려와도 표시하지 않음
    if (isImageDeleted) return null;
        return initialStoreInfo?.storeImg ? initialStoreInfo.storeImg : prev;
      });
    }, [initialStoreInfo, isEditingStoreInfo, isEditingHours, isImageDeleted]);

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
    if (!value) return isEditingHours ? "" : "-";
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

  const handleClickUploadImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChangeImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setIsImageDeleted(false);
  };

  const handleDeleteImageFile = () => {
    // ✅ 이미지 삭제: 로컬 파일/프리뷰 + storeInfo.storeImg 모두 비우기
    setImageFile(null);
    setImagePreview(null);
    setStoreInfo((prev) => ({
      ...prev,
      storeImg: null,          // ← 서버로도 "이미지 없음" 이라고 보내기 위함
    }));
    setIsImageDeleted(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 요일별 영업시간 및 휴무일 변경 핸들러
  const _handleHoursChange = useCallback((dayOfWeek, field, value) => {
    setStoreInfo((prev) => {
      // ✅ 기존 storeHours가 없거나 비어있으면, DAY_ORDER 기준으로 기본 구조 생성
      const baseHours =
        prev.storeHours && prev.storeHours.length > 0
          ? prev.storeHours
          : DAY_ORDER.map((day) => ({
              dayOfWeek: day,
              openTime: null,
              closeTime: null,
              isClosed: null,
            }));

      const updatedStoreHours = baseHours.map((hour) => {
        if (hour.dayOfWeek !== dayOfWeek) return hour;

        // isClosed 변경 처리
        if (field === "isClosed") {
          const newIsClosed = value ? "Y" : "N";

          if (newIsClosed === "Y") {
            // ✅ 휴무로 설정하면 시간 비우기
            return {
              ...hour,
              isClosed: newIsClosed,
              openTime: null,
              closeTime: null,
            };
          }

          // ✅ 휴무 해제 시 기본 시간 세팅 (필요하면 시간 변경)
          return {
            ...hour,
            isClosed: newIsClosed,
            openTime: hour.openTime || "09:00",
            closeTime: hour.closeTime || "18:00",
          };
        }

        // openTime / closeTime 변경 처리
        return {
          ...hour,
          [field]: value,
        };
      });

      return {
        ...prev,
        storeHours: updatedStoreHours,
      };
    });

    // isClosed 변경 시에는 해당 요일 에러를 즉시 제거
    if (field === "isClosed") {
      setHoursErrors((prev) => {
        const next = { ...prev };
        delete next[dayOfWeek];
        return next;
      });
    }
  }, []);
  // 요일별 시간 입력 핸들러 (백스페이스 정상 동작, 자동 00 미패딩, 자연스러운 입력)
  const handleDayTimeChange = (dayOfWeek, field) => (e) => {
    if (!isEditingHours) return;

    let input = e.target.value || "";
    // 숫자만 추출
    let digits = input.replace(/\D/g, "");

    // 최대 4자리(HHMM)까지만 허용
    if (digits.length > 4) {
      digits = digits.slice(0, 4);
    }

    let formatted = "";

    if (digits.length === 0) {
      // 아무 것도 없으면 빈 문자열 유지 (백스페이스 정상 동작)
      formatted = "";
    } else if (digits.length <= 2) {
      // 1~2자리: 시(HH)만 입력 중 (예: '0', '09')
      formatted = digits;
    } else {
      // 3~4자리: HHMM -> HH:MM (분은 사용자가 입력한 만큼만 반영, 자동 00 패딩 없음)
      const hours = digits.slice(0, 2);
      const minutes = digits.slice(2); // 1자리 또는 2자리 그대로 사용
      formatted = `${hours}:${minutes}`;
    }

    _handleHoursChange(dayOfWeek, field, formatted);

    const currentHour =
      mergedStoreHours.find((h) => h.dayOfWeek === dayOfWeek) || {};
    const isClosed = currentHour.isClosed === "Y";
    const openValue = field === "openTime" ? formatted : currentHour.openTime;
    const closeValue =
      field === "closeTime" ? formatted : currentHour.closeTime;

    let hasError = false;
    if (!isClosed) {
      const openFilled = !!openValue;
      const closeFilled = !!closeValue;
      hasError = openFilled !== closeFilled;
    }

    setHoursErrors((prev) => {
      const next = { ...prev };
      if (hasError) {
        next[dayOfWeek] = true;
      } else {
        delete next[dayOfWeek];
      }
      return next;
    });
  };

  // 매장 정보 수정 (PATCH /api/owners/stores/{partnerStoreId})
  const handleSaveStoreInfo = async () => {
    setError(null);
    setSuccessMessage(null);

    try {
      // ✅ 전역 Zustand에서 partnerStoreId 사용 (authUser와 직접 partnerStoreId 모두 확인)
      const { authUser, setUser, partnerStoreId: storePartnerStoreId } = useUserStore.getState();
      const partnerStoreId = authUser?.partnerStoreId || storePartnerStoreId || storeInfo?.partnerStoreId;

      if (!partnerStoreId) {
        throw new Error("제휴 매장 ID가 없습니다.");
      }

      // ✅ CafeSignUp과 동일한 형태의 FormData + dto 구성
      const formData = new FormData();

      const dto = {
        businessNumber: storeInfo.businessNumber, // 사업자번호
        storeName: storeInfo.storeName, // 상호명
        roadAddress: storeInfo.roadAddress, // 도로명 주소
        detailAddress: storeInfo.detailAddress, // 상세주소
        detailInfo: storeInfo.detailInfo, // 가게 상세정보
        storeTel: storeInfo.tel, // 매장 번호(숫자만)
        xPoint: storeInfo.xPoint, // X좌표(경도)
        yPoint: storeInfo.yPoint, // Y좌표(위도)
        storeImg: storeInfo.storeImg ?? null, // ✅ 이미지 URL 또는 null 명시적으로 전달
      };

      const jsonBlob = new Blob([JSON.stringify(dto)], {
        type: "application/json",
      });
      formData.append("data", jsonBlob);

      if (imageFile) {
        // 새 이미지를 업로드한 경우에만 실제 파일 전송
        formData.append("file", imageFile);
      }

      // ✅ partnerStoreId와 함께 patchStoreInfo 호출
      const result = await patchStoreInfo(partnerStoreId, formData);

      if (!result) {
        throw new Error("매장 정보 수정에 실패했습니다.");
      }

      // 필요 시 최신 정보를 다시 조회하여 전역 상태 동기화
      const response = await api.get(STORE_API_URL);
      const updatedData = response.data.data;
      if (updatedData && updatedData.purchaseId) {
        setUser({
          ...authUser,
          purchaseId: updatedData.purchaseId,
        });
      }

      // ✅ 이미지 프리뷰 유지/복원
      setImagePreview((prev) => {
        // 1) 새 이미지를 업로드한 상태에서 저장한 경우: 기존 프리뷰(blob URL)를 그대로 유지
        if (imageFile && prev) {
          return prev;
        }

        // 2) 명시적으로 이미지를 삭제한 상태(storeImg === null && 새 파일 없음)라면,
        //    프리뷰도 비운 상태 유지 (→ "등록된 매장 이미지가 없습니다." 계속 보이게)
        if (storeInfo.storeImg === null && !imageFile) {
          return null;
        }

        // 3) 그 외에는 서버/원본 기준으로 등록된 이미지가 있는 경우: 그 URL로 복원
        const fallback =
          storeInfo.storeImg ||
          originalStoreInfo.storeImg ||
          initialStoreInfo?.storeImg ||
          null;

        return fallback ?? prev;
      });

      setSuccessMessage("매장 정보가 성공적으로 수정되었습니다.");
      setIsEditingStoreInfo(false);
      setOriginalStoreInfo(storeInfo);
    } catch (err) {
      console.error("매장 정보 수정 실패 :", err);
      setError("정보 수정에 실패. 다시 시도해주세요");
    }
  };

  const handleCancelStoreInfo = () => {
    // ✅ 매장 기본 정보만 원본으로 되돌리고, 영업시간(storeHours)과 이미지(storeImg 관련)는 건드리지 않는다.
    setStoreInfo((prev) => ({
      ...prev,
      businessNumber: originalStoreInfo.businessNumber,
      storeName: originalStoreInfo.storeName,
      roadAddress: originalStoreInfo.roadAddress,
      detailAddress: originalStoreInfo.detailAddress,
      detailInfo: originalStoreInfo.detailInfo,
      tel: originalStoreInfo.tel,
      xPoint: originalStoreInfo.xPoint,
      yPoint: originalStoreInfo.yPoint,
      // storeHours, storeImg 등 나머지 필드는 그대로 유지
    }));

    // ✅ 이미지 프리뷰/업로드 파일도 원본 상태로 롤백
    setImagePreview(originalStoreInfo.storeImg || null); // ⬅ 화면에 다시 보여줄 이미지
    setImageFile(null);                     // 수정 중에 올렸던 새 파일은 버림
    setIsImageDeleted(false);

    // 수정 모드 종료 및 에러 초기화
    setIsEditingStoreInfo(false);
    setError(null);
  };

  const handleCancelStoreHours = () => {
    // 영업시간 수정 취소 시, 원본으로 되돌리기
    setStoreInfo((prev) => ({
      ...prev,
      storeHours: originalStoreInfo?.storeHours
        ? [...originalStoreInfo.storeHours]
        : [],
    }));
    setIsEditingHours(false);
    setError(null);
    setHoursErrors({});
  };

  const handleSaveStoreHours = async () => {
    setError(null);
    setSuccessMessage(null);

    // ✅ 영업시간 유효성 검사: 시작/종료 중 하나만 입력된 경우 에러 처리
    const newErrors = {};
    mergedStoreHours.forEach((hour) => {
      const isClosed = hour.isClosed === "Y";
      const openFilled = !!hour.openTime;
      const closeFilled = !!hour.closeTime;

      // 휴무가 아니고, 시작/종료 입력 상태가 서로 다르면 에러
      if (!isClosed && openFilled !== closeFilled) {
        newErrors[hour.dayOfWeek] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setHoursErrors(newErrors);
      setError("영업시간을 다시 확인해주세요.");
      return; // ⬅ 저장 요청 보내지 않음
    }

    setHoursErrors({}); // 통과 시 에러 초기화

    try {
      // ✅ 전역 Zustand에서 partnerStoreId 가져오기 (authUser와 직접 partnerStoreId 모두 확인)
      const { authUser, partnerStoreId: storePartnerStoreId } = useUserStore.getState();
      const partnerStoreId = authUser?.partnerStoreId || storePartnerStoreId || storeInfo?.partnerStoreId;

      if (!partnerStoreId) {
        throw new Error("제휴 매장 ID가 없습니다.");
      }

      // 기존 storeHours (storeHoursId 찾기용)
      const existingStoreHours = storeInfo.storeHours || [];

      // ✅ 서버에 보낼 dayHours 배열 구성
      const dayHours = mergedStoreHours.map((hour) => {
        // storeInfo.storeHours에서 같은 dayOfWeek 가진 기존 데이터 찾기
        const base = existingStoreHours.find(
          (h) => h.dayOfWeek === hour.dayOfWeek
        );

        // isClosed 값 결정
        const isClosedValue =
          hour.isClosed !== undefined && hour.isClosed !== null
            ? hour.isClosed
            : hour.openTime || hour.closeTime
            ? "N"
            : "Y";

        return {
          isClosed: isClosedValue, // 'Y' 또는 'N'
          openTime: hour.openTime || null,
          closeTime: hour.closeTime || null,
          storeHoursId: base ? base.storeHoursId ?? null : null,
          dayOfWeek: hour.dayOfWeek,
        };
      });

      // ✅ 정의한 partnerStoreId + dayHours로 요청 보내기
      const result = await postStoreHourInfo({
        partnerStoreId,
        dayHours,
      });

      // 🔎 postStoreHourInfo 반환값이 true가 아니라면, 변경사항 적용하지 않고 알림만 띄움
      if (!result) {
        alert("매장 등록이 실패되었습니다. 다시 시도해주세요.");
        return;
      }

      // ✅ 로컬 상태도 최신 값으로 동기화 (렌더링용 storeHours 업데이트)
      setStoreInfo((prev) => ({
        ...prev,
        storeHours: dayHours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
          storeHoursId: h.storeHoursId ?? null,
        })),
      }));

      setOriginalStoreInfo((prev) => ({
        ...prev,
        storeHours: dayHours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
          storeHoursId: h.storeHoursId ?? null,
        })),
      }));

      setSuccessMessage("영업시간 및 휴무일 정보가 저장되었습니다.");
      setIsEditingHours(false);
	  window.location.reload();
      // 저장 이후에는 별도의 재조회 없이, 방금 입력한 로컬 상태(storeInfo.storeHours)를 그대로 화면에 보여줍니다.
    } catch (err) {
      console.error("영업시간 정보 저장 실패 :", err);
      setError("영업시간 저장에 실패했습니다. 다시 시도해주세요.");
    }
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
            borderRadius: 2,
            bgcolor: "white",
            border: "1px solid #ffe0b2",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
        {/* 헤더 및 수정 버튼 */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            <Typography 
              variant="h5" 
              component="h1" 
              fontWeight={700}
              sx={{
                fontSize: "1.75rem",
                letterSpacing: "-0.02em",
                mb: 0.5,
                color: "#334336",
              }}
            >
              매장 정보
            </Typography>
            <Typography 
              variant="body2" 
              sx={{
                fontSize: "0.875rem",
                color: "#334336",
              }}
            >
              오늘 기준 매장 정보를 한 번에 확인하고 수정해 보세요.
            </Typography>
          </Box>
          {isEditingStoreInfo ? (
            <Box display="flex" gap={1.5}>
              {/* 수정 취소 */}
              <Button
                variant="outlined"
                onClick={handleCancelStoreInfo}
                size="medium"
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.875rem",
                  borderColor: "rgba(148, 163, 184, 0.4)",
                  color: "#334336",
                  bgcolor: "transparent",
                  "&:hover": {
                    borderColor: "rgba(148, 163, 184, 0.6)",
                    bgcolor: "rgba(148, 163, 184, 0.05)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                취소
              </Button>

              {/* 수정 완료 */}
              <Button
                variant="contained"
                onClick={handleSaveStoreInfo}
                size="medium"
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.875rem",
                  bgcolor: "#334336",
                  color: "#fff9f4",
                  boxShadow: "0 2px 8px rgba(51, 67, 54, 0.3)",
                  "&:hover": {
                    bgcolor: "#334336",
                    opacity: 0.9,
                    boxShadow: "0 4px 12px rgba(51, 67, 54, 0.4)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                저장하기
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={() => setIsEditingStoreInfo(true)}
              size="medium"
              sx={{
                borderRadius: 2,
                px: 2.5,
                py: 1,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.875rem",
                bgcolor: "#334336",
              color: "#fff9f4",
                boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
                "&:hover": {
                  bgcolor: "#334336",
                color: "#fff9f4",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              수정하기
            </Button>
          )}
        </Box>

        {/* 알림 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {/* {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage} */}
          {/* </Alert> */}
        {/* )} */}

        {/* 매장 이미지 영역 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 3,
            mb: 4,
          }}
        >
          <Box
            sx={{
              width: 200,
              height: 200,
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              bgcolor: "rgba(248, 250, 252, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                transform: "translateY(-2px)",
              },
            }}
          >
            {imagePreview ? (
              <Box
                component="img"
                src={imagePreview}
                alt="store"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Typography 
                variant="body2" 
                sx={{
                  color: "#334336",
                  fontSize: "0.875rem",
                }}
              >
                등록된 매장 이미지가 없습니다.
              </Typography>
            )}
          </Box>

          {isEditingStoreInfo && (
            <Stack spacing={1.5}>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<PhotoCamera />}
                onClick={handleClickUploadImage}
                sx={{
                  textTransform: "none",
                  alignSelf: "flex-start",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  borderColor: "#334336",
                  color: "#334336",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  "&:hover": {
                    borderColor: "#334336",
                    bgcolor: "rgba(51, 67, 54, 0.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                새 이미지 첨부
              </Button>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleChangeImageFile}
              />

              {imagePreview && (
                <Button
                  variant="text"
                  size="medium"
                  startIcon={<Delete />}
                  onClick={handleDeleteImageFile}
                  sx={{
                    textTransform: "none",
                    alignSelf: "flex-start",
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    color: "error.main",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    "&:hover": {
                      bgcolor: "rgba(239, 68, 68, 0.05)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  이미지 삭제
                </Button>
              )}
            </Stack>
          )}
        </Box>

        {/* 매장 기본 정보 영역 */}
        <Typography
          variant="h6"
          mb={3}
          sx={{
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            fontSize: "1.25rem",
            letterSpacing: "-0.01em",
            color: "#334336",
          }}
        >
          매장 정보
          <Box
            component="span"
            sx={{
              width: 6,
              height: 6,
              borderRadius: "999px",
              bgcolor: "#334336",
              color: "#fff9f4",
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
            onChange={isEditingStoreInfo ? handleChange : undefined}
            InputProps={{
              readOnly: !isEditingStoreInfo,
            }}
            inputProps={{
              style: { textAlign: "center" },   // ✅ 중앙 정렬
            }}
            InputLabelProps={{
              readOnly: !isEditingStoreInfo,
              style: {
                cursor: isEditingStoreInfo ? "auto" : "default",
              },
            }}
            variant="outlined"
            sx={{
              pointerEvents: isEditingStoreInfo ? "auto" : "none",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: isEditingStoreInfo 
                  ? "rgba(255, 255, 255, 0.95)" 
                  : "rgb(255, 255, 255)",
                transition: "all 0.2s ease",
                "& fieldset": {
                  borderColor: "rgba(148, 163, 184, 0.4)",
                  pointerEvents: "none",
                },
                "&:hover fieldset": {
                  borderColor: isEditingStoreInfo ? "rgba(99, 102, 241, 0.5)" : "rgba(226, 232, 240, 0.8)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#6366f1",
                  borderWidth: 2,
                },
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.875rem",
                fontWeight: 500,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#334336",
              },
              "& .MuiInputBase-input": {
                fontSize: "0.9375rem",
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
            onChange={isEditingStoreInfo ? handleChange : undefined}
            InputProps={{
              readOnly: !isEditingStoreInfo,
            }}
            inputProps={{
              style: { textAlign: "center" },   // ✅ 중앙 정렬
            }}
            InputLabelProps={{
              readOnly: !isEditingStoreInfo,
              style: {
                cursor: isEditingStoreInfo ? "auto" : "default",
              },
            }}
            variant="outlined"
            sx={{
              pointerEvents: isEditingStoreInfo ? "auto" : "none",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: isEditingStoreInfo 
                  ? "rgba(255, 255, 255, 0.95)" 
                  : "rgb(255, 255, 255)",
                transition: "all 0.2s ease",
                "& fieldset": {
                  borderColor: "rgba(148, 163, 184, 0.4)",
                  pointerEvents: "none",
                },
                "&:hover fieldset": {
                  borderColor: isEditingStoreInfo ? "rgba(99, 102, 241, 0.5)" : "rgba(226, 232, 240, 0.8)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#6366f1",
                  borderWidth: 2,
                },
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.875rem",
                fontWeight: 500,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#334336",
              },
              "& .MuiInputBase-input": {
                fontSize: "0.9375rem",
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
                  borderColor: "#334336",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#334336",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#4f46e5",
              },
            }}
          />
        </Grid>
        </Grid>
        
        {/* 2행: 도로명 주소 / 상세 주소 - 한 행에서 50%씩 분할 */}
        <Box sx={{ mt: 3, display: "flex", gap: 3, width: "100%" }}>
          <Box
            sx={{
              position: "relative",
              width: "50%",
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
                width: "100%",
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
                    borderColor: "#334336",
                  },
                },
                "& .MuiInputBase-input": {
                  overflowX: "auto",
                  overflowY: "hidden",
                  textOverflow: "clip",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  "&::-webkit-scrollbar": {
                    height: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "2px",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#334336",
                },
              }}
            />
            {isEditingStoreInfo && (
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
                  bgcolor: "#334336",
                  color: "#fff9f4",
                  boxShadow: "0 8px 20px rgba(51, 67, 54, 0.18)",
                  opacity: 0,
                  transition:
                    "opacity 0.18s ease-out, transform 0.18s ease-out, box-shadow 0.18s ease-out",
                  zIndex: 3,
                  "&:hover": {
                    bgcolor: "#334336",
                    opacity: 0.9,
                  },
                }}
              >
                주소 검색
              </Button>
            )}
          </Box>

          <Box sx={{ width: "30%" }}>
            <TextField
              fullWidth
              label="상세 주소"
              name="detailAddress"
              value={storeInfo.detailAddress || ""}
              onChange={isEditingStoreInfo ? handleChange : undefined}
              InputProps={{
                readOnly: !isEditingStoreInfo,
              }}
              inputProps={{
                style: { textAlign: "center" },   // ✅ 중앙 정렬
              }}
              InputLabelProps={{
                readOnly: !isEditingStoreInfo,
                style: {
                  cursor: isEditingStoreInfo ? "auto" : "default",
                },
              }}
              variant="outlined"
              sx={{
                pointerEvents: isEditingStoreInfo ? "auto" : "none",
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
                    borderColor: "#334336",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#334336",
                },
              }}
            />
          </Box>
        </Box>

        {/* 매장 설명 영역 */}
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h6"
            mb={2}
            sx={{
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              color: "#334336",
            }}
          >
            매장 설명
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: "999px",
                bgcolor: "#334336",
              color: "#fff9f4",
              }}
            />
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "rgba(248, 250, 252, 0.8)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "rgba(99, 102, 241, 0.3)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            {isEditingStoreInfo ? (
              <TextField
                fullWidth
                multiline
                rows={6}
                label="매장 설명"
                name="detailInfo"
                value={storeInfo.detailInfo || ""}
                onChange={handleChange}
                placeholder="매장에 대한 상세한 설명을 입력해주세요."
                InputProps={{
                  sx: {
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontWeight: 500,
                  },
                }}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "rgba(255, 255, 255, 0.95)",
                    "& fieldset": {
                      borderColor: "rgba(148, 163, 184, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(51, 67, 54, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#334336",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#334336",
                  },
                }}
              />
            ) : (
              <Typography
                variant="body1"
                sx={{
                  color: "#334336",
                  fontSize: "0.95rem",
                  lineHeight: 1.7,
                  minHeight: "120px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {storeInfo.detailInfo || "등록된 매장 설명이 없습니다."}
              </Typography>
            )}
          </Paper>
        </Box>

        {/* 영업시간 영역 */}
        <Box
          mt={4}
          mb={0.5}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              fontSize: "1.25rem",
              letterSpacing: "-0.01em",
              color: "#334336",
            }}
          >
            {month}월 영업시간 & 휴무일
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: "999px",
                bgcolor: "#334336",
              }}
            />
          </Typography>
          {isEditingHours ? (
            <Box display="flex" gap={1.5}>
              {/* 수정 취소 */}
              <Button
                variant="outlined"
                onClick={handleCancelStoreHours}
                size="medium"
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.875rem",
                  borderColor: "rgba(148, 163, 184, 0.4)",
                  color: "#334336",
                  bgcolor: "transparent",
                  "&:hover": {
                    borderColor: "rgba(148, 163, 184, 0.6)",
                    bgcolor: "rgba(148, 163, 184, 0.05)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                취소
              </Button>

              {/* 수정 완료 */}
              <Button
                variant="contained"
                onClick={handleSaveStoreHours}
                size="medium"
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.875rem",
                  bgcolor: "#334336",
                  color: "#fff9f4",
                  boxShadow: "0 2px 8px rgba(51, 67, 54, 0.3)",
                  "&:hover": {
                    bgcolor: "#334336",
                    opacity: 0.9,
                    boxShadow: "0 4px 12px rgba(51, 67, 54, 0.4)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                저장하기
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={() => setIsEditingHours(true)}
              size="medium"
              sx={{
                borderRadius: 2,
                px: 2.5,
                py: 1,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.875rem",
                bgcolor: "#334336",
              color: "#fff9f4",
                boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
                "&:hover": {
                  bgcolor: "#334336",
                color: "#fff9f4",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              수정하기
            </Button>
          )}
        </Box>
        <Typography 
          variant="body2" 
          sx={{
            color: "#334336",
            mb: 3,
            fontSize: "0.875rem",
          }}
        >
          요일별 영업 시간을 입력하고, 쉬는 날은 버튼 하나로 간단하게 설정해 보세요.
        </Typography>
        <Box
          sx={{
            borderRadius: 3,
            p: 3,
            bgcolor: "rgba(248, 250, 252, 0.8)",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            transition: "all 0.2s ease",
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
                        style: { cursor: isEditingHours ? "auto" : "default" },
                      }}
                      InputProps={{
                        readOnly: !isEditingHours || isClosed,
                        style: {
                          cursor:
                            isEditingHours && !isClosed ? "auto" : "default",
                        },
                      }}
                      inputProps={{
                        inputMode: "numeric",
                        maxLength: 5, // 09:00 형태
                      }}
                       error={Boolean(hoursErrors[hour.dayOfWeek])}
                      helperText={
                        hoursErrors[hour.dayOfWeek]
                          ? "시작/종료시간 모두 입력해주세요"
                          : " "
                      }
                      variant="outlined"
                      sx={{
                        flex: 1,
                        pointerEvents:
                          isEditingHours && !isClosed ? "auto" : "none",
                        "& .MuiOutlinedInput-root": {
                          bgcolor: isEditingHours
                            ? "rgba(248, 250, 252, 0.9)"
                            : "rgba(239, 242, 245, 0.9)",
                          borderRadius: 3,
                          "& fieldset": {
                            borderColor: "rgba(148, 163, 184, 0.4)",
                          },
                          "&:hover fieldset": {
                            borderColor: "#334336",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#334336",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#334336",
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
                        style: { cursor: isEditingHours ? "auto" : "default" },
                      }}
                      InputProps={{
                        readOnly: !isEditingHours || isClosed,
                        style: {
                          cursor:
                            isEditingHours && !isClosed ? "auto" : "default",
                        },
                      }}
                      inputProps={{
                        inputMode: "numeric",
                        maxLength: 5,
                      }}
                      error={Boolean(hoursErrors[hour.dayOfWeek])}
                      helperText={" "}
                      variant="outlined"
                      sx={{
                        flex: 1,
                        pointerEvents:
                          isEditingHours && !isClosed ? "auto" : "none",
                        "& .MuiOutlinedInput-root": {
                          bgcolor: isEditingHours
                            ? "rgba(248, 250, 252, 0.9)"
                            : "rgba(239, 242, 245, 0.9)",
                          borderRadius: 3,
                          "& fieldset": {
                            borderColor: "rgba(148, 163, 184, 0.4)",
                          },
                          "&:hover fieldset": {
                            borderColor: "#334336",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#334336",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#334336",
                        },
                      }}
                    />
                    {/* 휴무/영업/미정 표시 버튼 */}
                    {isEditingHours ? (
                      // ✅ 수정 모드일 때
                      isUndefinedStatus ? (
                        // 시작/종료 시간이 모두 비어 있고 상태가 미정인 경우: [미정] 버튼만 표시
                        <Button
                          variant={buttonVariant}
                          onClick={() =>
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
                            ...(isUndefinedStatus ? {
                              bgcolor: "grey.100",
                              color: "grey.600",
                              borderColor: "grey.400",
                            } : {
                              borderColor: "#334336",
                              color: "#334336",
                              "&:hover": {
                                borderColor: "#334336",
                                bgcolor: "rgba(51, 67, 54, 0.05)",
                              },
                            }),
                          }}
                        >
                          {statusLabel}
                        </Button>
                      ) : (
                        // ✅ 시작/종료에 값이 하나라도 들어온 경우: [영업], [휴무] 두 개의 버튼 표시
                        <Box display="flex" gap={1}>
                          <Button
                            variant={isClosed ? "outlined" : "contained"}
                            onClick={() =>
                              _handleHoursChange(
                                hour.dayOfWeek,
                                "isClosed",
                                false // 영업 = isClosed: 'N'
                              )
                            }
                            size="small"
                            sx={{
                              borderRadius: 999,
                              px: 2.2,
                              py: 0.6,
                              fontWeight: 600,
                              textTransform: "none",
                              ...(isClosed ? {
                                borderColor: "#334336",
                                color: "#334336",
                                "&:hover": {
                                  borderColor: "#334336",
                                  bgcolor: "rgba(51, 67, 54, 0.05)",
                                },
                              } : {
                                bgcolor: "#334336",
                                color: "#fff9f4",
                                "&:hover": {
                                  bgcolor: "#334336",
                                  opacity: 0.9,
                                },
                              }),
                            }}
                          >
                            영업
                          </Button>
                          <Button
                            variant={isClosed ? "contained" : "outlined"}
                            onClick={() =>
                              _handleHoursChange(
                                hour.dayOfWeek,
                                "isClosed",
                                true // 휴무 = isClosed: 'Y'
                              )
                            }
                            size="small"
                            sx={{
                              borderRadius: 999,
                              px: 2.2,
                              py: 0.6,
                              fontWeight: 600,
                              textTransform: "none",
                              ...(isClosed ? {
                                bgcolor: "#607064",
                                color: "#fff9f4",
                                "&:hover": {
                                  bgcolor: "#607064",
                                  opacity: 0.9,
                                },
                              } : {
                                borderColor: "#607064",
                                color: "#607064",
                                "&:hover": {
                                  borderColor: "#607064",
                                  bgcolor: "rgba(96, 112, 100, 0.05)",
                                },
                              }),
                            }}
                          >
                            휴무
                          </Button>
                        </Box>
                      )
                    ) : (
                      // ✅ 수정 모드가 아닐 때는 기존처럼 단일 상태 버튼만 표시
                      <Button
                        variant={buttonVariant}
                        size="small"
                        sx={{
                          borderRadius: 999,
                          px: 2.2,
                          py: 0.6,
                          fontWeight: 600,
                          textTransform: "none",
                          ...(isUndefinedStatus ? {
                            bgcolor: "grey.100",
                            color: "grey.600",
                            borderColor: "grey.400",
                          } : isClosed ? {
                            bgcolor: "#607064",
                            color: "#fff9f4",
                            "&:hover": {
                              bgcolor: "#607064",
                              opacity: 0.9,
                            },
                          } : {
                            bgcolor: "#334336",
                            color: "#fff9f4",
                            "&:hover": {
                              bgcolor: "#334336",
                              opacity: 0.9,
                            },
                          }),
                        }}
                      >
                        {statusLabel}
                      </Button>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
        </Paper>
      </Box>
    </Box>
  );
}