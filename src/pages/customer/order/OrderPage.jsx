import { 
  Box, 
  Button, 
  Tabs, 
  Tab, 
  Typography, 
  CircularProgress 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import TodayOrderItem from "../../../components/customer/order/TodayOrderItem";
import useAppShellMode from "../../../hooks/useAppShellMode";
import { useEffect, useState } from "react";
import { formatKoreanDateTime } from "../../../utils/dateUtil";
import todayOrderList from "../../../data/customer/todayOrderList";
import CoffeeIcon from "@mui/icons-material/Coffee";
import api from "../../../utils/api";

function OrderPage() {
  const navigate = useNavigate();
  const { isAppLike } = useAppShellMode();
  const [isLoading, setIsLoading] = useState(true);
  const [todayDate, setTodayDate] = useState(null);
  const [todayOrders, setTodayOrders] = useState([]);
  const [tab, setTab] = useState(0);

  const inProgressOrders = todayOrders.filter(
    (it) => it.orderStatus === "REQUEST" || it.orderStatus === "INPROGRESS"
  );
  const completedOrders = todayOrders.filter(
    (it) => it.orderStatus === "COMPLETED" || it.orderStatus === "RECEIVED"
  );

  useEffect(() => {
    setTodayDate(formatKoreanDateTime(new Date()));

    (async () => {
      try {
        const res = await api.get(`/me/orders/today`);
        setTodayOrders(res.data?.data ?? []);
      } catch (err) {
        console.error("오늘 주문 목록 조회 실패:", err);
      } finally {
        // demo
        setTodayOrders(todayOrderList.orderList);
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <Box
      sx={{
        px: isAppLike ? 2 : 12,
        py: isAppLike ? 2 : 5,
        pb: isAppLike ? 9 : 8,
        minHeight: "100%",
      }}
    >
      {/* 헤더 영역 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", 
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 1.5,
          width: "100%",
          mb: 2,
        }}
      >
        {/* 제목 */}
        <Typography
          sx={{
            fontSize: { xs: "1.5rem", sm: isAppLike ? "1.7rem" : "1.9rem" },
            fontWeight: "bold",
            lineHeight: 1.1,
          }}
        >
          나의 주문 현황
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            width:  "100%",
            justifyContent: "space-between",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          {/* 날짜 */}
          <Typography
            sx={{
              fontSize: { xs: "1.15rem", sm: "1rem" },
              fontWeight: 600,
              mb: 0,
              flex: "1 1 auto",
              minWidth: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: { xs: "left", sm: "right" },
            }}
            title={todayDate || ""}
          >
            {todayDate}
          </Typography>

          {/* 주문하기 버튼 */}
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: "black",
              borderRadius: "999px",
              "&:hover": { bgcolor: "#222" },
              flexShrink: 0,
              px: { xs: 2, sm: 3 },
            }}
            onClick={() => navigate("/me/order/new")}
            endIcon={<CoffeeIcon />}
          >
            주문하기
          </Button>
        </Box>
      </Box>

      {/* 탭 */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{
          mb: 2,
          "& .MuiTab-root": { fontWeight: 600, textTransform: "none" },
          "& .Mui-selected": { color: "black" },
          "& .MuiTabs-indicator": { backgroundColor: "black" },
          minHeight: 42,
        }}
      >
        <Tab label={`진행 중 (${inProgressOrders.length})`} />
        <Tab label={`픽업 완료 (${completedOrders.length})`} />
      </Tabs>

      {/* 리스트 영역 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          mt: 2,
          minHeight: 200,
          justifyContent: isLoading ? "center" : "flex-start",
          alignItems: isLoading ? "center" : "stretch",
        }}
      >
        {isLoading ? (
          <CircularProgress sx={{ color: "#999" }} size={40} />
        ) : tab === 0 ? (
          inProgressOrders.length > 0 ? (
            inProgressOrders.map((order) => (
              <TodayOrderItem order={order} key={order.orderId} />
            ))
          ) : (
            <Box
              sx={{
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
              }}
            >
              <Typography sx={{ mb: 1 }}>
                현재 진행 중인 주문이 없습니다.
              </Typography>
            </Box>
          )
        ) : completedOrders.length > 0 ? (
          completedOrders.map((order) => (
            <TodayOrderItem order={order} key={order.orderId} />
          ))
        ) : (
          <Box
            sx={{
              bgcolor: "#f5f5f5",
              borderRadius: 2,
              p: 2,
              textAlign: "center",
            }}
          >
            <Typography>픽업 완료된 주문이 없습니다.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default OrderPage;
