import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { withdrawal } from "../../utils/member";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import WcIcon from "@mui/icons-material/Wc";
import EmailIcon from "@mui/icons-material/Email";
import withdrawal01 from "../../assets/withdrawal_01.png";
import withdrawal02 from "../../assets/withdrawal_02.png";
import withdrawal03 from "../../assets/withdrawal_03.png";
import withdrawal04 from "../../assets/withdrawal_04.png";
import useUserStore from "../../stores/useUserStore";

function Profile() {
  const { authUser, clearUser } = useUserStore();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: authUser?.name || "",
    tel: authUser?.tel || "",
    gender: authUser?.gender || "",
    email: authUser?.email || "",
  });

  useEffect(() => {
    if (!authUser) return;

    setUser((prev) => ({
      ...prev,
      name: authUser.name ?? prev.name,
      tel: authUser.tel ?? prev.tel,
      gender: authUser.gender ?? prev.gender,
      email: authUser.email ?? prev.email,
    }));
  }, [authUser]);

  const [isWithdrawCompleted, setIsWithdrawCompleted] = useState(false);

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(1);
  const REQUIRED_WITHDRAW_TEXT = "안녕 호모 커피엔스";
  const [withdrawInput, setWithdrawInput] = useState("");

  const handleOpenWithdraw = () => {
    setIsWithdrawOpen(true);
    setWithdrawStep(1);
    setWithdrawInput("");
  };
  const handleGoodbyeConfirm = () => {
    // 이 함수의 내용은 Withdrawal.jsx 로 이전되었습니다.
  };
  const handleCloseWithdraw = () => {
    setIsWithdrawOpen(false);
  };

  const handleNextStep = () => {
    setWithdrawStep((prev) => (prev < 4 ? prev + 1 : prev));
  };

  const handlePrevStep = () => {
    setWithdrawStep((prev) => (prev > 1 ? prev - 1 : prev));
  };
  const handleClickWithdrawConfirm = () => {
    // 먼저 문구 검증
    if (withdrawInput.trim() !== REQUIRED_WITHDRAW_TEXT) {
      window.alert("탈퇴를 원하시면 안내된 문구를 정확히 입력해주세요.");
      return;
    }

    const confirmed = window.confirm("정말 탈퇴하시겠습니까?");
    if (!confirmed) return;

    // 사용자가 확인을 눌렀을 때만 실제 탈퇴 로직 실행
    handleWithdrawConfirm();
  };
  const handleWithdrawConfirm = async () => {
    try {
      const success = await withdrawal();
      console.log("withdrawal 결과:", success);
      if (success) {
        // 탈퇴 완료: 탈퇴 모달 닫고, Withdrawal 페이지로 이동
        setIsWithdrawOpen(false);
        setIsWithdrawCompleted(true);
        navigate("/withdrawal", { replace: true });
      } else {
        alert("탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("withdrawal 오류:", error);
      alert("탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  if (isWithdrawCompleted) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#fffdf7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 480,
            borderRadius: 4,
            boxShadow: 6,
            bgcolor: "white",
          }}
        >
          <CardContent
            sx={{
              px: 4,
              py: 5,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                mb: 2,
              }}
            >
              언젠간 다시 돌아오세요
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: "primary.main",
              }}
            >
              커피엔스의 커피 세상으로
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mb: 4, lineHeight: 1.7 }}
            >
              매일의 커피 한 잔으로 하루를 진화시키던 그 시간들처럼,
              <br />
              언젠가 다시, 당신의 하루를 깨우는 커피 한 잔이 필요해질 때
              <br />
              COFFIENS 여기에서 기다리고 있을게요.
            </Typography>

            <Button
              variant="contained"
              onClick={handleGoodbyeConfirm}
              sx={{
                borderRadius: 999,
                px: 4,
                py: 1.2,
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              확인
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "70vh",
        bgcolor: "white",
        display: "flex",
        justifyContent: "center",
        px: 2,
        py: 4,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 4,
          boxShadow: 4,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {user.name}
            </Typography>
          </Box>
        </Box>

        <Divider />

        <CardContent sx={{ px: 3, py: 2.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "text.secondary", mb: 1 }}
          >
            기본 정보
          </Typography>

          <Box
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: (theme) =>
                theme.palette.mode === "light"
                  ? "background.paper"
                  : "background.default",
              overflow: "hidden",
            }}
          >
            <List disablePadding>
              <ListItem
                sx={{
                  px: 2.5,
                  py: 1.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PersonIcon sx={{ opacity: 0.8 }} />
                </ListItemIcon>
                <ListItemText
                  primary="이름"
                  secondary={user.name}
                  primaryTypographyProps={{
                    variant: "caption",
                    color: "text.secondary",
                  }}
                  secondaryTypographyProps={{
                    variant: "body2",
                    sx: { fontWeight: 500, mt: 0.2 },
                  }}
                />
              </ListItem>

              <Divider component="li" />

              <ListItem
                sx={{
                  px: 2.5,
                  py: 1.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PhoneIphoneIcon sx={{ opacity: 0.8 }} />
                </ListItemIcon>
                <ListItemText
                  primary="전화번호"
                  secondary={user.tel}
                  primaryTypographyProps={{
                    variant: "caption",
                    color: "text.secondary",
                  }}
                  secondaryTypographyProps={{
                    variant: "body2",
                    sx: { fontWeight: 500, mt: 0.2 },
                  }}
                />
              </ListItem>

              <Divider component="li" />

              <ListItem
                sx={{
                  px: 2.5,
                  py: 1.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <WcIcon sx={{ opacity: 0.8 }} />
                </ListItemIcon>
                <ListItemText
                  primary="성별"
                  secondary={user.gender === "M" ? "남자" : "여자"}
                  primaryTypographyProps={{
                    variant: "caption",
                    color: "text.secondary",
                  }}
                  secondaryTypographyProps={{
                    variant: "body2",
                    sx: { fontWeight: 500, mt: 0.2 },
                  }}
                />
              </ListItem>

              <Divider component="li" />

              <ListItem
                sx={{
                  px: 2.5,
                  py: 1.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <EmailIcon sx={{ opacity: 0.8 }} />
                </ListItemIcon>
                <ListItemText
                  primary="이메일"
                  secondary={user.email}
                  primaryTypographyProps={{
                    variant: "caption",
                    color: "text.secondary",
                  }}
                  secondaryTypographyProps={{
                    variant: "body2",
                    sx: { fontWeight: 500, mt: 0.2, wordBreak: "break-all" },
                  }}
                />
              </ListItem>
            </List>
          </Box>
        </CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            px: 3,
            pb: 3,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={handleOpenWithdraw}
            sx={{
              color: "#555",
              borderColor: "#555",
            }}
          >
            탈퇴하기
          </Button>
        </Box>
      </Card>
      <Dialog
        open={isWithdrawOpen}
        onClose={handleCloseWithdraw}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: 500,
            height: "90vh",
            borderRadius: 4,
            bgcolor: "#ffffff",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 18,
            pb: 1,
            px: 3,
          }}
        >
          계정 탈퇴 전, 한 번만 더 확인해주세요
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {/* 탈퇴 안내 이미지 - 단계별로 변경 */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              pt: 3,
            }}
          >
            <Box
              component="img"
              src={
                withdrawStep === 1
                  ? withdrawal01
                  : withdrawStep === 2
                  ? withdrawal02
                  : withdrawStep === 3
                  ? withdrawal03
                  : withdrawal04
              }
              alt={`탈퇴 안내 ${withdrawStep}`}
              sx={{
                width: "100%",
                maxWidth: 320,
                borderRadius: 2,
              }}
            />
          </Box>

          {/* 단계별 안내 내용 */}
          <Box
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {withdrawStep === 1 && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  당신의 하루를 진화시키는 커피 구독,
                  <br />
                  정말 떠나시겠어요?
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  사장님께 힘이 되었던 당신의 방문과, 당신의 하루를 현명하게
                  만들었던 그 커피 구독 혜택을 다시 한번 생각해 주세요
                </Typography>
              </>
            )}
            {withdrawStep == 2 && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  정말 탈퇴하시겠습니까?
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mb: 2 }}
                >
                  탈퇴 후에는 보유 중인 구독권, 쿠폰, 적립 내역이 모두 삭제되며
                  복구가 불가능합니다.
                  <br />
                  특히 자주 가는 동네 카페의 구독권 혜택을 더 이상 이용하실 수
                  없습니다.
                </Typography>
                <TextField
                  fullWidth
                  type="text"
                  label="탈퇴를 원하시면 [안녕 호모 커피엔스]를 입력해주세요"
                  variant="outlined"
                  value={withdrawInput}
                  onChange={(e) => setWithdrawInput(e.target.value)}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Button onClick={handleCloseWithdraw}>탈퇴하지 않을래요</Button>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                flexGrow: 1,
              }}
            >
              {[1, 2].map((step) => (
                <Box
                  key={step}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: step <= withdrawStep ? "primary.main" : "grey.300",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button onClick={handlePrevStep} disabled={withdrawStep === 1}>
                이전
              </Button>
              {withdrawStep < 2 ? (
                <Button variant="contained" onClick={handleNextStep}>
                  다음
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleClickWithdrawConfirm}
                >
                  탈퇴하기
                </Button>
              )}
            </Box>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Profile;
