import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import useUserStore from "../../stores/useUserStore";
// 이메일은 부모 컴포넌트에서 props로 전달받는다고 가정합니다.
function CustomerSignUp() {
  const { search } = useLocation();
  const BASE_URL = import.meta.env.VITE_API_URL;

  // 상태 관리
  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [gender, setGender] = useState("남");
  const [initialEmail, setInitialEmail] = useState("");
  // L_01 - 네비게이트 선언
  let navigate = useNavigate();
  useEffect(() => {
    console.log("MemberSignUp mounted!!!!!");
    const params = new URLSearchParams(search);
    const token = params.get("token");

    if (token) {
      console.log("토큰 있음:", token);

      try {
        const decodedToken = jwtDecode(token);
        console.log("디코딩된 토큰:", decodedToken);

        // TODO 필수아님
        if (decodedToken.purpos !== "singup") {
          alert("회원가입용 토큰이 아닙니다. 다시 로그인해주세요.");
          // TODO 로그인 페이지로 유도
        }

        setInitialEmail(decodedToken.email || "");
      } catch (err) {
        console.log("JWT 오류 : " + err);
        alert("인증 토큰이 없습니다. 다시 로그인해주세요.");
        // TODO 실패로 인해서 로그인 페이지로 유도
      }
    }
  }, [search]);

  // // 전화번호를 000-0000-0000 형태로 포맷팅 (3-4-4)
  // const formatTelNumber = (raw) => {
  //   const digitsOnly = String(raw).replace(/\D/g, "").slice(0, 11);
  //   if (digitsOnly.length <= 3) return digitsOnly;
  //   if (digitsOnly.length <= 7) return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
  //   return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7)}`;
  // };

  // L_05 - zustand에서 setUser 불러오기
  const { setUser } = useUserStore.getState();

  // 폼 제출 핸들러
  const handleSignup = async () => {
    const genderEnum = gender === "남" ? "M" : "F";
    // 서버로 전송할 최종 데이터 객체
    const formData = {
      name,
      email: initialEmail,
      tel,
      gender: genderEnum,
    };

    try {
      // axios 직접 호출 대신 api 인스턴스 사용
      // baseURL과 withCredentials는 api 인스턴스에 이미 설정되어 있음
      const response = await api.post("/signup/store", { ...formData },{ withCredentials: true });

      // response 전체 출력
      console.log("응답 전체:", response.data);
      const memberId = response.data.data.memberId;
      console.log("리다이렉트 URL:", response.data.data.redirectUrl);
      // L_02 - 이거 있으면 강제로 리다이렉트 될수있음 일단 주석처리
      // if (response.data.data.redirectUrl) {
      //   window.location.href = response.data.data.redirectUrl;
      // } else {
      //   alert("카페 상세정보 입력창으로 넘어갑니다.");
      // }

      // L_03 - 성공이 success : true 라면 카페 상세정보 입력하는 창으로 이동
      if (response.data.data.message === "성공") {
        // L_04 - zustand의 useUserStore를 사용해서 memberId 업데이트해서 cafeSignUp에서 사용가능하게 해주기
        setUser({ memberId });

        const goToCafeSignUp = window.confirm(
          "회원정보 등록이 완료되었습니다. 매장 등록을 진행하시겠습니까?"
        );

        if (goToCafeSignUp) {
          // 등록하기 선택 시: 기존 로직대로 카페 상세정보 입력 페이지로 이동
          navigate("/cafeSignUp");
        } else {
          // 건너뛰기 선택 시: 매장 목록 페이지로 이동
          navigate("/store");
        }
      }
    } catch (err) {
      console.error("회원가입 실패:", err);
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  // 라벨 텍스트와 입력 필드를 포함하는 컨테이너의 스타일 정의
  // 라벨 텍스트와 입력 필드 간의 정렬을 위해 Flexbox를 사용합니다.
  const inputRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px", // 라벨과 인풋 사이 간격
    width: "100%", // 폼 너비만큼 확장
    justifyContent: "flex-start",
  };

  // 라벨 텍스트 ("이름:", "이메일:", "전화번호:", "성별:")의 우측 정렬 스타일
  const labelTextStyle = {
    color: "black",
    minWidth: "70px", // 라벨 너비를 일정하게 유지
    textAlign: "right", // 텍스트 우측 정렬
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
          // 폼 전체를 감싸는 외곽선 및 패딩 추가
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
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            alignItems: "center",
            width: "100%", // 폼 너비 설정
          }}
        >
          {/* 이름 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>이름:</span>
            <TextField
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              size="small"
              variant="outlined"
              sx={{ minWidth: 240 }}
            />
          </div>
          {/* 이메일 - 일반 텍스트 형태로만 표시 (수정 불가) */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>이메일:</span>
            <span
              style={{
                color: "black",
                flexGrow: 1, // 남은 공간 채우기
              }}
            >
              {initialEmail}
            </span>
          </div>

          {/* 전화번호 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>전화번호:</span>
            <TextField
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              placeholder="000-0000-0000"
              size="small"
              variant="outlined"
              sx={{ minWidth: 240 }}
              inputProps={{ inputMode: "tel" }}
            />
          </div>

          {/* 성별 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>성별:</span>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                displayEmpty
              >
                <MenuItem value={"남"}>남</MenuItem>
                <MenuItem value={"여"}>여</MenuItem>
              </Select>
            </FormControl>
            {/* 정렬을 맞추기 위한 빈 공간 (Flexbox 균형) */}
            <div style={{ flexGrow: 1 }}></div>
          </div>
          <Button
            variant="contained"
            onClick={handleSignup}
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

export default CustomerSignUp;
