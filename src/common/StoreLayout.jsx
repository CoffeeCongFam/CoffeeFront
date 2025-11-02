import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
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
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';

const drawerWidth = 240;

const today = new Date();

export default function StoreLayout() {
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
      icon: <SearchIcon />,
    },
    { to: '/store/manageMenu', label: '메뉴 관리', icon: <ShoppingCartIcon /> },
    {
      to: '/store/manageproduct',
      label: '상품 관리',
      icon: <ShoppingCartIcon />,
    },
    {
      to: '/store/manageStoreInfo',
      label: '매장 정보',
      icon: <ShoppingCartIcon />,
    },
  ];

  const DrawerContent = (
    <Box role="navigation" sx={{ width: drawerWidth }}>
      <Toolbar>
        <Typography variant="h6" component="div">
          로고
        </Typography>
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
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
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
    <Box sx={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <CssBaseline />

      {/* 왼쪽 사이드바 */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundImage: 'none',
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
          backgroundColor: '#f9f9f9',
          overflow: 'auto',
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
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" noWrap>
              {today.toLocaleDateString()}
            </Typography>
            <Box>
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* AppBar 높이만큼 여백 확보 */}
        <Toolbar />
        {/* 여기에 AdminHome.jsx의 내용이 렌더링 */}
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
