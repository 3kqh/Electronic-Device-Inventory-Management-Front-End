import { useEffect, useState } from 'react';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 960);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = user?.role || '';
  const navItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      const mobile = window.innerWidth < 960;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const effectiveSidebarWidth = isMobile ? 0 : sidebarWidth;
  const mainPadding = viewportWidth < 480 ? 14 : viewportWidth < 640 ? 18 : 26;
  const navFontSize = viewportWidth < 480 ? 13 : 14;

  const isActive = (route) => {
    if (route === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === route || location.pathname.startsWith(route + '/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigate = (route) => {
    navigate(route);
    if (isMobile) {
      setCollapsed(true);
    }
  };

  return (
    <div style={styles.wrapper}>
      <aside
        style={{
          ...styles.sidebar,
          width: sidebarWidth,
          ...(isMobile ? styles.sidebarMobile : {}),
          ...(isMobile && collapsed ? styles.sidebarHidden : {}),
          ...(isMobile && !collapsed ? styles.sidebarVisible : {}),
        }}
      >
        <div style={styles.sidebarHeader}>
          {!collapsed && <div style={styles.brand}>EDIMS</div>}
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
                onClick={() => handleNavigate(item.route)}
                style={{
                  ...styles.navItem,
                  fontSize: navFontSize,
                  ...(active ? styles.navItemActive : {}),
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'rgba(233, 244, 238, 0.08)';
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

      {isMobile && !collapsed && <div style={styles.backdrop} onClick={() => setCollapsed(true)} />}

      <main style={{ ...styles.main, marginLeft: effectiveSidebarWidth, padding: mainPadding }}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'transparent',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    background: 'linear-gradient(180deg, var(--bg-sidebar) 0%, var(--bg-sidebar-2) 100%)',
    color: 'var(--text-light)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.25s ease, transform 0.25s ease',
    overflow: 'hidden',
    zIndex: 101,
    borderRight: '1px solid rgba(233, 244, 238, 0.12)',
    boxShadow: 'var(--shadow-soft)',
  },
  sidebarMobile: {
    width: SIDEBAR_WIDTH,
  },
  sidebarHidden: {
    transform: 'translateX(-100%)',
  },
  sidebarVisible: {
    transform: 'translateX(0)',
  },
  brand: {
    display: 'inline-flex',
    width: 'fit-content',
    fontFamily: 'Space Grotesk, Plus Jakarta Sans, sans-serif',
    fontSize: '22px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--accent)',
  },
  sidebarHeader: {
    padding: '16px 14px 12px',
    borderBottom: '1px solid rgba(233, 244, 238, 0.16)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  toggleBtn: {
    color: 'var(--text-light)',
    fontSize: '18px',
    cursor: 'pointer',
    alignSelf: 'flex-end',
    padding: '6px 10px',
    borderRadius: '8px',
    backgroundColor: 'rgba(233, 244, 238, 0.08)',
    border: '1px solid rgba(233, 244, 238, 0.16)',
  },
  userInfo: {
    padding: '6px 4px 2px',
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
    opacity: 0.86,
    color: '#bdd8cb',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navItem: {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    margin: 0,
    background: 'transparent',
    borderRadius: 10,
    color: '#e4f1ea',
    fontSize: '14px',
    textAlign: 'left',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    transition: 'background 0.2s ease, transform 0.2s ease',
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
    backgroundColor: 'rgba(212, 185, 61, 0.2)',
    color: '#fff9da',
    fontWeight: 600,
    border: '1px solid rgba(212, 185, 61, 0.45)',
  },
  sidebarFooter: {
    padding: '12px',
    borderTop: '1px solid rgba(233, 244, 238, 0.16)',
  },
  logoutBtn: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'rgba(233, 244, 238, 0.08)',
    border: '1px solid rgba(233, 244, 238, 0.28)',
    color: '#f4fff9',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s ease',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    backgroundColor: 'rgba(10, 18, 14, 0.45)',
    backdropFilter: 'blur(2px)',
  },
  main: {
    flex: 1,
    padding: '26px',
    minHeight: '100vh',
    transition: 'margin-left 0.25s ease',
  },
};
