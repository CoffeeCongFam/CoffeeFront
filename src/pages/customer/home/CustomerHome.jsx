import React, { useEffect, useState, useRef } from 'react';
import SubscriptionItem from '../../../components/customer/home/SubscriptionItem';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LocalCafeCard from '../../../components/customer/home/LocalCafeCard';
import useAppShellMode from '../../../hooks/useAppShellMode';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SubscriptionCard from '../../../components/customer/cafe/SubscriptionCard';

import {
  fetchCustomerSubscriptions,
  fetchNearbyCafes,
} from '../../../apis/customerApi';
import useUserStore from '../../../stores/useUserStore';
import api, { TokenService } from '../../../utils/api';
import LocalCafeImgList from './LocalCafeImgList';
import getDistanceKm from '../../../utils/getDistanceKm';
import { SubscriptionDetailCard } from '../Subscription';
// import api from "../../../utils/api";

function CustomerHome() {
  const navigate = useNavigate();

  const { authUser, setUser } = useUserStore();

  const { isAppLike } = useAppShellMode();
  // const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [today, setToday] = useState(null);
  const [nearbyCafes, setNearbyCafes] = useState([]);
  const [locError, setLocError] = useState('');

  const scrollRef = useRef(null);

  useEffect(() => {
    loadToday(); // 오늘 날짜
    loadSubscriptions(); // 보유 구독권 조회

    // 위치 가져와서 근처 카페 요청
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          console.log('근처 카페 요청');
          loadNearbyCafes(coords);
        },
        (err) => {
          console.log('위치 권한 거부', err);
          setLocError('위치 권한을 허용하면 근처 카페를 보여줄 수 있어요.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocError('이 브라우저에서는 위치 정보를 사용할 수 없어요.');
    }
  }, []);

  function loadToday() {
    const todayDate = new Date();
    setToday(todayDate.toISOString().split('T')[0]);
  }

  const loadSubscriptions = async () => {
    try {
      const data = await fetchCustomerSubscriptions();
      setSubscriptions(data || []);
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  };

  //
  const loadNearbyCafes = async (coords) => {
    try {
      console.log('LOAD NEAR BY CAFES');
      const data = await fetchNearbyCafes(
        coords.longitude, // 경도 (xpoint)
        coords.latitude, // 위도 (ypoint)
        500
      );
      console.log('LOCAL CAFES>> ', data);

      // 각 카페에 distanceKm 필드 추가 (현재 위치 기준 거리)
      const enriched = (data || []).map((store) => {
        // 백엔드에서 내려주는 좌표 이름: xpoint(경도), ypoint(위도) 라고 가정
        const storeLat = store.ypoint;
        const storeLng = store.xpoint;

        let distanceKm = null;
        if (typeof storeLat === 'number' && typeof storeLng === 'number') {
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
    navigate('/me/order/new', {
      state: { subscription: sub },
    });
  }

  const scrollBy = (offset) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: offset,
      behavior: 'smooth',
    });
  };

  // const localScrollBy = (offset) => {
  //   if (!localScrollRef.current) return;
  //   localScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  // };

  return (
    <Box
      sx={{
        px: isAppLike ? 2 : 12,
        py: isAppLike ? 2 : 5,
        pb: isAppLike ? 9 : 8,
        minHeight: '100%',
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isAppLike ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isAppLike ? 'flex-start' : 'center',
          gap: isAppLike ? 2 : 0,
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            mb: '2%',
          }}
        >
          <Typography
            sx={{ fontSize: isAppLike ? '23px' : '30px', fontWeight: 'bold' }}
          >
            안녕하세요 {authUser?.name} 님 👋, {isAppLike && <br />} 오늘도 한
            잔의 여유를 즐겨보세요.
          </Typography>
          <Typography>오늘은 어디에서 커피 한 잔 할까요? ☕️</Typography>
        </Box>

        <Box
          style={{ float: 'right', alignSelf: isAppLike ? 'flex-end' : 'auto' }}
        >
          <IconButton onClick={() => scrollBy(-260)} size="small">
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => scrollBy(260)} size="small">
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {subscriptions.length <= 0 && (
        <Box
          sx={{
            backgroundColor: '#f0f0f0c9',
            px: '1rem',
            py: '1.5rem',
            borderRadius: '8px',
            mb: 5,
            display: 'flex',
            gap: isAppLike ? '0.8rem' : '2rem',
            flexDirection: isAppLike ? 'column' : 'row',
            alignItems: 'center',
          }}
        >
          <Typography>
            보유 구독권이 없습니다. 구독권을 구매해주세요!
          </Typography>
          <Button
            endIcon={<OpenInNewIcon />}
            onClick={() => navigate('/me/search')}
          >
            구독권 구매하러 가기
          </Button>
        </Box>
      )}

      {/* 구독권 캐러셀 */}
      {subscriptions.length > 0 && (
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            mb: 10,
            py: 2,
            '&::-webkit-scrollbar': {
              height: isAppLike ? 0 : 6,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#ccc',
              borderRadius: 8,
            },
            // backgroundColor: "#ccccccaf",
            // borderRadius: "8px",
          }}
        >
          {subscriptions.map((item) => (
            <Box
              key={item.purchaseId}
              sx={{
                scrollSnapAlign: 'start',
                px: isAppLike ? '8%' : 0,
                flex: isAppLike ? '0 0 100%' : '0 0 auto',
              }}
            >
              {/* <SubscriptionCard subscription={item} /> */}
              <SubscriptionItem
                today={today}
                item={item}
                handleOrderClick={handleOrderClick}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* 내 근처 카페 */}
      <Box style={{ px: '1rem' }}>
        <Typography sx={{ fontSize: '20px', fontWeight: 'bold', mb: 2 }}>
          내 근처 동네 카페
        </Typography>

        <LocalCafeImgList list={nearbyCafes} />

        {locError && (
          <Typography color="error" sx={{ mb: 1 }}>
            {locError}
          </Typography>
        )}

        {/* <Box
          style={{ float: "right", alignSelf: isAppLike ? "flex-end" : "auto" }}
        >
          <IconButton onClick={() => localScrollBy(-260)} size="small">
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => localScrollBy(260)} size="small">
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          ref={localScrollRef}
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            mb: 5,
            py: 2,
            "&::-webkit-scrollbar": {
              height: isAppLike ? 0 : 6,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#ccc",
              borderRadius: 8,
            },
            // backgroundColor: "#ccccccaf",
            // borderRadius: "8px",
          }}
        >
          {nearbyCafes.map((store) => (
            <Box
              key={store.id || store.storeId}
              sx={{
                scrollSnapAlign: "start",
                px: isAppLike ? "8%" : 0,
                flex: isAppLike ? "0 0 100%" : "0 0 auto",
              }}
            >
              <LocalCafeCard store={store} key={store.id || store.storeId} />
            </Box>
          ))}
        </Box> */}

        {/* <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isAppLike
              ? "1fr"
              : "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "10px",
          }}
        >
          {nearbyCafes.map((store) => (
            <LocalCafeCard store={store} key={store.id || store.storeId} />
          ))}

          {!locError && nearbyCafes.length === 0 && (
            <Typography sx={{ color: "text.secondary" }}>
              500m 안에 등록된 카페가 아직 없어요 ☕
            </Typography>
          )}
        </Box> */}
      </Box>
    </Box>
  );
}

export default CustomerHome;
