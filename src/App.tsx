import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute, AuthRedirect } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ChangePassword from "./pages/ChangePassword";
import NotAuthorized from "./pages/NotAuthorized";
import LandingPagePreview from "./pages/LandingPagePreview";
import PublicLandingPage from "./pages/PublicLandingPage";
import ThankYou from "./pages/ThankYou";

// Dashboards
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import DeveloperDashboard from "./pages/dashboards/DeveloperDashboard";
import ShopOwnerDashboard from "./pages/dashboards/ShopOwnerDashboard";
import OrderManagerDashboard from "./pages/dashboards/OrderManagerDashboard";
import EmployeeDashboard from "./pages/dashboards/EmployeeDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/preview/:pageId" element={<LandingPagePreview />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/auth" element={
              <AuthRedirect>
                <Auth />
              </AuthRedirect>
            } />
            
            {/* Public Landing Page Route - /:shopSlug/:pageSlug */}
            <Route path="/:shopSlug/:pageSlug" element={<PublicLandingPage />} />
            
            {/* Password Change (requires auth but no role check) */}
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } />
            
            {/* Super Admin Dashboard */}
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Developer Dashboard */}
            <Route path="/developer-console" element={
              <ProtectedRoute allowedRoles={['developer']}>
                <DeveloperDashboard />
              </ProtectedRoute>
            } />
            
            {/* Shop Owner Dashboard */}
            <Route path="/shop-panel" element={
              <ProtectedRoute allowedRoles={['shop_owner']}>
                <ShopOwnerDashboard />
              </ProtectedRoute>
            } />
            
            {/* Order Manager Dashboard */}
            <Route path="/orders-dashboard" element={
              <ProtectedRoute allowedRoles={['order_manager']}>
                <OrderManagerDashboard />
              </ProtectedRoute>
            } />
            
            {/* Employee Dashboard */}
            <Route path="/employee-portal" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            
            {/* Not Authorized */}
            <Route path="/not-authorized" element={<NotAuthorized />} />
            
            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
