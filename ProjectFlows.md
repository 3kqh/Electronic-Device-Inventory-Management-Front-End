# EDIMS - Tài liệu Flow Dự án
## Hệ thống Quản lý Thiết bị Điện tử (Electronic Device Inventory Management System)

---

## 1. Tổng quan hệ thống

### 1.1 Kiến trúc
- **Frontend**: React 19, React Router v7, Recharts
- **Backend**: Node.js, Express, MongoDB Atlas
- **Xác thực**: JWT (JSON Web Token)
- **Port**: Frontend `:3001` | Backend `:3120` (API prefix: `/api`)

### 1.2 Vai trò người dùng

| Vai trò | Mã | Quyền hạn |
|---------|-----|-----------|
| Quản trị viên | `admin` | Toàn quyền: quản lý thiết bị, người dùng, hệ thống, báo cáo, danh mục, vị trí |
| Quản lý kho | `inventory_manager` | Quản lý thiết bị, phân công, bảo trì, bảo hành, khấu hao, báo cáo |
| Nhân viên | `staff` | Xem thiết bị, xác nhận phân công, yêu cầu bảo trì, xem báo cáo cơ bản |

### 1.3 Cấu trúc Navigation (Sidebar)

| Menu | Route | Quyền truy cập |
|------|-------|----------------|
| Dashboard | `/dashboard` | Tất cả |
| Thiết bị | `/devices` | Tất cả |
| Danh mục | `/categories` | Tất cả |
| Vị trí | `/locations` | Tất cả |
| Phân công | `/assignments` | Tất cả |
| Bảo trì | `/maintenance` | Tất cả |
| Bảo hành | `/warranties` | Tất cả |
| Khấu hao | `/depreciation` | admin, inventory_manager |
| Báo cáo | `/reports` | Tất cả |
| Người dùng | `/users` | admin |
| Hệ thống | `/system` | admin |

---

## 2. Flow Xác thực (Authentication)

### 2.1 Screen Flow

```
Trang chủ (/) ──→ Nhấn "Bắt đầu" ──→ Trang đăng nhập (/login)
                                            │
                                     Nhập email + mật khẩu
                                            │
                                    ┌───────┴───────┐
                                    ▼               ▼
                              Thành công        Thất bại
                                    │               │
                              Lưu JWT token    Hiển thị lỗi
                              + user info      "Đăng nhập thất bại"
                                    │
                                    ▼
                              Dashboard (/dashboard)
```

### 2.2 Thao tác chi tiết

**Trang chủ (`/`)**
- Landing page giới thiệu hệ thống EDIMS
- Các section: Hero, Chức năng chính, Lợi ích, CTA, Footer
- Nút "Bắt đầu ngay" / "Xem Demo" → chuyển đến `/login`

**Đăng nhập (`/login`)**
- Form: Email + Mật khẩu
- Gọi API: `POST /api/auth/login`
- Thành công → lưu `accessToken` + `user` vào AuthContext → redirect `/dashboard`
- Nếu đã đăng nhập → tự động redirect `/dashboard`

**Đăng xuất**
- Nhấn "Đăng xuất" ở sidebar footer
- Xóa token + user khỏi context → redirect `/login`

---

## 3. Flow Dashboard

### 3.1 Screen Flow

```
Dashboard (/dashboard)
    │
    ├── 6 thẻ tổng quan (Summary Cards)
    │   ├── Tổng thiết bị
    │   ├── Sẵn sàng
    │   ├── Đã phân công
    │   ├── Đang bảo trì
    │   ├── Đã thanh lý
    │   └── Tổng người dùng
    │
    └── 3 biểu đồ (Charts)
        ├── Donut Chart: Trạng thái thiết bị (%)
        ├── Bar Chart: Thiết bị theo danh mục
        └── Bar Chart: Thiết bị theo vị trí (full-width)
```

### 3.2 Thao tác chi tiết
- Tự động tải dữ liệu khi vào trang
- API: `GET /api/reports/device-status` + `GET /api/users`
- Hiển thị skeleton loading khi đang tải
- Nút "Thử lại" nếu lỗi

---

## 4. Flow Quản lý Thiết bị (Devices)

### 4.1 Screen Flow

