import {
  Box,
  IconButton,
  Typography,
  Fade,
  Backdrop,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ForwardIcon from "@mui/icons-material/Forward";
import ErrorIcon from "@mui/icons-material/Error";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SubscriptItem from "../../components/customer/purchase/SubscriptionItem";
import SearchGiftReceiver from "../../components/customer/purchase/SearchGiftReceiver";
import useAppShellMode from "../../hooks/useAppShellMode";
import {
  fetchSubscriptionInfo,
  findReceiver,
  requestPurchase,
} from "../../apis/customerApi";
import useUserStore from "../../stores/useUserStore";
import axios from "axios";

function GiftSubscriptionPage() {
  const { isAppLike } = useAppShellMode();
  const authUser = useUserStore((state) => state.authUser);
  const { subId } = useParams();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [searchOpen, setSearchOpen] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [giftMessage, setGiftMessage] = useState("");

  async function fetchSubData() {
    const subData = await fetchSubscriptionInfo(subId);
    console.log(subData);
    setSubscription(subData);
  }

  useEffect(() => {
    console.log(subId + "로 구독권 정보 가져오기");
    fetchSubData();
  }, [subId]);

  function handleBack() {
    navigate(-1);
  }

  async function confirmPayment(pg = "danal_tpay") {
    // ✅ 받는 사람 유효성 검증 추가
    if (!receiver) {
      alert("받는 사람을 먼저 선택해 주세요.");
      setPayOpen(false);
      return;
    }

    setIsLoading(true);
    setPayOpen(false);

    try {
      const payload = {
        subscriptionId: subscription.subscriptionId,
        receiverMemberId: receiver.memberId,
        giftMessage: giftMessage?.trim() || "선물 드려요 ☕",
      };

      const created = await requestPurchase(payload);
      const merchantUid = created.merchantUid;

      const { IMP } = window;

      if (!IMP) {
        throw new Error("PortOne SDK가 로드되지 않았습니다.");
      }

      IMP.init("imp03140165");

      IMP.request_pay(
        {
          pg,
          pay_method: "card",
          amount: subscription.price,
          name: subscription.subscriptionName,
          merchant_uid: merchantUid,
          buyer_name: authUser.name,
          buyer_email: authUser.email,
          buyer_tel: authUser.tel,
        },
        async (response) => {
          if (response.success) {
            console.log("결제 성공:", response);

            try {
              const validationRes = await axios.post("/api/payments/validation", {
                purchaseId: created.purchaseId,
                impUid: response.imp_uid,
                merchantUid: response.merchant_uid,
              });

              console.log("검증 성공:", validationRes.data);
              navigate(`/me/purchase/${created.purchaseId}/complete`);
            } catch (error) {
              console.error("결제 검증 실패:", error);
              alert("결제 검증에 실패했습니다. 결제가 승인되지 않았습니다.");
            }
          } else {
            alert(`결제 실패: ${response.error_msg}`);
          }
          setIsLoading(false); // ✅ 콜백 내부에서 로딩 해제
        }
      );
    } catch (error) {
      console.error("결제 요청 오류:", error);
      alert("결제 요청 중 문제가 발생했습니다.");
      setIsLoading(false);
    }
  }

  async function handleSearch(inputPhone) {
    console.log("검색할 전화번호", inputPhone);
    if (authUser.tel === inputPhone) {
      alert("자기 자신에게 선물을 보낼 수는 없어요.");
      return;
    }
    const payload = { tel: inputPhone };
    const findMember = await findReceiver(payload);
    setReceiver(findMember);
  }

  function handleSelectReceiver(member) {
    setReceiver(member);
    setSearchOpen(false);
  }

  return (
    <>
      <Box
        sx={{
          p: 3,
          pb: isAppLike ? "100px" : 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* 뒤로가기 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: 900,
          }}
        >
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>

        {/* 제목 */}
        <Box sx={{ textAlign: "center", mb: 2, width: "100%", maxWidth: 900 }}>
          <Typography variant="h6">선물하기</Typography>
        </Box>

        {/* 선택한 구독권 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: 900,
            mt: 2,
            gap: 2,
          }}
        >
          <SubscriptItem subscription={subscription} />

          {/* 보내는 사람 / 받는 사람 */}
          <Box
            sx={{
              display: "flex",
              flexDirection: isAppLike ? "column" : "row",
              gap: 2,
              width: "100%",
              maxWidth: "900px",
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            {/* 보내는 사람 */}
            <Box
              sx={{
                flex: 1,
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>보내는 사람</Typography>
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  backgroundColor: "#f6f6f6ff",
                  borderRadius: "10px",
                  height: "fit-content",
                  padding: "15px 25px",
                }}
              >
                <AccountCircleIcon />
                {authUser?.name}
              </Box>
            </Box>

            <Box
              sx={{
                width: 40,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ForwardIcon />
            </Box>

            {/* 받는 사람 */}
            <Box
              sx={{
                flex: 1,
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>받는 사람</Typography>
              {receiver && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1.2,
                    borderRadius: 1,
                    backgroundColor: "#f4f4f4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    height: "fit-content",
                    padding: "15px 25px",
                  }}
                >
                  <Box sx={{ display: "flex", gap: "10px" }}>
                    <AccountCircleIcon />
                    <Typography>{receiver.name}</Typography>
                  </Box>
                  <IconButton
                    onClick={() => {
                      setSearchOpen(true);
                      setReceiver(null);
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                </Box>
              )}
              {receiver === null && searchOpen && (
                <SearchGiftReceiver
                  keyword={keyword}
                  setKeyword={setKeyword}
                  handleSearch={handleSearch}
                />
              )}

              {receiver === null && searchResults.length > 0 && (
                <Box
                  sx={{
                    mt: 1,
                    border: "1px solid #eee",
                    borderRadius: 1,
                    backgroundColor: "white",
                    maxHeight: 180,
                    overflowY: "auto",
                  }}
                >
                  {searchResults.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 1.2,
                        py: 1,
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "#f9f9f9",
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.phone}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        onClick={() => handleSelectReceiver(item)}
                      >
                        선택
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* 선물 메시지 입력 영역 */}
          <Box sx={{ mt: 1, width: "100%", maxWidth: 900 }}>
            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
              메시지 카드
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              placeholder="선물과 함께 보낼 메시지를 입력하세요. (최대 100자)"
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value.slice(0, 100))}
            />
          </Box>
        </Box>

        {/* 유의사항 */}
        <Box
          sx={{
            mt: 3,
            width: "100%",
            maxWidth: 900,
            bgcolor: "#fffef6",
            border: "1px solid #fff2c5",
            borderRadius: 2,
            py: 2,
            px: 5,
            textAlign: "left",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <ErrorIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              유의사항
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              • 본 구독권은 {subscription?.store?.storeName} 매장 전용으로 사용
              가능합니다.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 결제일 기준 30일간 이용 가능하며, 중도 해지는 불가합니다.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 1일 {subscription?.maxDailyUsage}회 제공 기준이며, 일부 메뉴는
              추가 금액이 발생할 수 있습니다.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 선물하기로 받은 구독권은 양도가 제한될 수 있습니다.
            </Typography>
          </Box>
        </Box>

        {/* 하단 결제 버튼 */}
        <Box
          sx={{
            mt: 4,
            width: "100%",
            maxWidth: 900,
            display: "flex",
            justifyContent: "right",
          }}
        >
          <Button
            onClick={() => {
              if (!receiver) {
                alert("받는 사람을 먼저 선택해 주세요.");
                return;
              }
              setPayOpen(true);
            }}
            sx={{
              backgroundColor: "black",
              color: "white",
              px: 4,
              "&:hover": { backgroundColor: "#333" },
            }}
          >
            선물 보내기
          </Button>
        </Box>
      </Box>

      {/* 결제 선택 패널 */}
      <Backdrop
        open={payOpen}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        onClick={() => setPayOpen(false)}
      >
        <Fade in={payOpen}>
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              mx: "auto",
              maxWidth: 820,
              bgcolor: "#5e5e5e",
              borderRadius: "24px 24px 0 0",
              minHeight: 420,
              px: 3,
              pt: 3,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <IconButton onClick={() => setPayOpen(false)}>
                <CloseIcon sx={{ color: "white" }} />
              </IconButton>
            </Box>

            <Typography
              variant="subtitle1"
              sx={{ color: "white", fontWeight: 600, mb: 2 }}
            >
              결제 수단을 선택하세요
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
                mb: 3,
              }}
            >
              {[
                { label: "신용카드", pg: "danal_tpay" },
                { label: "휴대폰결제", pg: "danal_tpay" },
                { label: "카카오페이", pg: "kakaopay" },
                { label: "스마일페이", pg: "smilepay" },
                { label: "토스페이", pg: "tosspay" },
                { label: "페이코", pg: "payco" },
              ].map((method) => (
                <Box
                  key={method.label}
                  onClick={() => confirmPayment(method.pg)}
                  sx={{
                    bgcolor: "#dcdcdc",
                    border: "4px solid rgba(255,128,0,0.4)",
                    borderRadius: 4,
                    height: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#555",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "#eaeaea",
                      transform: "scale(1.03)",
                      transition: "all 0.2s ease",
                    },
                  }}
                >
                  {method.label}
                </Box>
              ))}
            </Box>
          </Box>
        </Fade>
      </Backdrop>

      {/* 결제 로딩 화면 */}
      <Backdrop
        open={isLoading}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.modal + 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress color="inherit" />
        <Typography variant="body1" sx={{ mt: 1 }}>
          결제 진행 중입니다...
        </Typography>
      </Backdrop>
    </>
  );
}

export default GiftSubscriptionPage;