import React, { useRef, useState } from "react";
import { Button, TextField } from "@mui/material";

function CustomerSignUp() {
  const JAVASCRIPT_API_KEY = 'bfc6a794411e9c59db71d143bcc3d704';
  // 상태 관리
  const [businessNumber, setBusinessNumber] = useState("");
  const [storeName, setStoreName] = useState("");
  const [roadAddress, setRoadAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [extraAddress, setExtraAddress] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeImage, setStoreImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const fileInputRef = useRef(null);
  const detailAddressRef = useRef(null);

  // 사업자번호 입력값을 000-00-00000 형태로 포맷팅
  const formatBusinessNumber = (raw) => {
    const digitsOnly = String(raw).replace(/\D/g, "").slice(0, 10);
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 5) return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 5)}-${digitsOnly.slice(5)}`;
  };

  // 매장 전화번호를 000-0000-0000 형태로 포맷팅 (3-4-4)
  const formatPhoneNumber = (raw) => {
    const digitsOnly = String(raw).replace(/\D/g, "").slice(0, 11);
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 7) return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7)}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      businessNumber,
      storeName,
      roadAddress,
      detailAddress,
      extraInfo,
      storePhone,
      hasImage: Boolean(storeImage),
    };
    // submit 처리 로직 연동 예정
  };

  // Daum Postcode 스크립트를 동적으로 로드
  const loadDaumPostcodeScript = () => new Promise((resolve, reject) => {
    if (window.daum && window.daum.Postcode) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[data-daum-postcode]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-daum-postcode', 'true');
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });

  // Kakao Maps SDK 동적 로드 (권장 방식: autoload=false 후 kakao.maps.load로 초기화)
  const loadKakaoMapsSdk = () => new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[data-kakao-maps]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${JAVASCRIPT_API_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-kakao-maps', 'true');
    script.onload = () => resolve(true);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  const handleClickAddressSearch = async () => {
    try {
      await loadDaumPostcodeScript();
      // eslint-disable-next-line no-undef
      new window.daum.Postcode({
        oncomplete: async function(data) {
          let addr = '';
          let extraAddr = '';
          if (data.userSelectedType === 'R') {
            addr = data.roadAddress;
          } else {
            addr = data.jibunAddress;
          }
          if (data.userSelectedType === 'R') {
            if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
              extraAddr += data.bname;
            }
            if (data.buildingName !== '' && data.apartment === 'Y') {
              extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            if (extraAddr !== '') {
              extraAddr = ' (' + extraAddr + ')';
            }
            setExtraAddress(extraAddr);
          } else {
            setExtraAddress('');
          }
          setPostcode(data.zonecode);
          setRoadAddress(addr);
          try {
            const ok = await loadKakaoMapsSdk();
            if (!ok) {
              console.warn('Kakao Maps SDK key 미설정으로 지오코딩을 생략합니다.');
            } else {
              window.kakao.maps.load(() => {
                try {
                  const geocoder = new window.kakao.maps.services.Geocoder();
                  geocoder.addressSearch(addr, function (result, status) {
                    if (status === window.kakao.maps.services.Status.OK) {
                      const coordinateX = result[0].x;
                      const coordinateY = result[0].y;
                      console.log('X좌표(경도):', coordinateX);
                      console.log('Y좌표(위도):', coordinateY);
                    }
                  });
                } catch (innerErr) {
                  console.error('Geocoding failed inside kakao.maps.load:', innerErr);
                }
              });
            }
          } catch (geoErr) {
            console.error('Kakao Maps SDK load failed:', geoErr);
          }
          // 상세주소 입력으로 포커스 이동
          setTimeout(() => { if (detailAddressRef.current) { detailAddressRef.current.focus(); } }, 0);
        }
      }).open();
    } catch (e) {
      console.error('주소 검색 스크립트 로드 실패', e);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setStoreImage(null);
      setImagePreviewUrl("");
      return;
    }
    setStoreImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreviewUrl(String(ev.target.result));
    };
    reader.readAsDataURL(file);
  };

  const inputRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    justifyContent: 'flex-start',
  };

  const labelTextStyle = {
    color: 'black',
    minWidth: '90px',
    textAlign: 'right',
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        border: '1px solid #ddd',
        padding: '30px 40px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        backgroundColor: '#fff',
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '22px', color: 'black', marginBottom: '10px' }}>점주회원</div>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
          width: '100%',
        }}>
          {/* 사업자번호 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>사업자번호:</span>
            <TextField
              value={businessNumber}
              onChange={(e) => setBusinessNumber(formatBusinessNumber(e.target.value))}
              placeholder="000-00-00000"
              size="small"
              variant="outlined"
              sx={{ minWidth: 240 }}
              type="text"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9-]*', maxLength: 12 }}
            />
          </div>

          {/* 상호명 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>상호명:</span>
            <TextField
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
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
              value={postcode}
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
              sx={{ textTransform: 'none' }}
            >주소 찾기</Button>
            <div style={{ flexGrow: 1 }}></div>
          </div>

          {/* 도로명 주소 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>도로명 주소:</span>
            <TextField
              value={roadAddress}
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
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
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
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
              placeholder="매장을 소개글을 작성해주세요"
              size="small"
              variant="outlined"
              sx={{ minWidth: 240 }}
            />
          </div>

          {/* 참고항목 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>참고항목:</span>
            <TextField
              value={extraAddress}
              onChange={() => {}}
              placeholder="참고항목"
              size="small"
              variant="outlined"
              sx={{ minWidth: 240 }}
              inputProps={{ readOnly: true }}
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
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              sx={{ textTransform: 'none' }}
            >이미지 업로드</Button>
            <div style={{ flexGrow: 1 }}></div>
          </div>

          {/* 이미지 미리보기 */}
          {imagePreviewUrl && (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <img
                src={imagePreviewUrl}
                alt="store-preview"
                style={{ maxWidth: '320px', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee' }}
              />
            </div>
          )}

          {/* 매장 전화번호 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>매장 전화번호:</span>
            <TextField
              value={storePhone}
              onChange={(e) => setStorePhone(formatPhoneNumber(e.target.value))}
              placeholder="000-0000-0000"
              size="small"
              variant="outlined"
              sx={{ minWidth: 240 }}
              type="text"
              inputProps={{ inputMode: 'tel', pattern: '[0-9-]*', maxLength: 13 }}
            />
          </div>

          <Button type="submit" variant="contained"
            sx={{
              backgroundColor: 'black',
              '&:hover': { backgroundColor: '#111' },
              textTransform: 'none',
              marginTop: '15px',
              width: '100%',
              padding: '10px 0'
            }}
          >회원가입</Button>
        </form>
      </div>
    </div>
  )
}

export default CustomerSignUp;