```
Danh sách thiết bị (/devices)
    │
    ├── Tìm kiếm (Enter) ──→ Kết quả tìm kiếm
    ├── Lọc trạng thái ──→ Danh sách đã lọc
    ├── Lọc tình trạng ──→ Danh sách đã lọc
    │
    ├── Nhấn "Thêm thiết bị" ──→ Form thêm (/devices/new)
    │   [Chỉ admin, inventory_manager]     │
    │                                Điền form → Lưu
    │                                      │
    │                                      ▼
    │                              Quay lại danh sách
    │
    ├── Nhấn vào 1 dòng ──→ Chi tiết thiết bị (/devices/:id)
    │                              │
    │                    ┌─────────┼─────────┐
    │                    ▼         ▼         ▼
    │               Quay lại    Sửa       Xóa
    │                         (/devices   (Confirm
    │                          /:id/edit)  Dialog)
    │
    └── Phân trang (10 items/trang)
```

### 4.2 Thao tác chi tiết

**Danh sách (`/devices`)**
- Bảng: Mã tài sản, Tên, Danh mục, Trạng thái (badge màu), Tình trạng, Vị trí
- Tìm kiếm: nhập từ khóa → Enter → `GET /api/devices/search?q=...`
- Lọc trạng thái: available / assigned / in_maintenance / retired
- Lọc tình trạng: new / good / fair / poor
- Phân trang: 10 thiết bị/trang

**Thêm thiết bị (`/devices/new`)** — admin, inventory_manager
- Form: Tên, Số serial, Danh mục (dropdown), Vị trí (dropdown), Nhà sản xuất, Model, Ngày mua, Giá mua, Trạng thái, Tình trạng
- Validation: Tên, Số serial, Danh mục, Nhà sản xuất, Model bắt buộc
- API: `POST /api/devices`

**Chi tiết (`/devices/:id`)**
- 4 section: Thông tin chung, Thông tin tài chính, Vị trí & Mã vạch, Thông số kỹ thuật
- Nút Sửa / Xóa (admin, inventory_manager)
- Xóa: ConfirmDialog → `DELETE /api/devices/:id`

**Sửa (`/devices/:id/edit`)** — admin, inventory_manager
- Form giống Thêm, pre-fill dữ liệu hiện tại
- API: `PUT /api/devices/:id`

---

## 5. Flow Quản lý Danh mục (Categories)

### 5.1 Screen Flow

```
Danh mục (/categories)
    │
    ├── Nhấn "Thêm danh mục" ──→ Modal form
    │   [Chỉ admin]                │
    │                        Điền: Tên, Mã, Mô tả,
    │                        Trường tùy chỉnh (dynamic)
    │                              │
    │                        Lưu → Đóng modal
    │
    ├── Nhấn "Sửa" ──→ Modal form (pre-fill)
    │   [Chỉ admin]
    │
    └── Nhấn "Xóa" ──→ ConfirmDialog → Xóa
        [Chỉ admin]
```

### 5.2 Thao tác chi tiết
- Bảng: Tên danh mục, Mã, Mô tả
- Thêm/Sửa: Modal overlay với form
- Trường tùy chỉnh (Custom Fields): thêm/xóa dynamic, mỗi trường có Tên + Loại (text/number/date/boolean)
- API: `GET/POST /api/categories`, `PUT/DELETE /api/categories/:id`
- Quyền CRUD: chỉ admin

---

## 6. Flow Quản lý Vị trí (Locations)

### 6.1 Screen Flow

```
Vị trí (/locations)
    │
    ├── Nhấn "Thêm vị trí" ──→ Modal form
    │   [Chỉ admin]               │
    │                        Điền: Tên, Mã, Loại,
    │                        Vị trí cha, Địa chỉ
    │                              │
    │                        Lưu → Đóng modal
    │
    ├── Nhấn "Sửa" ──→ Modal form (pre-fill)
    └── Nhấn "Xóa" ──→ ConfirmDialog → Xóa
```

### 6.2 Thao tác chi tiết
- Bảng: Tên vị trí, Mã, Loại (Tòa nhà/Tầng/Phòng/Khác), Vị trí cha
- Hỗ trợ cấu trúc phân cấp (parent-child)
- API: `GET/POST /api/locations`, `PUT/DELETE /api/locations/:id`
- Quyền CRUD: chỉ admin

