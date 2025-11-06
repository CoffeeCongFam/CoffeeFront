import React from "react";
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
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import logo from "../assets/CoffeiensLogo.png";
import useAppShellMode from "../hooks/useAppShellMode";

const drawerWidth = 240;

export default function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname.startsWith("/me/search");
  const { isAppLike } = useAppShellMode(); // ← 여기서 모바일/PWA 여부
  const [bottomValue, setBottomValue] = React.useState(location.pathname);

  const links = [
    { to: "/me", label: "Home", icon: <HomeIcon />, end: true },
    { to: "/me/search", label: "매장 탐색", icon: <SearchIcon /> },
    {
      to: "/me/order",
      label: "주문하기",
      icon: <ShoppingCartIcon />,
      end: true,
    },
    { to: "/me/mypage", label: "마이페이지", icon: <PersonIcon /> },
  ];

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
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
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
            <IconButton color="black">
              <Badge badgeContent={3} color="error">
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
    </Box>
  );
}
