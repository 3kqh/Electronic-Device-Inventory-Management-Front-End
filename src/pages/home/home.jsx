import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: "rgba(248, 249, 250, 0.8)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e4e7eb",
          padding: "1rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#0066cc" }}>
            EDIMS
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <a href="#features" style={navLinkStyle}>Chức năng</a>
            <a href="#benefits" style={navLinkStyle}>Lợi ích</a>

            <button style={primaryBtn} onClick={() => navigate("/login")}>Bắt đầu</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: "8rem", paddingBottom: "5rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 1.5rem" }}>
          <h1 style={{ fontSize: "3.5rem", fontWeight: "bold" }}>
            Quản lý Thiết bị <span style={{ color: "#0066cc" }}>Thông minh</span>
          </h1>
          <p style={{ maxWidth: 500, color: "#65676b" }}>
            Hệ thống quản lý thiết bị điện tử tập trung, tối ưu vận hành doanh nghiệp.
          </p>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button style={primaryBtn} onClick={() => navigate("/login")}>Bắt đầu ngay</button>
            <button style={outlineBtn} onClick={() => navigate("/login")}>Xem Demo</button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ background: "#f0f2f5", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2 style={sectionTitle}>Các Chức Năng Chính</h2>

          <div style={grid4}>
            {features.map((f) => (
              <div key={f.title} style={card}>
                <div style={{ fontSize: "2rem" }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2 style={sectionTitle}>Tại sao chọn EDIMS?</h2>

          {benefits.map((b) => (
            <div key={b.title} style={benefitItem}>
              <strong>{b.title}</strong>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.25rem" }}>Sẵn sàng nâng cấp quản lý thiết bị?</h2>
        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button style={primaryBtn} onClick={() => navigate("/login")}>Bắt đầu miễn phí</button>
          <button style={outlineBtn} onClick={() => navigate("/login")}>Liên hệ Sales</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e4e7eb", padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem" }}>
          <FooterCol title="Sản phẩm" items={["Tính năng", "Giá cả", "Bảo mật"]} />
          <FooterCol title="Công ty" items={["Về chúng tôi", "Blog", "Liên hệ"]} />
          <FooterCol title="Hỗ trợ" items={["Tài liệu", "FAQ", "Support"]} />
        </div>

        <p style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.875rem", color: "#65676b" }}>
          © 2026 EDIMS. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

/* ================== Components ================== */

function FooterCol({ title, items }) {
  return (
    <div>
      <h4>{title}</h4>
      {items.map((i) => (
        <button key={i} style={footerBtn}>{i}</button>
      ))}
    </div>
  );
}

/* ================== Styles ================== */

const navLinkStyle = {
  color: "#2c2c2c",
  textDecoration: "none",
};

const primaryBtn = {
  padding: "0.75rem 2rem",
  background: "#0066cc",
  color: "#fff",
  border: "none",
  borderRadius: "999px",
  cursor: "pointer",
};

const outlineBtn = {
  padding: "0.75rem 2rem",
  background: "transparent",
  border: "1px solid #e4e7eb",
  borderRadius: "999px",
  cursor: "pointer",
};

const sectionTitle = {
  fontSize: "2.25rem",
  marginBottom: "2rem",
};

const grid4 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "1.5rem",
};

const card = {
  background: "#fff",
  padding: "1.5rem",
  borderRadius: "0.75rem",
  border: "1px solid #e4e7eb",
};

const benefitItem = {
  marginBottom: "1rem",
  background: "#f0f2f5",
  padding: "1rem",
  borderRadius: "0.5rem",
};

const footerBtn = {
  display: "block",
  background: "none",
  border: "none",
  padding: 0,
  color: "#65676b",
  cursor: "pointer",
  marginBottom: "0.5rem",
};

/* ================== Data ================== */

const features = [
  { icon: "📦", title: "Quản lý Thiết bị", desc: "Theo dõi thiết bị tập trung" },
  { icon: "📊", title: "Báo cáo", desc: "Thống kê tồn kho" },
  { icon: "👥", title: "Người dùng", desc: "Phân quyền dễ dàng" },
  { icon: "🔒", title: "Bảo mật", desc: "An toàn dữ liệu" },
];

const benefits = [
  { title: "Giao diện dễ dùng", desc: "Không cần đào tạo phức tạp" },
  { title: "Hiệu suất cao", desc: "Xử lý dữ liệu lớn" },
  { title: "Hỗ trợ 24/7", desc: "Luôn sẵn sàng" },
];