---

## 7. Flow Phân công Thiết bị (Assignments)

### 7.1 Screen Flow

```
Phân công (/assignments)
    │
    ├── Nhấn "Phân công thiết bị" ──→ Modal form
    │   [admin, inventory_manager]       │
    │                              Chọn: Thiết bị (dropdown),
    │                              Người nhận (dropdown), Ghi chú
    │                                    │
    │                              Phân công → Đóng modal
    │
    ├── Nhấn "Xác nhận" ──→ ConfirmDialog
    │   [staff, khi status=pending]    │
    │                            Xác nhận nhận thiết bị
    │
    ├── Nhấn "Chuyển giao" ──→ Modal form
    │   [admin, inventory_manager]     │
    │   [khi status=active/acknowledged]
    │                            Chọn người nhận mới + Ghi chú
    │                                  │
    │                            Chuyển giao → Đóng modal
    │
    └── Phân trang (10 items/trang)
```

### 7.2 Thao tác chi tiết
- Bảng: Thiết bị, Người nhận, Người phân công, Ngày phân công, Trạng thái (badge), Hành động
- Trạng thái: Chờ xác nhận → Đã xác nhận → Đang sử dụng → Đã trả
- Phân công mới: `POST /api/assignments`
- Xác nhận: `PUT /api/assignments/:id/acknowledge`
- Chuyển giao: `PUT /api/assignments/:id/transfer`

---

## 8. Flow Bảo trì (Maintenance)

### 8.1 Screen Flow

```
Danh sách bảo trì (/maintenance)
    │
    ├── Nhấn "Yêu cầu bảo trì" ──→ Form yêu cầu (/maintenance/request)
    │   [Tất cả vai trò]                │
    │                              Chọn thiết bị, loại bảo trì,
    │                              mô tả vấn đề, ghi chú
    │                                    │
    │                              Gửi → Quay lại danh sách
    │
    ├── Nhấn "Lên lịch bảo trì" ──→ Form lên lịch (/maintenance/schedule)
    │   [admin, inventory_manager]       │
    │                              Chọn thiết bị, loại, ngày lên lịch,
    │                              người thực hiện, mô tả, ghi chú
    │                                    │
    │                              Lưu → Quay lại danh sách
    │
    ├── Nhấn "Hoàn thành" ──→ ConfirmDialog
    │   [admin, inventory_manager]
    │   [khi status=in_progress]
    │
    ├── Nhấn "Hủy" ──→ ConfirmDialog
    │   [admin, inventory_manager]
    │   [khi status=scheduled/pending]
    │
    └── Phân trang (10 items/trang)
```

### 8.2 Thao tác chi tiết

**Danh sách (`/maintenance`)**
- Bảng: Thiết bị, Loại (Phòng ngừa/Sửa chữa/Khác), Trạng thái, Ngày lên lịch, Người thực hiện, Hành động
- Trạng thái: Đã lên lịch → Đang thực hiện → Hoàn thành / Đã hủy

**Yêu cầu bảo trì (`/maintenance/request`)**
- Tất cả vai trò có thể gửi yêu cầu
- Form: Thiết bị (dropdown), Loại bảo trì, Mô tả (bắt buộc), Ghi chú
- API: `POST /api/maintenance/request`

**Lên lịch bảo trì (`/maintenance/schedule`)**
- Chỉ admin, inventory_manager
- Form: Thiết bị, Loại, Ngày lên lịch (datetime-local, phải trong tương lai), Người thực hiện (dropdown), Mô tả, Ghi chú
- API: `POST /api/maintenance/schedule`

**Hoàn thành**: `PUT /api/maintenance/:id/complete`
**Hủy**: `PUT /api/maintenance/:id/cancel`

---

## 9. Flow Bảo hành (Warranties)

### 9.1 Screen Flow

