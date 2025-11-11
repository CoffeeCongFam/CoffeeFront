import { InputAdornment, TextField, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import React from "react";

function SearchGiftReceiver({ keyword, setKeyword, handleSearch }) {
  // Enter 키로도 검색 가능하게 처리
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && setKeyword) {
      handleSearch(keyword);
    }
  };

  return (
    <TextField
      variant="outlined"
      placeholder="선물을 받을 회원 전화번호 검색"
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      onKeyDown={handleKeyDown}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => handleSearch && handleSearch(keyword)}
                edge="end"
              >
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "50px",
          backgroundColor: "white",
          "& fieldset": {
            borderRadius: "50px",
            borderColor: "#ffe0b2",
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
  );
}

export default SearchGiftReceiver;

// {
/* <Input
            id="standard-adornment-password"
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showPassword ? 'hide the password' : 'display the password'
                  }
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  onMouseUp={handleMouseUpPassword}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          /> */
// }
