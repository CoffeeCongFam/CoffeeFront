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

  // ✅ 공통: 사용 내역 및 환불 여부 정규화
  const normalizeUsageAndRefund = (src) => {
    if (!src || typeof src !== "object") {
      return { usedAt: [], isRefunded: false };
    }

    const usageHistoryList = Array.isArray(src.usageHistoryList)
      ? src.usageHistoryList
      : [];

    const usedAtArray = usageHistoryList
      .map((u) => (u && u.usedAt ? u.usedAt : null))
      .filter(Boolean);

    const usedAt = usedAtArray.length > 0
      ? usedAtArray
      : Array.isArray(src.usedAt)
      ? src.usedAt
      : [];

    const isRefunded =
      typeof src.isRefunded === "boolean"
        ? src.isRefunded
        : !!(src.refundedAt && String(src.refundedAt).trim() !== "");

    return { usedAt, isRefunded };
  };

  // ✅ 공통: 메뉴 리스트 정규화
  const normalizeMenuList = (src) => {
    if (!src || typeof src !== "object") return [];
    const raw = Array.isArray(src.menuList)
      ? src.menuList
      : Array.isArray(src.menuNameList)
      ? src.menuNameList
      : [];
    return raw;
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
import useUserStore from "../../stores/useUserStore"; 

function MyGift() {
  const { authUser } = useUserStore();
  const memberId = authUser?.memberId ?? 105;
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
      const normalized = list.map((it) => {
        const { usedAt, isRefunded } = normalizeUsageAndRefund(it);

        return {
          ...it,
          usedAt,
          isRefunded,
          maxDailyUsage: it.maxDailyUsage ?? it.dailyRemainCount ?? 0,
          menuList: normalizeMenuList(it),
        };
      });
      setSentGiftList(normalized);
    })();
  }, [filter]);

  useEffect(() => {
    if (filter !== "RECEIVED") return;
    (async () => {
      const res = await getReceievGiftData();
      const list = extractListFromResponse(res);
      const normalized = list.map((it) => {
        const { usedAt, isRefunded } = normalizeUsageAndRefund(it);

        return {
          ...it,
          usedAt,
          isRefunded,
          menuList: normalizeMenuList(it),
          dailyRemainCount:
            typeof it.dailyRemainCount === "number"
              ? it.dailyRemainCount
              : it.maxDailyUsage ?? 0,
        };
      });
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

      const { usedAt, isRefunded } = normalizeUsageAndRefund(data);

      const normalized = {
        ...data,
        usedAt,
        isRefunded,
        maxDailyUsage: data.maxDailyUsage ?? data.dailyRemainCount ?? 0,
        menuList: normalizeMenuList(data),
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

      const { usedAt, isRefunded } = normalizeUsageAndRefund(obj);

      const normalized = {
        ...obj,
        usedAt,
        isRefunded,
        menuList: normalizeMenuList(obj),
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


  // ✅ 탭 필터링
  const filteredGiftList = useMemo(() => {
    if (filter === "RECEIVED") return receivedGiftList; // RECEIVED 탭은 getReceievGiftData 결과만 사용
    if (filter === "SENT") return sentGiftList; // SENT 탭은 getSendGiftData 결과만 사용
    return baseList; // ALL
  }, [filter, baseList, sentGiftList, receivedGiftList]);

  // ✅ 문구 생성 (ALL 탭) - memberId / senderId / receiverId 기반
  const formatMessage = (item, memberId) => {
    const bold = { fontWeight: "bold", color: "black" };

    const normalizeId = (v) => {
      if (v === undefined || v === null || v === "") return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    };

    const mId = normalizeId(memberId);
    const sId = normalizeId(item.senderId);
    const rId = normalizeId(item.receiverId);

    // receiverId 와 memberId 를 기준으로 판별:
    //  - 같으면: 내가 받은 선물
    //  - 다르면: 내가 보낸 선물로 간주
    const isMineReceived = mId !== null && rId !== null && mId === rId;
    const isMineSent =
      mId !== null && rId !== null && mId !== rId;

    // 내가 받은 선물: sender -> 나 (receiverId === memberId)
    if (isMineReceived) {
      return {
        isSent: false,
        isMineSent,
        isMineReceived,
        node: (
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
        ),
      };
    }

    // 내가 보낸 선물: 나(senderId) -> 상대(receiverId)
    if (isMineSent) {
      return {
        isSent: true,
        isMineSent,
        isMineReceived,
        node: (
          <>
            <Typography component="span" sx={bold}>
              {item.receiver}
            </Typography>
            님께&nbsp;
            <Typography component="span" sx={bold}>
              {item.subscriptionName}
            </Typography>
            을 선물했습니다!
          </>
        ),
      };
    }

    // 기타: 나와 직접적인 매칭이 없는 선물 기록 (안전망)
    return {
      isSent: false,
      isMineSent,
      isMineReceived,
      node: (
        <>
          <Typography component="span" sx={bold}>
            {item.sender}
          </Typography>
          님이&nbsp;
          <Typography component="span" sx={bold}>
            {item.receiver}
          </Typography>
          님께&nbsp;
          <Typography component="span" sx={bold}>
            {item.subscriptionName}
          </Typography>
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


  return (
    <Box
      sx={{
        width: "100%",
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

      {/* 데이터가 없을 때 표시할 메시지 */}
      {filteredGiftList.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            선물 내역이 존재하지 않습니다.
          </Typography>
        </Box>
      )}

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
                      usedAt: item.usedAt,
                      refundedAt: item.refundedAt,
                      isRefunded: item.isRefunded,
                      purchaseId: item.purchaseId,
                    }}
                    purchaseId={item.purchaseId}
                    subscriptionType={item.subscriptionType}
                    maxDailyUsage={item.maxDailyUsage}
                    giftType="SENT"
                    isGifted={true}
                    isExpired={item.isExpired}
                    usedAt={item.usedAt}
                    refundedAt={item.refundedAt}
                    isRefunded={item.isRefunded}
                    onRefundSuccess={(pid, refundedAtFromApi) => {
                      setSentGiftList((prev) =>
                        prev.map((g) =>
                          g.purchaseId === pid
                            ? {
                                ...g,
                                isRefunded: true,
                                refundedAt:
                                  refundedAtFromApi ??
                                  g.refundedAt ??
                                  new Date().toISOString(),
                              }
                            : g
                        )
                      );
                    }}
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
                    refundedAt: item.refundedAt,
                    isRefunded: item.isRefunded,
                    purchaseId: item.purchaseId,
                  }}
                  purchaseId={item.purchaseId}
                  subscriptionType={item.subscriptionType}
                  maxDailyUsage={item.dailyRemainCount}
                  giftType="RECEIVED"
                  isGifted={true}
                  isExpired={item.usageStatus === 'EXPIRED'}
                  usedAt={item.usedAt}
                  refundedAt={item.refundedAt}
                  isRefunded={item.isRefunded}
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
                  onRefundSuccess={(pid, refundedAtFromApi) => {
                    setReceivedGiftList((prev) =>
                      prev.map((g) =>
                        g.purchaseId === pid
                          ? {
                              ...g,
                              isRefunded: true,
                              refundedAt:
                                refundedAtFromApi ??
                                g.refundedAt ??
                                new Date().toISOString(),
                            }
                          : g
                      )
                    );
                  }}
                />
              </Box>
            </Collapse>
          </Box>
        );
      })}

      {/* ALL 탭: getGiftData 기반, memberId / senderId / receiverId로 분기 */}
      {filter === "ALL" && filteredGiftList.map((item, index) => {
        const { node, isSent, isMineSent, isMineReceived } = formatMessage(item, memberId);
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
                          usedAt: detail.usedAt,
                          refundedAt: detail.refundedAt,
                          isRefunded: detail.isRefunded,
                          purchaseId: detail.purchaseId,
                        }}
                        purchaseId={item.purchaseId} // 목록에서 받은 purchaseId 사용
                        subscriptionType={detail.subscriptionType}
                        maxDailyUsage={detail.maxDailyUsage}
                        giftType="SENT"
                        isGifted={true}
                        isExpired={detail.isExpired}
                        usedAt={detail.usedAt}
                        refundedAt={detail.refundedAt}
                        isRefunded={detail.isRefunded}
                        onRefundSuccess={(pid, refundedAtFromApi) => {
                          // detail 캐시 갱신
                          setSendDetailById((prev) => {
                            const target = prev[pid];
                            if (!target) return prev;
                            const updated = {
                              ...target,
                              isRefunded: true,
                              refundedAt:
                                refundedAtFromApi ??
                                target.refundedAt ??
                                new Date().toISOString(),
                            };
                            return { ...prev, [pid]: updated };
                          });
                          // SENT 탭 리스트도 함께 갱신
                          setSentGiftList((prev) =>
                            prev.map((g) =>
                              g.purchaseId === pid
                                ? {
                                    ...g,
                                    isRefunded: true,
                                    refundedAt:
                                      refundedAtFromApi ??
                                      g.refundedAt ??
                                      new Date().toISOString(),
                                  }
                                : g
                            )
                          );
                        }}
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
                          refundedAt: detail.refundedAt,
                          isRefunded: detail.isRefunded,
                          purchaseId: detail.purchaseId,
                        }}
                        purchaseId={item.purchaseId} // 목록에서 받은 purchaseId 사용
                        subscriptionType={detail.subscriptionType}
                        maxDailyUsage={detail.dailyRemainCount}
                        giftType="RECEIVED"
                        isGifted={true}
                        isExpired={detail.usageStatus === 'EXPIRED'}
                        usedAt={detail.usedAt}
                        refundedAt={detail.refundedAt}
                        isRefunded={item.isRefunded} // detail 대신 list item의 isRefunded를 직접 사용
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
                        onRefundSuccess={(pid, refundedAtFromApi, msid) => {
                          // 모든 상태 업데이트를 giftList(원본 데이터) 기준으로 단일화
                          const updateItem = (g) => {
                            if (g.purchaseId !== pid) return g;
                            return {
                              ...g,
                              isRefunded: true,
                              refundedAt:
                                refundedAtFromApi ??
                                g.refundedAt ??
                                new Date().toISOString(),
                            };
                          };
                          setGiftList(prev => prev.map(updateItem));
                          setReceivedGiftList(prev => prev.map(updateItem));
                          setSentGiftList(prev => prev.map(updateItem));
                        }}
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
