import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ALL_NAV_ITEMS = [
  { label: 'Dashboard', route: '/dashboard', roles: ['admin', 'inventory_manager', 'staff'] },
  { label: 'Thiết bị', route: '/devices', roles: ['admin', 'inventory_manager', 'staff'] },
  { label: 'Danh mục', route: '/categories', roles: ['admin', 'inventory_manager', 'staff'] },
  { label: 'Vị trí', route: '/locations', roles: ['admin', 'inventory_manager', 'staff'] },
  { label: 'Phân công', route: '/assignments', roles: ['admin', 'inventory_manager', 'staff'] },
  { label: 'Bảo trì', route: '/maintenance', roles: ['admin', 'inventory_manager', 'staff'] },
  { label: 'Bảo hành', route: '/warranties', roles: ['admin', 'inventory_manager', 'staff'] },
  { label: 'Khấu hao', route: '/depreciation', roles: ['admin', 'inventory_manager'] },
  { label: 'Báo cáo', route: '/reports', roles: ['admin', 'inventory_manager', 'staff'] },
  { label: 'Người dùng', route: '/users', roles: ['admin'] },
  { label: 'Phòng ban', route: '/departments', roles: ['admin'] },
  { label: 'Hệ thống', route: '/system', roles: ['admin'] },
];

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 60;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = user?.role || '';
  const navItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const isActive = (route) => {
    if (route === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === route || location.pathname.startsWith(route + '/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={styles.wrapper}>
      <aside style={{ ...styles.sidebar, width: sidebarWidth }}>
        <div style={styles.sidebarHeader}>
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            style={styles.toggleBtn}
            aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {collapsed ? '☰' : '✕'}
          </button>
          {!collapsed && (
            <div style={styles.userInfo}>
              <div style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={styles.userRole}>{user?.role}</div>
            </div>
          )}
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => {
            const active = isActive(item.route);
            return (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                style={{
                  ...styles.navItem,
                  ...(active ? styles.navItemActive : {}),
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={collapsed ? item.label : undefined}
              >
                {collapsed ? item.label.charAt(0) : item.label}
              </button>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            {collapsed ? '↪' : 'Đăng xuất'}
          </button>
        </div>
      </aside>

      <main style={{ ...styles.main, marginLeft: sidebarWidth }}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    backgroundColor: '#1a237e',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.2s ease',
    overflow: 'hidden',
    zIndex: 100,
  },
  sidebarHeader: {
    padding: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    alignSelf: 'flex-end',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  userInfo: {
    padding: '4px 0',
  },
  userName: {
    fontWeight: 600,
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '12px',
    opacity: 0.75,
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    backgroundColor: '#1a237e',
  },
  navItem: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    margin: 0,
    background: 'transparent',
    border: 'none',
    borderRadius: 0,
    color: '#fff',
    fontSize: '14px',
    textAlign: 'left',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    transition: 'background 0.15s',
    opacity: 1,
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    lineHeight: '1.4',
    fontFamily: 'inherit',
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontWeight: 600,
  },
  sidebarFooter: {
    padding: '12px',
    borderTop: '1px solid rgba(255,255,255,0.15)',
  },
  logoutBtn: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.25)',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  main: {
    flex: 1,
    padding: '24px',
    minHeight: '100vh',
    transition: 'margin-left 0.2s ease',
  },
};
