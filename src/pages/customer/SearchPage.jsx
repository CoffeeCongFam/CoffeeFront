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
  ListItemAvatar,
  Avatar,
  Chip,
  Select,
  MenuItem,
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
  bottom: 0,
  transform: "translate(-50%, 100%)", // 기본: 숨김
  width: "100%",
  maxHeight: "80vh",
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  boxShadow: "0 -4px 20px rgba(0,0,0,0.2)",
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease-in-out",
  overflow: "hidden",
  zIndex: 20,
  padding: "10px"
}));


// 매장 상태 
const STATUS_MAP = {
  OPEN: {
    label: "영업중",
    sx: {
      backgroundColor: "#E6F4EA", // 연한 민트/그린톤
      color: "#137333", // 진한 초록
      fontWeight: 600,
    },
  },
  CLOSED: {
    label: "영업종료",
    sx: {
      backgroundColor: "#F1F3F4", // 밝은 회색
      color: "#5F6368", // 중간톤 회색 텍스트
      fontWeight: 500,
    },
  },
  HOLIDAY: {
    label: "휴무일",
    sx: {
      backgroundColor: "#FFF8E1", // 연한 크림 노랑
      color: "#B28704", // 따뜻한 머스타드색 텍스트
      fontWeight: 600,
    },
  },
};

export default function SearchPage() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapsRef = useRef(null);
  const hereMarkerRef = useRef(null);
  const mmRef = useRef(null);

  const [status, setStatus] = useState("loading");
  const [keyword, setKeyword] = useState("");
  const [cafes, setCafes] = useState([]);

  const [sortOption, setSortOption] = useState("distance"); // distance | latest | subscribers | reviews


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
    const mm = mmRef.current;
    if (!map || !maps) return;

    // MarkerManager가 있으면 그쪽에 먼저 맡긴다
    const id = cafe.id ?? cafe.storeId;
    if (mm && id != null) {
      mm.focusCafe(id, cafe);   // ✅ 우리가 방금 MarkerManager에 만든 메서드
    } else {
      // 혹시 모를 fallback
      if (!cafe.xPoint || !cafe.yPoint) return;
      const pos = new maps.LatLng(cafe.xPoint, cafe.yPoint);
      if (typeof map.panTo === "function") map.panTo(pos);
      else map.setCenter(pos);
    }

    // 패널 닫기
    setOpenCafeList(false);
  };



  // 매장 상태 칩 
  function renderStoreStatus(status) {
    const config = STATUS_MAP[status] || {
      label: "정보없음",
      sx: { backgroundColor: "#ECEFF1", color: "#5F6368" },
    };

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          textAlign: "center",
          fontSize: "0.75rem",
          width: "fit-content",
          ...config.sx, // 상태별 색상 적용
        }}
      />
    );
  }

  // 매장 리스트 정렬
  const sortedCafes = [...cafes].sort((a, b) => {
    switch (sortOption) {
      case "latest":
        return new Date(b.createdAt) - new Date(a.createdAt); // 최신순
      case "subscribers":
        return (b.subscriberCount || 0) - (a.subscriberCount || 0); // 구독자수순
      case "reviews":
        return (b.reviewCount || 0) - (a.reviewCount || 0); // 리뷰순
      case "distance":
      default:
        return (a.distance || 0) - (b.distance || 0); // 거리순 (가까운 순)
    }
  });


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

      {/* 카페 리스트용 패널 */}
      <Panel
        sx={{
          transform: openCafeList
            ? "translate(-50%, 0)"     // 위로 올라오기 (열림)
            : "translate(-50%, 100%)", // 아래로 내려가기 (닫힘)
        }}
      >
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

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Select
              size="small"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              sx={{ fontSize: "0.875rem", height: 32 }}
            >
              <MenuItem value="distance">거리순</MenuItem>
              <MenuItem value="latest">최신순</MenuItem>
              <MenuItem value="subscribers">구독자순</MenuItem>
              <MenuItem value="reviews">리뷰순</MenuItem>
            </Select>
            <Button size="small" onClick={() => setOpenCafeList(false)}>
              닫기
            </Button>
          </Box>
        </Box>

        <Box sx={{ overflowY: "auto", flexGrow: 1 }}>
          {/* dense */}
          <List >
            <Box sx={{ overflowY: "auto", flexGrow: 1, gap: 2, display: "flex", flexDirection: "column",  }}>
              {/* 정렬 기준 */}
              {sortedCafes.map((cafe) => (
                <Box
                  key={cafe.storeId}
                  onClick={() => handleSelectCafe(cafe)}
                  sx={{
                    bgcolor: "#f8f9fa",
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    p: 2,
                    mb: 2,
                    display: "flex",
                    gap: 2,
                    alignItems: "stretch",
                    cursor:"pointer"
                  }}
                >
                  {/* 썸네일 */}
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: grey[100],
                      borderRadius: 2,
                      overflow: "hidden",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Avatar
                      src={cafe.storeImage}
                      alt={cafe.storeName}
                      sx={{ width: "100%", height: "100%", borderRadius: 2 }}
                      variant="rounded"
                    />
                  </Box>

                  {/* 가운데 정보 영역 */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* 위줄: 상태칩 + 거리 */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                      {renderStoreStatus(cafe.storeStatus)}
                      <Typography variant="caption" color="text.secondary">
                        {cafe.distance ?? "454m"}
                      </Typography>
                    </Box>

                    {/* 카페 이름 / 주소 */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}>
                      {cafe.storeName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {cafe.roadAddress || cafe.address || "주소 정보 없음"}
                    </Typography>

                    {/* 구독자/리뷰 줄 */}
                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        👥 {cafe.subscriberCount ?? 0}명 구독
                      </Typography>
                      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        ⭐ {cafe.reviewCount ?? 0}개 리뷰
                      </Typography>
                    </Box>
                  </Box>

                  {/* 오른쪽 버튼 영역 */}
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {cafe.isSubscribed ? (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<span style={{ fontSize: 14 }}>✓</span>}
                        sx={{
                          borderRadius: 999,
                          borderColor: grey[400],
                          color: grey[800],
                          px: 2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        구독 중인 카페
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          borderRadius: 999,
                          bgcolor: "black",
                          "&:hover": { bgcolor: "#222" },
                          whiteSpace: "nowrap",
                        }}
                      >
                        + 구독하기
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
            {/* {cafes.map((cafe) => (
              <React.Fragment key={cafe.id}>
                <ListItem button={true} onClick={() => handleSelectCafe(cafe)} style={{cursor: "pointer"}}>
                  <ListItemAvatar>
                    <Avatar alt={cafe.id} src={cafe.storeImage} />
                  </ListItemAvatar>
                    <ListItemText
                      primary={cafe.storeName}
                      secondary={cafe.roadAddress || cafe.address || "주소 정보 없음"}
                      primaryTypographyProps={{
                        fontWeight: "bold",     
                        fontSize: "1rem",       
                      }}
                      secondaryTypographyProps={{
                        color: "text.secondary", 
                        fontSize: "0.875rem",
                      }}
                    />
                  {renderStoreStatus(cafe.storeStatus)}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))} */}
          </List>
        </Box>
      </Panel>

    </div>
  );
}
