# Requirements Document

## Introduction

Xây dựng toàn bộ giao diện frontend React cho hệ thống Quản lý Thiết bị Điện tử (EDIMS) và tích hợp với tất cả API backend Express.js. Hệ thống hiện tại chỉ có trang landing page tĩnh, cần bổ sung xác thực, phân quyền, các trang quản lý, tầng dịch vụ API, và layout chung với sidebar điều hướng. Giao diện sử dụng tiếng Việt.

## Glossary

- **EDIMS_Frontend**: Ứng dụng React (React 19, react-router-dom v7) tại `Electronic-Device-Inventory-Management-Front-End/src`
- **Backend_API**: Server Express.js + MongoDB chạy trên port 5000, cung cấp REST API
- **Axios_Client**: Instance axios đã cấu hình tại `src/api/axiosClient.js`, dùng để gọi Backend_API
- **Auth_Context**: React Context quản lý trạng thái xác thực (token, user info, role) toàn ứng dụng
- **API_Service_Layer**: Các module JavaScript tại `src/api/` đóng gói lời gọi HTTP tới Backend_API
- **Protected_Route**: Component wrapper chỉ cho phép truy cập khi người dùng đã xác thực
- **Role_Guard**: Component wrapper kiểm tra role của người dùng trước khi hiển thị nội dung
- **App_Layout**: Layout chung gồm sidebar điều hướng và vùng nội dung chính
- **Admin**: Vai trò có toàn quyền truy cập hệ thống
- **Inventory_Manager**: Vai trò quản lý thiết bị, phân công, bảo trì, bảo hành, khấu hao
- **Staff**: Vai trò xem thiết bị, yêu cầu bảo trì, xác nhận phân công

## Requirements

### Requirement 1: Cấu hình Axios Client

**User Story:** As a developer, I want the axios client to point to the correct backend URL and automatically attach auth tokens, so that all API calls are authenticated and reach the right server.

#### Acceptance Criteria

1. THE Axios_Client SHALL use `http://localhost:5000` as the base URL for Backend_API requests
2. WHEN a JWT token exists in localStorage, THE Axios_Client SHALL attach the token as a Bearer Authorization header on every outgoing request
3. WHEN the Backend_API returns a 401 Unauthorized response, THE Axios_Client SHALL remove the stored token and redirect the user to the login page
4. THE Axios_Client SHALL use `http://localhost:5000/api` as the default baseURL prefix, and provide a separate instance without the `/api` prefix for the `/users` endpoint

### Requirement 2: Authentication Service Layer

**User Story:** As a developer, I want a dedicated auth API service module, so that all authentication-related HTTP calls are centralized and reusable.

#### Acceptance Criteria

1. THE API_Service_Layer SHALL expose a `signIn(email, password)` function that sends a POST request to `/api/auth/signin`
2. THE API_Service_Layer SHALL expose a `refreshToken(token)` function that sends a POST request to `/api/auth/refresh-token`
3. THE API_Service_Layer SHALL expose a `getProfile()` function that sends a GET request to `/api/auth/me`
4. THE API_Service_Layer SHALL expose a `signOut()` function that sends a POST request to `/api/auth/signout`
5. THE API_Service_Layer SHALL expose a `updateProfile(data)` function that sends a PUT request to `/api/auth/profile`
6. THE API_Service_Layer SHALL expose a `changePassword(data)` function that sends a PUT request to `/api/auth/change-password`
7. THE API_Service_Layer SHALL expose a `register(data)` function that sends a POST request to `/api/auth/register`
8. THE API_Service_Layer SHALL expose a `resetPassword(data)` function that sends a POST request to `/api/auth/reset-password`
9. THE API_Service_Layer SHALL expose an `unlockAccount(userId)` function that sends a POST request to `/api/auth/unlock-account`

### Requirement 3: Authentication Context and State Management

**User Story:** As a user, I want my login state to persist across page refreshes and be available throughout the app, so that I don't have to log in repeatedly.

#### Acceptance Criteria

