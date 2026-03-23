import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const floatingPattern = `
@keyframes landing-float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
}
`;

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const goPrimary = () => navigate(isAuthenticated ? "/dashboard" : "/login");

  return (
    <div style={styles.page}>
      <style>{floatingPattern}</style>

      <nav style={styles.navWrap}>
        <div style={styles.navContainer}>
          <button style={styles.brand} onClick={() => navigate("/")}>EDIMS</button>
          <div style={styles.navActions}>
            <a href="#features" style={styles.navLink}>Tính năng</a>
            <a href="#flow" style={styles.navLink}>Quy trình</a>
            <button style={styles.ghostBtn} onClick={() => navigate("/login")}>Đăng nhập</button>
            <button style={styles.primaryBtn} onClick={goPrimary}>
              {isAuthenticated ? "Vào dashboard" : "Bắt đầu"}
            </button>
          </div>
        </div>
      </nav>

      <section style={styles.heroSection}>
        <div style={styles.heroGrid}>
          <div style={styles.heroLeft}>
            <span style={styles.heroBadge}>Electronic Device Inventory Management</span>
            <h1 style={styles.heroTitle}>
              Nền tảng số hóa quản lý thiết bị - minh bạch dữ liệu, tăng tốc vận hành, giảm thiểu sai sót
            </h1>
            <p style={styles.heroDesc}>
              Theo dõi vòng đời thiết bị từ nhập kho, phân công, bảo trì, bảo hành đến báo cáo khấu hao trong một hệ thống thống nhất.
            </p>

            <div style={styles.heroActions}>
              <button style={styles.primaryBtnLarge} onClick={goPrimary}>
                {isAuthenticated ? "Mở hệ thống" : "Dùng thử ngay"}
              </button>
              <button style={styles.outlineBtnLarge} onClick={() => navigate("/login")}>
                Xem bản demo
              </button>
            </div>

            <div style={styles.statsGrid}>
              {stats.map((item) => (
                <div key={item.label} style={styles.statCard}>
                  <div style={styles.statValue}>{item.value}</div>
                  <div style={styles.statLabel}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.showcaseCard}>
              <div style={styles.showcaseTop}>
                <span style={styles.showcaseTag}>Live Snapshot</span>
                <span style={styles.showcaseStatus}>Online</span>
              </div>

              <div style={styles.metricList}>
                {heroMetrics.map((item) => (
                  <div key={item.name} style={styles.metricRow}>
                    <span style={styles.metricName}>{item.name}</span>
                    <strong style={styles.metricValue}>{item.value}</strong>
                  </div>
                ))}
              </div>

              <div style={styles.barWrap}>
                <div style={styles.barLabel}>
                  <span>Tỷ lệ sẵn sàng</span>
                  <span>89%</span>
                </div>
                <div style={styles.barTrack}>
                  <div style={styles.barFill} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" style={styles.section}>
        <div style={styles.sectionContainer}>
          <h2 style={styles.sectionTitle}>Những gì bạn có thể làm ngay</h2>
          <div style={styles.featuresGrid}>
            {features.map((feature) => (
              <article key={feature.title} style={styles.featureCard}>
                <div style={styles.featureIcon}>{feature.icon}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDesc}>{feature.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="flow" style={styles.sectionAlt}>
        <div style={styles.sectionContainer}>
          <h2 style={styles.sectionTitle}>Quy trình quản lý khép kín</h2>
          <div style={styles.flowGrid}>
            {flows.map((item, index) => (
              <div key={item.title} style={styles.flowCard}>
                <div style={styles.flowIndex}>0{index + 1}</div>
                <h3 style={styles.flowTitle}>{item.title}</h3>
                <p style={styles.flowDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.ctaCard}>
          <h2 style={styles.ctaTitle}>Sẵn sàng nâng cấp website quản lý thiết bị của bạn?</h2>
          <p style={styles.ctaDesc}>Đăng nhập để bắt đầu theo dõi dữ liệu tài sản theo thời gian thực.</p>
          <div style={styles.heroActions}>
            <button style={styles.primaryBtnLarge} onClick={goPrimary}>
              {isAuthenticated ? "Vào dashboard" : "Đăng nhập ngay"}
            </button>
            <button style={styles.outlineBtnLarge} onClick={() => navigate("/login")}>
              Liên hệ triển khai
            </button>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>EDIMS Platform</div>
          <div style={styles.footerLinks}>
            <a href="#features" style={styles.footerLink}>Tính năng</a>
            <a href="#flow" style={styles.footerLink}>Quy trình</a>
            <button style={styles.footerLinkBtn} onClick={() => navigate("/login")}>Đăng nhập</button>
          </div>
        </div>
        <p style={styles.copyright}>© 2026 EDIMS. All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 10% 8%, rgba(212, 185, 61, 0.23) 0, rgba(212, 185, 61, 0) 28%), radial-gradient(circle at 94% 0, rgba(47, 143, 99, 0.23) 0, rgba(47, 143, 99, 0) 32%), var(--bg-app)",
    color: "var(--text-primary)",
  },
  navWrap: {
    position: "sticky",
    top: 0,
    zIndex: 40,
    backdropFilter: "blur(10px)",
    backgroundColor: "rgba(244, 246, 236, 0.82)",
    borderBottom: "1px solid #dfe5d8",
  },
  navContainer: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "12px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  brand: {
    border: "none",
    background: "transparent",
    color: "var(--text-primary)",
    fontFamily: "Space Grotesk, Plus Jakarta Sans, sans-serif",
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: "0.08em",
    cursor: "pointer",
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  navLink: {
    textDecoration: "none",
    color: "var(--text-secondary)",
    fontWeight: 600,
    fontSize: 14,
    padding: "8px 10px",
    borderRadius: 8,
  },
  ghostBtn: {
    border: "1px solid #dfe5d8",
    background: "#ffffff",
    color: "var(--text-secondary)",
    borderRadius: 10,
    padding: "9px 14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  primaryBtn: {
    border: "none",
    background: "var(--accent-2)",
    color: "#ffffff",
    borderRadius: 10,
    padding: "9px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  heroSection: {
    padding: "40px 18px 30px",
  },
  heroGrid: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 24,
    alignItems: "stretch",
  },
  heroLeft: {
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    border: "1px solid rgba(255, 255, 255, 0.66)",
    borderRadius: 22,
    boxShadow: "var(--shadow-card)",
    padding: "26px",
  },
  heroBadge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: 999,
    backgroundColor: "rgba(47, 143, 99, 0.14)",
    color: "var(--accent-2)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  heroTitle: {
    margin: "16px 0 12px",
    fontSize: "clamp(2rem, 4vw, 3.3rem)",
    lineHeight: 1.08,
  },
  heroDesc: {
    margin: 0,
    color: "var(--text-secondary)",
    fontSize: 15,
    lineHeight: 1.6,
    maxWidth: 620,
  },
  heroActions: {
    marginTop: 20,
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  primaryBtnLarge: {
    border: "none",
    borderRadius: 12,
    backgroundColor: "var(--accent-2)",
    color: "#fff",
    padding: "11px 18px",
    fontWeight: 700,
    boxShadow: "0 8px 18px rgba(47, 143, 99, 0.24)",
    cursor: "pointer",
  },
  outlineBtnLarge: {
    border: "1px solid #dfe5d8",
    borderRadius: 12,
    backgroundColor: "#fff",
    color: "var(--text-primary)",
    padding: "11px 18px",
    fontWeight: 600,
    cursor: "pointer",
  },
  statsGrid: {
    marginTop: 22,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))",
    gap: 10,
  },
  statCard: {
    border: "1px solid #e3e9de",
    backgroundColor: "#fbfcf9",
    borderRadius: 12,
    padding: "10px 12px",
  },
  statValue: {
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.1,
    color: "var(--text-primary)",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "var(--text-secondary)",
  },
  heroRight: {
    display: "flex",
    alignItems: "stretch",
  },
  showcaseCard: {
    width: "100%",
    borderRadius: 22,
    background: "linear-gradient(145deg, #1f2f29 0%, #314a3d 100%)",
    border: "1px solid rgba(233, 244, 238, 0.1)",
    color: "#edf7f1",
    padding: "22px",
    boxShadow: "0 22px 34px rgba(24, 39, 32, 0.25)",
    animation: "landing-float 5.5s ease-in-out infinite",
  },
  showcaseTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  showcaseTag: {
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    backgroundColor: "rgba(212, 185, 61, 0.18)",
    color: "#f5e6a1",
  },
  showcaseStatus: {
    fontSize: 12,
    color: "#b8d7c8",
  },
  metricList: {
    marginTop: 16,
    display: "grid",
    gap: 10,
  },
  metricRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px dashed rgba(233, 244, 238, 0.15)",
    paddingBottom: 8,
  },
  metricName: {
    color: "#bed8cb",
    fontSize: 13,
  },
  metricValue: {
    fontSize: 19,
    color: "#ffffff",
  },
  barWrap: {
    marginTop: 14,
  },
  barLabel: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 7,
    fontSize: 12,
    color: "#cfe2d8",
  },
  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(233, 244, 238, 0.16)",
    overflow: "hidden",
  },
  barFill: {
    width: "89%",
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #d4b93d 0%, #2f8f63 100%)",
  },
  section: {
    padding: "18px 18px 22px",
  },
  sectionAlt: {
    padding: "18px 18px 24px",
  },
  sectionContainer: {
    maxWidth: 1180,
    margin: "0 auto",
  },
  sectionTitle: {
    margin: "0 0 16px",
    fontSize: "clamp(1.55rem, 2.3vw, 2.25rem)",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  featureCard: {
    border: "1px solid var(--border-soft)",
    borderRadius: 14,
    backgroundColor: "var(--bg-surface)",
    boxShadow: "var(--shadow-card)",
    padding: "16px",
  },
  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(47, 143, 99, 0.14)",
    color: "var(--accent-2)",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    marginBottom: 12,
  },
  featureTitle: {
    margin: "0 0 8px",
    fontSize: 17,
  },
  featureDesc: {
    margin: 0,
    fontSize: 14,
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
  flowGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 12,
  },
  flowCard: {
    borderRadius: 14,
    padding: "16px",
    background: "linear-gradient(140deg, #ffffff 0%, #f5f9f2 100%)",
    border: "1px solid #e4eadf",
  },
  flowIndex: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 999,
    padding: "4px 8px",
    color: "var(--accent-2)",
    backgroundColor: "rgba(47, 143, 99, 0.12)",
  },
  flowTitle: {
    margin: "10px 0 6px",
    fontSize: 17,
  },
  flowDesc: {
    margin: 0,
    color: "var(--text-secondary)",
    lineHeight: 1.5,
    fontSize: 14,
  },
  ctaSection: {
    padding: "20px 18px 26px",
  },
  ctaCard: {
    maxWidth: 1180,
    margin: "0 auto",
    borderRadius: 18,
    padding: "24px",
    border: "1px solid rgba(255, 255, 255, 0.66)",
    boxShadow: "var(--shadow-card)",
    background:
      "linear-gradient(135deg, rgba(47, 143, 99, 0.15) 0%, rgba(212, 185, 61, 0.18) 100%)",
  },
  ctaTitle: {
    margin: 0,
    fontSize: "clamp(1.55rem, 2.2vw, 2.2rem)",
  },
  ctaDesc: {
    margin: "10px 0 0",
    color: "var(--text-secondary)",
    fontSize: 15,
  },
  footer: {
    borderTop: "1px solid #dfe5d8",
    marginTop: 10,
    padding: "18px",
  },
  footerInner: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  footerBrand: {
    fontFamily: "Space Grotesk, Plus Jakarta Sans, sans-serif",
    fontWeight: 700,
    letterSpacing: "0.04em",
  },
  footerLinks: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  footerLink: {
    textDecoration: "none",
    color: "var(--text-secondary)",
    fontSize: 14,
  },
  footerLinkBtn: {
    border: "none",
    background: "transparent",
    color: "var(--text-secondary)",
    cursor: "pointer",
    fontSize: 14,
  },
  copyright: {
    margin: "10px auto 0",
    maxWidth: 1180,
    color: "#7b897f",
    fontSize: 13,
  },
};

