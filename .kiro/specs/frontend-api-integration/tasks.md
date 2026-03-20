# Implementation Plan: Frontend API Integration (EDIMS)

## Overview

Build the complete React frontend for the Electronic Device Inventory Management System (EDIMS), integrating with the Express.js backend. Implementation proceeds incrementally: axios setup → auth context → shared components → layout/routing → API services → pages. Each task builds on previous steps. All UI text in Vietnamese. Uses React 19, react-router-dom v7, axios, inline styles, fast-check for PBT, Jest + React Testing Library for unit tests.

## Tasks

- [x] 1. Install dependencies and set up axios client instances
  - Install `axios` and `fast-check` packages
  - Rewrite `src/api/axiosClient.js` to export two instances: `apiClient` (baseURL: `http://localhost:5000/api`) and `userClient` (baseURL: `http://localhost:5000`)
  - Add request interceptor on both instances to attach `Authorization: Bearer <token>` from localStorage
  - Add response interceptor on both instances to handle 401 (clear token, redirect to `/login`), 403, 500, and network errors
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Implement AuthContext and auth service
  - [x] 2.1 Create `src/api/authService.js` with all auth API functions
    - Implement: `signIn`, `refreshToken`, `getProfile`, `signOut`, `updateProfile`, `changePassword`, `register`, `resetPassword`, `unlockAccount`
    - All functions use `apiClient` and target `/auth/*` endpoints
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [x] 2.2 Create `src/context/AuthContext.js`
    - Implement AuthProvider with state: `user`, `token`, `isAuthenticated`, `loading`
    - On mount: check localStorage for token, call `getProfile()` to validate, set user or clear token
    - Expose `login(token, user)` — stores token in localStorage, sets user state
    - Expose `logout()` — calls signOut API, removes token from localStorage, clears user state
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 2.3 Write property test for auth state round trip (Property 4)
    - **Property 4: Auth state round trip (login/logout)**
    - Generate random token/user pairs with fast-check, call login then logout, verify state transitions and localStorage
    - **Validates: Requirements 3.3, 3.4**

  - [ ]* 2.4 Write property test for token attachment (Property 2)
    - **Property 2: Token attachment on outgoing requests**
    - Generate random JWT-like strings, store in localStorage, make request through apiClient and userClient, verify Authorization header
    - **Validates: Requirements 1.2**

  - [ ]* 2.5 Write property test for 401 response handling (Property 3)
    - **Property 3: 401 response clears auth state**
    - Simulate 401 responses on both axios instances, verify token removal from localStorage and redirect to /login
    - **Validates: Requirements 1.3**

