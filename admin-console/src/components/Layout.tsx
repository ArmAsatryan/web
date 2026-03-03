import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import MapIcon from '@mui/icons-material/Map';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import StraightenIcon from '@mui/icons-material/Straighten';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { SIDEBAR_BG, SIDEBAR_TEXT, SIDEBAR_ACTIVE } from '../theme';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

const nav = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/', label: 'Users', icon: <PeopleIcon /> },
  { path: '/map', label: 'User Locations', icon: <MapIcon /> },
  { path: '/notifications', label: 'Notifications', icon: <NotificationsIcon /> },
  { path: '/create-bullet', label: 'Create bullet', icon: <AddCircleOutlineIcon /> },
  { path: '/create-caliber', label: 'Create caliber', icon: <StraightenIcon /> },
  { path: '/create-vendor', label: 'Create vendor', icon: <StorefrontIcon /> },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/': 'Users',
  '/map': 'User Locations Map',
  '/notifications': 'Notifications',
  '/create-bullet': 'Create bullet',
  '/create-caliber': 'Create caliber',
  '/create-vendor': 'Create vendor',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout } = useAuth();

  const currentWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  const userInitial = auth.user?.name?.charAt(0)?.toUpperCase()
    || auth.user?.emailAddress?.charAt(0)?.toUpperCase()
    || 'A';

  const sidebarContent = (isMobile: boolean) => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: SIDEBAR_BG,
        color: SIDEBAR_TEXT,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          px: collapsed && !isMobile ? 1 : 2.5,
          py: 2.5,
          minHeight: 64,
        }}
      >
        {(!collapsed || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: `linear-gradient(135deg, #4A90D9 0%, #1E3A5F 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              B
            </Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
              }}
            >
              BALLISTiQ
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton
            size="small"
            onClick={() => setCollapsed(!collapsed)}
            sx={{ color: SIDEBAR_TEXT, '&:hover': { color: '#fff' } }}
          >
            <ChevronLeftIcon
              sx={{
                transition: 'transform 0.2s',
                transform: collapsed ? 'rotate(180deg)' : 'none',
              }}
            />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: alpha('#fff', 0.08), mx: 2 }} />

      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {nav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={isActive}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: '8px',
                mb: 0.5,
                px: collapsed && !isMobile ? 1.5 : 2,
                py: 1,
                minHeight: 44,
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                color: isActive ? '#fff' : SIDEBAR_TEXT,
                bgcolor: isActive ? alpha(SIDEBAR_ACTIVE, 0.2) : 'transparent',
                '&:hover': {
                  bgcolor: isActive ? alpha(SIDEBAR_ACTIVE, 0.25) : alpha('#fff', 0.06),
                },
                '&.Mui-selected': {
                  bgcolor: alpha(SIDEBAR_ACTIVE, 0.2),
                  '&:hover': { bgcolor: alpha(SIDEBAR_ACTIVE, 0.25) },
                },
              }}
            >
              <Tooltip title={collapsed && !isMobile ? item.label : ''} placement="right">
                <ListItemIcon
                  sx={{
                    color: isActive ? SIDEBAR_ACTIVE : SIDEBAR_TEXT,
                    minWidth: collapsed && !isMobile ? 0 : 40,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              </Tooltip>
              {(!collapsed || isMobile) && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: alpha('#fff', 0.08), mx: 2 }} />

      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={logout}
          sx={{
            borderRadius: '8px',
            px: collapsed && !isMobile ? 1.5 : 2,
            py: 1,
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
            color: SIDEBAR_TEXT,
            '&:hover': { bgcolor: alpha('#fff', 0.06), color: '#EF5350' },
          }}
        >
          <Tooltip title={collapsed && !isMobile ? 'Logout' : ''} placement="right">
            <ListItemIcon
              sx={{
                color: 'inherit',
                minWidth: collapsed && !isMobile ? 0 : 40,
                justifyContent: 'center',
              }}
            >
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
          </Tooltip>
          {(!collapsed || isMobile) && (
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ fontSize: '0.8125rem' }}
            />
          )}
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box component="nav" sx={{ width: { sm: currentWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              border: 'none',
            },
          }}
        >
          {sidebarContent(true)}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentWidth,
              border: 'none',
              transition: 'width 0.2s ease-in-out',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {sidebarContent(false)}
        </Drawer>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { sm: `calc(100% - ${currentWidth}px)` },
          transition: 'width 0.2s ease-in-out',
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: alpha('#fff', 0.9),
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, display: { sm: 'none' }, color: 'text.primary' }}
              aria-label="open menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 600 }}
            >
              {pageTitle}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500, lineHeight: 1.2 }}>
                  {auth.user?.name || 'Admin'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>
                  {auth.user?.emailAddress}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {userInitial}
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            maxWidth: 1400,
            width: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
