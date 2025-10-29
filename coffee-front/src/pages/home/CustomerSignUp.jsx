import React, { useRef, useState } from "react";
import { Button, TextField } from "@mui/material";

function CustomerSignUp() {
  // 상태 관리
  const [businessNumber, setBusinessNumber] = useState("");
  const [storeName, setStoreName] = useState("");
  const [roadAddress, setRoadAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeImage, setStoreImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const fileInputRef = useRef(null);

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
    console.log("전송할 점주회원 회원가입 데이터:", formData);
  };

  const handleClickAddressSearch = () => {
    // 도로명 주소 검색 로직 연동 예정 (모달/외부 라이브러리 등)
    console.log("도로명 주소 검색 클릭");
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

          {/* 도로명 주소 - 검색 버튼 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>도로명 주소:</span>
            <Button
              variant="outlined"
              onClick={handleClickAddressSearch}
              sx={{ textTransform: 'none' }}
            >도로명 주소 검색</Button>
            <div style={{ flexGrow: 1 }}></div>
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