- [ ] 3. Implement shared UI components
  - [x] 3.1 Create `src/components/LoadingSpinner.jsx`
    - Simple centered spinner with inline styles
    - _Requirements: 19.5_

  - [x] 3.2 Create `src/components/Notification.jsx`
    - Toast notification component with `type` ('success' | 'error') and `message` props
    - Export `showNotification` module-level function
    - Auto-dismiss after timeout, inline styles with color coding
    - _Requirements: 19.4_

  - [x] 3.3 Create `src/components/ConfirmDialog.jsx`
    - Modal dialog with `open`, `title`, `message`, `onConfirm`, `onCancel` props
    - Overlay backdrop, centered dialog box, confirm/cancel buttons
    - _Requirements: 19.3_

  - [x] 3.4 Create `src/components/DataTable.jsx`
    - Props: `columns` (key, label, sortable, render), `data`, `pagination` (page, pageSize, total), `onPageChange`, `onSort`, `onRowClick`, `loading`
    - Render table headers from columns, rows from data, pagination controls
    - Show loading spinner overlay when loading, empty state message when no data
    - _Requirements: 19.1_

  - [x] 3.5 Create `src/components/FormField.jsx`
    - Reusable form field with label, input/select/textarea, error message display
    - Props: `label`, `name`, `type`, `value`, `onChange`, `error`, `options` (for select), `required`
    - _Requirements: 19.2_

  - [ ]* 3.6 Write property test for DataTable rendering (Property 15)
    - **Property 15: DataTable renders columns and pagination correctly**
    - Generate random column configs and data arrays, render DataTable, verify header count equals columns length and row count equals data length
    - **Validates: Requirements 19.1**

  - [ ]* 3.7 Write property test for Notification type and message (Property 16)
    - **Property 16: Notification component displays correct type and message**
    - Generate random type/message pairs, render Notification, verify correct styling and exact message text
    - **Validates: Requirements 19.4**

  - [ ]* 3.8 Write property test for ConfirmDialog callbacks (Property 17)
    - **Property 17: ConfirmDialog callbacks**
    - Generate random title/message, render dialog, click confirm/cancel, verify each callback invoked exactly once
    - **Validates: Requirements 19.3**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement ProtectedRoute, RoleGuard, and AppLayout
  - [x] 5.1 Create `src/components/ProtectedRoute.jsx`
    - Read `isAuthenticated` and `loading` from AuthContext
    - If loading: show LoadingSpinner
    - If not authenticated: redirect to `/login` using `<Navigate>`
    - Otherwise: render children
    - _Requirements: 5.1, 5.4_

  - [x] 5.2 Create `src/components/RoleGuard.jsx`
    - Props: `allowedRoles` (array of role strings)
    - Read `user` from AuthContext
    - If user.role is in allowedRoles: render children
    - Otherwise: render "Truy cập bị từ chối" (Access Denied) message
    - _Requirements: 5.2, 5.3_

  - [x] 5.3 Create `src/components/AppLayout.jsx`
    - Collapsible sidebar with navigation links, main content area with `<Outlet />`
    - Sidebar header: display user's firstName, lastName, and role from AuthContext
    - Navigation items filtered by user role per the role-navigation mapping table in design
    - Highlight active navigation item using current route path
    - Logout button calling `logout()` from AuthContext
    - Inline styles, Vietnamese labels (Thiết bị, Danh mục, Vị trí, Phân công, Bảo trì, Bảo hành, Khấu hao, Báo cáo, Người dùng, Hệ thống)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 5.4 Write property test for ProtectedRoute redirect (Property 5)
    - **Property 5: Protected route redirect for unauthenticated users**
    - Generate random route paths from protected routes list, render without auth, verify redirect to /login
    - **Validates: Requirements 5.1, 20.2**

  - [ ]* 5.5 Write property test for RoleGuard access control (Property 6)
    - **Property 6: Role-based access control**
    - Generate random (role, allowedRoles) pairs, render RoleGuard, verify content rendered iff role ∈ allowedRoles
    - **Validates: Requirements 5.2, 5.3, 20.3, 20.4**

  - [ ]* 5.6 Write property test for sidebar navigation by role (Property 7)
    - **Property 7: Sidebar navigation items filtered by role**
    - Generate random roles, render AppLayout with AuthContext, verify visible nav items match role config
    - **Validates: Requirements 6.3, 17.5**

  - [ ]* 5.7 Write property test for sidebar user identity (Property 8)
    - **Property 8: Sidebar displays user identity**
    - Generate random firstName/lastName/role, render sidebar, verify text content includes name and role
    - **Validates: Requirements 6.2**

