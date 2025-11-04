// SearchPage.jsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import cafeList from "../../../data/customer/cafeList.js";
import {
  Button,
  IconButton,
  List,
  Box,
  Typography,
  Paper,
  Avatar,
  Select,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import SearchCafeInput from "../../../components/customer/search/SearchCafeInput.jsx";
import MarkerManager from "../../../utils/MarkerManager.js";
import loadNaverMaps from "../../../utils/naverMapLoader.js";
import useAppShellMode from "../../../hooks/useAppShellMode.js";
import { useNavigate } from "react-router-dom";
import { fetchAllCafes } from "../../../apis/customerApi.js";
import CafeStatusChip from "../../../components/customer/cafe/CafeStatusChip.jsx";

const Panel = styled(Paper)(({ theme }) => ({
  position: "absolute",
  left: "50%",
  bottom: 0,
  // 100% 아래로 내려서 '숨김' 상태를 명확히 함
  transform: "translate(-50%, 100%)",
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
  zIndex: 1300,
  padding: "10px",
}));

// 패널 렌더링 부분은 이미 잘 되어 있습니다.
// transform: openCafeList ? "translate(-50%, 0)" : "translate(-50%, 100%)",

export default function SearchPage() {
  const { isAppLike } = useAppShellMode();
  const navigate = useNavigate();

  // refs
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapsRef = useRef(null);
  const hereMarkerRef = useRef(null);
  const mmRef = useRef(null);
  const initedRef = useRef(false); // 중복 init 방지

  // state
  const [mapsReady, setMapsReady] = useState(false);
  const [isMapError, setIsMapError] = useState(false);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
  // const [isLoading, setIsLoading] = useState(true);
  const [currentLoc, setCurrentLoc] = useState({ xPoint: null, yPoint: null }); // (lng, lat)

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [cafes, setCafes] = useState([]);
  const [sortOption, setSortOption] = useState("distance");
  const [openCafeList, setOpenCafeList] = useState(false);
  const [showSearchResult, setShowSearchResult] = useState(false);

  // --- utils ---
  function getCurrentPositionAsync(options) {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  // 1) 네이버 지도 스크립트만 먼저 로딩
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const clientId = import.meta.env.VITE_NAVER_MAPS_CLIENT_ID;
        const maps = await loadNaverMaps(clientId);
        if (!mounted) return;
        mapsRef.current = maps;
        setMapsReady(true);
      } catch (e) {
        console.error(e);
        setIsMapError(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 2) 현재 위치 먼저 확보 + 주변 카페 조회(좌표 정규화 포함)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const pos = await getCurrentPositionAsync({
          enableHighAccuracy: true,
          timeout: 5000,
        });
        const { latitude: y, longitude: x } = pos.coords;
        const loc = { xPoint: x, yPoint: y }; // (lng, lat)
        if (!mounted) return;
        setCurrentLoc(loc);

        const res = await fetchAllCafes();
        console.log("fetchAllCafes>> ", res);
        const normalized = (Array.isArray(res) ? res : []).map((c, i) => ({
          ...c,
          // 서버 응답 키가 xpoint/ypoint일 수도 있으므로 정규화
          xPoint: Number(c.xPoint ?? c.xpoint), // lng
          yPoint: Number(c.yPoint ?? c.ypoint), // lat
          _mmId: c.storeId ?? c.id ?? `idx-${i}`, // MarkerManager용 고유키
        }));
        setCafes(normalized);
        console.log(normalized);
      } catch (err) {
        console.error("현재 위치 또는 카페 API 실패:", err);
        // 실패 시 샘플 데이터 사용
        const normalized = cafeList.map((c, i) => ({
          ...c,
          xPoint: Number(c.xPoint ?? c.xpoint),
          yPoint: Number(c.yPoint ?? c.ypoint),
          _mmId: c.storeId ?? c.id ?? `idx-${i}`,
        }));
        setCafes(normalized);
      }
      // finally {
      //   setIsLoading(false);
      // }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 3) currentLoc + maps가 준비되면 "한 번만" 지도 init
  useEffect(() => {
    if (initedRef.current) return;
    if (!mapsReady || !mapContainerRef.current) return;
    if (!currentLoc.xPoint || !currentLoc.yPoint) return;

    const maps = mapsRef.current;
    const center = new maps.LatLng(currentLoc.yPoint, currentLoc.xPoint); // (lat, lng) 주의!

    // 지도 생성
    const map = new maps.Map(mapContainerRef.current, {
      center,
      zoom: 17,
      minZoom: 8,
      maxZoom: 20,
      scaleControl: true,
      mapDataControl: false,
      logoControl: true,
      zoomControl: true,
      zoomControlOptions: { position: maps.Position.RIGHT_CENTER },
    });
    mapRef.current = map;

    // 현재 위치 마커
    hereMarkerRef.current = new maps.Marker({
      position: center,
      map,
      title: "현재 위치",
    });

    // 지도 클릭 시 현재 위치 마커 이동(선택)
    maps.Event.addListener(map, "click", (e) => {
      hereMarkerRef.current?.setPosition(e.coord);
      if (typeof map.panTo === "function") map.panTo(e.coord);
      else map.setCenter(e.coord);
    });

    // 마커 매니저 준비
    mmRef.current = new MarkerManager(map, maps);

    setStatus("ready");
    initedRef.current = true;

    // 언마운트 시 자원 정리
    return () => {
      mmRef.current?.destroy();
      mmRef.current = null;
      hereMarkerRef.current = null;
      mapRef.current = null;
    };
  }, [currentLoc, mapsReady]);

  // 4) 카페 목록 변경 시 마커 동기화
  useEffect(() => {
    if (status !== "ready" || !mmRef.current) return;
    mmRef.current.setData(cafes ?? []);
  }, [status, cafes]);

  // 현재 위치로 이동 버튼
  const setCurrentLocation = useCallback(() => {
    console.log("현재 위치로 이동!");
    if (openCafeList) {
      setOpenCafeList(false);
    }
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

  // 검색 디바운스
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 200);
    return () => clearTimeout(t);
  }, [keyword]);

  // 리스트에서 선택 시 해당 마커에 포커스
  const handleSelectCafe = (cafe) => {
    const map = mapRef.current;
    const maps = mapsRef.current;
    const mm = mmRef.current;
    if (!map || !maps) return;

    const id = cafe._mmId ?? cafe.storeId ?? cafe.id;
    if (mm && id != null) {
      mm.focusCafe(id, cafe);
    } else {
      if (!cafe.yPoint || !cafe.xPoint) return;
      const pos = new maps.LatLng(cafe.yPoint, cafe.xPoint);
      if (typeof map.panTo === "function") map.panTo(pos);
      else map.setCenter(pos);
    }
    setShowSearchResult(false);
    setOpenCafeList(false);
  };

  // 검색 필터링
  const filteredCafes = useMemo(() => {
    if (!debouncedKeyword) return [];
    const k = debouncedKeyword.toLowerCase();
    return cafes
      .filter(
        (c) =>
          (c.storeName && c.storeName.toLowerCase().includes(k)) ||
          (c.roadAddress && c.roadAddress.toLowerCase().includes(k)) ||
          (c.address && c.address.toLowerCase().includes(k))
      )
      .slice(0, 6);
  }, [debouncedKeyword, cafes]);

  // 리스트 정렬
  const sortedCafes = useMemo(() => {
    const arr = [...cafes];
    switch (sortOption) {
      case "latest":
        return arr.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "subscribers":
        return arr.sort(
          (a, b) => (b.subscriberCount || 0) - (a.subscriberCount || 0)
        );
      case "reviews":
        return arr.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      case "distance":
      default:
        return arr.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
  }, [cafes, sortOption]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {isMapError ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            bgcolor: "background.default",
            zIndex: 1400,
            p: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h6">지도를 불러올 수 없어요</Typography>
          <Typography variant="body2" color="text.secondary">
            오프라인이거나 네이버 지도 스크립트를 불러오지 못했습니다.
            <br />
            온라인으로 다시 접속하거나 새로고침 해주세요.
          </Typography>
        </Box>
      ) : (
        <div
          ref={mapContainerRef}
          style={{ position: "absolute", inset: 0, overflow: "hidden" }}
        />
      )}

      {/* 상단 컨트롤 + 검색 드롭다운 */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          zIndex: 1300,
          display: "flex",
          gap: 8,
          alignItems: "center",
          // flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        {/* 검색창 */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1400,
            flex: { xs: "1 1 100%", sm: "0 0 auto" },
            maxWidth: { xs: "100%", sm: 500 },
          }}
        >
          <SearchCafeInput
            keyword={keyword}
            setKeyword={(v) => {
              setKeyword(v);
              setShowSearchResult(!!v);
            }}
          />
          {showSearchResult && filteredCafes.length > 0 && (
            <Paper
              elevation={3}
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                mt: 1,
                width: "120%",
                maxHeight: 280,
                overflowY: "auto",
                borderRadius: 2,
                p: 1,
              }}
            >
              {filteredCafes.map((cafe) => (
                <Box
                  key={cafe._mmId ?? cafe.storeId}
                  onClick={() => handleSelectCafe(cafe)}
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    p: 1,
                    borderRadius: 1.5,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: grey[100] },
                  }}
                >
                  <Avatar
                    src={cafe.storeImage}
                    alt={cafe.storeName}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {cafe.storeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {cafe.roadAddress || cafe.address || "주소 정보 없음"}
                    </Typography>
                  </Box>
                  <CafeStatusChip status={cafe.storeStatus} />
                </Box>
              ))}
            </Paper>
          )}
        </Box>

        {/* 현재 위치 */}
        <IconButton
          onClick={setCurrentLocation}
          aria-label="current-location"
          sx={{
            backgroundColor: "white",
            color: "gray",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            "&:hover": {
              backgroundColor: "#f5f5f5",
              boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
            },
          }}
        >
          <LocationSearchingIcon />
        </IconButton>

        {/* 리스트 토글 */}
        {isAppLike ? (
          <IconButton
            onClick={() => setOpenCafeList((prev) => !prev)}
            aria-label="카페 리스트"
            sx={{
              backgroundColor: "black",
              color: "white",
              "&:hover": { backgroundColor: "#333" },
            }}
          >
            <FormatListBulletedIcon />
          </IconButton>
        ) : (
          <Button
            startIcon={<FormatListBulletedIcon />}
            onClick={() => setOpenCafeList((prev) => !prev)}
            sx={{
              backgroundColor: "black",
              color: "white",
              cursor: "pointer",
              "&:hover": { backgroundColor: "#333" },
            }}
          >
            카페 리스트
          </Button>
        )}
      </Box>

      {/* 하단 리스트 패널 */}
      <Panel
        sx={{
          // 마운트 시 트랜지션 방지: openCafeList가 false일 때는 transition을 0으로 설정
          transition: openCafeList
            ? "transform 0.3s ease-in-out"
            : "transform 0s",
          transform: openCafeList
            ? "translate(-50%, 0)"
            : "translate(-50%, 100%)",
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

        <Box sx={{ overflowY: "auto", flexGrow: 1, pb: "25%" }}>
          <List>
            <Box
              sx={{
                overflowY: "auto",
                flexGrow: 1,
                gap: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {sortedCafes.map((cafe) => (
                <Box
                  key={cafe._mmId ?? cafe.storeId}
                  onClick={() => handleSelectCafe(cafe)}
                  sx={{
                    bgcolor: "#f8f9fa",
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    p: isAppLike ? 2 : 4,
                    mb: 2,
                    display: "flex",
                    gap: 2,
                    alignItems: "stretch",
                    cursor: "pointer",
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  {/* 썸네일 */}
                  <Box
                    sx={{
                      width: { xs: "100%", sm: "10%" },
                      height: { xs: 140, sm: 100 },
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

                  {/* 정보 */}
                  <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 0.5,
                        gap: 1,
                      }}
                    >
                      {/* 오타(stauts) → status 로 수정 */}
                      <CafeStatusChip status={cafe.storeStatus} />
                    </Box>

                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}
                    >
                      {cafe.storeName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap={false}
                    >
                      {cafe.roadAddress || cafe.address || "주소 정보 없음"}
                    </Typography>

                    <Box
                      sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ display: "flex", gap: 0.5 }}
                      >
                        👥 {cafe.subscriberCount ?? 0}명 구독
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ display: "flex", gap: 0.5 }}
                      >
                        ⭐ {cafe.reviewCount ?? 0}개 리뷰
                      </Typography>
                    </Box>
                  </Box>

                  {/* 우측 버튼 */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      mt: { xs: 1.5, sm: 0 },
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    {!isAppLike && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        {cafe.distance ?? "454m"}
                      </Typography>
                    )}

                    {cafe.isSubscribed ? (
                      <Button
                        variant="outlined"
                        size={isAppLike ? "small" : "medium"}
                        startIcon={<span style={{ fontSize: 14 }}>✓</span>}
                        sx={{
                          borderRadius: 999,
                          borderColor: grey[400],
                          color: grey[800],
                          px: 2,
                          whiteSpace: "nowrap",
                          width: { xs: "100%", sm: 150 },
                        }}
                      >
                        구독 중인 카페
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size={isAppLike ? "small" : "medium"}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/me/store/${cafe.storeId}`);
                        }}
                        sx={{
                          borderRadius: 999,
                          "&:hover": { bgcolor: "#222", color: "#fff" },
                          whiteSpace: "nowrap",
                          width: { xs: "100%", sm: 150 },
                        }}
                      >
                        자세히 보기
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </List>
        </Box>
      </Panel>
    </div>
  );
}
