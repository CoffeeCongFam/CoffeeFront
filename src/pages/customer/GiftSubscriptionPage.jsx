import {
  Box,
  IconButton,
  Typography,
  Fade,
  Backdrop,
  Button,
  CircularProgress,
  TextField,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ForwardIcon from "@mui/icons-material/Forward";
import ErrorIcon from "@mui/icons-material/Error";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
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

// ✅ 결제수단 로고 이미지 import
import kakaopayImg from "../../assets/kakaopay.png";
import tosspayImg from "../../assets/tosspay.png";
import naverpayImg from "../../assets/naverpay.png";
import paycoImg from "../../assets/payco.png";

function formatPhoneInput(value) {
  const digits = (value || "").replace(/\D/g, "").slice(0, 11);

  if (digits.length < 4) return digits;
  if (digits.length < 8) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

const personBoxSx = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  backgroundColor: "#f6f6f6ff",
  borderRadius: "10px",
  px: 3,
  py: 2,
  minHeight: 64,
};

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
  const [selectedMethod, setSelectedMethod] = useState(null);

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

      // (모바일에서는) m_redirect_url = 결제 완료 후 돌아올 내 사이트 주소 필요
      const redirectUrl = `${window.location.origin}/me/purchase/${created.purchaseId}/complete`;

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
          m_redirect_url: redirectUrl,  // 리다이렉트 url 추가
        },
        async (response) => {
          // PC 환경(팝업)에서는 여전히 콜백이 호출됨
           // 모바일 리디렉션 환경에서는 주로 redirectUrl 쪽에서 처리
          if (response.success) {
            console.log("결제 성공:", response);

            try {
              const validationRes = await axios.post(
                "/api/payments/validation",
                {
                  purchaseId: created.purchaseId,
                  impUid: response.imp_uid,
                  merchantUid: response.merchant_uid,
                }
              );

              console.log("검증 성공:", validationRes.data);
              navigate(`/me/purchase/${created.purchaseId}/complete`);
            } catch (error) {
              console.error("결제 검증 실패:", error);
              alert("결제 검증에 실패했습니다. 결제가 승인되지 않았습니다.");
            }
          } else {
            alert(`결제 실패: ${response.error_msg}`);
          }
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("결제 요청 오류:", error);
      alert("결제 요청 중 문제가 발생했습니다.");
      setIsLoading(false);
    }
  }

  async function handleSearch(inputPhone) {
    const onlyNumber = (inputPhone || "").replace(/\D/g, "");
    const myTelDigits = (authUser.tel || "").replace(/\D/g, "");

    console.log("검색할 전화번호(숫자만)", onlyNumber);

    console.log("검색할 전화번호", inputPhone);
    if (myTelDigits && myTelDigits === onlyNumber) {
      alert("자기 자신에게 선물을 보낼 수는 없어요.");
      return;
    }
    const payload = { tel: onlyNumber };
    const findMember = await findReceiver(payload);
    console.log(findMember);
    if (findMember === null) {
      alert("존재하지 않는 회원입니다.");
    }
    setReceiver(findMember);
  }

  function handleSelectReceiver(member) {
    setReceiver(member);
    setSearchOpen(false);
  }

  // ✅ 결제 수단 정보 (디자인 강화)
  const paymentMethods = [
    {
      label: "신용/체크카드",
      pg: "danal_tpay",
      icon: <CreditCardIcon sx={{ fontSize: 28 }} />,
      color: "#4A90E2",
      bgColor: "#E8F4FF",
    },
    {
      label: "휴대폰 결제",
      pg: "danal_tpay",
      icon: <PhoneAndroidIcon sx={{ fontSize: 28 }} />,
      color: "#7B68EE",
      bgColor: "#F0EDFF",
    },
    {
      label: "카카오페이",
      pg: "kakaopay",
      icon: kakaopayImg,
      color: "#FEE500",
      bgColor: "#FFF9C4",
      textColor: "#3C1E1E",
      imgStyle: { width: 100, height: "auto" },
    },
    {
      label: "토스페이",
      pg: "tosspay",
      icon: tosspayImg,
      color: "#0064FF",
      bgColor: "#F4F8FF",
      imgStyle: { width: 120, height: "auto" },
    },
    {
      label: "네이버페이",
      pg: "naverco",
      icon: naverpayImg,
      color: "#03C75A",
      bgColor: "#E8F9F0",
      imgStyle: { width: 70, height: "auto" },
    },
    {
      label: "페이코",
      pg: "payco",
      icon: paycoImg,
      color: "#FF5046",
      bgColor: "#FFEAE8",
      imgStyle: { width: 200, height: "auto" },
    },
  ];

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
        {/* 뒤로가기 + 제목 한 줄에 배치 (제목 가운데 정렬) */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 900,
            mb: isAppLike ? 1 : 5,
            height: 48,
          }}
        >
          {/* 뒤로가기 버튼: 왼쪽 고정 */}
          <IconButton
            onClick={handleBack}
            sx={{
              position: "absolute",
              left: 0,
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          {/* 제목: 중앙 정렬 */}
          <Typography
            variant="h6"
            sx={{ textAlign: "center", flexGrow: 1, fontWeight: "bold" }}
          >
            선물하기
          </Typography>
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
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Box sx={{ width: "100%", maxWidth: "900px" }}>
            <SubscriptItem subscription={subscription}  isAppLike={isAppLike} />
          </Box>
        </Box>

          {/* 보내는 사람 / 받는 사람 */}
          <Box
            sx={{
              display: "flex",
              flexDirection: isAppLike ? "column" : "row",
              gap: isAppLike ? 3 : 2,
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
              <Box sx={personBoxSx}>
                <AccountCircleIcon />
                <Typography>{authUser?.name}</Typography>
              </Box>
            </Box>

            {isAppLike || 
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
            }


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
                    ...personBoxSx,
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                    <AccountCircleIcon />
                    <Typography>{receiver.name}</Typography>
                  </Box>
                  <IconButton
                    onClick={() => {
                      setSearchOpen(true);
                      setReceiver(null);
                    }}
                    sx={{ padding: 0 }}
                  >
                    <SearchIcon />
                  </IconButton>
                </Box>
              )}

              {receiver === null && searchOpen && (
                <SearchGiftReceiver
                  keyword={keyword}
                  setKeyword={(raw) => setKeyword(formatPhoneInput(raw))}
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
            mt: 8,
            width: "100%",
            maxWidth: "900px",
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
            <Typography variant="subtitle2" sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
              유의사항
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column",  gap: 0.5 }}>
            <Typography variant="body2" sx={{fontSize: "0.8rem", }} color="text.secondary">
              • 본 구독권은 {subscription?.store?.storeName} 매장 전용으로 사용
              가능합니다.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{fontSize: "0.8rem", }} >
              • 결제일 기준 30일간 이용 가능하며, 중도 해지는 불가합니다.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{fontSize: "0.8rem", }} >
              • 1일 {subscription?.maxDailyUsage}회 제공 기준이며, 일부 메뉴는
              추가 금액이 발생할 수 있습니다.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{fontSize: "0.8rem", }} >
              • 선물하기로 받은 구독권은 양도가 제한될 수 있습니다.
            </Typography>
          </Box>
        </Box>

        {/* 하단 결제 버튼 */}
        <Box
          sx={{
            mt: 2,
            width: "100%",
            maxWidth: "900px",
            mx: "auto",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            fullWidth={isAppLike}
            onClick={() => {
              if (!receiver) {
                alert("받는 사람을 먼저 선택해 주세요.");
                return;
              }
              setPayOpen(true);
            }}
             sx={{
              borderRadius: isAppLike ? "2rem" : "inherit",
              backgroundColor: "black",
              color: "white",
              px: 4,
              maxWidth: isAppLike ? 480 : "none",
              "&:hover": { backgroundColor: "#333" },
            }}
          >
            선물 보내기
          </Button>
        </Box>
      </Box>

      {/* ✅ 결제수단 선택 패널 */}
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
              bgcolor: "white",
              borderRadius: "24px 24px 0 0",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
              px: 3,
              pt: 2,
              pb: 4,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 4,
                bgcolor: "#E0E0E0",
                borderRadius: 2,
                mx: "auto",
                mb: 2,
              }}
            />

            {/* 닫기 */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
              <IconButton
                onClick={() => setPayOpen(false)}
                size="small"
                sx={{
                  color: "#666",
                  "&:hover": { bgcolor: "#f5f5f5" },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* 안내 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                결제 수단 선택
              </Typography>
              <Typography variant="body2" color="text.secondary">
                안전하고 편리한 결제 수단을 선택하세요
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* ✅ 결제 수단 그리드 */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))", // 3열 고정
                gridAutoRows: 110,                                // 각 행 높이를 110px로 고정
                columnGap: 1.5,
                rowGap: 1.5,
              }}
            >
               {paymentMethods.map((method) => (
                              <Box
                                key={method.label}
                                onClick={() => {
                                  setSelectedMethod(method.label);
                                  setTimeout(() => confirmPayment(method.pg), 200);
                                }}
                                sx={{
                                  bgcolor: method.bgColor,
                                  border: `2px solid ${
                                    selectedMethod === method.label
                                      ? method.color
                                      : "transparent"
                                  }`,
                                  borderRadius: 3,
                                  height: "100%", 
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 1,
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    boxShadow: `0 4px 12px ${method.color}40`,
                                    borderColor: method.color,
                                    transform: "translateY(-3px)",
                                  },
                                }}
                              >
                                {/* 아이콘 */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: 40,
                                  }}
                                >
                                  {React.isValidElement(method.icon) ? (
                                    method.icon
                                  ) : (
                                    <img
                                      src={method.icon}
                                      alt={method.label}
                                      style={{
                                        ...method.imgStyle,
                                        objectFit: "contain",
                                        filter:
                                          method.label === "토스페이"
                                            ? "drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
                                            : "none",
                                      }}
                                    />
                                  )}
                                </Box>
              
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: method.textColor || "#333",
                                    fontSize: 13,
                                  }}
                                >
                                  {method.label}
                                </Typography>
                              </Box>
                            ))}
                          </Box>

            <Box
              sx={{
                bgcolor: "#F8F9FA",
                borderRadius: 2,
                px: 2,
                pt: 1,
                mt: 2,
                pb: 10
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", lineHeight: 1.5 }}
              >
                🔒 모든 결제는 안전하게 암호화되어 처리됩니다
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Backdrop>

      {/* ✅ 결제 로딩 화면 */}
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