```
Bảo hành (/warranties)
    │
    ├── Nhấn "Thêm bảo hành" ──→ Modal form
    │   [admin, inventory_manager]     │
    │                            Chọn thiết bị, loại bảo hành,
    │                            nhà cung cấp, ngày bắt đầu/kết thúc,
    │                            phạm vi, chi phí
    │                                  │
    │                            Lưu → Đóng modal
    │
    ├── Nhấn "Sửa" ──→ Modal form (pre-fill)
    ├── Nhấn "Xóa" ──→ ConfirmDialog
    │
    └── Phân trang (10 items/trang)

Yêu cầu bảo hành (/warranties/claims)
    │
    ├── Nhấn "Thêm yêu cầu bảo hành" ──→ Modal form
    │   [admin, inventory_manager]           │
    │                                  Chọn bảo hành (dropdown),
    │                                  hiển thị thông tin thiết bị,
    │                                  mô tả sự cố, ngày nộp
    │                                        │
    │                                  Lưu → Đóng modal
    │
    └── Nhấn "Xóa" ──→ ConfirmDialog
```

### 9.2 Thao tác chi tiết

**Danh sách bảo hành (`/warranties`)**
- Bảng: Thiết bị, Loại (Nhà sản xuất/Mở rộng/Khác), Nhà cung cấp, Ngày bắt đầu, Ngày kết thúc, Trạng thái
- Trạng thái: Còn hiệu lực / Hết hạn / Đã hủy
- CRUD: admin, inventory_manager
- API: `GET/POST /api/warranties`, `PUT/DELETE /api/warranties/:id`

**Yêu cầu bảo hành (`/warranties/claims`)**
- Bảng: Mã yêu cầu, Thiết bị, Mô tả sự cố, Trạng thái, Kết quả xử lý
- Trạng thái: Đã nộp → Đang xem xét → Đã giải quyết / Từ chối
- API: `GET/POST /api/warranty-claims`, `DELETE /api/warranty-claims/:id`

---

## 10. Flow Khấu hao (Depreciation)

### 10.1 Screen Flow

```
Khấu hao (/depreciation)
    │
    ├── Tab "Quy tắc khấu hao"
    │   │
    │   ├── Nhấn "Thêm quy tắc" ──→ Modal form
    │   │   [admin, inventory_manager]     │
    │   │                            Chọn danh mục, phương pháp,
    │   │                            thời gian sử dụng, giá trị thu hồi,
    │   │                            tỷ lệ khấu hao
    │   │                                  │
    │   │                            Lưu → Đóng modal
    │   │
    │   ├── Nhấn "Sửa" ──→ Modal form (pre-fill)
    │   └── Nhấn "Xóa" ──→ ConfirmDialog
    │
    └── Tab "Khấu hao thiết bị"
        │
        ├── Nhập Device ID ──→ Nhấn "Tính khấu hao"
        │                           │
        │                     ┌─────┴─────┐
        │                     ▼           ▼
        │               Thành công    Lỗi
        │                     │
        │               Hiển thị:
        │               - Giá mua, Giá trị hiện tại
        │               - Khấu hao lũy kế
        │               - Phương pháp, Thời gian sử dụng
        │               - Bảng lịch khấu hao theo năm
        │
        └── (Không có dữ liệu → thông báo lỗi)
```

### 10.2 Thao tác chi tiết
- Quyền truy cập: admin, inventory_manager
- Phương pháp khấu hao: Đường thẳng (straight_line), Số dư giảm dần (declining_balance)
- API quy tắc: `GET/POST /api/depreciation/rules`, `PUT/DELETE /api/depreciation/rules/:id`
- API tính khấu hao: `GET /api/depreciation/calculate/:deviceId`

---

## 11. Flow Báo cáo (Reports)

### 11.1 Screen Flow

```
Báo cáo (/reports)
    │
    ├── Grid các loại báo cáo (card click)
    │   │
    │   ├── 🛡️ Bảo hành ──→ Bảng dữ liệu bảo hành
    │   ├── ⚠️ Cảnh báo bảo hành ──→ Thiết bị sắp hết hạn
    │   ├── 📊 Trạng thái thiết bị ──→ Thống kê trạng thái
    │   ├── 👤 Phân công ──→ Báo cáo phân công
    │   ├── 📉 Khấu hao ──→ Chọn danh mục → Báo cáo khấu hao
    │   ├── 💰 Giá trị tồn kho ──→ Tổng giá trị tài sản
    │   ├── 🔧 Bảo trì ──→ Báo cáo hoạt động bảo trì
    │   └── 📝 Báo cáo tùy chỉnh ──→ Tạo báo cáo theo yêu cầu
    │
    ├── Khu vực hiển thị báo cáo
    │   ├── Bảng dữ liệu (auto-generate columns)
    │   ├── Nút "Xuất báo cáo" (CSV) [admin, inventory_manager]
    │   └── Nút "Đóng"
    │
    └── Flow đặc biệt: Khấu hao
        │
        Nhấn card "Khấu hao" ──→ Dropdown chọn danh mục
                                       │
                                 Chọn danh mục → "Xem báo cáo"
                                       │
                                 Hiển thị bảng khấu hao
```

