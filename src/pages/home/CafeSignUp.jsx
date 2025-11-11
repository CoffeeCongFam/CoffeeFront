import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircleRounded,
  PhotoCameraRounded,
  SearchRounded,
} from "@mui/icons-material";
import axios from "axios";
// L_03 - 카페 정보 등록만 담당하는 등록 api 호출
import { postCafe } from "../../utils/login";
import { getStoreInfo } from "../../utils/store";
import useUserStore from "../../stores/useUserStore";
const JAVASCRIPT_API_KEY = import.meta.env.VITE_JAVASCRIPT_API_KEY;

const SERVICE_KEY = import.meta.env.VITE_SERVICE_KEY;

function StoreForm({ onSuccess }) {
<<<<<<< HEAD
=======
  const { setPartnerStoreId } = useUserStore();

>>>>>>> 7237919 (ui 최종)
  // 상태 관리
  const [formState, setFormState] = useState({
    businessNumber: "", // 사업자번호
    storeName: "", // 상호명
    roadAddress: "", // 도로명 주소
    detailAddress: "", // 상세주소
    postcode: "", // 우편번호
    extraInfo: "", // 가게 상세정보
    storePhone: "", // 매장 번호
    storeImg: null, // 매장 이미지
    xPoint: "", // X좌표(경도)
    yPoint: "", // Y좌표(위도)
    imagePreviewUrl: "",
    isBusinessVerified: false, // 사업자번호 인증 상태
  });

  const fileInputRef = useRef(null);
  const detailAddressRef = useRef(null);

  // 사업자번호 입력값을 000-00-00000 형태로 포맷팅
  const formatBusinessNumber = (raw) => {
    const digitsOnly = String(raw).replace(/\D/g, "").slice(0, 10);
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 5)
      return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(
      3,
      5
    )}-${digitsOnly.slice(5)}`;
  };

  // 매장 전화번호를 000-0000-0000 형태로 포맷팅 (3-4-4)
  const formatPhoneNumber = (raw) => {
    const digitsOnly = String(raw).replace(/\D/g, "").slice(0, 11);
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 7)
      return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(
      3,
      7
    )}-${digitsOnly.slice(7)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSignup();
  };

  // 사업자번호 인증 함수
  const handleVerifyBusinessNumber = async () => {
    const cleanedBusinessNumber = formState.businessNumber.replace(/\D/g, "");

    if (cleanedBusinessNumber.length !== 10) {
      alert("사업자번호 10자리를 정확히 입력해주세요.");
      return;
    }

    const data = {
      b_no: [cleanedBusinessNumber],
    };

    try {
      const response = await axios.post(
        `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${SERVICE_KEY}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: SERVICE_KEY,
          },
        }
      );

      // API 응답 전체를 콘솔에 출력
      console.log("사업자번호 인증 API 응답:", response.data);

      const businessInfo = response.data?.data?.[0];
      if (businessInfo && businessInfo.b_stt_cd === "01") {
        // '01'은 계속사업자를 의미
        alert(`[${businessInfo.tax_type}] 사업자 인증이 완료되었습니다.`);
        setFormState((prev) => ({ ...prev, isBusinessVerified: true }));
      } else {
        alert(
          `국세청에 등록되지 않았거나 휴/폐업 상태의 사업자입니다.\n상태: ${
            businessInfo?.b_stt || "알 수 없음"
          }`
        );
        setFormState((prev) => ({ ...prev, isBusinessVerified: false }));
      }
    } catch (error) {
      console.error(
        "사업자번호 인증 API 호출 중 에러 발생:",
        error.response || error
      );
      alert(
        "사업자번호 인증 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
      setFormState((prev) => ({ ...prev, isBusinessVerified: false }));
    }
  };

  // Daum Postcode 스크립트를 동적으로 로드
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

  // Kakao Maps SDK 동적 로드 (권장 방식: autoload=false 후 kakao.maps.load로 초기화)
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

  const handleClickAddressSearch = async () => {
    try {
      await loadDaumPostcodeScript();
      // eslint-disable-next-line no-undef
      new window.daum.Postcode({
        oncomplete: async function (data) {
          let addr = "";
          if (data.userSelectedType === "R") {
            addr = data.roadAddress;
          } else {
            addr = data.jibunAddress;
          }
          setFormState((prev) => ({
            ...prev,
            postcode: data.zonecode,
            roadAddress: addr,
          }));

          try {
            const ok = await loadKakaoMapsSdk();
            if (!ok) {
              console.warn(
                "Kakao Maps SDK key 미설정으로 지오코딩을 생략합니다."
              );
            } else {
              window.kakao.maps.load(() => {
                try {
                  const geocoder = new window.kakao.maps.services.Geocoder();
                  geocoder.addressSearch(addr, function (result, status) {
                    if (status === window.kakao.maps.services.Status.OK) {
                      const coordinateX = result[0].x;
                      const coordinateY = result[0].y;
                      // 상태에 좌표 저장
                      setFormState((prev) => ({
                        ...prev,
                        xPoint: coordinateX,
                        yPoint: coordinateY,
                      }));
                      console.log(
                        "주소 검색 완료, 좌표가 상태에 저장되었습니다:",
                        { x: coordinateX, y: coordinateY }
                      );
                    }
                  });
                } catch (innerErr) {
                  console.error(
                    "Geocoding failed inside kakao.maps.load:",
                    innerErr
                  );
                }
              });
            }
          } catch (geoErr) {
            console.error("Kakao Maps SDK load failed:", geoErr);
          }
          // 상세주소 입력으로 포커스 이동
          setTimeout(() => {
            if (detailAddressRef.current) {
              detailAddressRef.current.focus();
            }
          }, 0);
        },
      }).open();
    } catch (e) {
      console.error("주소 검색 스크립트 로드 실패", e);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setFormState((prev) => ({
        ...prev,
        storeImg: null,
        imagePreviewUrl: "",
      }));
      return;
    }
    setFormState((prev) => ({ ...prev, storeImg: file }));

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormState((prev) => ({
        ...prev,
        imagePreviewUrl: String(ev.target.result),
      }));
    };
    reader.readAsDataURL(file);
  };

  // 모든 필수 필드가 채워졌는지 확인하는 변수
  const isFormValid =
    formState.isBusinessVerified &&
    formState.storeName.trim() !== "" &&
    formState.roadAddress.trim() !== "" &&
    formState.detailAddress.trim() !== "" &&
    formState.storePhone.trim() !== "";

  //----------------회원가입 버튼 --------------------
  const handleSignup = async () => {
    try {
      const data = new FormData();

      const dto = {
        businessNumber: formState.businessNumber, // 하이픈 포함 그대로
        storeName: formState.storeName,
        roadAddress: formState.roadAddress,
        detailAddress: formState.detailAddress,
        detailInfo: formState.extraInfo,
        storeTel: formState.storePhone, // 숫자만(하이픈 제거)
        xPoint: formState.xPoint,
        yPoint: formState.yPoint,
      };

      const jsonBlob = new Blob([JSON.stringify(dto)], {
        type: "application/json",
      });
      data.append("data", jsonBlob);

      // 이미지 파일 (선택한 경우에만)
      if (formState.storeImg) {
        data.append("file", formState.storeImg);
      }
      const result = await postCafe(data);
      if (result) {
        alert("매장 등록 완료!");
        
        // ✅ 매장 등록 완료 시 getStoreInfo 호출하여 partnerStoreId 설정
        try {
          const storeData = await getStoreInfo();
          if (storeData?.partnerStoreId) {
            setPartnerStoreId(storeData.partnerStoreId);
            console.log("✅ 매장 등록 완료 - partnerStoreId 설정:", storeData.partnerStoreId);
          }
        } catch (err) {
          console.error("매장 정보 조회 실패:", err);
        }
        
        // ✅ 컨텍스트별로 후처리 분기:
        // - CafeSignUp에서 사용 시: /store로 이동 (onSuccess 전달)
        // - CafeMyPage에서 사용 시: 기본 동작으로 새로고침
        if (typeof onSuccess === "function") {
          onSuccess();
        } else {
          window.location.reload();
        }
      } else {
        alert("매장 등록 실패!");
      }
    } catch (err) {
      console.error("매장등록 실패:", err);
      alert("매장등록 중 오류가 발생했습니다.");
    }
  };
  //------------------------------------

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 520,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.03em",
            mb: 0.5,
          }}
        >
          매장 등록
        </Typography>
        <Typography variant="body2" color="text.secondary">
          우리 동네 대표 카페로 등록하고, 구독 · 선물 서비스를 시작해보세요 ☕
        </Typography>
      </Box>

      <Divider sx={{ my: 1 }} />

      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.8 }}>
          {/* 사업자번호 */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, fontSize: "0.9rem" }}
              >
                사업자번호
              </Typography>
              {formState.isBusinessVerified && (
                <Chip
                  icon={
                    <CheckCircleRounded
                      sx={{ fontSize: 16, color: "success.main" }}
                    />
                  }
                  label="인증완료"
                  size="small"
                  sx={{
                    borderRadius: 999,
                    px: 0.6,
                    bgcolor: "success.light",
                    color: "success.dark",
                    "& .MuiChip-icon": {
                      ml: 0.2,
                    },
                  }}
                />
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                disabled={formState.isBusinessVerified} // 인증 후 비활성화
                value={formState.businessNumber}
                onChange={(e) => {
                  const formatted = formatBusinessNumber(e.target.value);
                  setFormState((prev) => ({
                    ...prev,
                    businessNumber: formatted,
                    isBusinessVerified: false, // 번호 변경 시 인증 상태 초기화
                  }));
                }}
                placeholder="000-00-00000"
                size="small"
                variant="outlined"
                fullWidth
                type="text"
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9-]*",
                  maxLength: 12,
                }}
              />
              <Button
                variant="contained"
                onClick={handleVerifyBusinessNumber}
                disabled={formState.isBusinessVerified}
                sx={{
                  flexShrink: 0,
                  borderRadius: 999,
                  px: 2,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "none",
<<<<<<< HEAD
                  backgroundImage: "linear-gradient(135deg, #111827, #4b5563)",
                  boxShadow: "0 6px 16px rgba(15,23,42,0.35)",
=======
                  bgcolor: "#334336",
                  color: "#fff9f4",
                  boxShadow: "0 6px 16px rgba(51, 67, 54, 0.35)",
                  "&:hover": {
                    bgcolor: "#334336",
                    opacity: 0.9,
                  },
>>>>>>> cad9ab0 (ui 색상 변경)
                  "&:disabled": {
                    bgcolor: "#ccc",
                    color: "#666",
                  },
                }}
              >
                사업자 인증
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary">
              국세청에 등록된 사업자만 가입이 가능해요.
            </Typography>
          </Box>

          {/* 상호명 */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, fontSize: "0.9rem" }}
            >
              상호명
            </Typography>
            <TextField
              value={formState.storeName}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  storeName: e.target.value,
                }))
              }
              placeholder="예) 달빛다방"
              size="small"
              variant="outlined"
              fullWidth
            />
          </Box>

          {/* 주소 섹션 */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, fontSize: "0.9rem" }}
            >
              매장 주소
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                value={formState.postcode}
                onChange={() => {}}
                placeholder="우편번호"
                size="small"
                variant="outlined"
                fullWidth
                inputProps={{ readOnly: true }}
              />
              <Button
                variant="outlined"
                onClick={handleClickAddressSearch}
                startIcon={
                  <SearchRounded sx={{ fontSize: 18, color: "#334336" }} />
                }
                sx={{
                  flexShrink: 0,
                  borderRadius: 999,
                  px: 1.8,
                  fontSize: "0.8rem",
                  textTransform: "none",
                  borderColor: "#334336",
                  color: "#334336",
                  "&:hover": {
                    borderColor: "#334336",
                    bgcolor: "rgba(51, 67, 54, 0.05)",
                  },
                }}
              >
                주소 찾기
              </Button>
            </Box>

            <TextField
              value={formState.roadAddress}
              onChange={() => {}}
              placeholder="도로명 주소"
              size="small"
              variant="outlined"
              fullWidth
              inputProps={{ readOnly: true }}
            />

            <TextField
              value={formState.detailAddress}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  detailAddress: e.target.value,
                }))
              }
              placeholder="상세주소 (층, 호수 등)"
              size="small"
              variant="outlined"
              fullWidth
              inputRef={detailAddressRef}
            />
          </Box>

          {/* 상세정보 */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, fontSize: "0.9rem" }}
            >
              매장 소개
            </Typography>
            <TextField
              value={formState.extraInfo}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  extraInfo: e.target.value,
                }))
              }
              placeholder="우리 카페의 분위기, 인기 메뉴 등을 자유롭게 적어주세요."
              size="small"
              variant="outlined"
              fullWidth
              multiline
              minRows={3}
            />
          </Box>

          {/* 매장사진 업로드 */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, fontSize: "0.9rem" }}
            >
              매장 사진
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <Button
                variant="outlined"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
                startIcon={
                  <PhotoCameraRounded
                    sx={{ fontSize: 18, color: "#334336" }}
                  />
                }
                sx={{
                  borderRadius: 999,
                  px: 2,
                  textTransform: "none",
                  fontSize: "0.85rem",
                  borderColor: "#334336",
                  color: "#334336",
                  "&:hover": {
                    borderColor: "#334336",
                    bgcolor: "rgba(51, 67, 54, 0.05)",
                  },
                }}
              >
                이미지 업로드
              </Button>
              <Typography variant="caption" color="text.secondary">
                JPG / PNG, 10MB 이하 권장
              </Typography>
            </Box>

            {formState.imagePreviewUrl && (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Box
                  component="img"
                  src={formState.imagePreviewUrl}
                  alt="store-preview"
                  sx={{
                    width: "100%",
                    maxWidth: 360,
                    maxHeight: 220,
                    borderRadius: 3,
                    objectFit: "cover",
                    border: "1px solid",
                    borderColor: "grey.200",
                    boxShadow: "0 10px 30px rgba(15,23,42,0.18)",
                  }}
                />
              </Box>
            )}
          </Box>

          {/* 매장 전화번호 */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, fontSize: "0.9rem" }}
            >
              매장 전화번호
            </Typography>
            <TextField
              value={formatPhoneNumber(formState.storePhone)}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, ""); // 숫자만 추출
                setFormState((prev) => ({
                  ...prev,
                  storePhone: digitsOnly, // 하이픈 없는 문자열로 저장
                }));
              }}
              placeholder="000-0000-0000"
              size="small"
              variant="outlined"
              fullWidth
              type="text"
              inputProps={{
                inputMode: "tel",
                pattern: "[0-9-]*",
                maxLength: 13,
              }}
            />
          </Box>

          {/* 안내 메시지 */}
          {!formState.isBusinessVerified && (
            <Typography variant="caption" color="error.main" sx={{ mt: -0.5 }}>
              사업자 인증을 먼저 진행해주세요.
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={!isFormValid}
            sx={{
              mt: 0.5,
              borderRadius: 999,
              py: 1.2,
              fontWeight: 700,
              fontSize: "0.95rem",
              textTransform: "none",
              bgcolor: "#334336",
              color: "#fff9f4",
              boxShadow: "0 6px 16px rgba(51, 67, 54, 0.35)",
              "&:hover": {
                bgcolor: "#334336",
                opacity: 0.9,
              },
              "&:disabled": {
                backgroundImage: "none",
                backgroundColor: "grey.400",
                boxShadow: "none",
              },
            }}
          >
            매장 등록 완료하기
          </Button>
        </Box>
      </form>
    </Box>
  );
}

function CafeSignUp() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/store");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          border: "1px solid #ddd",
          padding: "30px 40px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          backgroundColor: "#fff",
        }}
      >
        <StoreForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}

export { StoreForm };
export default CafeSignUp;
