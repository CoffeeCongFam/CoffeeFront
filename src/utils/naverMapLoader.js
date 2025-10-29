// utils/naverMapLoader.js
let naverMapsPromise;

export function loadNaverMaps(clientId) {
  if (window.naver?.maps) return Promise.resolve(window.naver.maps);
  if (!naverMapsPromise) {
    naverMapsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
      script.defer = true;
      script.onload = () => resolve(window.naver.maps);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return naverMapsPromise;
}