### 11.2 Thao tác chi tiết
- 8 loại báo cáo, hiển thị dạng card grid
- Báo cáo hạn chế (admin, inventory_manager): Khấu hao, Giá trị tồn kho, Bảo trì, Tùy chỉnh
- Báo cáo khấu hao yêu cầu chọn `categoryId` trước khi gọi API
- Xuất CSV: flatten data → `POST /api/reports/export` → download file
- API: `/api/reports/warranty`, `/api/reports/warranty-alerts`, `/api/reports/device-status`, `/api/reports/assignments`, `/api/reports/depreciation?categoryId=...`, `/api/reports/inventory-value`, `/api/reports/maintenance`, `/api/reports/custom`

---

## 12. Flow Quản lý Người dùng (Users)

### 12.1 Screen Flow

```
Người dùng (/users) [Chỉ admin]
    │
    ├── Nhấn "Thêm người dùng" ──→ Modal form
    │                                  │
    │                            Điền: Email, Mật khẩu, Họ, Tên,
    │                            Vai trò (dropdown), Mã phòng ban
    │                                  │
    │                            Thêm → Đóng modal
    │
    ├── Nhấn "Sửa" ──→ Modal form
    │                        │
    │                  Sửa: Họ, Tên, Vai trò, Mã phòng ban
    │                  (Thay đổi vai trò → gọi assignRole API)
    │                        │
    │                  Lưu → Đóng modal
    │
    └── Nhấn "Xóa" ──→ ConfirmDialog → Xóa
```

### 12.2 Thao tác chi tiết
- Chỉ admin mới truy cập được
- Bảng: Email, Họ, Tên, Vai trò (badge màu), Trạng thái (Hoạt động/Ngừng)
- Thêm người dùng: `POST /api/auth/register`
- Phân vai trò: `PUT /api/users/:id/role`
- Xóa: `DELETE /api/users/:id`

---

## 13. Flow Quản lý Hệ thống (System)

### 13.1 Screen Flow

```
Hệ thống (/system) [Chỉ admin]
    │
    ├── Tab "Cài đặt hệ thống"
    │   ├── Thêm cài đặt: Nhập Khóa + Giá trị → "Thêm"
    │   ├── Sửa: Nhấn "Sửa" → inline edit → "Lưu"
    │   └── Xóa: Nhấn "Xóa" → ConfirmDialog
    │
    ├── Tab "Thống kê CSDL"
    │   └── Hiển thị các card thống kê (collections, documents, size...)
    │
    ├── Tab "Sao lưu"
    │   ├── Nhấn "Tạo bản sao lưu" → Tạo backup mới
    │   ├── Nhấn "Tải xuống" → Download file backup
    │   └── Nhấn "Xóa" → ConfirmDialog → Xóa backup
    │
    └── Tab "Nhật ký hệ thống"
        ├── Bộ lọc: Từ ngày, Đến ngày, Hành động (Tạo mới/Cập nhật/Xóa/Đăng nhập)
        ├── Nhấn "Lọc" → Tải lại logs
        └── Bảng: Thời gian, Hành động, Module, Người dùng, Mô tả
```

### 13.2 Thao tác chi tiết

**Cài đặt hệ thống**
- CRUD key-value settings
- API: `GET /api/system/settings`, `PUT /api/system/settings`, `DELETE /api/system/settings/:key`

**Thống kê CSDL**
- Hiển thị thông tin database (collections, document count, storage size...)
- API: `GET /api/system/database-stats`

**Sao lưu**
- Tạo: `POST /api/system/backup`
- Danh sách: `GET /api/system/backup`
- Tải: `GET /api/system/backup/:filename/download`
- Xóa: `DELETE /api/system/backup/:filename`

