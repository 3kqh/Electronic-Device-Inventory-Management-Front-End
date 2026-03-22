# Package Diagram — Electronic Device Inventory Management (Front-End)

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              <<Application>>                                │
│                                  src/                                       │
│                                                                             │
│  ┌──────────┐   ┌──────────────┐   ┌────────────┐   ┌───────────────────┐  │
│  │  index.js │──▶│    App.js    │──▶│   routes   │──▶│      pages        │  │
│  └──────────┘   └──────────────┘   └─────┬──────┘   └────────┬──────────┘  │
│                                          │                    │             │
│                                          ▼                    ▼             │
│                                   ┌────────────┐      ┌────────────┐       │
│                                   │ components │      │    api     │       │
│                                   └──────┬─────┘      └──────┬─────┘       │
│                                          │                    │             │
│                                          ▼                    │             │
│                                   ┌────────────┐             │             │
│                                   │  context   │◀────────────┘             │
│                                   └────────────┘                           │
│                                                                             │
│  ┌────────────┐                                                             │
│  │   assets   │  (images, SVGs — static resources)                          │
│  └────────────┘                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────────┐
                    │    <<External Libraries>>         │
                    │  react, react-dom,               │
                    │  react-router-dom, axios          │
                    └──────────────────────────────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────────┐
                    │       <<Backend API>>             │
                    │  http://localhost:3120/api        │
                    └──────────────────────────────────┘