- [ ] 6. Set up routing configuration and Login page
  - [x] 6.1 Create `src/pages/login/LoginPage.jsx`
    - Login form with email and password fields
    - On submit: call `signIn` from authService, then `login()` from AuthContext, redirect to `/dashboard`
    - Display API error messages on failure
    - Disable submit button and show loading indicator while request in progress
    - If already authenticated: redirect to `/dashboard`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 6.2 Create `src/pages/NotFoundPage.jsx`
    - Display 404 message with link back to dashboard
    - Vietnamese text: "Trang không tồn tại"
    - _Requirements: 20.5_

  - [x] 6.3 Update `src/routes/AppRoutes.jsx` with full routing configuration
    - Wrap App with `AuthProvider`
    - Public routes: `/` (Home), `/login` (LoginPage)
    - Protected routes wrapped in `ProtectedRoute` and `AppLayout`: `/dashboard`, `/devices`, `/devices/new`, `/devices/:id`, `/devices/:id/edit`, `/categories`, `/locations`, `/assignments`, `/maintenance`, `/warranties`, `/warranties/claims`, `/depreciation`, `/reports`
    - Admin-only routes wrapped in additional `RoleGuard`: `/users`, `/system`
    - Catch-all `*` route → NotFoundPage
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

  - [ ]* 6.4 Write property test for 404 on undefined routes (Property 18)
    - **Property 18: 404 page for undefined routes**
    - Generate random non-matching URL paths, render router, verify NotFound page renders
    - **Validates: Requirements 20.5**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement all API service modules
  - [x] 8.1 Create `src/api/deviceService.js`
    - Implement all device CRUD, search, barcode, label, and bulk operation functions using `apiClient`
    - Functions: `getAllDevices`, `getDeviceById`, `addDevice`, `updateDevice`, `deleteDevice`, `disposeDevice`, `searchDevices`, `filterDevices`, `advancedSearch`, `scanBarcode`, `generateBarcode`, `generateMultipleBarcodes`, `printAssetLabel`, `bulkPrintAssetLabels`, `bulkImportDevices`, `bulkExportDevices`, `bulkUpdateStatus`, `bulkUpdateLocation`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 8.2 Create `src/api/categoryService.js`
    - Implement: `getAllCategories`, `getCategoryById`, `createCategory`, `updateCategory`, `deleteCategory` using `apiClient`
    - _Requirements: 10.1_

  - [x] 8.3 Create `src/api/locationService.js`
    - Implement: `getAllLocations`, `getLocationById`, `createLocation`, `updateLocation`, `deleteLocation` using `apiClient`
    - _Requirements: 11.1_

  - [x] 8.4 Create `src/api/userService.js`
    - Implement: `getAllUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`, `assignRole` using `userClient` (no /api prefix)
    - _Requirements: 12.1_

  - [x] 8.5 Create `src/api/assignmentService.js`
    - Implement: `getAllAssignments`, `getAssignmentById`, `assignDevice`, `updateAssignment`, `unassignDevice`, `transferDevice`, `getAssignmentHistory`, `getUserAssignments`, `acknowledgeAssignment` using `apiClient`
    - _Requirements: 13.1_

  - [x] 8.6 Create `src/api/maintenanceService.js`
    - Implement: `getAllMaintenance`, `getMaintenanceById`, `recordMaintenance`, `requestMaintenance`, `scheduleMaintenance`, `updateMaintenance`, `completeMaintenance`, `cancelMaintenance`, `getUpcomingMaintenance`, `getMaintenanceHistory` using `apiClient`
    - _Requirements: 14.1_

  - [x] 8.7 Create `src/api/warrantyService.js`
    - Implement warranty functions: `getAllWarranties`, `getWarrantyById`, `createWarranty`, `updateWarranty`, `deleteWarranty`, `getExpiringWarranties`, `refreshWarrantyStatus`
    - Implement warranty claim functions: `getAllWarrantyClaims`, `getWarrantyClaimById`, `createWarrantyClaim`, `updateWarrantyClaim`, `deleteWarrantyClaim`
    - All using `apiClient`
    - _Requirements: 15.1, 15.2_

  - [x] 8.8 Create `src/api/depreciationService.js`
    - Implement: `getAllDepreciationRules`, `getDepreciationRuleById`, `getDepreciationRuleByCategory`, `createDepreciationRule`, `updateDepreciationRule`, `deleteDepreciationRule`, `calculateDeviceDepreciation`, `getCategoryDepreciation`, `batchUpdateValues` using `apiClient`
    - _Requirements: 16.1_

  - [x] 8.9 Create `src/api/reportService.js`
    - Implement: `getWarrantyReport`, `getWarrantyAlerts`, `getDepreciationReport`, `getDeviceStatusReport`, `getInventoryValueReport`, `getAssignmentReport`, `getMaintenanceReport`, `generateCustomReport`, `exportReport` using `apiClient`
    - _Requirements: 17.1_

  - [x] 8.10 Create `src/api/systemService.js`
    - Implement: `healthCheck`, `getSystemSettings`, `updateSystemSetting`, `deleteSystemSetting`, `getDatabaseStats`, `createBackup`, `getBackupList`, `downloadBackup`, `deleteBackup`, `getSystemLogs` using `apiClient`
    - _Requirements: 18.1_

  - [ ]* 8.11 Write property test for API service function-to-endpoint mapping (Property 1)
    - **Property 1: API service function-to-endpoint mapping**
    - For each service module, generate random valid arguments, mock axios, verify correct HTTP method and URL path
    - Cover all 11 service modules: auth, device, category, location, user, assignment, maintenance, warranty, depreciation, report, system
    - **Validates: Requirements 2.1–2.9, 7.1–7.5, 10.1, 11.1, 12.1, 13.1, 14.1, 15.1, 15.2, 16.1, 17.1, 18.1**

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Dashboard page
  - Create `src/pages/dashboard/DashboardPage.jsx`
  - Fetch device status counts and user count from report/device APIs on mount
  - Display summary cards: total devices, available, assigned, in_maintenance, retired, total users
  - Show skeleton placeholders while loading
  - Display error message with retry button on API failure
  - Inline styles, Vietnamese labels
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 11. Implement Device management pages
  - [x] 11.1 Create `src/pages/devices/DeviceListPage.jsx`
    - Paginated device list using DataTable with columns: asset tag, name, category, status, condition, location
    - Search input calling `searchDevices`, filter controls calling `filterDevices`
    - "Thêm thiết bị" button (Admin/Inventory_Manager only) navigating to `/devices/new`
    - Row click navigates to `/devices/:id`
    - _Requirements: 9.1, 9.5_

  - [x] 11.2 Create `src/pages/devices/DeviceDetailPage.jsx`
    - Fetch device by ID, display all device fields
    - "Sửa" (Edit) button navigating to `/devices/:id/edit` (Admin/Inventory_Manager only)
    - "Xóa" (Delete) button with ConfirmDialog (Admin/Inventory_Manager only)
    - _Requirements: 9.2_

  - [x] 11.3 Create `src/pages/devices/DeviceFormPage.jsx`
    - Shared form for add (`/devices/new`) and edit (`/devices/:id/edit`)
    - Fields matching Device model: name, serialNumber, categoryId (dropdown), manufacturer, model, purchaseDate, purchasePrice, locationId (dropdown), status, condition
    - On edit: pre-fill form with existing device data
    - Field-level validation and error display using FormField
    - On success: show notification, navigate to device list
    - _Requirements: 9.3, 9.4, 9.6, 9.7_

  - [ ]* 11.4 Write property test for device edit form pre-population (Property 13)
    - **Property 13: Device edit form pre-population**
    - Generate random device objects, render edit form, verify all fields pre-filled with corresponding values
    - **Validates: Requirements 9.4**