const stats = [
  { value: "99.9%", label: "Độ ổn định" },
  { value: "24/7", label: "Giám sát" },
  { value: "1 nền tảng", label: "Quản trị tập trung" },
];

const heroMetrics = [
  { name: "Tổng thiết bị", value: "2,540" },
  { name: "Sẵn sàng", value: "2,261" },
  { name: "Đang bảo trì", value: "74" },
  { name: "Cảnh báo bảo hành", value: "21" },
];

const features = [
  {
    icon: "01",
    title: "Quản lý thiết bị tập trung",
    desc: "Tạo, cập nhật và theo dõi tình trạng thiết bị theo danh mục, vị trí và phòng ban.",
  },
  {
    icon: "02",
    title: "Phân công và bàn giao",
    desc: "Theo dõi ai đang sử dụng thiết bị, lịch sử bàn giao và trạng thái hoàn trả.",
  },
  {
    icon: "03",
    title: "Bảo trì và bảo hành",
    desc: "Tự động nhắc lịch bảo trì, xử lý yêu cầu sửa chữa và cảnh báo bảo hành sắp hết hạn.",
  },
  {
    icon: "04",
    title: "Báo cáo và khấu hao",
    desc: "Tổng hợp số liệu tồn kho, trạng thái sử dụng và hỗ trợ phân tích khấu hao thiết bị.",
  },
];

const flows = [
  {
    title: "Nhập thông tin thiết bị",
    desc: "Chuẩn hóa dữ liệu đầu vào theo danh mục, serial, ngày mua và giá trị tài sản.",
  },
  {
    title: "Phân bổ cho bộ phận sử dụng",
    desc: "Giao thiết bị theo người dùng/phòng ban, lưu lịch sử thay đổi để dễ tra soát.",
  },
  {
    title: "Theo dõi vòng đời vận hành",
    desc: "Cập nhật trạng thái sử dụng, bảo trì, hư hỏng và bảo hành theo thời gian thực.",
  },
  {
    title: "Báo cáo và ra quyết định",
    desc: "Xuất báo cáo trực quan phục vụ kiểm kê, mua sắm mới hoặc thanh lý tài sản.",
  },
];
