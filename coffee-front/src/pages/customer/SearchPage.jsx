// src/pages/SearchPage.jsx
import React, { useEffect, useRef } from "react";

// 간단한 동적 로더(중복 로드 방지)
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

function SearchPage() {
  const mapRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const clientId = import.meta.env.VITE_NAVER_MAPS_CLIENT_ID;
        if (!clientId) {
          console.error("❌ VITE_NAVER_MAPS_CLIENT_ID 환경변수가 없습니다.");
          return;
        }

        const maps = await loadNaverMaps(clientId);
        if (!mounted || !mapRef.current) return;

        // 초기 중심(서울시청 근처)
        const center = new maps.LatLng(37.5665, 126.978);
        const map = new maps.Map(mapRef.current, {
          center,
          zoom: 13,
        });

        // 마커 하나
        const marker = new maps.Marker({
          position: center,
          map,
          title: "테스트 마커",
        });

        // 클릭 시 좌표 로그 + 마커 이동
        maps.Event.addListener(map, "click", (e) => {
          const lat = e.coord.lat();
          const lng = e.coord.lng();
          console.log("지도 클릭:", lat, lng);
          marker.setPosition(new maps.LatLng(lat, lng));
        });
      } catch (err) {
        console.error("네이버 지도 로드 실패:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>매장 탐색 페이지</h2>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "60vh",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        }}
      />
      <p style={{ marginTop: 8, color: "#666" }}>
        지도를 클릭하면 콘솔에 좌표가 찍히고 마커가 이동합니다.
      </p>
    </div>
  );
}

export default SearchPage;