- [x] 12. Implement Category management page
  - Create `src/pages/categories/CategoryPage.jsx`
  - List categories using DataTable with columns: name, code, description
  - Add/Edit form with fields: name, code, description, custom fields
  - Delete with ConfirmDialog confirmation
  - Admin-only for create/edit/delete actions
  - _Requirements: 10.2, 10.3, 10.4_

- [x] 13. Implement Location management page
  - Create `src/pages/locations/LocationPage.jsx`
  - List locations using DataTable with columns: name, code, type, parent location
  - Add/Edit form with fields: name, code, type (building/floor/room/other), parentId (dropdown), address
  - Delete with ConfirmDialog confirmation
  - _Requirements: 11.2, 11.3, 11.4_

- [x] 14. Implement User management page (Admin only)
  - Create `src/pages/users/UserPage.jsx`
  - List users using DataTable with columns: email, firstName, lastName, role, status
  - Add user form calling `register` auth API with fields: email, password, firstName, lastName, role, departmentId
  - Edit user form, role assignment via `assignRole`
  - Delete with ConfirmDialog confirmation
  - _Requirements: 12.2, 12.3, 12.4, 12.5_

- [x] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Implement Assignment management pages
  - [x] 16.1 Create `src/pages/assignments/AssignmentListPage.jsx`
    - List assignments using DataTable with columns: device name, assigned to, assigned by, date, status
    - "Phân công thiết bị" button (Admin/Inventory_Manager only)
    - "Acknowledge" button for pending assignments (Staff view)
    - "Transfer" button for active assignments (Admin/Inventory_Manager only)
    - _Requirements: 13.2, 13.4, 13.5_

  - [x] 16.2 Create `src/pages/assignments/AssignmentFormPage.jsx`
    - Form with device selector, user selector, notes field
    - Calls `assignDevice` API on submit
    - Transfer form variant with new user selector calling `transferDevice`
    - _Requirements: 13.3, 13.5_

  - [ ]* 16.3 Write property test for pending assignment acknowledge button (Property 14)
    - **Property 14: Pending assignment shows acknowledge button**
    - Generate random assignments with various statuses, render for staff user, verify "Acknowledge" button appears only for status "pending"
    - **Validates: Requirements 13.4**

- [ ] 17. Implement Maintenance management pages
  - [x] 17.1 Create `src/pages/maintenance/MaintenanceListPage.jsx`
    - List maintenance records using DataTable with columns: device, type, status, scheduled date, performed by
    - "Yêu cầu bảo trì" button (all roles) and "Lên lịch bảo trì" button (Admin/Inventory_Manager)
    - "Hoàn thành" button for in-progress records (Admin/Inventory_Manager)
    - _Requirements: 14.2_

  - [x] 17.2 Create `src/pages/maintenance/MaintenanceFormPage.jsx`
    - Request form: device selector, description (Staff can use)
    - Schedule form: device selector, type, scheduled date, description (Admin/Inventory_Manager)
    - Complete form: completed date, cost, notes (Admin/Inventory_Manager)
    - _Requirements: 14.3, 14.4, 14.5_

