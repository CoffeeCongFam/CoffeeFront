// naver Maps API 로더

let naverMapsPromise = null;

function loadNaverMaps(clientId) {
  if (typeof window === "undefined") return Promise.reject("SSR");
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

export default loadNaverMaps;


