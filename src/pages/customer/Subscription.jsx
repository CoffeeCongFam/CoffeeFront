import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  ButtonGroup,
  Tabs,
  Tab,
  Divider,
  MenuItem,
  Select,
  FormControl,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider as MuiDivider,
} from '@mui/material';
import {getSubscription} from '../../api/subscription';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import RedeemIcon from '@mui/icons-material/Redeem';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryIcon from '@mui/icons-material/History';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// 구독권 상세 정보 컴포넌트
export const SubscriptionDetailCard = ({ subscriptionData, isGifted = false, isExpired = false, headerExtra = null, actionsSlot = null, maxDailyUsage: maxDailyUsageProp, giftType, usedAt: usedAtProp }) => {
  const [selectedMenu, setSelectedMenu] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  const {
    storeName,
    subscriptionType,
    price,
    subscriptionDesc,
    menuNameList,
    menuList,
  } = subscriptionData;
  const menus = Array.isArray(menuNameList)
    ? menuNameList
    : Array.isArray(menuList)
    ? menuList
    : [];
  const resolvedMaxDaily = maxDailyUsageProp ?? subscriptionData.maxDailyUsage ?? subscriptionData.dailyRemainCount;
  const dailyLabel = giftType === 'RECEIVED' ? '일일 잔여' : '일일 사용가능 횟수';

  const formattedPrice = price.toLocaleString();

  // 금액 정보를 보여주는 박스 서브 컴포넌트
  const InfoBox = ({ title, content, subContent = null, isPrice = false }) => (
    <Box
      sx={{
        flexGrow: 1,
        padding: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        minHeight: '70px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        border: '1px solid #E0E0E0',
      }}
    >
      <Typography variant="caption" color="textSecondary" fontWeight="bold" sx={{ mb: 0.25 }}>
        {title}
      </Typography>
      <Typography variant="body2" fontWeight="bold">
        {content}
      </Typography>
      {subContent && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
          {subContent}
        </Typography>
      )}
    </Box>
  );

  // ---- Usage grouping helper ----
  const usageDates = Array.isArray(usedAtProp)
    ? usedAtProp
    : Array.isArray(subscriptionData.usedAt)
    ? subscriptionData.usedAt
    : Array.isArray(subscriptionData.usageDates)
    ? subscriptionData.usageDates
    : [];
  const groupByMonth = (dates) => {
    const map = {};
    dates.forEach((iso) => {
      const d = new Date(iso);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(iso);
    });
    // sort months desc and days desc
    const sorted = Object.keys(map).sort((a, b) => (a < b ? 1 : -1)).reduce((acc, k) => {
      acc[k] = map[k].sort((a, b) => (a < b ? 1 : -1));
      return acc;
    }, {});
    return sorted;
  };
  const usageByMonth = groupByMonth(usageDates);

  // ---- Cancel / Deny button visibility rules ----
  const usedCount = usageDates.length;
  const parseDateSafe = (iso) => {
    const d = new Date(iso);
    return isNaN(d) ? null : d;
  };
  const startDate = parseDateSafe(subscriptionData?.subStart);
  const now = new Date();
  const daysSinceStart = startDate ? Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  // 숨김 조건: 1) 사용내역 존재(usedAt.length > 0)  2) subStart로부터 8일째(>= 8일)부터
  const shouldHideCancel = usedCount > 0 || daysSinceStart >= 8;

  const isUsageStatusExpired = subscriptionData?.usageStatus === 'NOT_ACTIVATED';

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'relative',
        maxWidth: 400,
        margin: 'auto',
        padding: 2.5,
        borderRadius: '12px',
        height: '520px', // 정사각형에 가까운 높이 설정
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between', // 내부 요소들의 간격을 균등하게 배분
      }}>
      {/* Flip container */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          perspective: '1000px',
          filter: isExpired ? 'grayscale(60%) blur(0px) opacity(0.85)' : 'none',
        }}
      >
        {/* Card faces wrapper */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transition: 'transform 600ms ease',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRONT FACE */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 0, // already padded by Paper
              pointerEvents: isFlipped ? 'none' : 'auto',
            }}
          >
            {isGifted && giftType !== 'SENT' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  left: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  padding: '6px 10px',
                  borderRadius: '12px',
                  boxShadow: 2,
                  zIndex: 3,
                }}
              >
                <RedeemIcon sx={{ color: '#ff6f00', fontSize: 22 }} />
                <Typography variant="caption" fontWeight="bold" color="text.primary">
                  {subscriptionData?.giverName
                    ? `${subscriptionData.giverName}님이 선물해주셨어요`
                    : '익명의 천사님이 선물해주셨어요'}
                </Typography>
              </Box>
            )}
            {giftType === 'SENT' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  left: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  padding: '6px 10px',
                  borderRadius: '12px',
                  boxShadow: 2,
                  zIndex: 3,
                }}
              >
                <RedeemIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                <Typography variant="caption" fontWeight="bold" color="text.primary">
                  {`For · ${subscriptionData?.receiver ?? '수신자'}`}
                </Typography>
              </Box>
            )}
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Box sx={{ display: 'inline-block' }}>
                <Chip
                  label={subscriptionType}
                  size="medium"
                  sx={{
                    fontWeight: 'bold',
                    bgcolor:
                      subscriptionType === 'BASIC'
                        ? 'green'
                        : subscriptionType === 'STANDARD'
                        ? '#ff9800'
                        : subscriptionType === 'PREMIUM'
                        ? '#9c27b0'
                        : 'grey.300',
                    color: '#fff'
                  }}
                />
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mt: 1, color: '#333' }}>
                {storeName}
              </Typography>
              <Typography variant="body1" fontWeight="light" sx={{ mt: 1, color: '#333' }}>
                <span style={{ fontWeight: 'bold' }}>₩{formattedPrice}</span>/월
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <InfoBox title="금액" content={`${formattedPrice}원`} isPrice />
              <InfoBox title="구독 기간" content={`1일`} />
              <InfoBox title={dailyLabel} content={`매일, 하루 ${resolvedMaxDaily ?? 0}잔`} />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="primary.main" fontWeight="bold" sx={{ mb: 1 }}>
                상세설명
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                {subscriptionDesc}
              </Typography>
            </Box>

            <FormControl fullWidth variant="outlined">
              <Select
                value={selectedMenu}
                onChange={(e) => setSelectedMenu(e.target.value)}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
                size="small"
              >
                <MenuItem value="" disabled>제공메뉴</MenuItem>
                {menus.map((menu, index) => (
                  <MenuItem key={index} value={menu}>{menu}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {actionsSlot ? (
                actionsSlot
              ) : (
                <>
                  {!shouldHideCancel && (
                    <Button variant="outlined" sx={{ flex: 1, borderColor: '#E0E0E0', color: '#757575', fontWeight: 'bold' }}>
                      {giftType === 'RECEIVED' ? '선물 거절' : '결제 취소'}
                    </Button>
                  )}
                  {giftType !== 'SENT' && (
                    <Button
                      variant="contained"
                      onClick={() => setIsFlipped(true)}
                      sx={{
                        flex: 1,
                        backgroundColor: '#424242',
                        '&:hover': { backgroundColor: '#616161' },
                        position: 'relative',
                        zIndex: 6,
                        pointerEvents: 'auto',
                      }}
                    >
                      사용 내역
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Box>

          {/* BACK FACE (Usage History) */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              p: 0,
              pointerEvents: isFlipped ? 'auto' : 'none',
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon />
                <Typography variant="h6" fontWeight="bold">사용 내역</Typography>
              </Box>
              <IconButton aria-label="close usage" onClick={() => setIsFlipped(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <MuiDivider sx={{ mb: 1 }} />

            {/* Monthly grouped usage */}
            <Box sx={{ overflowY: 'auto' }}>
              {Object.keys(usageByMonth).length === 0 && (
                <Typography variant="body2" color="text.secondary">사용 내역이 없습니다.</Typography>
              )}
              {Object.entries(usageByMonth).map(([month, days]) => (
                <Accordion key={month} disableGutters sx={{ boxShadow: 'none', border: '1px solid #eee', mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonthIcon fontSize="small" />
                      <Typography variant="subtitle2" fontWeight="bold">{month}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <List dense>
                      {days.map((iso) => {
                        const d = new Date(iso);
                        const dateLabel = isNaN(d) ? iso : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        return (
                          <ListItem key={iso} disablePadding sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                              <HistoryIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primaryTypographyProps={{ variant: 'body2' }}
                              primary={dateLabel}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            {/* Back actions */}
            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            </Box>
          </Box>
        </Box>
      </Box>
      {isUsageStatusExpired && !isFlipped && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(97, 97, 97, 0.5)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            pointerEvents: 'auto',
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#fff', textAlign: 'center' }}>
            구독권 만료
          </Typography>
        </Box>
      )}
      {isExpired && !isFlipped && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(97, 97, 97, 0.5)', // semi-transparent gray
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            pointerEvents: 'auto',
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#fff', textAlign: 'center' }}>
            기한이 만료되었습니다
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// API 데이터를 카드 컴포넌트에서 쓰기 좋게 변환
const adaptToCardData = (s) => ({
  storeName: s?.store?.storeName ?? '',
  subscriptionType: s?.subscriptionType ?? 'STANDARD',
  price: Number(s?.price ?? 0),
  subscriptionDesc: s?.subName ?? '',
  menuList: Array.isArray(s?.menu) ? s.menu : [],
  dailyRemainCount: s?.remainingCount ?? 0,
  giverName: s?.sender,
  receiver: s?.receiver,
  subStart: s?.subStart,
  usageStatus: s?.usageStatus,
});

// 커스텀 다음 화살표 컴포넌트
function NextArrow(props) {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'absolute',
        top: '50%',
        right: 0,
        transform: 'translateY(-50%)',
        zIndex: 2,
        color: 'black',
        backgroundColor: 'white',
        boxShadow: 3,
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.8)' }
      }}
    >
      <ArrowForwardIosIcon fontSize="small" />
    </IconButton>
  );
}

// 커스텀 이전 화살표 컴포넌트
function PrevArrow(props) {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'absolute',
        top: '50%',
        left: 0,
        transform: 'translateY(-50%)',
        zIndex: 2,
        color: 'black',
        backgroundColor: 'white',
        boxShadow: 3,
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.8)' }
      }}
    >
      <ArrowBackIosNewIcon fontSize="small" />
    </IconButton>
  );
}

// 구독권 목록을 보여주는 페이지 컴포넌트
const SubscriptionPage = () => {
  const sliderRef = useRef(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'expired'
  const [availableList, setAvailableList] = useState([]); // 사용 가능한 구독권
  const [expiredList, setExpiredList] = useState([]);     // 만료/비활성 구독권 (NOT_ACTIVATED 포함)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getSubscription(); // API 호출
        // API가 { success, data, message }를 반환하므로 .data를 붙여서 사용
        const arr = Array.isArray(res?.data) ? res.data : [];
        // 조건 정정:
        // 사용 가능: isExpired ∈ {'ACTIVE', 'Y'}
        // 만료/비활성: isExpired ∈ {'NOT_ACTIVATED', 'EXPIRED', 'CANCELLED', 'USED_UP', 'N'}
        const norm = (v) => (v ?? '').toString().toUpperCase();
        const avail = arr.filter(s => ['ACTIVE', 'Y'].includes(norm(s?.isExpired)));
        const exp = arr.filter(s => ['NOT_ACTIVATED', 'EXPIRED', 'CANCELLED', 'USED_UP', 'N'].includes(norm(s?.isExpired)));
        console.log('[Subscription] available:', avail.length, 'expired:', exp.length, { raw: res, list: arr });
        if (mounted) {
          setAvailableList(avail);
          setExpiredList(exp);
        }
      } catch (e) {
        if (mounted) setError(e?.message || '구독권 조회에 실패했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const currentList = activeTab === 'all' ? availableList : expiredList;
  const settings = {
    dots: true,
    infinite: currentList.length > 2,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 600, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          나의 구독권
        </Typography>
      </Box>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ borderBottom: 1, borderColor: 'divider', mt: 0.5, mb: 3 }}
      >
        <Tab value="all" label="사용 가능한 구독권" />
        <Tab value="expired" label="만료된 구독권" />
      </Tabs>
      {loading ? (
        <Typography>불러오는 중…</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : currentList.length > 0 ? (
        <Box sx={{
          position: 'relative',
          padding: '0 44px 72px',
          '& .slick-list': { overflow: 'hidden', paddingBottom: '24px' },
          '& .slick-dots': { bottom: '-36px' },
        }}>
          <Slider ref={sliderRef} {...settings}>
            {currentList.map((s, index) => {
              const cardData = adaptToCardData(s);
              const isGifted = (s?.sender && s?.receiver && s.sender !== s.receiver) || s?.isGift === 'Y';
              const giftType = isGifted ? 'RECEIVED' : undefined;
              return (
                <Box key={s.subId ?? index} sx={{ padding: '0 8px' }}>
                  <SubscriptionDetailCard
                    subscriptionData={cardData}
                    isGifted={isGifted}
                    isExpired={activeTab === 'expired'}
                    giftType={giftType}
                    usedAt={Array.isArray(s?.usedAt) ? s.usedAt : []}
                    maxDailyUsage={s?.remainingCount}
                  />
                </Box>
              );
            })}
          </Slider>
          <IconButton
            onClick={() => sliderRef.current?.slickPrev()}
            sx={{
              position: 'absolute', top: '40%', left: 0, transform: 'translateY(-50%)',
              zIndex: 2, color: 'black', backgroundColor: 'white', boxShadow: 3,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.8)' }
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => sliderRef.current?.slickNext()}
            sx={{
              position: 'absolute', top: '40%', right: 0, transform: 'translateY(-50%)',
              zIndex: 2, color: 'black', backgroundColor: 'white', boxShadow: 3,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.8)' }
            }}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Typography>보유한 구독권이 없습니다.</Typography>
      )}
    </Container>
  );
};

export default SubscriptionPage;