1. THE Auth_Context SHALL store the current user object (id, email, firstName, lastName, role) and JWT token
2. WHEN the EDIMS_Frontend loads, THE Auth_Context SHALL check localStorage for an existing token and validate it by calling `getProfile()`
3. WHEN a user signs in successfully, THE Auth_Context SHALL store the token in localStorage and update the user state
4. WHEN a user signs out, THE Auth_Context SHALL remove the token from localStorage and clear the user state
5. THE Auth_Context SHALL expose `isAuthenticated`, `user`, `login`, `logout`, and `loading` values to consuming components

### Requirement 4: Login Page

**User Story:** As a user, I want a login page where I can enter my credentials, so that I can access the system.

#### Acceptance Criteria

1. THE EDIMS_Frontend SHALL display a login form with email and password fields at the `/login` route
2. WHEN the user submits valid credentials, THE EDIMS_Frontend SHALL call the signIn API and redirect to the dashboard on success
3. IF the signIn API returns an error, THEN THE EDIMS_Frontend SHALL display the error message from the Backend_API response
4. WHILE the login request is in progress, THE EDIMS_Frontend SHALL disable the submit button and show a loading indicator
5. WHEN an authenticated user navigates to `/login`, THE EDIMS_Frontend SHALL redirect the user to the dashboard

### Requirement 5: Protected Routes and Role-Based Access

**User Story:** As an admin, I want certain pages restricted by authentication and role, so that unauthorized users cannot access sensitive features.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to a protected route, THE Protected_Route SHALL redirect the user to the `/login` page
2. WHEN an authenticated user with insufficient role navigates to a role-restricted route, THE Role_Guard SHALL display an "Access Denied" message
3. THE Role_Guard SHALL accept a list of allowed roles and compare against the current user's role from Auth_Context
4. WHILE the Auth_Context is loading (checking token validity), THE Protected_Route SHALL display a loading indicator instead of redirecting

### Requirement 6: Application Layout with Sidebar Navigation

**User Story:** As a user, I want a consistent layout with sidebar navigation, so that I can easily navigate between different sections of the application.

#### Acceptance Criteria

1. THE App_Layout SHALL display a collapsible sidebar with navigation links grouped by feature area
2. THE App_Layout SHALL display the current user's name and role in the sidebar header
3. THE App_Layout SHALL show navigation items based on the current user's role (Admin sees all items, Inventory_Manager sees management items, Staff sees limited items)
4. THE App_Layout SHALL highlight the currently active navigation item
5. WHEN the user clicks a navigation link, THE App_Layout SHALL navigate to the corresponding route without full page reload
6. THE App_Layout SHALL include a logout button that calls the signOut function from Auth_Context

### Requirement 7: Device API Service Layer

**User Story:** As a developer, I want a device API service module, so that all device-related HTTP calls are centralized.

#### Acceptance Criteria

1. THE API_Service_Layer SHALL expose functions for device CRUD: `getAllDevices(params)`, `getDeviceById(id)`, `addDevice(data)`, `updateDevice(id, data)`, `deleteDevice(id)`, `disposeDevice(id)`
2. THE API_Service_Layer SHALL expose functions for device search: `searchDevices(query)`, `filterDevices(params)`, `advancedSearch(params)`
3. THE API_Service_Layer SHALL expose functions for barcode operations: `scanBarcode(code)`, `generateBarcode(deviceId)`, `generateMultipleBarcodes(deviceIds)`
4. THE API_Service_Layer SHALL expose functions for label operations: `printAssetLabel(id)`, `bulkPrintAssetLabels(ids)`
5. THE API_Service_Layer SHALL expose functions for bulk operations: `bulkImportDevices(data)`, `bulkExportDevices(params)`, `bulkUpdateStatus(data)`, `bulkUpdateLocation(data)`

### Requirement 8: Dashboard Page

**User Story:** As a user, I want a dashboard showing key metrics and recent activity, so that I can get a quick overview of the inventory status.

#### Acceptance Criteria

