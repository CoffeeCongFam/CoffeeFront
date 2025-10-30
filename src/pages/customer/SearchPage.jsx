import React, { useEffect, useRef, useState, useCallback } from "react";
import cafeList from "../../data/customer/cafeList.js";
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import SearchCafeInput from "../../components/customer/search/SearchCafeInput";
import MarkerManager from "../../components/customer/search/MarkerManager.js";
import loadNaverMaps from "../../utils/naverMapLoader.js";

const Panel = styled(Paper)(({ theme }) => ({
  position: "absolute",
  left: "50%",
  bottom: 70,
  transform: "translate(-50%, 100%)", // 기본은 화면 아래로 숨기기
  // width: "min(90vw, 380px)", // 너비 조절
  width: "100%",
  maxHeight: "50vh",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.25s ease-out",
}));

export default function SearchPage() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapsRef = useRef(null);
  const hereMarkerRef = useRef(null);
  const mmRef = useRef(null);

  const [status, setStatus] = useState("loading");
  const [keyword, setKeyword] = useState("");
  const [cafes, setCafes] = useState([]);

  // 패널 열림 여부
  const [openCafeList, setOpenCafeList] = useState(false);

  useEffect(() => {
    setCafes(cafeList ?? []);
  }, []);

  // 지도 init
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

          hereMarkerRef.current = new maps.Marker({
            position: center,
            map,
            title: "현재 위치",
          });

          maps.Event.addListener(map, "click", (e) => {
            hereMarkerRef.current.setPosition(e.coord);
            if (typeof map.panTo === "function") map.panTo(e.coord);
            else map.setCenter(e.coord);
          });

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

  // 마커 리스트 업데이트
  useEffect(() => {
    if (status !== "ready") return;
    if (!mmRef.current) return;
    mmRef.current.setData(cafes ?? []);
  }, [status, cafes]);

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
        if (hereMarkerRef.current) {
          hereMarkerRef.current.setPosition(here);
        } else {
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

  // 리스트에서 선택
  const handleSelectCafe = (cafe) => {
    const map = mapRef.current;
    const maps = mapsRef.current;
    if (!map || !maps) return;
    if (!cafe.latitude || !cafe.longitude) return;

    const pos = new maps.LatLng(cafe.latitude, cafe.longitude);
    if (typeof map.panTo === "function") map.panTo(pos);
    else map.setCenter(pos);

    setOpenCafeList(false);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* 지도 */}
      <div
        ref={mapContainerRef}
        style={{ position: "absolute", inset: 0, overflow: "hidden" }}
      />

      {/* 상단 컨트롤 */}
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
        <Button
          style={{ backgroundColor: "black", color: "white" }}
          startIcon={<FormatListBulletedIcon />}
          onClick={() => setOpenCafeList((prev) => !prev)}
        >
          카페 리스트
        </Button>
      </div>

      {/* 작은 바텀 패널 (OUTLINE용) */}
      <Panel
        sx={{
          transform: openCafeList
            ? "translate(-50%, 0)" // 열렸을 때
            : "translate(-50%, 100%)", // 닫혔을 때
        }}
      >
        {/* 헤더 */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${grey[200]}`,
          }}
        >
          <Typography variant="subtitle2">{cafes.length}개 카페</Typography>
          <Button size="small" onClick={() => setOpenCafeList(false)}>
            닫기
          </Button>
        </Box>

        {/* 리스트 */}
        <Box sx={{ overflowY: "auto", width: "100%" }}>
          <List dense>
            {cafes.map((cafe) => (
              <React.Fragment key={cafe.storeId ?? cafe.id}>
                <ListItem
                  button={true}
                  onClick={() => handleSelectCafe(cafe)}
                  style={{ cursor: "pointer" }}
                >
                  <ListItemText
                    primary={cafe.storeName}
                    secondary={
                      cafe.roadAddress || cafe.address || "주소 정보 없음"
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Panel>
    </div>
  );
}
