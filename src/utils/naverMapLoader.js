// utils/naverMapLoader.js

let naverMapsPromise = null;

function loadNaverMaps(clientId) {
  if (typeof window === "undefined") {
    // 서버사이드 렌더링 상황에서는 그냥 null 반환
    return Promise.resolve(null);
  }

  // 이미 로드되어 있으면 바로 반환
  if (window.naver?.maps) {
    return Promise.resolve(window.naver.maps);
  }

  if (!naverMapsPromise) {
    naverMapsPromise = new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
      s.defer = true;

      s.onload = () => resolve(window.naver?.maps ?? null); // 정상 로드됐을 때

      s.onerror = () => {
        // 오프라인 등으로 실패한 경우에도 에러 던지지 않고 null 반환
        console.warn("[naverMapLoader] 지도 스크립트 로드 실패");
        resolve(null);
      };

      document.head.appendChild(s);
    });
  }

  return naverMapsPromise;
}

export default loadNaverMaps;
