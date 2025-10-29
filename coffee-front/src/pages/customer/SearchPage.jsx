import React, { useEffect, useRef, useState } from "react";
import SearchCafe from "../../components/customer/search/SearchCafe";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";

let naverMapsPromise;
function loadNaverMaps(clientId) {
  if (window.naver?.maps) return Promise.resolve(window.naver.maps);
  if (!naverMapsPromise) {
    naverMapsPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
      s.defer = true;
      s.onload = () => resolve(window.naver.maps);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return naverMapsPromise;
}

export default function SearchPage() {
  const mapRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const clientId = import.meta.env.VITE_NAVER_MAPS_CLIENT_ID;
        const maps = await loadNaverMaps(clientId);
        if (!mounted || !mapRef.current) return;

        // 기본 좌표
        const defaultCenter = new maps.LatLng(37.5665, 126.978);

        const initMap = (center) => {
          const map = new maps.Map(mapRef.current, {
            center,
            zoom: 15,
          });

          const marker = new maps.Marker({
            position: center,
            map,
            title: "현재 위치",
          });

          maps.Event.addListener(map, "click", (e) => {
            marker.setPosition(e.coord);
            console.log("클릭 좌표:", e.coord.lat(), e.coord.lng());
          });

          setStatus("ready");
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
              if (!mounted) return;
              initMap(new maps.LatLng(coords.latitude, coords.longitude));
            },
            (err) => {
              console.warn("위치 접근 실패:", err);
              initMap(defaultCenter);
            },
            { enableHighAccuracy: true, timeout: 5000 }
          );
        } else {
          console.warn("Geolocation 미지원");
          initMap(defaultCenter);
        }
      } catch (e) {
        console.error("네이버 지도 로드 실패:", e);
        setStatus("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh", // 화면 꽉 채우기
      }}
    >
      {/* 지도 레이어 */}
      <div
        ref={mapRef}
        style={{
          position: "absolute",
          inset: 0, // top:0, right:0, bottom:0, left:0
          overflow: "hidden",
        }}
      />

      {/* 지도 위 오버레이 UI */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 10,
          alignItems: "center",
          // background: "white",
          // borderRadius: "50px",
          // padding: "8px 12px",
          // fontSize: 14,
        }}
      >
        <TextField
          style={{
            borderRadius: "10px",
            // boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          }}
          variant="outlined"
          placeholder="카페를 검색해주세요."
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
              borderRadius: "50px", // Set desired border-radius
              backgroundColor: "white",
              "& fieldset": {
                borderRadius: "50px", // Ensure fieldset also has the same border-radius
              },
            },
          }}
        ></TextField>
        <IconButton
          aria-label="current-location"
          // color="primary"
          style={{ backgroundColor: "white" }}
        >
          <LocationSearchingIcon />
        </IconButton>
      </div>
    </div>
  );
}

{
  /* {status === "loading" && "현재 위치를 불러오는 중..."}
        {status === "ready" && "지도를 클릭하면 마커가 이동합니다."}
        {status === "error" && "지도를 불러오지 못했습니다."} */
}