**Nhật ký hệ thống**
- Sử dụng Audit Logs API thay vì System Logs
- API: `GET /api/audit-logs?fromDate=...&toDate=...&action=...`
- Bảng: Thời gian, Hành động (badge), Module, Người dùng, Mô tả

---

## 14. Tổng quan Screen Flow toàn hệ thống

```
                                    ┌──────────┐
                                    │ Trang chủ│
                                    │   (/)    │
                                    └────┬─────┘
                                         │
                                    ┌────▼─────┐
                                    │  Đăng    │
                                    │  nhập    │
                                    │ (/login) │
                                    └────┬─────┘
                                         │
                              ┌──────────▼──────────┐
                              │     Dashboard       │
                              │   (/dashboard)      │
                              │  Cards + Charts     │
                              └──────────┬──────────┘
                                         │
          ┌──────────┬──────────┬────────┼────────┬──────────┬──────────┐
          ▼          ▼          ▼        ▼        ▼          ▼          ▼
     ┌─────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
     │ Thiết bị││Danh mục││ Vị trí ││Phân    ││Bảo trì ││Bảo hành││Khấu hao│
     │/devices ││/catego-││/loca-  ││công    ││/mainte-││/warran-││/deprec-│
     │         ││ries    ││tions   ││/assign-││nance   ││ties    ││iation  │
     └────┬────┘└────────┘└────────┘│ments   │└───┬────┘└───┬────┘└────────┘
          │                         └────────┘    │         │
     ┌────┼────┐                             ┌────┼────┐┌───┴────┐
     ▼    ▼    ▼                             ▼    ▼    ▼▼        ▼
   Chi  Thêm  Sửa                        Yêu  Lên   Claims
   tiết mới   thiết                       cầu  lịch
   /:id /new  bị                          /req /sche
              /:id/                       uest dule
              edit

          ┌──────────┬──────────┐
          ▼          ▼          ▼
     ┌─────────┐┌────────┐┌────────┐
     │ Báo cáo ││Người   ││Hệ     │
     │/reports ││dùng    ││thống  │
     │         ││/users  ││/system│
     │         ││[admin] ││[admin]│
     └─────────┘└────────┘└────────┘
```

---

## 15. Bảng tổng hợp API Endpoints

| Module | Method | Endpoint | Mô tả |
|--------|--------|----------|--------|
| Auth | POST | `/api/auth/login` | Đăng nhập |
| Auth | POST | `/api/auth/register` | Đăng ký (admin tạo user) |
| Devices | GET | `/api/devices` | Danh sách thiết bị |
| Devices | GET | `/api/devices/search?q=` | Tìm kiếm |
| Devices | GET | `/api/devices/filter` | Lọc thiết bị |
| Devices | GET | `/api/devices/:id` | Chi tiết thiết bị |
| Devices | POST | `/api/devices` | Thêm thiết bị |
| Devices | PUT | `/api/devices/:id` | Cập nhật thiết bị |
| Devices | DELETE | `/api/devices/:id` | Xóa thiết bị |
| Categories | GET/POST | `/api/categories` | CRUD danh mục |
| Categories | PUT/DELETE | `/api/categories/:id` | Sửa/Xóa danh mục |
| Locations | GET/POST | `/api/locations` | CRUD vị trí |
| Locations | PUT/DELETE | `/api/locations/:id` | Sửa/Xóa vị trí |
| Assignments | GET/POST | `/api/assignments` | Danh sách/Phân công |
| Assignments | PUT | `/api/assignments/:id/acknowledge` | Xác nhận |
| Assignments | PUT | `/api/assignments/:id/transfer` | Chuyển giao |
| Maintenance | GET | `/api/maintenance` | Danh sách bảo trì |
| Maintenance | POST | `/api/maintenance/request` | Yêu cầu bảo trì |
| Maintenance | POST | `/api/maintenance/schedule` | Lên lịch bảo trì |
| Maintenance | PUT | `/api/maintenance/:id/complete` | Hoàn thành |
| Maintenance | PUT | `/api/maintenance/:id/cancel` | Hủy |
| Warranties | GET/POST | `/api/warranties` | CRUD bảo hành |
| Warranties | PUT/DELETE | `/api/warranties/:id` | Sửa/Xóa bảo hành |
| Warranty Claims | GET/POST | `/api/warranty-claims` | CRUD yêu cầu bảo hành |
| Depreciation | GET/POST | `/api/depreciation/rules` | CRUD quy tắc khấu hao |
| Depreciation | GET | `/api/depreciation/calculate/:id` | Tính khấu hao |
| Reports | GET | `/api/reports/device-status` | Báo cáo trạng thái |
| Reports | GET | `/api/reports/warranty` | Báo cáo bảo hành |
| Reports | GET | `/api/reports/warranty-alerts` | Cảnh báo bảo hành |
| Reports | GET | `/api/reports/depreciation?categoryId=` | Báo cáo khấu hao |
| Reports | GET | `/api/reports/inventory-value` | Giá trị tồn kho |
| Reports | GET | `/api/reports/assignments` | Báo cáo phân công |
| Reports | GET | `/api/reports/maintenance` | Báo cáo bảo trì |
| Reports | POST | `/api/reports/export` | Xuất báo cáo CSV |
| Users | GET | `/api/users` | Danh sách người dùng |
| Users | PUT | `/api/users/:id/role` | Phân vai trò |
| Users | DELETE | `/api/users/:id` | Xóa người dùng |
| System | GET/PUT/DELETE | `/api/system/settings` | Cài đặt hệ thống |
| System | GET | `/api/system/database-stats` | Thống kê CSDL |
| System | GET/POST | `/api/system/backup` | Sao lưu |
| Audit Logs | GET | `/api/audit-logs` | Nhật ký hệ thống |

