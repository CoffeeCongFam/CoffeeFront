import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  Button,
} from "@mui/material";
import logo from "../assets/finalLogo.png";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HomeIcon from "@mui/icons-material/Home";
import {
  History,
  LocalCafe,
  CardGiftcard,
  LocationOn,
  HelpOutline,
} from '@mui/icons-material';
import useNotificationStore from '../stores/useNotificationStore';
import NotificationItem from '../components/common/NotificationItem';
import { deleteNotification, readNotification } from '../apis/notificationApi';

const drawerWidth = 240;

const today = new Date();

const links = [
  {
    to: '/store',
    label: '홈화면',
    icon: <HomeIcon />,
    end: true,
  },
  {
    to: '/store/pastorders',
    label: '지난 주문 내역',
    icon: <History />,
  },
  { to: '/store/manageMenu', label: '메뉴 관리', icon: <LocalCafe /> },
  {
    to: '/store/manageproduct',
    label: '구독권 관리',
    icon: <CardGiftcard />,
  },
  {
    to: '/store/cafeMyPage',
    label: '매장 정보',
    icon: <LocationOn />,
  },
  {
    to: '/store/guideLine',
    label: '가이드라인',
    icon: <HelpOutline />,
  },
];

export default function StoreLayout() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteAllNotifications,
    fetchAndUpdateNotifications,
  } = useNotificationStore();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false); // 알림 토글

  // 🚩 [필수] 컴포넌트 마운트 시 알림 로딩
  useEffect(() => {
    fetchAndUpdateNotifications();
  }, [fetchAndUpdateNotifications]);

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
    console.log('알림 전체 삭제');

    if (!notifications.length) return;
    const ok = window.confirm('알림을 모두 삭제하시겠습니까?');
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
      console.error('전체 알림 삭제 실패:', e);
      alert('알림 전체 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }

  // 특정 알림 읽음 처리  + 페이지 이동
  async function handleNotificationClick(noti) {
    const { notificationId, notificationType, notificationContent } = noti;

    console.log('📨 클릭된 알림:', noti);

    // 안 읽은 알림이면 서버에 읽음 처리 + 상태 업데이트
    if (!noti.readAt && !noti.isRead) {
      try {
        await readNotification(notificationId); // PATCH 요청
        markAsRead(notificationId); // Zustand 상태 업데이트
      } catch (e) {
        console.error('알림 읽음 처리 실패:', e);
      }
    }

    // 타입별 네비게이션
    try {
      // notificationContent 가 { message, targetId } 형태라고 가정
      const content = notificationContent;
      const targetId =
        content && typeof content === 'object' ? content.targetId : null;

      // ORDER(주문) 타입 + targetId 있으면 주문 상세로 이동
      if (
        (notificationType === 'ORDER' || notificationType === '주문') &&
        targetId
      ) {
        navigate(`/store/pastorders`);
        setNotifOpen(false); // 드로어 닫기
      }

      // 다른 타입들도 나중에 추가 가능
      // else if (notificationType === "GIFT" || notificationType === "선물") { ... }
    } catch (e) {
      console.error('알림 클릭 후 이동 처리 중 오류:', e);
    }
  }

  const DrawerContent = (
    <Box role="navigation" sx={{ width: drawerWidth }}>
      <Toolbar>
        <Box
          sx={{
            height: 120,
            margin: '0 auto',
            cursor: 'pointer',
            marginTop: '10px',
            marginBottom: '10px',
          }}
          onClick={() => navigate('/store')}
        >
          <img src={logo} alt="CoffeeEns 로고" style={{ height: '100%' }} />
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ mt: 1 }}>
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {({ isActive }) => (
              <ListItemButton
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,

                  color: "#ffe0c2",
                  "&.Mui-selected": {
                    backgroundColor: "#435548",
                    color: "#fff9f4",
                    "& .MuiListItemIcon-root": { color: "#fff9f4" },
                  },
                  "& .MuiListItemIcon-root": {
                    color: "#ffe0c2",
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
        bgcolor: "#fff9f4",
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
            bgcolor: "#334336",
            borderRight: "none",
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
          // ml: `${drawerWidth}px`,
          backgroundColor: "transparent",
          overflow: "auto",
        }}
      >
        {/* 상단 헤더(AppBar) */}
        <AppBar
          position="fixed"
          color="inherit"
          elevation={0}
          sx={{
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
            borderBottom: "1px solid #ffe0b2",
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" noWrap sx={{ color: "#334336" }}>
              {today.toLocaleDateString()}
            </Typography>
            <Box>
              <IconButton onClick={openNotifDrawer} sx={{ color: "#334336" }}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* AppBar 높이만큼 여백 확보 */}
        <Toolbar />
        {/* 페이지 콘텐츠 */}
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>

      {/* 알림 드로어 */}
      <Drawer
        anchor="right"
        open={notifOpen}
        onClose={handleCloseNotif}
        PaperProps={{
          sx: {
            width: 360,
            maxWidth: '80vw',
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ color: "#334336" }}>
            알림
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <Button onClick={handleDeleteAllNotifications} sx={{ color: "#334336" }}>
              전체 삭제
            </Button>
            <Button onClick={handleCloseNotif} sx={{ color: "#334336" }}>
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
              <Typography variant="body2" sx={{ color: "#334336" }}>
                아직 도착한 알림이 없어요 ☕
              </Typography>
            </Box>
          )}
        </List>
      </Drawer>
    </Box>
  );
}
