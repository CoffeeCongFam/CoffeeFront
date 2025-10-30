import React, { useEffect, useRef, useState, useCallback } from "react";
import cafeList from "../../data/customer/cafeList.js";
import { IconButton } from "@mui/material";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import SearchCafeInput from "../../components/customer/search/SearchCafeInput";
import MarkerManager from "../../components/customer/search/MarkerManager.js";
import loadNaverMaps from "../../utils/naverMapLoader.js";

export default function SearchPage() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null); // naver.maps.Map
  const mapsRef = useRef(null); // naver.maps namespace
  const hereMarkerRef = useRef(null); // current location marker
  const mmRef = useRef(null); // MarkerManager

  const [status, setStatus] = useState("loading");
  const [keyword, setKeyword] = useState("");
  const [cafes, setCafes] = useState([]);

  // 초기 데이터 로드 (필터/검색 전 기본 리스트)
  useEffect(() => {
    setCafes(cafeList ?? []);
  }, []);

  // 지도 1회 초기화
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const clientId = import.meta.env.VITE_NAVER_MAPS_CLIENT_ID;
        const maps = await loadNaverMaps(clientId);
        if (!mounted || !mapContainerRef.current) return;

        mapsRef.current = maps;
        const defaultCenter = new maps.LatLng(37.5665, 126.978);

        const init = (center) => {
          const map = new maps.Map(mapContainerRef.current, {
            center,
            zoom: 15,
          });
          mapRef.current = map;

          // current location marker
          hereMarkerRef.current = new maps.Marker({
            position: center,
            map,
            title: "현재 위치",
          });

          // 클릭 시 마커 이동
          maps.Event.addListener(map, "click", (e) => {
            hereMarkerRef.current.setPosition(e.coord);
            if (typeof map.panTo === "function") map.panTo(e.coord);
            else map.setCenter(e.coord);
          });

          // marker manager
          mmRef.current = new MarkerManager(map, maps);

          setStatus("ready");
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            ({ coords }) =>
              init(new maps.LatLng(coords.latitude, coords.longitude)),
            () => init(defaultCenter),
            { enableHighAccuracy: true, timeout: 5000 }
          );
        } else {
          init(defaultCenter);
        }
      } catch (e) {
        console.error(e);
        setStatus("error");
      }
    })();

    return () => {
      mounted = false;
      mmRef.current?.destroy();
      mmRef.current = null;
      hereMarkerRef.current = null;
      mapRef.current = null;
      mapsRef.current = null;
    };
  }, []);

  // 카페 데이터 변경 시 마커만 업데이트 (diff)
  useEffect(() => {
    if (status !== "ready") return;
    if (!mmRef.current) return;
    mmRef.current.setData(cafes ?? []);
  }, [status, cafes]);

  // 현재 위치로 이동
  const setCurrentLocation = useCallback(() => {
    const map = mapRef.current;
    const maps = mapsRef.current;
    if (!map || !maps) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const here = new maps.LatLng(coords.latitude, coords.longitude);
        if (typeof map.panTo === "function") map.panTo(here);
        else map.setCenter(here);
        if (hereMarkerRef.current) hereMarkerRef.current.setPosition(here);
        else {
          hereMarkerRef.current = new maps.Marker({
            position: here,
            map,
            title: "현재 위치",
          });
        }
      },
      (err) => console.warn("현재 위치 실패:", err),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  // # TODO 키워드 필터링
  // useEffect(() => {
  //   if (!keyword) {
  //     setCafes(cafeList ?? []);
  //     return;
  //   }
  //   const lower = keyword.trim().toLowerCase();
  //   const filtered = (cafeList ?? []).filter((c) => {
  //     const name = (c.storeName ?? "").toLowerCase();
  //     const addr = (c.roadAddress ?? "").toLowerCase();
  //     return name.includes(lower) || addr.includes(lower);
  //   });
  //   setCafes(filtered);
  // }, [keyword]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div
        ref={mapContainerRef}
        style={{ position: "absolute", inset: 0, overflow: "hidden" }}
      />

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
    </div>
  );
}