1. THE EDIMS_Frontend SHALL display a dashboard page at the `/dashboard` route after login
2. THE EDIMS_Frontend SHALL display summary cards showing total devices, devices by status (available, assigned, in_maintenance, retired), and total users
3. THE EDIMS_Frontend SHALL fetch dashboard data from the Backend_API device and report endpoints on page load
4. IF the Backend_API returns an error while loading dashboard data, THEN THE EDIMS_Frontend SHALL display an error message with a retry option
5. WHILE dashboard data is loading, THE EDIMS_Frontend SHALL display skeleton placeholders for each card

### Requirement 9: Device Management Pages

**User Story:** As an inventory manager, I want pages to list, view, add, edit, search, and filter devices, so that I can manage the device inventory.

#### Acceptance Criteria

1. THE EDIMS_Frontend SHALL display a paginated device list at `/devices` with columns for asset tag, name, category, status, condition, and location
2. WHEN the user clicks a device row, THE EDIMS_Frontend SHALL navigate to `/devices/:id` showing full device details
3. WHEN an Admin or Inventory_Manager clicks "Add Device", THE EDIMS_Frontend SHALL display a form at `/devices/new` with fields matching the Device model
4. WHEN an Admin or Inventory_Manager clicks "Edit" on a device, THE EDIMS_Frontend SHALL display a pre-filled edit form at `/devices/:id/edit`
5. THE EDIMS_Frontend SHALL provide search and filter controls on the device list page that call the `searchDevices` and `filterDevices` API functions
6. IF the user submits the device form with validation errors, THEN THE EDIMS_Frontend SHALL display field-level error messages
7. WHEN a device is successfully created or updated, THE EDIMS_Frontend SHALL show a success notification and navigate back to the device list

### Requirement 10: Category Management Pages

**User Story:** As an admin, I want pages to manage device categories, so that devices can be properly classified.

#### Acceptance Criteria

1. THE API_Service_Layer SHALL expose functions for category CRUD: `getAllCategories()`, `getCategoryById(id)`, `createCategory(data)`, `updateCategory(id, data)`, `deleteCategory(id)`
2. THE EDIMS_Frontend SHALL display a category list at `/categories` accessible to all authenticated roles
3. WHEN an Admin clicks "Add Category", THE EDIMS_Frontend SHALL display a form with fields for name, code, description, and custom fields
4. WHEN an Admin clicks "Delete" on a category, THE EDIMS_Frontend SHALL show a confirmation dialog before calling the delete API

### Requirement 11: Location Management Pages

**User Story:** As an admin, I want pages to manage locations, so that devices can be tracked by physical location.

#### Acceptance Criteria

1. THE API_Service_Layer SHALL expose functions for location CRUD: `getAllLocations()`, `getLocationById(id)`, `createLocation(data)`, `updateLocation(id, data)`, `deleteLocation(id)`
2. THE EDIMS_Frontend SHALL display a location list at `/locations` with columns for name, code, type, and parent location
3. WHEN a user creates or edits a location, THE EDIMS_Frontend SHALL provide a dropdown to select a parent location (supporting hierarchical structure: building > floor > room)
4. WHEN a user clicks "Delete" on a location, THE EDIMS_Frontend SHALL show a confirmation dialog before calling the delete API

### Requirement 12: User Management Pages (Admin Only)

**User Story:** As an admin, I want pages to manage user accounts, so that I can control who has access to the system.

#### Acceptance Criteria

1. THE API_Service_Layer SHALL expose functions for user management: `getAllUsers()`, `getUserById(id)`, `createUser(data)`, `updateUser(id, data)`, `deleteUser(id)`, `assignRole(id, role)` — using the `/users` endpoint (no `/api` prefix)
2. THE EDIMS_Frontend SHALL display a user list at `/users` accessible only to Admin role
3. WHEN an Admin clicks "Add User", THE EDIMS_Frontend SHALL display a form calling the `register` auth API with fields for email, password, firstName, lastName, role, and departmentId
4. THE EDIMS_Frontend SHALL allow an Admin to change a user's role via the `assignRole` API function
5. WHEN an Admin clicks "Delete" on a user, THE EDIMS_Frontend SHALL show a confirmation dialog before calling the delete API

### Requirement 13: Assignment Management Pages

**User Story:** As an inventory manager, I want pages to manage device assignments, so that I can track which devices are assigned to which users.

#### Acceptance Criteria