---

## 16. Ma trận phân quyền

| Chức năng | admin | inventory_manager | staff |
|-----------|:-----:|:-----------------:|:-----:|
| Xem Dashboard | ✅ | ✅ | ✅ |
| Xem thiết bị | ✅ | ✅ | ✅ |
| Thêm/Sửa/Xóa thiết bị | ✅ | ✅ | ❌ |
| CRUD Danh mục | ✅ | ❌ | ❌ |
| CRUD Vị trí | ✅ | ❌ | ❌ |
| Phân công thiết bị | ✅ | ✅ | ❌ |
| Xác nhận phân công | ❌ | ❌ | ✅ |
| Chuyển giao thiết bị | ✅ | ✅ | ❌ |
| Yêu cầu bảo trì | ✅ | ✅ | ✅ |
| Lên lịch bảo trì | ✅ | ✅ | ❌ |
| Hoàn thành/Hủy bảo trì | ✅ | ✅ | ❌ |
| CRUD Bảo hành | ✅ | ✅ | ❌ |
| Yêu cầu bảo hành | ✅ | ✅ | ❌ |
| Xem Khấu hao | ✅ | ✅ | ❌ |
| CRUD Quy tắc khấu hao | ✅ | ✅ | ❌ |
| Xem báo cáo cơ bản | ✅ | ✅ | ✅ |
| Xem báo cáo nâng cao | ✅ | ✅ | ❌ |
| Xuất báo cáo CSV | ✅ | ✅ | ❌ |
| Quản lý người dùng | ✅ | ❌ | ❌ |
| Quản lý hệ thống | ✅ | ❌ | ❌ |

---

## 17. Các Component dùng chung

| Component | Mô tả | Sử dụng tại |
|-----------|--------|-------------|
| `AppLayout` | Layout chính với sidebar + main content | Tất cả trang protected |
| `DataTable` | Bảng dữ liệu với phân trang, sorting | Devices, Assignments, Maintenance, Warranties, Users... |
| `FormField` | Input field component (text, select, textarea, date, number) | Tất cả form |
| `ConfirmDialog` | Dialog xác nhận hành động (Xóa, Hoàn thành...) | Tất cả trang có thao tác xóa/xác nhận |
| `LoadingSpinner` | Hiệu ứng loading | Tất cả trang |
| `Notification` | Toast notification (success/error) | Tất cả thao tác CRUD |
| `ProtectedRoute` | Guard route yêu cầu đăng nhập | Tất cả route protected |
| `RoleGuard` | Guard route theo vai trò | Users, System, Maintenance Schedule |
