import { Card, CardContent, Typography, Box } from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import React from "react";
import { useNavigate } from "react-router-dom";

function LocalCafeCard({ store }) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        width: "100%",
        // width: 230,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        m: "0 auto",
        borderRadius: "10px",
        overflow: "hidden",
        bgcolor: "white",
        cursor: "pointer",
      }}
      onClick={() => navigate(`/me/store/${store.storeId}`)}
    >
      {/* 상단 이미지 */}
      <Box
        sx={{
          width: "90%",
          bgcolor: "#e9e9e9",
          borderRadius: "8px",
          overflow: "hidden",
          mt: 1.5,
        }}
      >
        <img
          src={store?.storeImg}
          alt={store?.storeName}
          style={{
            width: "100%",
            height: "100px",
            objectFit: "cover",
            display: "block",
            borderRadius: "8px",
          }}
        />
      </Box>

      {/* 본문 */}
      <CardContent sx={{ width: "100%", p: 2, pt: 1.5 }}>
        {/* 상호명 */}
        <Typography
          variant="subtitle1"
          fontWeight="700"
          sx={{
            mb: 0.5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "#334336",
          }}
        >
          {store?.storeName}
        </Typography>

        {/* 주소 한 줄 (아이콘 + 말줄임) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "text.secondary",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <RoomIcon sx={{ fontSize: 16, color: "gray" }} />
          <Typography
            variant="body2"
            sx={{
              fontSize: "12px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flexGrow: 1,
            }}
            title={store?.roadAddress} // 마우스 올리면 전체 주소 툴팁
          >
            {store?.roadAddress}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default LocalCafeCard;
