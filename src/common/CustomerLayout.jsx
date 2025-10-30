import React from "react";
import { NavLink, Outlet } from "react-router-dom";
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
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";

const drawerWidth = 240;

export default function CustomerLayout() {
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

  const DrawerContent = (
    <Box role="navigation" sx={{ width: drawerWidth }}>
      <Toolbar>
        <Typography variant="h6" component="div">
          Local Pass
        </Typography>
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
    <Box sx={{ display: "flex", width: "100vw", height: "100vh" }}>
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
          // ml: `${drawerWidth}px`,
          backgroundColor: "#f9f9f9",
          overflow: "auto",
        }}
      >
        {/* 상단 헤더(AppBar) */}
        {/* 상단 헤더(AppBar) */}
        <AppBar
          position="fixed"
          color="inherit"
          elevation={0}
          sx={{
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
            backgroundColor: "transparent", // 배경 투명하게
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* AppBar 높이만큼 여백 확보 */}
        <Toolbar />

        {/* 페이지 콘텐츠 */}
        <Box sx={{}}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
