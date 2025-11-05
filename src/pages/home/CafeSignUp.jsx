import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Chip } from "@mui/material";
import axios from "axios";
// L_03 - 카페 정보 등록만 담당하는 등록 api 호출
import { postCafe } from "../../utils/login";
const JAVASCRIPT_API_KEY = import.meta.env.VITE_JAVASCRIPT_API_KEY;
const SERVICE_KEY = import.meta.env.VITE_SERVICE_KEY;
function CafeSignUp() {
  const navigate = useNavigate();

  // 상태 관리
  const [formState, setFormState] = useState({
    businessNumber: "", // 사업자번호
    storeName: "", // 상호명
    roadAddress: "", // 도로명 주소
    detailAddress: "", // 상세주소
    postcode: "", // 우편번호
    extraInfo: "", // 가게 상세정보
    storePhone: "", // 매장 번호
    storeImage: null, // 매장 이미지
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
        storeImage: null,
        imagePreviewUrl: "",
      }));
      return;
    }
    setFormState((prev) => ({ ...prev, storeImage: file }));

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormState((prev) => ({
        ...prev,
        imagePreviewUrl: String(ev.target.result),
      }));
    };
    reader.readAsDataURL(file);
  };

  const inputRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    justifyContent: "flex-start",
  };

  const labelTextStyle = {
    color: "black",
    minWidth: "90px",
    textAlign: "right",
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
      const newCafeData = {
        storeName: formState.storeName,
        roadAddress: formState.roadAddress,
        detailAddress: formState.detailAddress,
        businessNumber: formState.businessNumber, // 화면에 입력된 그대로(하이픈 포함)
        // L_04 - 일단 이미지는 나중으로 미루기 나중에 수정해줘야함
        storeImg: null,
        detailInfo: formState.extraInfo,
        storeTel: formState.storePhone, // 하이픈 제거된 숫자 문자열
        xPoint: formState.xPoint,
        yPoint: formState.yPoint,
      };

      const result = await postCafe(newCafeData);
      // postCafe는 response.data.data를 반환하는 유틸이라고 가정
      const success = result;

      if (success) {
        if (
          window.confirm("회원가입이 완료되었습니다. 회원 홈으로 이동합니다.")
        ) {
          navigate("/store");
        }
      } else {
        if (window.confirm("회원가입에 실패하였습니다. 메인으로 이동합니다.")) {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("회원가입 실패:", err);
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };
  //------------------------------------
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
        <div
          style={{
            fontWeight: "bold",
            fontSize: "22px",
            color: "black",
            marginBottom: "10px",
          }}
        >
          점주회원
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* 사업자번호 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>사업자번호:</span>
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
              sx={{ minWidth: 150, flexGrow: 1 }}
              type="text"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9-]*",
                maxLength: 12,
              }}
            />
            <Button
              variant="outlined"
              onClick={handleVerifyBusinessNumber}
              disabled={formState.isBusinessVerified}
              sx={{ textTransform: "none", whiteSpace: "nowrap" }}
            >
              사업자 인증
            </Button>
            {formState.isBusinessVerified && (
              <Chip label="인증완료" color="success" size="small" />
            )}
          </div>

          {/* 상호명 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>상호명:</span>
            <TextField
              value={formState.storeName}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, storeName: e.target.value }))
              }
              placeholder="상호명"
              size="small"
              variant="outlined"
              sx={{ minWidth: 240 }}
            />
          </div>

          {/* 우편번호 - 주소 찾기 버튼 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>우편번호:</span>
            <TextField
              value={formState.postcode}
              onChange={() => {}}
              placeholder="우편번호"
              size="small"
              variant="outlined"
              sx={{ minWidth: 160 }}
              inputProps={{ readOnly: true }}
            />
            <Button
              variant="outlined"
              onClick={handleClickAddressSearch}
              sx={{ textTransform: "none" }}
            >
              주소 찾기
            </Button>
            <div style={{ flexGrow: 1 }}></div>
          </div>

          {/* 도로명 주소 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>도로명 주소:</span>
            <TextField
              value={formState.roadAddress}
              onChange={() => {}}
              placeholder="도로명 주소"
              size="small"
              variant="outlined"
              sx={{ minWidth: 240, flexGrow: 1 }}
              inputProps={{ readOnly: true }}
            />
          </div>

          {/* 상세주소 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>상세주소:</span>
            <TextField
              value={formState.detailAddress}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  detailAddress: e.target.value,
                }))
              }
              placeholder="상세주소"
              size="small"
              variant="outlined"
              sx={{ minWidth: 240 }}
              inputRef={detailAddressRef}
            />
          </div>

          {/* 상세정보 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>상세정보:</span>
            <TextField
              value={formState.extraInfo}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, extraInfo: e.target.value }))
              }
              placeholder="매장을 소개글을 작성해주세요"
              size="small"
              variant="outlined"
              sx={{ minWidth: 240 }}
            />
          </div>

          {/* 매장사진 업로드 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>매장사진:</span>
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
              sx={{ textTransform: "none" }}
            >
              이미지 업로드
            </Button>
            <div style={{ flexGrow: 1 }}></div>
          </div>

          {/* 이미지 미리보기 */}
          {formState.imagePreviewUrl && (
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                src={formState.imagePreviewUrl}
                alt="store-preview"
                style={{
                  maxWidth: "320px",
                  maxHeight: "200px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  border: "1px solid #eee",
                }}
              />
            </div>
          )}

          {/* 매장 전화번호 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>매장 전화번호:</span>
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
              sx={{ minWidth: 240 }}
              type="text"
              inputProps={{
                inputMode: "tel",
                pattern: "[0-9-]*",
                maxLength: 13,
              }}
            />
          </div>

          {/* 안내 메시지 */}
          {!formState.isBusinessVerified && (
            <div
              style={{
                color: "#d32f2f",
                fontSize: "12px",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              사업자 인증을 먼저 진행해주세요.
            </div>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={!isFormValid}
            sx={{
              backgroundColor: "black",
              "&:hover": { backgroundColor: "#111" },
              textTransform: "none",
              marginTop: "15px",
              width: "100%",
              padding: "10px 0",
            }}
          >
            회원가입
          </Button>
        </form>
      </div>
    </div>
  );
}

export default CafeSignUp;
