import React, { useState, useEffect } from "react";
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
import { patchMember } from "../../utils/member";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import WcIcon from "@mui/icons-material/Wc";
import EmailIcon from "@mui/icons-material/Email";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import withdrawal01 from "../../assets/withdrawal_01.png";
import withdrawal02 from "../../assets/withdrawal_02.png";
import withdrawal03 from "../../assets/withdrawal_03.png";
import withdrawal04 from "../../assets/withdrawal_04.png";
import useUserStore from "../../stores/useUserStore";

function Profile() {
  const { authUser, setUser: setAuthUser } = useUserStore();
  const [user, setUser] = useState({
    name: authUser?.name || "",
    tel: authUser?.tel || "",
    gender: authUser?.gender || "",
    email: authUser?.email || "",
  });
  const [saveFeedback, setSaveFeedback] = useState(null); // { type: 'success' | 'error', message: string }

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


  const [isEditing, setIsEditing] = useState(false);

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(1);

  const handleOpenWithdraw = () => {
    setIsWithdrawOpen(true);
    setWithdrawStep(1);
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

  const handleEditClick = () => {
    setIsEditing((prev) => !prev);
  };

  const handleChange = (field) => (event) => {
    let value = event.target.value;
    if (field === "tel") {
      // 숫자만 입력받고, 11자리를 넘지 않도록 처리
      const digitsOnly = value.replace(/\D/g, "");
      value = digitsOnly.slice(0, 11);
    }
    if (field === "name") {
      // 한글과 영어만 입력 가능하도록 필터링
      value = value.replace(/[^a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣]/g, "");
    }
    setUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    // 이전 피드백 초기화
    setSaveFeedback(null);

    try {
      // 이름과 전화번호를 patchMember의 파라미터로 전달
      // patchMember가 (payload) 형태를 받는다고 가정
      const result = await patchMember({
        name: user.name,
        tel: user.tel,
      });

      // 반환값이 boolean 또는 { success: boolean } 둘 다 대응
      const isSuccess = result === true || result?.success === true;

      if (isSuccess) {
        // 수정 성공: alert로 안내 후 실제 데이터(authUser) 갱신
        alert("회원 정보가 수정되었습니다.");

        if (authUser) {
          const updated = { ...authUser, ...user };
          setAuthUser(updated);
          setUser((prev) => ({
            ...prev,
            name: updated.name,
            tel: updated.tel,
          }));
        } else {
          setAuthUser(user);
        }

        // alert 확인 후 편집 모드 해제 -> 변경된 정보가 화면에 반영됨
        setIsEditing(false);
      } else {
        // 반환값이 false인 경우
        setSaveFeedback({
          type: "error",
          message: "프로필 수정에 실패했습니다. 잠시 후 다시 시도해주세요.",
        });
      }
    } catch (error) {
      console.error("patchMember 오류:", error);
      setSaveFeedback({
        type: "error",
        message: "프로필 수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
    }
  };


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
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {user.name}
            </Typography>
          </Box>

          <IconButton
            aria-label="프로필 편집"
            size="small"
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
            onClick={handleEditClick}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
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
                {!isEditing ? (
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
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    label="이름"
                    variant="outlined"
                    value={user.name}
                    onChange={handleChange("name")}
                  />
                )}
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
                {!isEditing ? (
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
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    label="전화번호"
                    variant="outlined"
                    value={user.tel}
                    onChange={handleChange("tel")}
                  />
                )}
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
                  secondary={user.gender === 'M' ? "남자" : "여자"}
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
                    color: "text.secondary"
                  }}
                  secondaryTypographyProps={{
                    variant: "body2",
                    sx: { fontWeight: 500, mt: 0.2, wordBreak: "break-all" },
                  }}
                />
              </ListItem>
            </List>
          </Box>
          {isEditing && (
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={user.name.trim().length < 2 || !user.tel.trim()}
              >
                저장
              </Button>
              {saveFeedback && (
                <Typography
                  variant="caption"
                  color={saveFeedback.type === "error" ? "error" : "primary"}
                  sx={{ mt: 0.5 }}
                >
                  {saveFeedback.message}
                </Typography>
              )}
            </Box>
          )}
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
                  매일의 커피 한 잔이 당신의 하루를 바꾸듯, COFFEIENS는
                  소비자에게는 더 현명한 하루를, 사장님께는 꾸준히 찾아오는
                  단골의 기쁨을 선물합니다.
                </Typography>
              </>
            )}

            {withdrawStep === 2 && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  매일 마시는 커피,
                  <br />
                  이제는 구독으로 더 합리적으로
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  자주 가는 동네 카페의 구독권을 잃지 마세요.
                  <br />
                  한 달 구독으로 매일의 커피를 줄 서지 않고, 더 저렴하게,
                  더 편하게 즐길 수 있습니다.
                </Typography>
              </>
            )}

            {withdrawStep === 3 && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  COFFEIENS 구독자님만이 누릴 수 있는
                  <br />
                  온라인 주문 시스템으로 소중한 시간을 지킬 수 있습니다.
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    COFFEIENS는 당신과 사랑하는 동네 카페 사장님을 이어주는 소중한 연결고리입니다.
                    사장님께 힘이 되었던 당신의 방문과, 당신의 하루를 현명하게 만들었던 
                    그 커피 구독 혜택을 다시 한번 생각해 주세요
                </Typography>
              </>
            )}

            {withdrawStep === 4 && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  정말 탈퇴하시겠습니까?
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mb: 2 }}
                >
                  탈퇴 후에는 보유 중인 구독권, 쿠폰, 적립 내역이 모두
                  삭제되며 복구가 불가능합니다.
                  <br />
                  특히 자주 가는 동네 카페의 구독권 혜택을 더 이상
                  이용하실 수 없습니다.
                </Typography>
                <TextField
                  fullWidth
                  type="text"
                  label="탈퇴를 원하시면 [안녕 호모 커피엔스]를 입력해주세요"
                  variant="outlined"
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
              {[1, 2, 3, 4].map((step) => (
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
              <Button
                onClick={handlePrevStep}
                disabled={withdrawStep === 1}
              >
                이전
              </Button>
              {withdrawStep < 4 ? (
                <Button variant="contained" onClick={handleNextStep}>
                  다음
                </Button>
              ) : (
                <Button variant="contained" color="error">
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