1. THE API_Service_Layer SHALL expose functions for assignment operations: `getAllAssignments(params)`, `getAssignmentById(id)`, `assignDevice(data)`, `updateAssignment(id, data)`, `unassignDevice(id)`, `transferDevice(id, data)`, `getAssignmentHistory(deviceId)`, `getUserAssignments(userId)`, `acknowledgeAssignment(id)`
2. THE EDIMS_Frontend SHALL display an assignment list at `/assignments` with columns for device name, assigned to, assigned by, date, and status
3. WHEN an Admin or Inventory_Manager clicks "Assign Device", THE EDIMS_Frontend SHALL display a form with device selector, user selector, and notes field
4. WHEN a Staff user views their assignments, THE EDIMS_Frontend SHALL show an "Acknowledge" button for assignments with status "pending"
5. WHEN an Admin or Inventory_Manager clicks "Transfer" on an active assignment, THE EDIMS_Frontend SHALL display a transfer form with a new user selector

### Requirement 14: Maintenance Management Pages

**User Story:** As an inventory manager, I want pages to manage maintenance records, so that I can track device maintenance activities.

#### Acceptance Criteria

1. THE API_Service_Layer SHALL expose functions for maintenance operations: `getAllMaintenance(params)`, `getMaintenanceById(id)`, `recordMaintenance(data)`, `requestMaintenance(data)`, `scheduleMaintenance(data)`, `updateMaintenance(id, data)`, `completeMaintenance(id, data)`, `cancelMaintenance(id)`, `getUpcomingMaintenance()`, `getMaintenanceHistory(deviceId)`
2. THE EDIMS_Frontend SHALL display a maintenance list at `/maintenance` with columns for device, type, status, scheduled date, and performed by
3. WHEN a Staff user clicks "Request Maintenance", THE EDIMS_Frontend SHALL display a form with device selector and description field calling the `requestMaintenance` API
4. WHEN an Admin or Inventory_Manager clicks "Schedule Maintenance", THE EDIMS_Frontend SHALL display a form with device selector, type, scheduled date, and description
5. WHEN an Admin or Inventory_Manager clicks "Complete" on an in-progress maintenance record, THE EDIMS_Frontend SHALL display a completion form with completed date, cost, and notes fields

### Requirement 15: Warranty Management Pages

**User Story:** As an inventory manager, I want pages to manage warranties and warranty claims, so that I can track warranty coverage for devices.

#### Acceptance Criteria

1. THE API_Service_Layer SHALL expose functions for warranty operations: `getAllWarranties(params)`, `getWarrantyById(id)`, `createWarranty(data)`, `updateWarranty(id, data)`, `deleteWarranty(id)`, `getExpiringWarranties(days)`, `refreshWarrantyStatus()`
2. THE API_Service_Layer SHALL expose functions for warranty claim operations: `getAllWarrantyClaims()`, `getWarrantyClaimById(id)`, `createWarrantyClaim(data)`, `updateWarrantyClaim(id, data)`, `deleteWarrantyClaim(id)`
3. THE EDIMS_Frontend SHALL display a warranty list at `/warranties` with columns for device, type, provider, start date, end date, and status
4. THE EDIMS_Frontend SHALL display a warranty claims section at `/warranties/claims` with columns for claim number, device, issue, status, and resolution
5. WHEN a user creates a warranty claim, THE EDIMS_Frontend SHALL display a form with warranty selector, device (auto-filled from warranty), issue description, and filed date

### Requirement 16: Depreciation Management Pages

**User Story:** As an inventory manager, I want pages to manage depreciation rules and view device depreciation calculations, so that I can track asset value over time.

#### Acceptance Criteria

