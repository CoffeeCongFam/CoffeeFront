import React, { useState, useRef } from 'react';
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
import StandardTag from '../../components/customer/subcription/StandardTag';
import subscriptionList from '../../data/customer/subscriptionList';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import RedeemIcon from '@mui/icons-material/Redeem';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryIcon from '@mui/icons-material/History';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// 구독권 상세 정보 컴포넌트
const SubscriptionDetailCard = ({ subscriptionData, isGifted = false, isExpired = false }) => {
  const [selectedMenu, setSelectedMenu] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  const {
    storeName,
    subscriptionType,
    price,
    maxDailyUsage,
    subscriptionDesc,
    menuNameList,
  } = subscriptionData;

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
  const usageDates = subscriptionData.usageDates || []; // array of ISO strings like '2025-11-01'
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

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'relative',
        maxWidth: 400,
        margin: 'auto',
        padding: 2.5,
        borderRadius: '12px',
        height: '430px', // 정사각형에 가까운 높이 설정
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
            }}
          >
            {isGifted && (
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
                  익명의 천사님이 선물해주셨어요
                </Typography>
              </Box>
            )}
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <StandardTag type={subscriptionType} />
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
              <InfoBox title="일일 사용가능 횟수" content={`매일, 하루 ${maxDailyUsage}잔`} />
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
                {menuNameList.map((menu, index) => (
                  <MenuItem key={index} value={menu}>{menu}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button variant="outlined" sx={{ flex: 1, borderColor: '#E0E0E0', color: '#757575', fontWeight: 'bold' }}>
                결제 취소
              </Button>
              <Button
                variant="contained"
                onClick={() => setIsFlipped(true)}
                sx={{ flex: 1, backgroundColor: '#424242', '&:hover': { backgroundColor: '#616161' } }}
              >
                사용 내역
              </Button>
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
              <Button
                variant="contained"
                onClick={() => setIsFlipped(false)}
                sx={{ backgroundColor: '#424242', '&:hover': { backgroundColor: '#616161' } }}
              >
                닫기
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      {isExpired && (
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

  const settings = {
    dots: true,
    infinite: subscriptionList.length > 2, // 아이템이 2개 초과일 때만 무한으로 슬라이드
    speed: 500, // 넘어가는 속도
    slidesToShow: 2, // 한 번에 보여줄 슬라이드 수
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 600, // 600px 이하에서는
        settings: {
          slidesToShow: 1,
        }
      }
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
        <Tab value="all" label="전체 구독권" />
        <Tab value="expired" label="만료된 구독권" />
      </Tabs>
      {subscriptionList.length > 0 ? (
        <Box sx={{
          position: 'relative',
          padding: '0 44px 72px', // 좌우 버튼 공간 확보 + 점과 카드 간 여백
          '& .slick-list': {
            overflow: 'hidden',
            // mt: ,
            paddingBottom: '24px',
          },
          '& .slick-dots': {
            bottom: '-36px',           // 점 위치 조금 더 아래
          },
        }}>
          <Slider ref={sliderRef} {...settings}>
            {subscriptionList.map((subscription, index) => (
              <Box key={index} sx={{ padding: '0 8px' }}>
                <SubscriptionDetailCard
                  subscriptionData={subscription}
                  isGifted={index < 2}
                  isExpired={activeTab === 'expired'}
                />
              </Box>
            ))}
          </Slider>
          {/* Section-scoped navigation buttons that stay fixed within the section */}
          <IconButton
            onClick={() => sliderRef.current?.slickPrev()}
            sx={{
              position: 'absolute',
              top: '40%',
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
          <IconButton
            onClick={() => sliderRef.current?.slickNext()}
            sx={{
              position: 'absolute',
              top: '40%',
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
        </Box>
      ) : (
        <Typography>보유한 구독권이 없습니다.</Typography>
      )}
    </Container>
  );
};

export default SubscriptionPage;