import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../../utils/api";

function MemberSignUp() {
  const { search } = useLocation();

  // 상태 관리
  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [gender, setGender] = useState("남");
  const [initialEmail, setInitialEmail] = useState("");

  // Snackbar 상태
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // success | error | warning | info

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

  // 폼 제출 핸들러
  const handleSignup = async () => {
    const genderEnum = gender === "남" ? "M" : "F";
    const formData = { name, email: initialEmail, tel, gender: genderEnum };

    try {
      const response = await api.post("/signup/member", { ...formData });
      console.log("응답 전체:", response.data);
      console.log("리다이렉트 URL:", response.data.data.redirectUrl);

      // ✅ Snackbar 메시지 표시
      setSnackbarMsg("회원가입이 완료되었습니다 🎉 환영합니다!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // ✅ 1.5초 뒤에 이동 (Snackbar 확인 시간)
      setTimeout(() => {
        if (response.data.data.redirectUrl) {
          window.location.href = response.data.data.redirectUrl;
        }
      }, 1500);
    } catch (err) {
      console.error("회원가입 실패:", err);
      setSnackbarMsg("회원가입 중 오류가 발생했습니다 😢");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Snackbar 닫기 핸들러
  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
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
    minWidth: "70px",
    textAlign: "right",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
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
          일반회원
        </div>

        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            alignItems: "center",
            width: "100%",
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

          {/* 이메일 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>이메일:</span>
            <span style={{ color: "black", flexGrow: 1 }}>{initialEmail}</span>
          </div>

          {/* 전화번호 */}
          <div style={inputRowStyle}>
            <span style={labelTextStyle}>전화번호:</span>
            <TextField
              value={tel}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                setTel(onlyNumbers);
              }}
              placeholder="숫자만 입력"
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

      {/* Snackbar 영역 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default MemberSignUp;
