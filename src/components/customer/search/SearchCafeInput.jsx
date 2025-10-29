import { InputAdornment, TextField } from "@mui/material";
import React from "react";
import SearchIcon from "@mui/icons-material/Search";

function SearchCafeInput({ keyword, setKeyword }) {
  return (
    <TextField
      style={{
        borderRadius: "10px",
        // boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
      }}
      variant="outlined"
      placeholder="카페를 검색해주세요."
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "50px", // 기본 borderRadius 설정 무시 후 커스텀
          backgroundColor: "white",
          "& fieldset": {
            borderRadius: "50px", // fieldset도 동일한 Radius 갖도록 커스텀
          },
        },
      }}
    ></TextField>
  );
}

export default SearchCafeInput;
