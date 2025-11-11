import React, { useEffect, useState, useRef } from "react";
import SubscriptionItem from "../../../components/customer/home/SubscriptionItem";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LocalCafeCard from "../../../components/customer/home/LocalCafeCard";
import useAppShellMode from "../../../hooks/useAppShellMode";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Loading from "../../../components/common/Loading";
import TodayOrderItem from "../../../components/customer/order/TodayOrderItem";
import {
  fetchCustomerSubscriptions,
  fetchNearbyCafes,
  fetchTodayOrderList,
} from "../../../apis/customerApi";
import useUserStore from "../../../stores/useUserStore";
import { TokenService } from "../../../utils/api";
import LocalCafeImgList from "./LocalCafeImgList";
import getDistanceKm from "../../../utils/getDistanceKm";
import OrderStatusButton from "../../../components/customer/order/OrderStatusButton";
import { formatKoreanDateTime } from "../../../utils/dateUtil";
// import api from "../../../utils/api";

function CustomerHome() {
  const navigate = useNavigate();

  const { authUser } = useUserStore();

  const { isAppLike } = useAppShellMode();
  const [isLoading, setIsLoading] = useState(true);

  const [activeSubIndex, setActiveSubIndex] = useState(0); // 구독 캐러셀 현재 인덱스

  const [todayDate, setTodayDate] = useState(null);
  const [ongoingOrders, setOngoingOrders] = useState([]); // 진행 중인 주문 내역
  const [subscriptions, setSubscriptions] = useState([]);
  const [today, setToday] = useState(null);
  const [nearbyCafes, setNearbyCafes] = useState([]);
  const [locError, setLocError] = useState("");

  // ref
  const scrollRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    try {
      setTodayDate(formatKoreanDateTime(new Date()));
      loadToday(); // 오늘 날짜
      loadOngoingOrders(); // 진행 중인 주문 조회
      loadSubscriptions(); // 보유 구독권 조회

      // 위치 가져와서 근처 카페 요청
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            loadNearbyCafes(coords);
          },
          (err) => {
            console.log("위치 권한 거부", err);
            setLocError("위치 권한을 허용하면 근처 카페를 보여줄 수 있어요.");
          },
          { enableHighAccuracy: true }
        );
      } else {
        setLocError("이 브라우저에서는 위치 정보를 사용할 수 없어요.");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  function loadToday() {
    const todayDate = new Date();
    setToday(todayDate.toISOString().split("T")[0]);
  }
  const loadOngoingOrders = async () => {
    try {
      const list = await fetchTodayOrderList(); // 오늘 주문 불러오기 (혹은 전체 주문)
      const filtered = (list || []).filter(
        (o) => !["RECEIVED", "CANCELED", "COMPLETED"].includes(o.orderStatus)
        // REJECTED, REQUEST, INPROGRESS, COMPLETED 정도만 남김
      );
      setOngoingOrders(
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const data = await fetchCustomerSubscriptions();

      // 환불 안 된 구독권만 남기기
      const activeSubs =
        (data || []).filter((it) => it.refundedAt === "") || [];

      // 만료되지 않은 것만 남기기
      const notExpired = activeSubs.filter((it) => it.isExpired !== "EXPIRED");

      // remainingCount 기준 내림차순 정렬 (주문 잔 수 많은 것 먼저)
      notExpired.sort((a, b) => {
        const aRemain = a.remainingCount ?? 0;
        const bRemain = b.remainingCount ?? 0;
        return bRemain - aRemain;
      });

      setSubscriptions(notExpired);
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubScroll = () => {
    if (!isAppLike || !scrollRef.current) return;

    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    setActiveSubIndex(index);
  };

  const handleDotClick = (index) => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;

    scrollRef.current.scrollTo({
      left: clientWidth * index,
      behavior: "smooth",
    });
    setActiveSubIndex(index);
  };

  //
  const loadNearbyCafes = async (coords) => {
    try {
      const data = await fetchNearbyCafes(
        coords.longitude, // 경도 (xpoint)
        coords.latitude, // 위도 (ypoint)
        500
      );

      // 각 카페에 distanceKm 필드 추가 (현재 위치 기준 거리)
      const enriched = (data || []).map((store) => {
        // 백엔드에서 내려주는 좌표 이름: xpoint(경도), ypoint(위도) 라고 가정
        const storeLat = store.ypoint;
        const storeLng = store.xpoint;

        let distanceKm = null;
        if (typeof storeLat === "number" && typeof storeLng === "number") {
          distanceKm = getDistanceKm(
            coords.latitude,
            coords.longitude,
            storeLat,
            storeLng
          );
        }

        return {
          ...store,
          distanceKm,
        };
      });

      // 거리순 정렬까지 하고 싶으면
      enriched.sort((a, b) => {
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });

      setNearbyCafes(enriched);
    } catch (e) {
      console.error(e);
      // setLocError("주변 카페를 불러오는 데 실패했어요.");
    }
  };

  function handleOrderClick(sub) {
    navigate("/me/order/new", {
      state: { subscription: sub },
    });
  }

  const scrollBy = (offset) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: offset,
      behavior: "smooth",
    });
  };

  return isLoading ? (
    <Box
      sx={{
        px: isAppLike ? 2 : 12,
        py: isAppLike ? 2 : 5,
        minHeight: "100%",
      }}
    >
      <Typography
        sx={{
          fontSize: isAppLike ? "23px" : "30px",
          fontWeight: "bold",
          mb: 2,
        }}
      >
        안녕하세요 {authUser?.name ?? "고객"} 님 👋
      </Typography>
      <Loading />
    </Box>
  ) : (
    <Box
      sx={{
        px: isAppLike ? 3 : 12,
        pt: isAppLike ? 5 : 5,
        pb: isAppLike ? 12 : 8,
        minHeight: "100%",
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isAppLike ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isAppLike ? "flex-start" : "center",
          gap: isAppLike ? 2 : 0,
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            mb: "2%",
          }}
        >
          <Typography
            sx={{
              fontSize: isAppLike ? "1.2rem" : "30px",
              fontWeight: "bold",
              color: "#3B3026",
            }}
          >
            안녕하세요 {authUser?.name} 님 👋, {isAppLike && <br />} 오늘도 한
            잔의 여유를 즐겨보세요.
          </Typography>
          <Typography
            sx={{ color: "#3B3026", fontSize: isAppLike ? "0.8rem" : "1rem" }}
          >
            오늘은 어디에서 커피 한 잔 할까요? ☕️
          </Typography>
        </Box>
      </Box>

      {/* 오늘의 주문 내역 있으면 */}
      {ongoingOrders.length > 0 && (
        <Box
          sx={{
            width: "100%",
            mb: 6,
            p: 2,
            borderRadius: 2,
            bgcolor: "#fff7e6",
            border: "1px solid #ffe0b2",
            display: "flex",
            flexDirection: "column",
            gap: "0.7rem",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1 }}>
            {todayDate} {isAppLike && <br />} 진행 중인 주문{" "}
            {ongoingOrders.length}건
          </Typography>

          {isAppLike ? (
            // 모바일: 가로 캐러셀
            <Box
              sx={{
                display: "flex",
                overflowX: "auto",
                gap: 2,
                py: 1,
                scrollSnapType: "x mandatory",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              {ongoingOrders.map((order, idx) => (
                <Box
                  key={order.orderId ?? idx}
                  sx={{
                    flex: "0 0 100%", // 한 화면에 한 장씩 꽉 차게
                    scrollSnapAlign: "start",
                  }}
                >
                  <TodayOrderItem order={order} isAppLike={isAppLike} />
                </Box>
              ))}
            </Box>
          ) : (
            // 💻 데스크탑: 기존 세로 리스트
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {ongoingOrders.map((order, idx) => (
                <TodayOrderItem
                  key={order.orderId ?? idx}
                  order={order}
                  isAppLike={isAppLike}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* {ongoingOrders.length > 0 && (
        <Box
          sx={{
            width: "100%",
            mb: 4,
            p: 2,
            borderRadius: 2,
            bgcolor: "#fff7e6",
            border: "1px solid #ffe0b2",
            display: "flex",
            flexDirection: "column",
            gap: "0.7rem",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1 }}>
            {todayDate} {isAppLike && <br />} 진행 중인 주문{" "}
            {ongoingOrders.length}건
          </Typography>

          {ongoingOrders.map((order, idx) => (
            <TodayOrderItem key={idx} order={order} isAppLike={isAppLike} />
          ))}
        </Box>
      )} */}

      {/* 보유 구독권 목록 */}
      {subscriptions.length <= 0 && (
        <Box
          sx={{
            backgroundColor: "#fff9f4",
            border: "1px solid #ffe0b2",
            px: "1rem",
            py: "1.5rem",
            borderRadius: "8px",
            mb: 5,
            display: "flex",
            gap: isAppLike ? "0.8rem" : "2rem",
            flexDirection: isAppLike ? "column" : "row",
            alignItems: "center",
          }}
          ref={subscriptionRef}
          data-step="2" // 툴팁 순서
          data-intro="이곳에서 사용 가능한 **구독권 잔여 횟수**를 확인하고 바로 주문할 수 있어요." // 툴팁 내용
          data-position="bottom" // 툴팁 위치
        >
          <Typography sx={{ color: "#334336" }}>
            보유 구독권이 없습니다. 구독권을 구매해주세요!
          </Typography>
          <Button
            endIcon={<OpenInNewIcon />}
            onClick={() => navigate("/me/search")}
            sx={{
              color: "#334336",
              borderColor: "#334336",
              "&:hover": {
                borderColor: "#334336",
                bgcolor: "rgba(51, 67, 54, 0.05)",
              },
            }}
            variant="outlined"
          >
            구독권 구매하러 가기
          </Button>
        </Box>
      )}

      {/* 구독권 캐러셀 */}
      {subscriptions.length > 0 && (
        <Box
          sx={{
            position: "relative",
            mb: 10,
          }}
        >
          {/* 오른쪽 위 네비 버튼 */}
          {!isAppLike && (
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: 0,
                zIndex: 1,
                display: "flex",
                gap: 0.5,
              }}
            >
              <IconButton onClick={() => scrollBy(-260)} size="small">
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => scrollBy(260)} size="small">
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          {isAppLike && subscriptions.length > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                mt: 1,
              }}
            >
              {subscriptions.map((_, idx) => (
                <Box
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    cursor: "pointer",
                    bgcolor:
                      idx === activeSubIndex ? "#334336" : "rgba(0, 0, 0, 0.2)",
                    transform:
                      idx === activeSubIndex ? "scale(1.2)" : "scale(1)",
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </Box>
          )}

          {/* 실제 캐러셀 영역 */}
          <Box
            ref={scrollRef}
            onScroll={handleSubScroll}
            sx={{
              display: "flex",
              gap: isAppLike ? 0 : 2,
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              py: 2,
              pr: isAppLike ? 0 : 8,
              "&::-webkit-scrollbar": {
                height: isAppLike ? 0 : 6,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#ccc",
                borderRadius: 8,
              },
            }}
          >
            {subscriptions.map((item, index) => (
              <Box
                ref={index === 0 ? subscriptionRef : null}
                key={item.purchaseId}
                sx={{
                  scrollSnapAlign: "start",
                  flex: isAppLike ? "0 0 100%" : "0 0 auto",
                  px: isAppLike ? 1 : 0,
                }}
              >
                <SubscriptionItem
                  today={today}
                  item={item}
                  handleOrderClick={handleOrderClick}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* 내 근처 카페 */}
      <Box
        sx={{}}
        data-step="4"
        data-intro="GPS 정보를 기반으로 **500m 내에 있는 근처 카페**들을 보여드려요. 새로운 단골 매장을 찾아보세요!"
        data-position="top"
      >
        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontSize: isAppLike ? "1rem" : "30px",
              fontWeight: "bold",
              mb: 0.5,
              color: "#3B3026",
            }}
          >
            내 근처 동네 카페
          </Typography>
          <Typography sx={{ fontSize: isAppLike ? "0.8rem" : "1rem" }}>
            지금 내 위치 기준으로 가장 가까운 카페를 찾아보세요. 🔎
          </Typography>
        </Box>

        {nearbyCafes && nearbyCafes.length > 0 && (
          <LocalCafeImgList list={nearbyCafes} />
        )}

        {locError && (
          <Typography color="error" sx={{ mb: 1 }}>
            {locError}
          </Typography>
        )}

        {!locError && nearbyCafes.length === 0 && (
          <Box sx={{ px: 1, py: 1.5 }}>
            <Typography sx={{ color: "#3B3026" }}>
              2km 안에 등록된 카페가 아직 없어요 🔎
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default CustomerHome;
