import React, { useEffect, useRef, useState } from "react";
import cafeList from "../../data/customer/cafeList.js"; //

import { IconButton } from "@mui/material";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import SearchCafeInput from "../../components/customer/search/SearchCafeInput";

// 네이버 지도 로드
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
  const mapContainerRef = useRef(null); // 지도 DOM
  const mapInstanceRef = useRef(null); // naver.maps.Map 인스턴스
  const markerRef = useRef(null); // 현재 위치 마커

  const cafeMarkersRef = useRef([]); // ← 카페 마커들 관리

  const [status, setStatus] = useState("loading");
  const [keyword, setKeyword] = useState("");
  const [cafeMarkers, setCafeMarkers] = useState([]); // 현재 위치or 검색 위치 반경 2km 내외의 카페 리스트

  useEffect(() => {
    let mounted = true;

    // 카페 데이터 테스트
    setCafeMarkers(cafeList);

    (async () => {
      try {
        const clientId = import.meta.env.VITE_NAVER_MAPS_CLIENT_ID;
        const maps = await loadNaverMaps(clientId);
        if (!mounted || !mapContainerRef.current) return;

        // 기본 좌표 (서울 시청 근처)
        const defaultCenter = new maps.LatLng(37.5665, 126.978);

        const initMap = (center) => {
          const map = new maps.Map(mapContainerRef.current, {
            center,
            zoom: 15,
          });
          mapInstanceRef.current = map;

          const marker = new maps.Marker({
            position: center,
            map,
            title: "현재 위치",
          });
          markerRef.current = marker;

          maps.Event.addListener(map, "click", (e) => {
            marker.setPosition(e.coord);
            map.panTo(e.coord);
            // map.setCenter(e.coord);  // 클릭해도 Center 이동 없음(?)
            console.log("클릭 좌표:", e.coord.lat(), e.coord.lng());
          });

          // 초기 카페 마커 그리기
          // renderCafeMarkers(maps, map, cafeMarkers);

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
      // 언마운트 시 카페 마커들 정리
      cafeMarkersRef.current.forEach((m) => m.setMap(null));
      cafeMarkersRef.current = [];
    };
  }, []);

  //
  useEffect(() => {
    const maps = window.naver?.maps;
    const map = mapInstanceRef.current;
    if (!maps || !map) return;
    if (status !== "ready") return;
    if (!cafeMarkers || cafeMarkers.length === 0) return;

    renderCafeMarkers(maps, map, cafeMarkers);
  }, [status, cafeMarkers]);

  // markers(카페 데이터) 변경될 때마다 다시 렌더
  useEffect(() => {
    const maps = window.naver?.maps;
    const map = mapInstanceRef.current;
    if (!maps || !map) return;
    renderCafeMarkers(maps, map, cafeMarkers);
  }, [cafeMarkers]);

  // 카페 마커 렌더링
  function renderCafeMarkers(maps, map, cafes) {
    // 기존 마커 제거
    cafeMarkersRef.current.forEach((m) => m.setMap(null));
    cafeMarkersRef.current = [];

    if (!cafes || cafes.length === 0) return;

    let bounds = null;

    cafeMarkersRef.current = cafes.map((cafe, idx) => {
      // ⚠️ xPoint=위도(lat), yPoint=경도(lng)인지 확인!
      const pos = new maps.LatLng(cafe.xPoint, cafe.yPoint);

      const marker = new maps.Marker({
        position: pos,
        map,
        title: cafe.storeName,
      });

      const info = new maps.InfoWindow({
        content: `
        <div style="padding:8px 10px; font-size:12px;">
          <b>${cafe.storeName}</b><br/>
          <div>${cafe.roadAddress ?? ""}</div>
          <div style="color:#666;">${cafe.detailAddress ?? ""}</div>
        </div>
      `,
      });

      maps.Event.addListener(marker, "click", () => {
        info.open(map, marker);
      });

      // ✅ Bounds는 첫 포인트로 초기화 후 extend
      if (!bounds) {
        bounds = new maps.LatLngBounds(pos, pos);
      } else {
        bounds.extend(pos);
      }

      return marker;
    });

    if (bounds) {
      map.fitBounds(bounds);
    }
  }

  // 현재 유저의 위치로 지도 뷰 이동
  function setCurrentLocation() {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;

    if (!map) {
      console.warn("지도 초기화 전입니다.");
      return;
    }

    if (!navigator.geolocation) {
      console.warn("이 브라우저는 Geolocation을 지원하지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        const maps = window.naver.maps;
        const here = new maps.LatLng(latitude, longitude);

        // 부드럽게 이동(panTo) , 즉시 이동(setCenter)
        if (typeof map.panTo === "function") {
          map.panTo(here);
        } else {
          map.setCenter(here);
        }

        if (marker) {
          marker.setPosition(here);
        } else {
          // 혹시 마커가 없으면 새로 생성
          markerRef.current = new maps.Marker({
            position: here,
            map,
            title: "현재 위치",
          });
        }
      },
      (err) => {
        console.warn("현재 위치 가져오기 실패:", err);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* 지도 레이어 */}
      <div
        ref={mapContainerRef}
        style={{ position: "absolute", inset: 0, overflow: "hidden" }}
      />

      {/* 지도 위 오버레이 UI */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 10,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <SearchCafeInput keyword={keyword} setKeyword={setKeyword} />
        <IconButton
          onClick={setCurrentLocation}
          aria-label="current-location"
          style={{ backgroundColor: "white" }}
        >
          <LocationSearchingIcon />
        </IconButton>
      </div>

      {/* 상태 메시지 (원하면 표시) */}
      {/* <div style={{ position: "absolute", bottom: 16, left: 16, zIndex: 10, background:'white', padding: '6px 10px', borderRadius: 8 }}>
        {status === "loading" && "현재 위치를 불러오는 중..."}
        {status === "ready" && "지도를 클릭하면 마커가 이동합니다."}
        {status === "error" && "지도를 불러오지 못했습니다."}
      </div> */}
    </div>
  );
}
