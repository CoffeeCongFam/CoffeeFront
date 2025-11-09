import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  ListItemAvatar,
  Avatar,
  Button,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import CoffeeIcon from "@mui/icons-material/Coffee";
import logo from "../assets/coffeiensLogoTitle.png";
import useAppShellMode from "../hooks/useAppShellMode";
import useNotificationStore from "../stores/useNotificationStore";
import { deleteNotification, readNotification } from "../apis/notificationApi";
import NotificationItem from "../components/common/NotificationItem";

const drawerWidth = 240;

const links = [
  { to: "/me", label: "Home", icon: <HomeIcon />, end: true },
  { to: "/me/search", label: "매장 탐색", icon: <SearchIcon /> },
  {
    to: "/me/order/new",
    label: "주문하기",
    icon: <ShoppingCartIcon />,
    end: true,
  },
  {
    to: "/me/order",
    label: "주문 내역",
    icon: <ReceiptLongIcon />,
    end: true,
  },
  { to: "/me/mypage", label: "마이페이지", icon: <PersonIcon /> },
];

export default function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname.startsWith("/me/search");
  const { notifications, unreadCount, markAsRead, deleteAllNotifications } =
    useNotificationStore();
  const { isAppLike } = useAppShellMode(); // 모바일 여부
  const [bottomValue, setBottomValue] = useState(location.pathname);

  const [notifOpen, setNotifOpen] = useState(false); // 알림 토글

  // 페이지 이동 시 알림 드로어 자동 닫기
  useEffect(() => {
    setNotifOpen(false);
  }, [location.pathname]);

  function handleCloseNotif() {
    setNotifOpen(false);
  }
  function openNotifDrawer() {
    setNotifOpen(true);
  }

  // 전체 알림 삭제 요청
  async function handleDeleteAllNotifications() {
    console.log("알림 전체 삭제");

    if (!notifications.length) return;
    const ok = window.confirm("알림을 모두 삭제하시겠습니까?");
    if (!ok) return;
    // 모든 알림 읽음 처리
    try {
      // 서버에 있는 알림들 전부 삭제 요청
      await Promise.all(
        notifications.map((n) => deleteNotification(n.notificationId))
      );

      // 프론트 상태 비우기
      deleteAllNotifications();
    } catch (e) {
      console.error("전체 알림 삭제 실패:", e);
      alert("알림 전체 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }

  // 특정 알림 읽음 처리  + 페이지 이동
  async function handleNotificationClick(noti) {
    const { notificationId, notificationType } = noti;

    console.log("📨 클릭된 알림:", noti);

    // 안 읽은 알림이면 서버에 읽음 처리 + 상태 업데이트
    if (!noti.readAt && !noti.isRead) {
      try {
        await readNotification(notificationId); // PATCH 요청
        markAsRead(notificationId); // Zustand 상태 업데이트
      } catch (e) {
        console.error("알림 읽음 처리 실패:", e);
      }
    }

    // 타입별 네비게이션
    try {
      console.log("이동");
      // notificationContent 가 { message, targetId } 형태라고 가정
      const targetId = noti.targetId;
      // content && typeof content === "object" ? content.targetId : null;

      // ORDER(주문) 타입 + targetId 있으면 주문 상세로 이동
      if (notificationType === "ORDER" && targetId) {
        navigate(`/me/order/${targetId}`);
        setNotifOpen(false); // 드로어 닫기
      } else if (notificationType === "GIFT") {
        // 선물 보내기
        navigate(`/me/mypage`);
        setNotifOpen(false); // 드로어 닫기
      }

      // 다른 타입들도 나중에 추가 가능
      // else if (notificationType === "GIFT" || notificationType === "선물") { ... }
    } catch (e) {
      console.error("알림 클릭 후 이동 처리 중 오류:", e);
    }
  }

  // async function readMarkNotification(notificationId) {
  //   const target = useNotificationStore.getState().getNotification(notificationId);

  //   if (!target) {
  //     console.warn("❌ 알림을 찾을 수 없음:", notificationId);
  //     return;
  //   }
  //   console.log("📨 클릭된 알림:", target);

  //   if (target.readAt || target.isRead) {
  //     console.log("✅ 이미 읽은 알림입니다. 요청 생략.");
  //     return;
  //   }

  //    try {
  //     await readNotification(notificationId); // PATCH 요청
  //     markAsRead(notificationId); // 상태 업데이트
  //   } catch (e) {
  //     console.error("알림 읽음 처리 실패:", e);
  //   } finally {
  //     console.log("🔄 알림 상태 업데이트 완료");
  //   }
  // }

  // ------------------------------------------
  // 1) 앱 / 모바일 모드
  // ------------------------------------------
  if (isAppLike) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <CssBaseline />
        {/* 상단 바 - 아주 얇게 */}
        <AppBar position="static" elevation={0} color="inherit">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography
              variant="h6"
              fontWeight={"bold"}
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/me")}
            >
              COFFEIENS
            </Typography>
            <IconButton
              color="inherit"
              onClick={openNotifDrawer}
              // sx={{ zIndex: 1400 }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* 콘텐츠 영역 */}
        <Box
          sx={{
            flex: 1,
            overflow: isSearchPage ? "hidden" : "auto",
            position: "relative",
          }}
        >
          <Outlet />
        </Box>

        {/* 하단 네비게이션 */}
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2000,
          }}
        >
          <BottomNavigation
            value={bottomValue}
            onChange={(e, newValue) => setBottomValue(newValue)}
            showLabels
          >
            {links.map((link) => (
              <BottomNavigationAction
                key={link.to}
                label={link.label}
                icon={link.icon}
                value={link.to}
                component={NavLink}
                to={link.to}
              />
            ))}
          </BottomNavigation>
        </Paper>

        {/* 🔔 오른쪽 알림 드로어 (모바일에서도 동일하게 사용) */}
        <Drawer
          anchor="right"
          open={notifOpen}
          onClose={handleCloseNotif}
          PaperProps={{
            sx: {
              width: "80vw",
              maxWidth: 360,
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              알림
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row" }}>
              <Button onClick={handleDeleteAllNotifications}>전체 삭제</Button>
              <Button onClick={handleCloseNotif} color="gray">
                닫기
              </Button>
            </Box>
          </Box>
          <Divider />
          <List sx={{ p: 0 }}>
            {notifications.map((noti) => (
              <NotificationItem
                key={noti.notificationId}
                noti={noti}
                onClick={handleNotificationClick}
              />
            ))}

            {notifications.length === 0 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  아직 도착한 알림이 없어요 ☕
                </Typography>
              </Box>
            )}
          </List>
        </Drawer>
      </Box>
    );
  }

  // ------------------------------------------
  // 2) 데스크탑 모드
  // ------------------------------------------

  const DrawerContent = (
    <Box role="navigation" sx={{ width: drawerWidth }}>
      <Toolbar>
        <Box
          sx={{
            height: 120,
            margin: "0 auto",
            cursor: "pointer",
            marginTop: "10px",
            marginBottom: "10px",
          }}
          onClick={() => navigate("/me")}
        >
          <img src={logo} alt="CoffeeEns 로고" style={{ height: "100%" }} />
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ mt: 1 }}>
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {({ isActive }) => (
              <ListItemButton
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  "&.Mui-selected": {
                    backgroundColor: "primary.light",
                    color: "white",
                    "& .MuiListItemIcon-root": { color: "white" },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            )}
          </NavLink>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <CssBaseline />

      {/* 왼쪽 사이드바 */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundImage: "none",
          },
        }}
        open
      >
        {DrawerContent}
      </Drawer>

      {/* 오른쪽 메인 영역 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflow: isSearchPage ? "hidden" : "auto",
          position: "relative",
        }}
      >
        {/* 상단 헤더(AppBar) */}
        <AppBar
          position="absolute"
          elevation={0}
          sx={{
            top: 0,
            left: 0,
            width: "100%", // main 영역 전체
            background: "transparent",
            boxShadow: "none",
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton color="black" onClick={openNotifDrawer}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* 페이지 콘텐츠 */}
        <Box
          sx={{
            width: "100%",
            minHeight: "calc(100vh - 64px)",
            mt: 8,
            pb: isAppLike ? 10 : 0,
            position: "relative", // ✅ 추가
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* 🔔 오른쪽 알림 드로어 (데스크탑 공용) */}
      <Drawer
        anchor="right"
        open={notifOpen}
        onClose={handleCloseNotif}
        PaperProps={{
          sx: {
            width: 360,
            maxWidth: "80vw",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            알림
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <Button onClick={handleDeleteAllNotifications}>전체 삭제</Button>
            <Button onClick={handleCloseNotif} color="gray">
              닫기
            </Button>
          </Box>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {notifications.map((noti) => (
            <NotificationItem
              key={noti.notificationId}
              noti={noti}
              onClick={handleNotificationClick}
            />
          ))}

          {notifications.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                아직 도착한 알림이 없어요 ☕
              </Typography>
            </Box>
          )}
        </List>
      </Drawer>
    </Box>
  );
}
