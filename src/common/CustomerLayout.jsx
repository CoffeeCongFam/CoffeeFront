import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
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
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import logo from "../assets/CoffeiensLogo.png";

const drawerWidth = 240;

export default function CustomerLayout() {
  const location = useLocation();
  const isSearchPage = location.pathname.startsWith("/me/search");

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
        <Box
          sx={{
            height: 120,
            m: "10px auto",
            cursor: "pointer",
          }}
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
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundImage: "none",
          },
        }}
        open
      >
        {DrawerContent}
      </Drawer>

      {/* 오른쪽 메인 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflow: isSearchPage ? "hidden" : "auto",
          position: "relative",
        }}
      >
        {/* 투명 헤더 */}
        <AppBar
          position="absolute"
          elevation={0}
          sx={{
            top: 0,
            left: 0,
            width: "100%", // main 영역 전체
            background: "transparent",
            boxShadow: "none",
            pointerEvents: "none", // 밑에 요소 클릭 가능하도록
          }}
        >
          <Toolbar
            sx={{
              justifyContent: "flex-end",
              pointerEvents: "auto", // 아이콘만 클릭 가능하게 복구
            }}
          >
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
            width: "100%",
            minHeight: "100vh",
            // 헤더가 콘텐츠 위에 떠있게 하고 싶으면 패딩X
            // 만약 겹치는 게 싫으면 여기서 pt: '64px' 주면 됨
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
