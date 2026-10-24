import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import PublicRoutes from "./PublicRoutes";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public website */}
      <Route path="/" element={<PublicRoutes />} />

      {/* Admin login */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Protected admin application */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={null} />
        <Route path="beds" element={null} />
        <Route path="tenant-history" element={null} />
        <Route path="rent-payments" element={null} />
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
