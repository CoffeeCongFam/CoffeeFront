import {
  Box,
  Button,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import TodayOrderItem from "../../../components/customer/order/TodayOrderItem";
import useAppShellMode from "../../../hooks/useAppShellMode";
import { useEffect, useState } from "react";
import { formatKoreanDateTime } from "../../../utils/dateUtil";
import CoffeeIcon from "@mui/icons-material/Coffee";
import { fetchTodayOrderList } from "../../../apis/customerApi";

function OrderPage() {
  const navigate = useNavigate();
  const { isAppLike } = useAppShellMode();
  const [isLoading, setIsLoading] = useState(true);
  const [todayDate, setTodayDate] = useState(null);
  const [todayOrders, setTodayOrders] = useState([]);
  const [tab, setTab] = useState(0);

  const inProgressOrders = todayOrders.filter(
    (it) => it.orderStatus === "REQUEST" || it.orderStatus === "INPROGRESS" || it.orderStatus === "COMPLETED"
  );
  const completedOrders = todayOrders.filter(
    (it) => it.orderStatus === "RECEIVED"
  );

  // 취소 또는 매장 거부 내역 한 탭으로 보여주기
  const canceledOrders = todayOrders.filter(
    (it) => it.orderStatus === "CANCELED" || it.orderStatus === "REJECTED"
  );
  // const rejectedOrders = todayOrders.filter(
  //   (it) => it.orderStatus === "REJECTED"
  // );

  useEffect(() => {
    setTodayDate(formatKoreanDateTime(new Date()));

    (async () => {
      try {
        const res = await fetchTodayOrderList();
        console.log("✅오늘 주문 목록 조회 성공:", res);

        setTodayOrders(res ?? []);
      } catch (err) {
        console.error("오늘 주문 목록 조회 실패:", err);
      } finally {
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
        borderRadius: 2,
        border: "1px solid #ffe0b2",
        backgroundColor: "white",
        m: isAppLike ? 2 : 4,
      }}
    >
      {/* 헤더 영역 - 항상 같은 레이아웃 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // 데스크탑도 무조건 column
          gap: 1.5,
          mb: 2,
        }}
      >
        {/* 제목 */}
        <Typography
          sx={{
            fontSize: { xs: "1.5rem", md: "1.9rem" },
            fontWeight: "bold",
            lineHeight: 1.1,
            color: "#334336",
          }}
        >
          주문 내역
          {/* 나의 주문 현황 */}
        </Typography>

        {/* 날짜 + 버튼 한 줄 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "1rem", md: "1.2rem" },
              fontWeight: 600,
              flex: "1 1 auto",
              minWidth: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={todayDate || ""}
          >
            {todayDate}
          </Typography>

          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: "black",
              borderRadius: "999px",
              "&:hover": { bgcolor: "#222" },
              flexShrink: 0,
              px: { xs: 2, md: 3 },
            }}
            onClick={() => navigate("/me/order/new")}
            endIcon={<CoffeeIcon />}
          >
            주문하기
          </Button>
        </Box>
      </Box>

      <Box
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* 탭 */}
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{
            mb: 2,
            borderBottom: 1,
            borderColor: "#ffe0b2",
            "& .MuiTab-root": { 
              fontWeight: 600, 
              textTransform: "none",
              color: "#3B3026",
            },
            "& .Mui-selected": { 
              color: "#334336",
              fontWeight: 600,
            },
            "& .MuiTabs-indicator": { 
              backgroundColor: "#334336",
            },
          }}
        >
          <Tab label={`진행 중 (${inProgressOrders.length})`} />
          <Tab label={`픽업 완료 (${completedOrders.length})`} />
          <Tab label={`취소 (${canceledOrders.length})`} />
        </Tabs>
      </Box>
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
          <CircularProgress sx={{ color: "#334336" }} size={40} />
        ) : (
          (() => {
            // 현재 탭에 따라 보여줄 주문 리스트 선택
            const currentOrders =
              tab === 0
                ? inProgressOrders
                : tab === 1
                ? completedOrders
                : canceledOrders;

            // 탭별 빈 상태 문구
            const emptyMessage =
              tab === 0
                ? "현재 진행 중인 주문이 없습니다."
                : tab === 1
                ? "픽업 완료된 주문이 없습니다."
                : "취소된 주문이 없습니다.";

            // 주문이 없을 때
            if (currentOrders.length === 0) {
              return (
                <Box
                  sx={{
                    bgcolor: "#f5f5f5",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                  }}
                >
                  <Typography>{emptyMessage}</Typography>
                </Box>
              );
            }

            // 주문이 있을 때
            return currentOrders.map((order) => (
              <TodayOrderItem order={order} key={order.orderId} />
            ));
          })()
        )}
      </Box>
    </Box>
  );
}

export default OrderPage;