```

---

## Chi tiết từng package

### 1. `routes/`

| File             | Phụ thuộc vào                                          |
| ---------------- | ------------------------------------------------------ |
| `AppRoutes.jsx`  | `context/`, `components/`, tất cả `pages/`             |

```
routes
  └── AppRoutes.jsx
        ├──uses──▶ context/AuthContext (AuthProvider)
        ├──uses──▶ components/ProtectedRoute
        ├──uses──▶ components/RoleGuard
        ├──uses──▶ components/AppLayout
        └──uses──▶ pages/* (tất cả page components)
```

---

### 2. `context/`

| File              | Phụ thuộc vào            |
| ----------------- | ------------------------ |
| `AuthContext.js`   | `api/authService`       |

```
context
  └── AuthContext.js
        ├──provides──▶ AuthProvider (React Context Provider)
        ├──provides──▶ useAuth() hook
        └──uses──▶ api/authService (getProfile, signOut)
```

---

### 3. `components/`

| File                  | Phụ thuộc vào                     |
| --------------------- | --------------------------------- |
| `AppLayout.jsx`       | `context/AuthContext`, react-router-dom |
| `ProtectedRoute.jsx`  | `context/AuthContext`, `LoadingSpinner` |
| `RoleGuard.jsx`       | `context/AuthContext`             |
| `DataTable.jsx`       | (standalone)                      |
| `FormField.jsx`       | (standalone)                      |
| `ConfirmDialog.jsx`   | (standalone)                      |
| `LoadingSpinner.jsx`  | (standalone)                      |
| `Notification.jsx`    | (standalone)                      |

```
components
  ├── AppLayout.jsx ──uses──▶ context/AuthContext
  ├── ProtectedRoute.jsx ──uses──▶ context/AuthContext, LoadingSpinner
  ├── RoleGuard.jsx ──uses──▶ context/AuthContext
  ├── DataTable.jsx
  ├── FormField.jsx
  ├── ConfirmDialog.jsx
  ├── LoadingSpinner.jsx
  └── Notification.jsx
```

---

### 4. `api/`

Tất cả service đều phụ thuộc vào `axiosClient.js` (Axios instances).

| File                     | Axios Client  | Base Endpoint              |
| ------------------------ | ------------- | -------------------------- |
| `axiosClient.js`         | —             | Tạo `apiClient`, `userClient` |
| `authService.js`         | `apiClient`   | `/api/auth/*`              |
| `deviceService.js`       | `apiClient`   | `/api/devices/*`           |
| `categoryService.js`     | `apiClient`   | `/api/categories/*`        |
| `locationService.js`     | `apiClient`   | `/api/locations/*`         |
| `assignmentService.js`   | `apiClient`   | `/api/assignments/*`       |
| `maintenanceService.js`  | `apiClient`   | `/api/maintenance/*`       |
| `warrantyService.js`     | `apiClient`   | `/api/warranties/*`        |
| `depreciationService.js` | `apiClient`   | `/api/depreciation/*`      |
| `reportService.js`       | `apiClient`   | `/api/reports/*`           |
| `systemService.js`       | `apiClient`   | `/api/system/*`            |
| `userService.js`         | `userClient`  | `/users/*` (không có /api) |

```
api
  ├── axiosClient.js ──uses──▶ axios (external)
  │     ├── apiClient  (baseURL: /api)
  │     └── userClient (baseURL: /)
  │
  ├── authService.js ──────────▶ axiosClient (apiClient)
  ├── deviceService.js ────────▶ axiosClient (apiClient)
  ├── categoryService.js ──────▶ axiosClient (apiClient)
  ├── locationService.js ──────▶ axiosClient (apiClient)
  ├── assignmentService.js ────▶ axiosClient (apiClient)
  ├── maintenanceService.js ───▶ axiosClient (apiClient)
  ├── warrantyService.js ──────▶ axiosClient (apiClient)
  ├── depreciationService.js ──▶ axiosClient (apiClient)
  ├── reportService.js ────────▶ axiosClient (apiClient)
  ├── systemService.js ────────▶ axiosClient (apiClient)
  └── userService.js ──────────▶ axiosClient (userClient)
```

---

### 5. `pages/`

| Page                          | API Services sử dụng                              | Components sử dụng                                              |
| ----------------------------- | -------------------------------------------------- | ---------------------------------------------------------------- |
| `home/home.jsx`               | —                                                  | —                                                                |
| `login/LoginPage.jsx`         | `authService`                                      | —                                                                |
| `dashboard/DashboardPage.jsx` | `reportService`, `userService`                     | —                                                                |
| `devices/DeviceListPage.jsx`  | `deviceService`                                    | `DataTable`                                                      |
| `devices/DeviceFormPage.jsx`  | `deviceService`, `categoryService`, `locationService` | `FormField`, `Notification`, `LoadingSpinner`                 |
| `devices/DeviceDetailPage.jsx`| `deviceService`                                    | `ConfirmDialog`, `Notification`, `LoadingSpinner`                |
| `categories/CategoryPage.jsx` | `categoryService`                                  | `DataTable`, `FormField`, `ConfirmDialog`, `LoadingSpinner`, `Notification` |
| `locations/LocationPage.jsx`  | `locationService`                                  | `DataTable`, `FormField`, `ConfirmDialog`, `LoadingSpinner`, `Notification` |
| `assignments/AssignmentListPage.jsx` | `assignmentService`, `deviceService`, `userService` | `DataTable`, `FormField`, `ConfirmDialog`, `LoadingSpinner`, `Notification` |
| `maintenance/MaintenanceListPage.jsx`| `maintenanceService`                          | `DataTable`, `ConfirmDialog`, `LoadingSpinner`, `Notification`   |
| `warranties/WarrantyListPage.jsx`    | `warrantyService`, `deviceService`            | `DataTable`, `FormField`, `ConfirmDialog`, `LoadingSpinner`, `Notification` |
| `warranties/WarrantyClaimPage.jsx`   | `warrantyService`                             | `DataTable`, `FormField`, `ConfirmDialog`, `LoadingSpinner`, `Notification` |
| `depreciation/DepreciationPage.jsx`  | `depreciationService`, `categoryService`      | `DataTable`, `FormField`, `ConfirmDialog`, `LoadingSpinner`, `Notification` |
| `reports/ReportsPage.jsx`     | `reportService`                                    | `LoadingSpinner`, `Notification`                                 |
| `users/UserPage.jsx`          | `userService`, `authService`                       | `DataTable`, `FormField`, `ConfirmDialog`, `LoadingSpinner`, `Notification` |
| `system/SystemPage.jsx`       | `systemService`                                    | `ConfirmDialog`, `LoadingSpinner`, `Notification`                |
| `NotFoundPage.jsx`            | —                                                  | —                                                                |

---

## Sơ đồ quan hệ giữa các package (UML-style)

```
┌────────────┐
│   index.js │
└─────┬──────┘
      │ imports
      ▼
┌────────────┐       ┌──────────────────┐
│   App.js   │──────▶│  routes/         │
└────────────┘       │  AppRoutes.jsx   │
                     └───────┬──────────┘
                             │
              ┌──────────────┼──────────────────┐
              │              │                  │
              ▼              ▼                  ▼
     ┌──────────────┐ ┌────────────┐   ┌──────────────┐
     │  components/ │ │  context/  │   │   pages/     │
     │              │ │            │   │              │
     │ AppLayout    │ │ AuthContext │   │ 11 modules   │
     │ ProtectedRte │ │            │   │ (xem bảng    │
     │ RoleGuard    │ └──────┬─────┘   │  chi tiết)   │
     │ DataTable    │        │         └──────┬───────┘
     │ FormField    │        │                │
     │ ConfirmDlg   │        │                │
     │ LoadSpinner  │        │                │
     │ Notification │        │                │
     └──────────────┘        │                │
              ▲              │                │
              │              │                │
              └──────────────┤                │
                             │                │
                             ▼                ▼
                     ┌──────────────────────────┐
                     │         api/             │
                     │                          │
                     │  axiosClient.js          │
                     │  ├── authService         │
                     │  ├── deviceService       │
                     │  ├── categoryService     │
                     │  ├── locationService     │
                     │  ├── assignmentService   │
                     │  ├── maintenanceService  │
                     │  ├── warrantyService     │
                     │  ├── depreciationService │
                     │  ├── reportService       │
                     │  ├── userService         │
                     │  └── systemService       │
                     └─────────────┬────────────┘
                                   │
                                   ▼
                     ┌──────────────────────────┐
                     │    <<External>>           │
                     │  axios, react,            │
                     │  react-dom,               │
                     │  react-router-dom         │
                     └──────────────────────────┘
```

---

## Component Diagram — Chi tiết từng component

### Sơ đồ tổng quan components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        <<components package>>                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Layout & Auth Guards                         │    │
│  │                                                                 │    │
│  │  ┌──────────────┐  ┌─────────────────┐  ┌──────────────┐      │    │
│  │  │  AppLayout   │  │ ProtectedRoute  │  │  RoleGuard   │      │    │
│  │  │              │  │                 │  │              │      │    │
│  │  │ ◆ sidebar    │  │ ◆ auth check   │  │ ◆ role check │      │    │
│  │  │ ◆ navigation │  │ ◆ redirect     │  │ ◆ deny view  │      │    │
│  │  │ ◆ logout     │  │                 │  │              │      │    │
│  │  └──────┬───────┘  └────────┬────────┘  └──────┬───────┘      │    │
│  │         │                   │                   │              │    │
│  │         └───────────────────┼───────────────────┘              │    │
│  │                             │                                  │    │
│  │                             ▼                                  │    │
│  │                    ┌────────────────┐                          │    │
│  │                    │  AuthContext   │ (from context/)          │    │
│  │                    │  useAuth()    │                           │    │
│  │                    └────────────────┘                          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Reusable UI Components                       │    │
│  │                                                                 │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐      │    │
│  │  │  DataTable   │  │  FormField   │  │ ConfirmDialog   │      │    │
│  │  │              │  │              │  │                 │      │    │
│  │  │ ◆ columns    │  │ ◆ input      │  │ ◆ modal overlay │      │    │
│  │  │ ◆ sorting    │  │ ◆ select     │  │ ◆ confirm/cancel│      │    │
│  │  │ ◆ pagination │  │ ◆ textarea   │  │                 │      │    │
│  │  │ ◆ row click  │  │ ◆ validation │  │                 │      │    │
│  │  └──────┬───────┘  └──────────────┘  └─────────────────┘      │    │
│  │         │                                                      │    │
│  │         │ uses                                                 │    │
│  │         ▼                                                      │    │
│  │  ┌────────────────┐  ┌──────────────────┐                     │    │
│  │  │ LoadingSpinner │  │  Notification    │                     │    │
│  │  │                │  │                  │                     │    │
│  │  │ ◆ CSS spinner │  │ ◆ toast (global) │                     │    │
│  │  │ ◆ aria-label  │  │ ◆ success/error  │                     │    │
│  │  │               │  │ ◆ auto-dismiss   │                     │    │
│  │  └────────────────┘  └──────────────────┘                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Component: `AppLayout`

```
┌──────────────────────────────────────────────────────┐
│ <<component>> AppLayout                              │
├──────────────────────────────────────────────────────┤
│ State:                                               │
│   - collapsed: boolean                               │
│                                                      │
│ Dependencies:                                        │
│   - useAuth() → { user, logout }                     │
│   - useLocation() (react-router-dom)                 │
│   - useNavigate() (react-router-dom)                 │
│                                                      │
│ Chức năng:                                           │
│   - Sidebar navigation (co/mở rộng)                 │
│   - Hiển thị menu theo role (admin, manager, staff)  │
│   - Nút đăng xuất                                    │
│   - <Outlet /> render child routes                   │
├──────────────────────────────────────────────────────┤
│ Nav Items (lọc theo role):                           │
│   Dashboard, Thiết bị, Danh mục, Vị trí,            │
│   Phân công, Bảo trì, Bảo hành, Khấu hao,          │
│   Báo cáo, Người dùng (admin), Hệ thống (admin)     │
└──────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
  ┌──────────────┐         ┌────────────────┐
  │ AuthContext   │         │ react-router   │
  │ useAuth()    │         │ Outlet,        │
  │              │         │ useLocation,   │
  │              │         │ useNavigate    │
  └──────────────┘         └────────────────┘
```

---

### Component: `ProtectedRoute`

```
┌──────────────────────────────────────────────────────┐
│ <<component>> ProtectedRoute                         │
├──────────────────────────────────────────────────────┤
│ Props:                                               │
│   - children: ReactNode                              │
│                                                      │
│ Dependencies:                                        │
│   - useAuth() → { isAuthenticated, loading }         │
│   - Navigate (react-router-dom)                      │
│   - LoadingSpinner                                   │
│                                                      │
│ Logic:                                               │
│   loading=true  → <LoadingSpinner />                 │
│   !authenticated → <Navigate to="/login" />          │
│   authenticated  → render children                   │
└──────────────────────────────────────────────────────┘
         │               │
         ▼               ▼
  ┌──────────────┐ ┌────────────────┐
  │ AuthContext   │ │ LoadingSpinner │
  └──────────────┘ └────────────────┘
```

---

### Component: `RoleGuard`

```
┌──────────────────────────────────────────────────────┐
│ <<component>> RoleGuard                              │
├──────────────────────────────────────────────────────┤
│ Props:                                               │
│   - allowedRoles: string[]                           │
│   - children: ReactNode                              │
│                                                      │
│ Dependencies:                                        │
│   - useAuth() → { user }                             │
│                                                      │
│ Logic:                                               │
│   user.role ∈ allowedRoles → render children         │
│   otherwise → hiển thị "Truy cập bị từ chối"        │
└──────────────────────────────────────────────────────┘
         │
         ▼
  ┌──────────────┐
  │ AuthContext   │
  └──────────────┘
```

---

### Component: `DataTable`

```
┌──────────────────────────────────────────────────────┐
│ <<component>> DataTable                              │
├──────────────────────────────────────────────────────┤
│ Props:                                               │
│   - columns: Array<{                                 │
│       key: string,                                   │
│       label: string,                                 │
│       sortable?: boolean,                            │
│       render?: (value, row) => ReactNode             │
│     }>                                               │
│   - data: Array<Object>                              │
│   - pagination?: {                                   │
│       page: number,                                  │
│       pageSize: number,                              │
│       total: number                                  │
│     }                                                │
│   - onPageChange?: (page) => void                    │
│   - onSort?: (key, direction) => void                │
│   - onRowClick?: (row) => void                       │
│   - loading?: boolean                                │
│                                                      │
│ State:                                               │
│   - sortKey: string | null                           │
│   - sortDirection: 'asc' | 'desc'                    │
│                                                      │
│ Chức năng:                                           │
│   - Render bảng dữ liệu với header sortable         │
│   - Phân trang (prev/next + page numbers)            │
│   - Loading overlay                                  │
│   - Empty state "Không có dữ liệu"                  │
│   - Row hover highlight + click handler              │
│   - Custom cell render qua column.render()           │
├──────────────────────────────────────────────────────┤
│ Internal dependency:                                 │
│   └──uses──▶ LoadingSpinner                          │
└──────────────────────────────────────────────────────┘
```

---

### Component: `FormField`

```
┌──────────────────────────────────────────────────────┐
│ <<component>> FormField                              │
├──────────────────────────────────────────────────────┤
│ Props:                                               │
│   - label?: string                                   │
│   - name: string                                     │
│   - type: 'text' | 'select' | 'textarea' | ...      │
│   - value: any                                       │
│   - onChange: (event) => void                         │
│   - error?: string                                   │
│   - options?: Array<{ value, label }>  (cho select)  │
│   - required?: boolean                               │
│                                                      │
│ Chức năng:                                           │
│   - Render <input>, <select>, hoặc <textarea>        │
│     tùy theo prop type                               │
│   - Hiển thị label với dấu * nếu required            │
│   - Hiển thị error message bên dưới                  │
│   - Border đỏ khi có lỗi                             │
├──────────────────────────────────────────────────────┤
│ Dependencies: không (standalone)                     │
└──────────────────────────────────────────────────────┘
```

---

### Component: `ConfirmDialog`

```
┌──────────────────────────────────────────────────────┐
│ <<component>> ConfirmDialog                          │
├──────────────────────────────────────────────────────┤
│ Props:                                               │
│   - open: boolean                                    │
│   - title: string                                    │
│   - message: string                                  │
│   - onConfirm: () => void                            │
│   - onCancel: () => void                             │
│                                                      │
│ Chức năng:                                           │
│   - Modal overlay (click ngoài → cancel)             │
│   - Dialog box với title + message                   │
│   - Nút "Hủy" và "Xác nhận"                         │
│   - aria-modal, aria-labelledby (accessibility)      │
├──────────────────────────────────────────────────────┤
│ Dependencies: không (standalone)                     │
└──────────────────────────────────────────────────────┘
```

---

### Component: `LoadingSpinner`

```
┌──────────────────────────────────────────────────────┐
│ <<component>> LoadingSpinner                         │
├──────────────────────────────────────────────────────┤
│ Props: không                                         │
│                                                      │
│ Chức năng:                                           │
│   - CSS spinner animation (rotate 360°)              │
│   - role="status", aria-label="Đang tải"             │
├──────────────────────────────────────────────────────┤
│ Dependencies: không (standalone)                     │
└──────────────────────────────────────────────────────┘
```

---

### Component: `Notification`

```
┌──────────────────────────────────────────────────────┐
│ <<component>> Notification                           │
├──────────────────────────────────────────────────────┤
│ Props: không                                         │
│                                                      │
│ Exported function (global):                          │
│   showNotification({ type, message })                │
│     type: 'success' | 'error'                        │
│     message: string                                  │
│                                                      │
│ State:                                               │
│   - notification: { type, message } | null           │
│   - visible: boolean                                 │
│                                                      │
│ Chức năng:                                           │
│   - Toast notification (fixed top-right)             │
│   - Màu xanh (success) / đỏ (error)                 │
│   - Tự ẩn sau 3 giây                                 │
│   - Global listener pattern (module-level _listener) │
│   - role="alert" (accessibility)                     │
├──────────────────────────────────────────────────────┤
│ Dependencies: không (standalone)                     │
│ Gọi từ bên ngoài qua: showNotification()            │
└──────────────────────────────────────────────────────┘
```

---

### Sơ đồ quan hệ nội bộ giữa các components

```
                    ┌────────────────────────────────────────┐
                    │           AppRoutes.jsx                │
                    └──┬──────────┬──────────┬──────────────┘
                       │          │          │
                       ▼          ▼          ▼
              ┌────────────┐ ┌─────────┐ ┌──────────┐
              │ Protected  │ │  Role   │ │  App     │
              │ Route      │ │  Guard  │ │  Layout  │
              └─────┬──────┘ └────┬────┘ └────┬─────┘
                    │             │            │
                    │    ┌────────┘            │
                    │    │                     │
                    ▼    ▼                     ▼
              ┌──────────────┐         ┌──────────────┐
              │  AuthContext  │         │ react-router │
              │  useAuth()   │         │ Outlet, etc. │
              └──────────────┘         └──────────────┘
                    ▲
                    │ uses
         ┌─────────┼──────────────────────────────┐
         │         │                              │
   ┌─────┴────┐   │    ┌──────────────────────────┴───────┐
   │ Loading  │   │    │          <<pages>>                │
   │ Spinner  │◀──┘    │                                   │
   └──────────┘        │  Hầu hết pages sử dụng:          │
         ▲             │    ├── DataTable                  │
         │             │    ├── FormField                  │
   ┌─────┴────┐        │    ├── ConfirmDialog              │
   │ DataTable│        │    ├── LoadingSpinner             │
   └──────────┘        │    ├── Notification               │
                       │    │     (showNotification)       │
                       │    └── useAuth()                  │
                       └──────────────────────────────────┘
```

---

### Bảng tổng hợp: Component được sử dụng bởi page nào

| Component        | Được sử dụng bởi                                                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppLayout`      | `AppRoutes` (layout wrapper cho tất cả protected routes)                                                                                           |
| `ProtectedRoute` | `AppRoutes` (bọc ngoài AppLayout)                                                                                                                  |
| `RoleGuard`      | `AppRoutes` (bọc UserPage, SystemPage)                                                                                                             |
| `DataTable`      | DeviceListPage, CategoryPage, LocationPage, AssignmentListPage, MaintenanceListPage, WarrantyListPage, WarrantyClaimPage, DepreciationPage, UserPage |
| `FormField`      | DeviceFormPage, CategoryPage, LocationPage, AssignmentListPage, WarrantyListPage, WarrantyClaimPage, DepreciationPage, UserPage                     |
| `ConfirmDialog`  | DeviceDetailPage, CategoryPage, LocationPage, AssignmentListPage, MaintenanceListPage, WarrantyListPage, WarrantyClaimPage, DepreciationPage, UserPage, SystemPage |
| `LoadingSpinner` | ProtectedRoute, DataTable (internal), DeviceFormPage, DeviceDetailPage, CategoryPage, LocationPage, AssignmentListPage, MaintenanceListPage, WarrantyListPage, WarrantyClaimPage, DepreciationPage, ReportsPage, UserPage, SystemPage |
| `Notification`   | App.js (mount global), showNotification() gọi từ: DeviceFormPage, DeviceDetailPage, CategoryPage, LocationPage, AssignmentListPage, MaintenanceListPage, WarrantyListPage, WarrantyClaimPage, DepreciationPage, ReportsPage, UserPage, SystemPage |

---

## Ghi chú

- Hầu hết các page đều phụ thuộc vào `context/AuthContext` thông qua hook `useAuth()` để kiểm tra quyền truy cập.
- `axiosClient.js` cung cấp 2 Axios instance: `apiClient` (prefix `/api`) và `userClient` (không prefix) — tất cả service đều dùng `apiClient` ngoại trừ `userService` dùng `userClient`.
- Package `components/` chứa các UI component tái sử dụng, không phụ thuộc lẫn nhau (trừ `ProtectedRoute` dùng `LoadingSpinner`).
- Package `assets/` chứa tài nguyên tĩnh (hình ảnh, SVG), không có dependency code.
