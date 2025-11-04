  // ✅ 공통: 리스트 응답(normalize)
  // - 배열 그대로 반환
  // - axios 응답: { data: [...] } 또는 { data: { success, data: [...] } }
  // - 직접 래핑: { success, data: [...] }
  const extractListFromResponse = (res) => {
    if (Array.isArray(res)) return res;
    if (!res || typeof res !== "object") return [];
    const root = res.data ?? res; // axios면 res.data, 아니면 res
    if (Array.isArray(root)) return root;
    if (root && typeof root === "object" && Array.isArray(root.data)) return root.data;
    return [];
  };
// /src/pages/customer/MyGift.jsx
import React, { useState, useEffect, useMemo } from "react";
import GiftListItem from "../../components/customer/gift/GiftListItem";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Collapse,
  Grid,
  Divider,
  Chip,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  getGiftData,
  getSendGiftData,
  getReceievGiftData,
  getSendGift,
  getReceiveGift,
} from "../../utils/gift";
import { SubscriptionDetailCard } from "./Subscription";

function MyGift() {
  const [filter, setFilter] = useState("ALL");
  const [openIndex, setOpenIndex] = useState(null);
  const [giftList, setGiftList] = useState([]);
  const [sentGiftList, setSentGiftList, ] = useState([]);
  const [receivedGiftList, setReceivedGiftList] = useState([])
  const [sendDetailById, setSendDetailById] = useState({});
  const [loadingSendDetailId, setLoadingSendDetailId] = useState(null);
  const [receiveDetailById, setReceiveDetailById] = useState({});
  const [loadingReceiveDetailId, setLoadingReceiveDetailId] = useState(null);

  // ✅ 날짜 포맷터: "2025.11.08  오후 10시 26분"
  const formatKST = (isoLike) => {
    if (!isoLike) return "";
    let s = String(isoLike);
    // Normalize fractional seconds to max 3 digits (milliseconds)
    // e.g., "2025-11-01T11:52:14.683351" -> "2025-11-01T11:52:14.683"
    s = s.replace(
      /(T\d{2}:\d{2}:\d{2}\.)(\d{1,})(.*)?$/,
      (_, head, frac, tail = "") => head + frac.slice(0, 3) + (tail || "")
    );
    const d = new Date(s);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "오후" : "오전";
    h = h % 12 || 12;
    return `${yyyy}.${mm}.${dd}  ${ampm} ${h}시 ${m}분`;
  };

  // ✅ API에서 목록 받아오기 (항상 배열 보장)
  useEffect(() => {
    if (filter !== "ALL") return;
    (async () => {
      const data = await getGiftData();
      setGiftList(Array.isArray(data) ? data : []);
    })();
  }, [filter]);

  useEffect(() => {
    if (filter !== "SENT") return;
    (async () => {
      const res = await getSendGiftData();
      const list = extractListFromResponse(res);
      const normalized = list.map((it) => ({
        ...it,
        maxDailyUsage: it.maxDailyUsage ?? it.dailyRemainCount ?? 0,
        menuList: Array.isArray(it.menuList)
          ? it.menuList
          : Array.isArray(it.menuNameList)
          ? it.menuNameList
          : [],
      }));
      setSentGiftList(normalized);
    })();
  }, [filter]);

  useEffect(() => {
    if (filter !== "RECEIVED") return;
    (async () => {
      const res = await getReceievGiftData();
      const list = extractListFromResponse(res);
      const normalized = list.map((it) => ({
        ...it,
        usedAt: Array.isArray(it.usedAt) ? it.usedAt : [],
        menuList: Array.isArray(it.menuList)
          ? it.menuList
          : Array.isArray(it.menuNameList)
          ? it.menuNameList
          : [],
      }));
      setReceivedGiftList(normalized);
    })();
  }, [filter]);

  useEffect(() => {
    setOpenIndex(null);
  }, [filter]);

  // 보낸 선물 상세 fetch (purchaseId 기준)
  const fetchSendDetail = async (purchaseId) => {
    if (!purchaseId) return null;
    // 캐시가 있으면 반환
    if (sendDetailById[purchaseId]) return sendDetailById[purchaseId];
    try {
      setLoadingSendDetailId(purchaseId);
      const res = await getSendGift(purchaseId);
      // API가 객체를 직접 반환한다고 가정. axios 형태도 방어
      const data =
        res && typeof res === "object" && !Array.isArray(res)
          ? res.data ?? res
          : {};
      const normalized = {
        ...data,
        maxDailyUsage: data.maxDailyUsage ?? data.dailyRemainCount ?? 0,
        menuList: Array.isArray(data.menuList)
          ? data.menuList
          : Array.isArray(data.menuNameList)
          ? data.menuNameList
          : [],
      };
      setSendDetailById((prev) => ({ ...prev, [purchaseId]: normalized }));
      return normalized;
    } finally {
      setLoadingSendDetailId(null);
    }
  };

  // 받은 선물 상세 fetch (memberSubscriptionId 기준)
  const fetchReceiveDetail = async (memberSubscriptionId) => {
    if (!memberSubscriptionId) return null;
    if (receiveDetailById[memberSubscriptionId])
      return receiveDetailById[memberSubscriptionId];
    try {
      setLoadingReceiveDetailId(memberSubscriptionId);
      const res = await getReceiveGift(memberSubscriptionId);
      // 기대 응답(단일 객체):
      // axios 일 경우: res.data = { success, data: { ... }, message }
      // fetch/직접 객체 일 경우: res = { success, data: { ... }, message }
      const root = res && typeof res === "object" ? res.data ?? res : {};
      const obj =
        root && typeof root === "object"
          ? root.data && typeof root.data === "object"
            ? root.data
            : root
          : null;
      if (!obj || Array.isArray(obj)) {
        setReceiveDetailById((prev) => ({
          ...prev,
          [memberSubscriptionId]: null,
        }));
        return null;
      }
      const normalized = {
        ...obj,
        usedAt: Array.isArray(obj.usedAt) ? obj.usedAt : [],
        menuList: Array.isArray(obj.menuList)
          ? obj.menuList
          : Array.isArray(obj.menuNameList)
          ? obj.menuNameList
          : [],
        dailyRemainCount:
          typeof obj.dailyRemainCount === "number"
            ? obj.dailyRemainCount
            : obj.maxDailyUsage ?? 0,
      };
      setReceiveDetailById((prev) => ({
        ...prev,
        [memberSubscriptionId]: normalized,
      }));
      return normalized;
    } finally {
      setLoadingReceiveDetailId(null);
    }
  };

  // ✅ 내 선물함: getGiftData가 이미 내 선물함만 반환한다고 가정
  const baseList = useMemo(
    () => (Array.isArray(giftList) ? giftList : []),
    [giftList]
  );

  // const countAll = baseList.length;
  // const countReceived = baseList.filter((it) => it.isGift === "Y").length;
  // const countSent = baseList.filter((it) => it.isGift === "N").length;

  // ✅ 탭 필터링
  const filteredGiftList = useMemo(() => {
    if (filter === "RECEIVED") return receivedGiftList; // RECEIVED 탭은 getReceievGiftData 결과만 사용
    if (filter === "SENT") return sentGiftList; // SENT 탭은 getSendGiftData 결과만 사용
    return baseList; // ALL
  }, [filter, baseList, sentGiftList, receivedGiftList]);

  // ✅ 문구 생성 (ALL 탭) - isGift 기반
  const formatMessage = (item) => {
    const bold = { fontWeight: "bold", color: "black" };
    const isReceived = item.isGift === "Y";

    if (isReceived) {
      // 받은 선물: sender -> 나
      return {
        isSent: false,
        node: (
          <>
            <Typography component="span" sx={bold}>{item.sender}</Typography>
            님께&nbsp;
            <Typography component="span" sx={bold}>{item.subscriptionName}</Typography>
            을 선물받았습니다!
          </>
        ),
      };
    }

    // 보낸 선물: 나 -> receiver
    return {
      isSent: true,
      node: (
        <>
          <Typography component="span" sx={bold}>{item.receiver}</Typography>
          님께&nbsp;
          <Typography component="span" sx={bold}>{item.subscriptionName}</Typography>
          을 선물했습니다!
        </>
      ),
    };
  };

  // (pickSendGiftForRow, findReceivedForAllRow: 제거됨)

  // 메뉴 리스트에서 실제 메뉴 이름만 추출
  const extractMenuNames = (menuList) => {
    if (!Array.isArray(menuList)) return [];
    return menuList
      .map((m) => (typeof m === "string" ? m : m?.menuName))
      .filter(Boolean);
  };

  const SentDetailPanel = ({ row }) => {
    const labelSx = { color: "text.secondary", fontSize: 12 };
    const valueSx = { fontSize: 14, fontWeight: 500 };
    const sectionTitleSx = {
      fontSize: 12,
      color: "text.disabled",
      letterSpacing: 1,
      textTransform: "uppercase",
    };
    const currency = (n) =>
      typeof n === "number" ? n.toLocaleString() + "원" : n;

    return (
      <Card variant="outlined" sx={{ overflow: "hidden" }}>
        <CardHeader
          titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }}
          subheaderTypographyProps={{
            variant: "caption",
            color: "text.secondary",
          }}
          title={`${row.subscriptionName}`}
          subheader={`${row.storeName}`}
          avatar={
            <Avatar
              variant="rounded"
              sx={{
                width: 56,
                height: 56,
                bgcolor: "background.paper",
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Typography variant="caption">이미지</Typography>
            </Avatar>
          }
          sx={{ pb: 0.5 }}
        />
        <CardContent sx={{ pt: 1.5 }}>
          <Stack spacing={2}>
            {/* 송수신 정보 */}
            <Box>
              <Typography sx={sectionTitleSx}>보낸/받는 정보</Typography>
              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                {/* <Grid item xs={12} sm={6}>
                  <Typography sx={labelSx}>보낸 사람</Typography>
                  <Typography sx={valueSx}>{row.sender}</Typography>
                </Grid> */}
                <Grid item xs={12} sm={6}>
                  <Typography sx={labelSx}>받는 사람</Typography>
                  <Typography sx={valueSx}>{row.receiver}</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* 메시지 */}
            <Box>
              <Typography sx={sectionTitleSx}>선물 메시지</Typography>
              <Paper
                variant="outlined"
                sx={{ p: 1.2, mt: 0.5, bgcolor: "grey.50" }}
              >
                <Typography variant="body2">
                  {row.giftMessage ?? "—"}
                </Typography>
              </Paper>
            </Box>

            {/* 결제 정보 */}
            <Box>
              <Typography sx={sectionTitleSx}>결제 정보</Typography>
              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <Typography sx={labelSx}>결제 수단</Typography>
                  <Chip size="small" label={row.purchaseType} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={labelSx}>결제 일시</Typography>
                  <Typography sx={valueSx}>{formatKST(row.paidAt)}</Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* 구독권 기본정보 */}
            <Box>
              <Typography sx={sectionTitleSx}>구독권 정보</Typography>
              <List dense disablePadding sx={{ mt: 0.5 }}>
                <ListItem disableGutters sx={{ py: 0.5 }}>
                  <ListItemText
                    primaryTypographyProps={{ sx: labelSx }}
                    primary="구독권"
                    secondaryTypographyProps={{ sx: valueSx }}
                    secondary={row.subscriptionName}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.5 }}>
                  <ListItemText
                    primaryTypographyProps={{ sx: labelSx }}
                    primary="가격"
                    secondaryTypographyProps={{ sx: valueSx }}
                    secondary={currency(row.price)}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.5 }}>
                  <ListItemText
                    primaryTypographyProps={{ sx: labelSx }}
                    primary="구독 기간"
                    secondaryTypographyProps={{ sx: valueSx }}
                    secondary={`${row.subscriptionPeriod}일`}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.5 }}>
                  <ListItemText
                    primaryTypographyProps={{ sx: labelSx }}
                    primary="일일 사용가능 횟수"
                    secondaryTypographyProps={{ sx: valueSx }}
                    secondary={String(row.dailyRemainCount)}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.5 }}>
                  <ListItemText
                    primaryTypographyProps={{ sx: labelSx }}
                    primary="매장"
                    secondaryTypographyProps={{ sx: valueSx }}
                    secondary={row.storeName}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.5 }}>
                  <ListItemText
                    primaryTypographyProps={{ sx: labelSx }}
                    primary="타입"
                    secondaryTypographyProps={{ sx: valueSx }}
                    secondary={
                      <Chip
                        size="small"
                        color={
                          row.subscriptionType === "BASIC"
                            ? "success"
                            : "default"
                        }
                        label={row.subscriptionType}
                      />
                    }
                  />
                </ListItem>
              </List>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const ReceivedDetailPanel = ({ row }) => {
    const labelSx = { color: "text.secondary", fontSize: 12 };
    const valueSx = { fontSize: 14, fontWeight: 500 };
    const sectionTitleSx = {
      fontSize: 12,
      color: "text.disabled",
      letterSpacing: 1,
      textTransform: "uppercase",
    };
    const currency = (n) =>
      typeof n === "number" ? n.toLocaleString() + "원" : n;
    const chipColor =
      row.usageStatus === "ACTIVE"
        ? "success"
        : row.usageStatus === "NOT_ACTIVATED"
        ? "default"
        : "warning";

    return (
      <Card variant="outlined" sx={{ overflow: "hidden" }}>
        <CardHeader
          titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }}
          subheaderTypographyProps={{
            variant: "caption",
            color: "text.secondary",
          }}
          title={`${row.subscriptionName}`}
          subheader={`${row.storeName}`}
          avatar={
            <Avatar
              variant="rounded"
              sx={{
                width: 56,
                height: 56,
                bgcolor: "background.paper",
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Typography variant="caption">이미지</Typography>
            </Avatar>
          }
          sx={{ pb: 0.5 }}
        />
        <CardContent sx={{ pt: 1.5 }}>
          <Stack spacing={2}>
            {/* 송수신 정보 */}
            <Box>
              <Typography sx={sectionTitleSx}>보낸/받는 정보</Typography>
              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <Typography sx={labelSx}>받는 사람</Typography>
                  <Typography sx={valueSx}>{row.receiver}</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* 메시지 */}
            <Box>
              <Typography sx={sectionTitleSx}>선물 메시지</Typography>
              <Paper
                variant="outlined"
                sx={{ p: 1.2, mt: 0.5, bgcolor: "grey.50" }}
              >
                <Typography variant="body2">
                  {row.giftMessage ?? "—"}
                </Typography>
              </Paper>
            </Box>

            {/* 구독 기간/상태 */}
            <Box>
              <Typography sx={sectionTitleSx}>구독 사용 정보</Typography>
              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <Typography sx={labelSx}>시작일</Typography>
                  <Typography sx={valueSx}>
                    {formatKST(row.subscriptionStart)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={labelSx}>종료일</Typography>
                  <Typography sx={valueSx}>
                    {formatKST(row.subscriptionEnd)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={labelSx}>상태</Typography>
                  <Chip
                    size="small"
                    color={chipColor}
                    label={row.usageStatus}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  {/* <Typography sx={labelSx}>일일 잔여</Typography> */}
                  <Typography sx={valueSx}>{row.dailyRemainCount}</Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* 구독권 기본정보 */}
            <Box>
              <Typography sx={sectionTitleSx}>구독권 정보</Typography>
              <List dense disablePadding sx={{ mt: 0.5 }}>
                <ListItem disableGutters sx={{ py: 0.5 }}>
                  <ListItemText
                    primaryTypographyProps={{ sx: labelSx }}
                    primary="구독권"
                    secondaryTypographyProps={{ sx: valueSx }}
                    secondary={row.subscriptionName}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.5 }}>
                  <ListItemText
                    primaryTypographyProps={{ sx: labelSx }}
                    primary="가격"
                    secondaryTypographyProps={{ sx: valueSx }}
                    secondary={currency(row.price)}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.5 }}>
                  <ListItemText
                    primaryTypographyProps={{ sx: labelSx }}
                    primary="구독 기간"
                    secondaryTypographyProps={{ sx: valueSx }}
                    secondary={`${row.subscriptionPeriod}일`}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.5 }}>
                  <ListItemText
                    primaryTypographyProps={{ sx: labelSx }}
                    // primary="일일 잔여"
                    secondaryTypographyProps={{ sx: valueSx }}
                    secondary={String(row.dailyRemainCount)}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.5 }}>
                  <ListItemText
                    primaryTypographyProps={{ sx: labelSx }}
                    primary="매장"
                    secondaryTypographyProps={{ sx: valueSx }}
                    secondary={row.storeName}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.5 }}>
                  <ListItemText
                    primaryTypographyProps={{ sx: labelSx }}
                    primary="타입"
                    secondaryTypographyProps={{ sx: valueSx }}
                    secondary={
                      <Chip
                        size="small"
                        color={
                          row.subscriptionType === "BASIC"
                            ? "success"
                            : "default"
                        }
                        label={row.subscriptionType}
                      />
                    }
                  />
                </ListItem>
              </List>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: "auto",
        padding: 2,
        backgroundColor: "white",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          내 선물함
        </Typography>
      </Box>

      <Tabs
        value={filter}
        onChange={(_, v) => setFilter(v)}
        sx={{ borderBottom: 1, borderColor: "divider", mt: 0.5, mb: 1 }}
      >
        <Tab value="ALL" label="전체" />
        <Tab value="RECEIVED" label="받은선물" />
        <Tab value="SENT" label="보낸선물" />
      </Tabs>

      {/* SENT 탭: getSendGiftData 기반 렌더링 */}
      {filter === "SENT" &&
        filteredGiftList.map((item, index) => {
          const bold = { fontWeight: "bold", color: "black" };
          const messageNode = (
            <>
              <Typography component="span" sx={bold}>
                {item.receiver}
              </Typography>
              &nbsp;님께&nbsp;
              <Typography component="span" sx={bold}>
                {item.subscriptionName}
              </Typography>
              을 선물했습니다!
            </>
          );
          const handleClick = () =>
            setOpenIndex(openIndex === index ? null : index);

          return (
            <Box key={item.purchaseId ?? index} sx={{ mb: 1 }}>
              <Button
                fullWidth
                variant="text"
                onClick={handleClick}
                sx={{
                  p: 0,
                  justifyContent: "flex-start",
                  textTransform: "none",
                }}
              >
                <GiftListItem
                  messageComponent={messageNode}
                  date={formatKST(item.paidAt)}
                  isSent={true}
                />
              </Button>

            <Collapse in={openIndex === index} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 1, pr: 1, pb: 1 }}>
                <SubscriptionDetailCard
                  subscriptionData={{
                    storeName: item.storeName,
                    subscriptionType: item.subscriptionType,
                    price: item.price,
                    subscriptionDesc: item.subscriptionName,
                    subscriptionPeriod: item.subscriptionPeriod,
                    subscriptionStart: item.subscriptionStart || item.paidAt,
                    subscriptionEnd: item.subscriptionEnd,
                    menuNameList: extractMenuNames(item.menuList),
                    dailyRemainCount: item.maxDailyUsage,
                    receiver: item.receiver,
                  }}
                  subscriptionType={item.subscriptionType}
                  maxDailyUsage={item.maxDailyUsage}
                  giftType="SENT"
                  isGifted={true}
                  isExpired={item.isExpired}
                />
              </Box>
            </Collapse>
          </Box>
        );
      })}

      {/* RECEIVED 탭: getReceievGiftData 기반 렌더링 */}
      {filter === "RECEIVED" &&
        filteredGiftList.map((item, index) => {
          const bold = { fontWeight: "bold", color: "black" };
          const messageNode = (
            <>
              <Typography component="span" sx={bold}>
                {item.sender}
              </Typography>
              님께&nbsp;
              <Typography component="span" sx={bold}>
                {item.subscriptionName}
              </Typography>
              을 선물받았습니다!
            </>
          );
          const handleClick = () =>
            setOpenIndex(openIndex === index ? null : index);

          return (
            <Box key={item.memberSubscriptionId ?? index} sx={{ mb: 1 }}>
              <Button
                fullWidth
                variant="text"
                onClick={handleClick}
                sx={{
                  p: 0,
                  justifyContent: "flex-start",
                  textTransform: "none",
                }}
              >
                <GiftListItem
                  messageComponent={messageNode}
                  date={formatKST(item.subscriptionStart)}
                  isSent={false}
                />
              </Button>

            <Collapse in={openIndex === index} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 1, pr: 1, pb: 1 }}>
                <SubscriptionDetailCard
                  subscriptionData={{
                    storeName: item.storeName,
                    subscriptionType: item.subscriptionType,
                    price: item.price,
                    subscriptionDesc: item.subscriptionName,
                    subscriptionPeriod: item.subscriptionPeriod,
                    subscriptionStart: item.subscriptionStart,
                    subscriptionEnd: item.subscriptionEnd,
                    menuNameList: extractMenuNames(item.menuList),
                    giverName: item.sender,
                    receiver: item.receiver,
                    dailyRemainCount: item.dailyRemainCount,
                    usedAt: item.usedAt,
                    usageStatus: item.usageStatus,
                  }}
                  subscriptionType={item.subscriptionType}
                  maxDailyUsage={item.dailyRemainCount}
                  giftType="RECEIVED"
                  isGifted={true}
                  isExpired={item.usageStatus === 'EXPIRED'}
                  usedAt={item.usedAt}
                  hideCancel={item.usageStatus === 'ACTIVE'}
                  headerExtra={
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      {(() => {
                        const color =
                          item.usageStatus === 'ACTIVE' ? 'success' :
                          (item.usageStatus === 'NOT_ACTIVATED' ? 'default' : 'warning');
                        return <Chip size="small" color={color} label={item.usageStatus} />;
                      })()}
                    </Stack>
                  }
                />
              </Box>
            </Collapse>
          </Box>
        );
      })}

      {/* ALL 탭: 기존 렌더링 유지 (getGiftData 기반) */}
      {filter === "ALL" && filteredGiftList.map((item, index) => {
        const { node, isSent } = formatMessage(item);
        const isMineSent = item.isGift === "N";      // 보낸 선물
        const isMineReceived = item.isGift === "Y";  // 받은 선물
        const canToggle = isMineSent || isMineReceived;

        const handleClick = async () => {
          if (!canToggle) return;
          const next = openIndex === index ? null : index;
          setOpenIndex(next);

          if (next !== null) {
            if (isMineSent && item.purchaseId) {
              await fetchSendDetail(item.purchaseId);
            }
            if (isMineReceived && item.memberSubscriptionId) {
              await fetchReceiveDetail(item.memberSubscriptionId);
            }
          }
        };

        return (
          <Box key={item.purchaseId ?? index} sx={{ mb: 1 }}>
            <Button fullWidth variant="text" onClick={handleClick} sx={{ p: 0, justifyContent: "flex-start", textTransform: "none" }}>
              <GiftListItem
                messageComponent={node}
                date={formatKST(item.createdAt)}
                isSent={isSent}
              />
            </Button>

            {isMineSent && (
              <Collapse in={openIndex === index} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 1, pr: 1, pb: 1 }}>
                  {(() => {
                    const pid = item.purchaseId;
                    const detail = pid ? sendDetailById[pid] : null;

                      if (pid && !detail) {
                        return (
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary", p: 1 }}
                          >
                            {loadingSendDetailId === pid
                              ? "불러오는 중…"
                              : "상세 정보를 불러올 수 없습니다."}
                          </Typography>
                        );
                      }

                    // detail이 있으면 SENT 탭 카드와 동일한 구성으로 표시
                    return detail ? (
                      <SubscriptionDetailCard
                        subscriptionData={{
                          storeName: detail.storeName,
                          subscriptionType: detail.subscriptionType,
                          price: detail.price,
                          subscriptionDesc: detail.subscriptionName,
                          subscriptionPeriod: detail.subscriptionPeriod,
                          subscriptionStart: detail.subscriptionStart || detail.paidAt,
                          subscriptionEnd: detail.subscriptionEnd,
                          menuNameList: extractMenuNames(detail.menuList),
                          dailyRemainCount: detail.maxDailyUsage,
                          receiver: detail.receiver,
                        }}
                        subscriptionType={detail.subscriptionType}
                        maxDailyUsage={detail.maxDailyUsage}
                        giftType="SENT"
                        isGifted={true}
                        isExpired={detail.isExpired}
                      />
                    ) : null;
                  })()}
                </Box>
              </Collapse>
            )}

            {isMineReceived && (
              <Collapse in={openIndex === index} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 1, pr: 1, pb: 1 }}>
                  {(() => {
                    const msid = item.memberSubscriptionId;
                    const detail = msid ? receiveDetailById[msid] : null;

                      if (msid && !detail) {
                        return (
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary", p: 1 }}
                          >
                            {loadingReceiveDetailId === msid
                              ? "불러오는 중…"
                              : "상세 정보를 불러올 수 없습니다."}
                          </Typography>
                        );
                      }

                    return detail ? (
                      <SubscriptionDetailCard
                        subscriptionData={{
                          storeName: detail.storeName,
                          subscriptionType: detail.subscriptionType,
                          price: detail.price,
                          subscriptionDesc: detail.subscriptionName,
                          subscriptionPeriod: detail.subscriptionPeriod,
                          subscriptionStart: detail.subscriptionStart,
                          subscriptionEnd: detail.subscriptionEnd,
                          menuNameList: extractMenuNames(detail.menuList),
                          giverName: detail.sender,
                          receiver: detail.receiver,
                          dailyRemainCount: detail.dailyRemainCount,
                          usedAt: detail.usedAt,
                          usageStatus: detail.usageStatus,
                        }}
                        subscriptionType={detail.subscriptionType}
                        maxDailyUsage={detail.dailyRemainCount}
                        giftType="RECEIVED"
                        isGifted={true}
                        isExpired={detail.usageStatus === 'EXPIRED'}
                        usedAt={detail.usedAt}
                        hideCancel={detail.usageStatus === 'ACTIVE'}
                        headerExtra={
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                            {(() => {
                              const color =
                                detail.usageStatus === 'ACTIVE' ? 'success' :
                                (detail.usageStatus === 'NOT_ACTIVATED' ? 'default' : 'warning');
                              return <Chip size="small" color={color} label={detail.usageStatus} />;
                            })()}
                          </Stack>
                        }
                      />
                    ) : null;
                  })()}
                </Box>
              </Collapse>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default MyGift;
