import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleGuard from "../components/RoleGuard";
import AppLayout from "../components/AppLayout";

// Public pages
import Home from "../pages/home/home";
import LoginPage from "../pages/login/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";

// Protected pages
import DashboardPage from "../pages/dashboard/DashboardPage";
import DeviceListPage from "../pages/devices/DeviceListPage";
import DeviceDetailPage from "../pages/devices/DeviceDetailPage";
import DeviceFormPage from "../pages/devices/DeviceFormPage";
import CategoryPage from "../pages/categories/CategoryPage";
import LocationPage from "../pages/locations/LocationPage";
import AssignmentListPage from "../pages/assignments/AssignmentListPage";
import MaintenanceListPage from "../pages/maintenance/MaintenanceListPage";
import MaintenanceRequestPage from "../pages/maintenance/MaintenanceRequestPage";
import MaintenanceSchedulePage from "../pages/maintenance/MaintenanceSchedulePage";
import WarrantyListPage from "../pages/warranties/WarrantyListPage";
import WarrantyClaimPage from "../pages/warranties/WarrantyClaimPage";
import DepreciationPage from "../pages/depreciation/DepreciationPage";
import ReportsPage from "../pages/reports/ReportsPage";

// Admin-only pages
import UserPage from "../pages/users/UserPage";
import SystemPage from "../pages/system/SystemPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes with AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/devices" element={<DeviceListPage />} />
            <Route path="/devices/new" element={<DeviceFormPage />} />
            <Route path="/devices/:id" element={<DeviceDetailPage />} />
            <Route path="/devices/:id/edit" element={<DeviceFormPage />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/locations" element={<LocationPage />} />
            <Route path="/assignments" element={<AssignmentListPage />} />
            <Route path="/maintenance" element={<MaintenanceListPage />} />
            <Route path="/maintenance/request" element={<MaintenanceRequestPage />} />
            <Route
              path="/maintenance/schedule"
              element={
                <RoleGuard allowedRoles={["admin", "inventory_manager"]}>
                  <MaintenanceSchedulePage />
                </RoleGuard>
              }
            />
            <Route path="/warranties" element={<WarrantyListPage />} />
            <Route path="/warranties/claims" element={<WarrantyClaimPage />} />
            <Route path="/depreciation" element={<DepreciationPage />} />
            <Route path="/reports" element={<ReportsPage />} />

            {/* Admin-only routes */}
            <Route
              path="/users"
              element={
                <RoleGuard allowedRoles={["admin"]}>
                  <UserPage />
                </RoleGuard>
              }
            />
            <Route
              path="/system"
              element={
                <RoleGuard allowedRoles={["admin"]}>
                  <SystemPage />
                </RoleGuard>
              }
            />
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
