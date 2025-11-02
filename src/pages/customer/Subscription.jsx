import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  MenuItem,
  Select,
  FormControl,
  IconButton,
} from '@mui/material';
import StandardTag from '../../components/customer/subcription/StandardTag';
import subscriptionList from '../../data/customer/subscriptionList';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// 구독권 상세 정보 컴포넌트
const SubscriptionDetailCard = ({ subscriptionData }) => {
  const [selectedMenu, setSelectedMenu] = useState('');

  const {
    storeName,
    subscriptionType,
    price,
    maxDailyUsage,
    subscriptionDesc,
    menuNameList,
  } = subscriptionData;
  
  // subscriptionPeriod는 InfoBox 내부에서 1개월로 고정 사용해도 무방하지만,
  // 더미 데이터의 subscriptionPeriod를 활용하려면 아래와 같이 사용 가능합니다.
  // const subscriptionPeriod = subscriptionData.subscriptionPeriod;

  const formattedPrice = price.toLocaleString();

  // 금액 정보를 보여주는 박스 서브 컴포넌트
  const InfoBox = ({ title, content, subContent = null }) => (
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
        marginRight: 1,
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

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 400,
        margin: 'auto',
        padding: 2.5,
        borderRadius: '12px',
        height: '430px', // 정사각형에 가까운 높이 설정
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between', // 내부 요소들의 간격을 균등하게 배분
      }}>
      
      <Box sx={{ textAlign: 'center' }}>
        <StandardTag type={subscriptionType} />
        <Typography variant="h6" fontWeight="bold" sx={{ mt: 1, color: '#333' }}>
          {storeName}
        </Typography>
        <Typography variant="body1" fontWeight="light" sx={{ mt: 1, color: '#333' }}>
          <span style={{ fontWeight: 'bold' }}>₩{formattedPrice}</span>/월
        </Typography>
      </Box>

      <Grid container spacing={1}>
        <Grid item xs={4}>
          <InfoBox
            title="금액"
            content={`월 ${formattedPrice}원`}
            isPrice
          />
        </Grid>
        <Grid item xs={4}>
          <InfoBox
            title="구독 주기"
            content={`1개월`} // 사진에 맞춰 1개월로 고정
          />
        </Grid>
        <Grid item xs={4}>
          <InfoBox
            title="일일 사용가능 횟수"
            content={`매일, 하루 ${maxDailyUsage}잔`}
          />
        </Grid>
      </Grid>

      <Box>
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
          <MenuItem value="" disabled>
            제공메뉴
          </MenuItem>
          {menuNameList.map((menu, index) => (
            <MenuItem key={index} value={menu}>
              {menu}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button
          variant="outlined"
          sx={{
            flex: 1, // padding: '12px 0',
            borderColor: '#E0E0E0',
            color: '#757575',
            fontWeight: 'bold',
          }}
        >
          결제 취소
        </Button>
        <Button
          variant="contained"
          sx={{
            flex: 1,
            backgroundColor: '#424242',
            '&:hover': {
              backgroundColor: '#616161',
            },
          }}
        >
          사용 내역
        </Button>
      </Box>
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
        right: '-40px', // 캐러셀 바깥으로 위치 조정
        transform: 'translateY(-50%)',
        zIndex: 2,
        color: 'black',
        backgroundColor: 'white',
        boxShadow: 3,
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.8)'
        }
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
        left: '-40px', // 캐러셀 바깥으로 위치 조정
        transform: 'translateY(-50%)',
        zIndex: 2,
        color: 'black',
        backgroundColor: 'white',
        boxShadow: 3,
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.8)'
        }
      }}
    >
      <ArrowBackIosNewIcon fontSize="small" />
    </IconButton>
  );
}

// 구독권 목록을 보여주는 페이지 컴포넌트
const SubscriptionPage = () => {
  const settings = {
    dots: true,
    infinite: subscriptionList.length > 2, // 아이템이 2개 초과일 때만 무한으로 슬라이드
    speed: 500, // 넘어가는 속도
    slidesToShow: 2, // 한 번에 보여줄 슬라이드 수
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
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
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        나의 구독권
      </Typography>
      {subscriptionList.length > 0 ? (
        <Box sx={{
          position: 'relative',
          padding: '0 20px 72px', // 아래 여백을 더 늘려 점과 카드 사이 간격 확보
          '& .slick-list': {
            overflow: 'visible',       // 카드 그림자/하단이 잘리지 않도록
            paddingBottom: '24px',     // 리스트 자체에 하단 여백 추가
          },
          '& .slick-dots': {
            bottom: '-36px',           // 점 위치 조금 더 아래
          },
        }}>
          <Slider {...settings}>
            {subscriptionList.map((subscription, index) => (
              <Box key={index} sx={{ padding: '0 8px' }}>
                <SubscriptionDetailCard subscriptionData={subscription} />
              </Box>
            ))}
          </Slider>
        </Box>
      ) : (
        <Typography>보유한 구독권이 없습니다.</Typography>
      )}
    </Container>
  );
};

export default SubscriptionPage;