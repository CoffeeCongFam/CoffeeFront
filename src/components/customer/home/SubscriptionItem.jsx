import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Tooltip,
} from "@mui/material";
import CoffeeIcon from "@mui/icons-material/Coffee";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import React from "react";
import dummyImg from "../../../assets/cafeInfoDummy.png";
import { useNavigate } from "react-router-dom";
import useAppShellMode from "../../../hooks/useAppShellMode";
import SubTypeChip from "../../common/SubTypeChip";

function SubscriptionItem({ today, item, handleOrderClick }) {
  const { isAppLike } = useAppShellMode();
  const navigate = useNavigate();

  const isUsedToday = item.remainingCount <= 0;

  function getRemainingDays(today, subEnd) {
    const todayDate = new Date(today);
    const endDate = new Date(subEnd);
    const diffTime = endDate - todayDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  return (
    <Card
      sx={{
        width: "100%",  
        maxWidth: isAppLike ? "100%" : 250,    
        minWidth: isAppLike ? "auto" : 250, 
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        m: "0 auto",
        borderRadius: "10px",
        overflow: "hidden",
        bgcolor: "white",
        cursor: "pointer",
        position: "relative",  
        "&:hover": {
          // filter: "brightness(0.9)", 
          transform: "translateY(-3px)", 
          // boxShadow: "0 4px 12px rgba(0,0,0,0.15)", 
        }, 
      }}
      onClick={() => navigate(`/me/store/${item.store.partnerStoreId}`)}
    >
      {/* 구독권 타입 배지 - 카드 오른쪽 상단 */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 20,
        }}
      >
        <SubTypeChip type={item.subscriptionType} />
      </Box>

      {/* 도장 오버레이 */}
      {isUsedToday && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            backgroundColor: "rgba(0,0,0,0.25)",
            backdropFilter: "blur(1.5px)",
            zIndex: 10,
          }}
        >
          <CoffeeIcon sx={{ fontSize: 65, color: "#ffffffd2" }} />
          <Typography
            sx={{ fontSize: 20, fontWeight: 600, color: "#ffffffd2" }}
          >
            오늘 이용 완료
          </Typography>
        </Box>
      )}

      {/* 상단 이미지 */}
      <Box sx={{ width: "100%", bgcolor: "#e9e9e9" }}>
        <CardMedia
          component="img"
          sx={{
            width: "100%",
            height: 100,
            objectFit: "cover",
            backgroundColor: "#ddd",
            opacity: 0.8
          }}
          image={item.store.storeImg || dummyImg}
          alt={item.store.storeName}
        />
      </Box>

      {/* 본문 */}
      <CardContent sx={{ width: "100%", p: 2, pt: 1.5 }}>
        {/* 1줄 : 카페 이름 + 구독권명만 왼쪽에 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
            gap: "1.5rem",
          }}
        >
          <Tooltip title={item.store.storeName} arrow>
            <Typography
              variant="subtitle1"
              fontWeight="700"
              noWrap={!isAppLike}   // 데스크탑에서만 한 줄로
              sx={{
                flex: 1,
                cursor: "default",
                ...(isAppLike
                  ? {
                      display: "-webkit-box",
                      WebkitLineClamp: 2,        // 모바일: 최대 2줄까지
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }
                  : {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }),
              }}
            >
              {item.store.storeName} - {item.subName}
            </Typography>
          </Tooltip>
        </Box>

        <Typography
          variant="body2"
          sx={{ fontSize: "12px", textAlign: "right", color: "grey.600" }}
        >
          {item.subStart.split("T")[0]} ~ {item.subEnd.split("T")[0]}
        </Typography>

        <Typography
          sx={{
            fontSize: "12px",
            textAlign: "right",
            mt: 0.5,
            color: "#ff5e14ff",
            fontWeight: 500,
          }}
        >
          남은 이용일: {getRemainingDays(today, item.subEnd) - 1}일
        </Typography>
      </CardContent>

      {/* 하단 버튼 */}
      <Box sx={{ width: "100%", px: 2, pb: 2 }}>
        {item.remainingCount > 0 ? (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleOrderClick(item);
            }}
            fullWidth
            sx={{
              backgroundColor: "black",
              color: "white",
              borderRadius: "6px",
              "&:hover": { backgroundColor: "#333" },
              alignItems: "center",
            }}
            endIcon={<CoffeeIcon />}
          >
            {item?.remainingCount}잔 주문 가능
          </Button>
        ) : (
          <Button
            disabled
            fullWidth
            sx={{
              backgroundColor: "#f0f0f0",
              color: "#888",
              borderRadius: "6px",
            }}
          >
            오늘 이용 완료
          </Button>
        )}
      </Box>
    </Card>
  );
}

export default SubscriptionItem;