1. THE API_Service_Layer SHALL expose functions for depreciation operations: `getAllDepreciationRules()`, `getDepreciationRuleById(id)`, `getDepreciationRuleByCategory(categoryId)`, `createDepreciationRule(data)`, `updateDepreciationRule(id, data)`, `deleteDepreciationRule(id)`, `calculateDeviceDepreciation(deviceId)`, `getCategoryDepreciation(categoryId)`, `batchUpdateValues()`
2. THE EDIMS_Frontend SHALL display a depreciation rules list at `/depreciation` with columns for category, method, useful life, salvage value percent, and depreciation rate
3. WHEN an Admin or Inventory_Manager creates a depreciation rule, THE EDIMS_Frontend SHALL display a form with category selector, method (straight_line or declining_balance), useful life years, salvage value percent, and depreciation rate
4. THE EDIMS_Frontend SHALL display a device depreciation detail view showing current value, original purchase price, and depreciation schedule

### Requirement 17: Reports Pages

**User Story:** As a manager, I want report pages to view and export various inventory reports, so that I can make informed decisions.

#### Acceptance Criteria

1. THE API_Service_Layer SHALL expose functions for report operations: `getWarrantyReport()`, `getWarrantyAlerts()`, `getDepreciationReport()`, `getDeviceStatusReport()`, `getInventoryValueReport()`, `getAssignmentReport()`, `getMaintenanceReport()`, `generateCustomReport(data)`, `exportReport(data)`
2. THE EDIMS_Frontend SHALL display a reports hub at `/reports` with cards linking to each report type
3. WHEN a user selects a report type, THE EDIMS_Frontend SHALL fetch and display the report data in a tabular format
4. WHEN an Admin or Inventory_Manager clicks "Export", THE EDIMS_Frontend SHALL call the export API and trigger a file download
5. THE EDIMS_Frontend SHALL restrict depreciation, inventory value, maintenance, and custom reports to Admin and Inventory_Manager roles

### Requirement 18: System Settings Pages (Admin Only)

**User Story:** As an admin, I want system settings pages to manage application configuration, backups, and view system logs.

#### Acceptance Criteria

1. THE API_Service_Layer SHALL expose functions for system operations: `healthCheck()`, `getSystemSettings()`, `updateSystemSetting(data)`, `deleteSystemSetting(key)`, `getDatabaseStats()`, `createBackup()`, `getBackupList()`, `downloadBackup(filename)`, `deleteBackup(filename)`, `getSystemLogs(params)`
2. THE EDIMS_Frontend SHALL display a system settings page at `/system` accessible only to Admin role
3. THE EDIMS_Frontend SHALL display system settings as a key-value list with inline editing capability
4. THE EDIMS_Frontend SHALL display a backup management section with options to create, download, and delete backups
5. THE EDIMS_Frontend SHALL display a system logs viewer with filtering by date range and log level

### Requirement 19: Shared UI Components

**User Story:** As a developer, I want reusable UI components, so that the application has a consistent look and feel and reduces code duplication.

#### Acceptance Criteria

1. THE EDIMS_Frontend SHALL provide a reusable data table component supporting pagination, sorting, and column configuration
2. THE EDIMS_Frontend SHALL provide a reusable form component with field validation and error display
3. THE EDIMS_Frontend SHALL provide a reusable confirmation dialog component for delete and destructive actions
4. THE EDIMS_Frontend SHALL provide a reusable notification/toast component for success and error messages
5. THE EDIMS_Frontend SHALL provide a reusable loading spinner and skeleton placeholder component

### Requirement 20: Routing Configuration

**User Story:** As a developer, I want a centralized routing configuration, so that all pages are properly mapped to URL paths with appropriate guards.

#### Acceptance Criteria

1. THE EDIMS_Frontend SHALL define routes for: `/login`, `/dashboard`, `/devices`, `/devices/new`, `/devices/:id`, `/devices/:id/edit`, `/categories`, `/locations`, `/users`, `/assignments`, `/maintenance`, `/warranties`, `/warranties/claims`, `/depreciation`, `/reports`, `/system`
2. THE EDIMS_Frontend SHALL wrap all routes except `/login` and `/` with the Protected_Route component
3. THE EDIMS_Frontend SHALL wrap `/users` and `/system` routes with a Role_Guard allowing only Admin role
4. THE EDIMS_Frontend SHALL wrap management routes (create/edit/delete actions) with a Role_Guard allowing Admin and Inventory_Manager roles
5. WHEN a user navigates to an undefined route, THE EDIMS_Frontend SHALL display a 404 Not Found page