- [ ] 18. Implement Warranty management pages
  - [x] 18.1 Create `src/pages/warranties/WarrantyListPage.jsx`
    - List warranties using DataTable with columns: device, type, provider, start date, end date, status
    - Add/Edit warranty form with fields: deviceId, type, provider, startDate, endDate, coverage, cost
    - Delete with ConfirmDialog
    - _Requirements: 15.3_

  - [x] 18.2 Create `src/pages/warranties/WarrantyClaimPage.jsx`
    - List warranty claims with columns: claim number, device, issue, status, resolution
    - Add claim form: warranty selector, device (auto-filled), issue description, filed date
    - _Requirements: 15.4, 15.5_

- [x] 19. Implement Depreciation management page
  - Create `src/pages/depreciation/DepreciationPage.jsx`
  - List depreciation rules using DataTable with columns: category, method, useful life, salvage value %, depreciation rate
  - Add/Edit rule form: category selector, method (straight_line/declining_balance), useful life years, salvage value percent, depreciation rate
  - Device depreciation detail view: current value, purchase price, depreciation schedule
  - Delete with ConfirmDialog
  - _Requirements: 16.2, 16.3, 16.4_

- [x] 20. Implement Reports page
  - Create `src/pages/reports/ReportsPage.jsx`
  - Reports hub with cards linking to each report type: warranty, warranty alerts, depreciation, device status, inventory value, assignments, maintenance, custom
  - On report selection: fetch and display data in tabular format
  - Export button calling `exportReport` API, trigger file download
  - Role-based visibility: depreciation, inventory value, maintenance, custom reports restricted to Admin/Inventory_Manager
  - _Requirements: 17.2, 17.3, 17.4, 17.5_

- [x] 21. Implement System settings page (Admin only)
  - Create `src/pages/system/SystemPage.jsx`
  - System settings: key-value list with inline editing, add/delete settings
  - Database stats display
  - Backup management: create, list, download, delete backups
  - System logs viewer with date range and log level filtering
  - _Requirements: 18.2, 18.3, 18.4, 18.5_

- [x] 22. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 23. Wire everything together and final integration
  - [x] 23.1 Update `src/App.js` to wrap with AuthProvider
    - Ensure AuthProvider wraps the entire app
    - Verify all routes render correctly within the provider hierarchy
    - _Requirements: 3.5, 20.1_

  - [x] 23.2 Verify error handling across all pages
    - Ensure all pages wrap API calls in try/catch
    - Verify error messages display using Notification component
    - Verify form errors map to field-level messages
    - _Requirements: 4.3, 8.4, 9.6_

  - [ ]* 23.3 Write property test for API error messages in UI (Property 10)
    - **Property 10: API error messages displayed in UI**
    - Generate random error message strings, simulate API error on form submission, verify message appears in DOM
    - **Validates: Requirements 4.3, 9.6, 8.4**

  - [ ]* 23.4 Write property test for confirmation dialog before delete (Property 11)
    - **Property 11: Confirmation dialog before delete**
    - Generate random item data, click delete on category/location/user pages, verify dialog appears before API call
    - **Validates: Requirements 10.4, 11.4, 12.5**

  - [ ]* 23.5 Write property test for form validation (Property 20)
    - **Property 20: Form validation rejects invalid input and preserves valid input**
    - Generate random invalid inputs (empty, whitespace, too-long), submit form, verify error messages appear and valid fields preserved
    - **Validates: Requirements 19.2**

  - [ ]* 23.6 Write property test for dashboard summary cards (Property 12)
    - **Property 12: Dashboard summary cards reflect data**
    - Generate random device count data, mock API response, render dashboard, verify card values match response
    - **Validates: Requirements 8.2**

  - [ ]* 23.7 Write property test for depreciation detail view (Property 19)
    - **Property 19: Depreciation detail view data accuracy**
    - Generate random depreciation calculation responses, render detail view, verify displayed values match response
    - **Validates: Requirements 16.4**

  - [ ]* 23.8 Write property test for active navigation highlighting (Property 9)
    - **Property 9: Active navigation highlighting**
    - Generate random route paths matching nav items, render AppLayout, verify the matching nav item has highlighted style
    - **Validates: Requirements 6.4**

- [x] 24. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All UI text should be in Vietnamese as per project convention
- Inline styles used throughout to match existing landing page convention
- `userClient` (no /api prefix) is only used by `userService.js`; all other services use `apiClient`
