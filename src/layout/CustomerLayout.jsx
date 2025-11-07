import React, { useEffect } from "react";
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
import api from "../utils/api";

const drawerWidth = 240;

export default function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname.startsWith("/me/search");
  const { isAppLike } = useAppShellMode(); // 모바일 여부
  const [bottomValue, setBottomValue] = React.useState(location.pathname);

  const [notifOpen, setNotifOpen] = React.useState(false); // 알림 토글

  // 페이지 이동 시 알림 드로어 자동 닫기
  useEffect(() => {
    setNotifOpen(false);
  }, [location.pathname]);

  const links = [
    { to: "/me", label: "Home", icon: <HomeIcon />, end: true },
    { to: "/me/search", label: "매장 탐색", icon: <SearchIcon /> },
    {
      to: "/me/order",
      label: "주문 내역",
      icon: <ReceiptLongIcon />,
      end: true,
    },
    {
      to: "/me/order/new",
      label: "주문하기",
      icon: <ShoppingCartIcon />,
      end: true,
    },
    { to: "/me/mypage", label: "마이페이지", icon: <PersonIcon /> },
  ];

  // 🔔 알림 더미 데이터 (나중에 SSE/Fetch로 교체)
  const { notifications } = useNotificationStore();
  console.log("알림 내역>>>>>> ", notifications);

  // 알림 구조
  // interface Notification {
  //   notificationId: number;
  //   notificationType: string;
  //   notificationContent: String;
  // notificationContent : {
  //   message : '',
  //   targetId : '',
  // }
  //   readAt: string; // timestamp
  //   createdAT: string;
  // }

  function handleCloseNotif() {
    setNotifOpen(false);
  }
  function openNotifDrawer() {
    setNotifOpen(true);
  }

  //
  function deleteAllNotifications() {
    // 모든 알림 읽음 처리
  }

  // 특정 알림 읽음 처리
  async function readMarkNotification(notificationId) {
    //
    console.log("삭제할 알림>> ", notificationId);
    // /api/common/notification/{notificationId}
    const res = await api.patch(`/common/notification/${notificationId}`);
    console.log(res.data?.message);
  }

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
              <Badge badgeContent={notifications.length} color="error">
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

            <Typography
              variant="body2"
              sx={{ color: "text.secondary", cursor: "pointer" }}
              onClick={handleCloseNotif}
            >
              닫기
            </Typography>
          </Box>
          <Divider />
          <List sx={{ p: 0 }}>
            {notifications.map((noti) => (
              <ListItemButton
                key={noti.notificationId}
                alignItems="flex-start"
                onClick={() => readMarkNotification(noti.notificationId)}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      backgroundColor: noti.readAt
                        ? "rgba(223, 223, 223, 1)"
                        : "brown",
                    }}
                  >
                    <CoffeeIcon />
                  </Avatar>
                </ListItemAvatar>
                <Box sx={{ ml: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    {noti.notificationType}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mb: 0.3 }}
                  >
                    {noti.notificationContent}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.disabled" }}>
                    {noti.createdAT.split("T")[0]}{" "}
                    {noti.createdAT.split("T")[1].split(".")[0]}
                  </Typography>
                </Box>
              </ListItemButton>
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
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* 페이지 콘텐츠 */}
        <Box
          sx={{ width: "100%", minHeight: "calc(100vh - 64px)", mt: 8, pb: 10 }}
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
            <Button onClick={deleteAllNotifications}>전체 삭제</Button>
            <Button onClick={handleCloseNotif} color="gray">
              닫기
            </Button>
          </Box>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {notifications.map((noti) => (
            <ListItemButton
              key={noti.notificationId}
              alignItems="flex-start"
              onClick={() => readMarkNotification(noti.notificationId)}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    backgroundColor: noti.readAt
                      ? "rgba(223, 223, 223, 1)"
                      : "brown",
                  }}
                >
                  <CoffeeIcon />
                </Avatar>
              </ListItemAvatar>
              <Box sx={{ ml: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  {noti.notificationType}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mb: 0.3 }}
                >
                  {noti.notificationContent}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.disabled" }}>
                  {noti.createdAT.split("T")[0]}{" "}
                  {noti.createdAT.split("T")[1].split(".")[0]}
                </Typography>
              </Box>
            </ListItemButton>
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
