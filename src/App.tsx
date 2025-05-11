import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatPage from "./pages/ChatPage";
import MarketplacePage from "./pages/MarketplacePage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import { TodoList } from "./components/TodoList";
import { SupabaseTest } from "./components/SupabaseTest";
import { SupabaseConnectionTest } from "./components/SupabaseConnectionTest";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ProfilePage from "./pages/ProfilePage";
import VendorDetailsPage from "./pages/VendorDetailsPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import { AuthProvider } from "./lib/auth-context";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";

// Admin imports
import { AdminAuthProvider } from "./lib/admin-auth-context";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminLayout from "./components/AdminLayout";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import DashboardPage from "./pages/admin/DashboardPage";
import EventRequestsPage from "./pages/admin/EventRequestsPage";
import VendorsPage from "./pages/admin/VendorsPage";
import UsersPage from "./pages/admin/UsersPage";
import DbDebugPage from "./pages/admin/DbDebugPage";
import VendorBookingsPage from "./pages/admin/VendorBookingsPage";
import BlogManagementPage from "./pages/admin/BlogManagementPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="flex flex-col min-h-screen">
              <Routes>
                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminProtectedRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="event-requests" element={<EventRequestsPage />} />
                    <Route path="vendor-bookings" element={<VendorBookingsPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="vendors" element={<VendorsPage />} />
                    <Route path="blog" element={<BlogManagementPage />} />
                    <Route path="analytics" element={<div>Analytics Coming Soon</div>} />
                    <Route path="settings" element={<div>Settings Coming Soon</div>} />
                    <Route path="db-status" element={<SupabaseConnectionTest />} />
                    <Route path="db-debug" element={<DbDebugPage />} />
                    <Route index element={<DashboardPage />} />
                  </Route>
                </Route>
                
                {/* Public routes with normal layout */}
                <Route path="*" element={
                  <>
                    <Navbar />
                    <div className="flex-grow">
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/auth/callback" element={<AuthCallbackPage />} />
                        <Route path="/marketplace" element={<MarketplacePage />} />
                        <Route path="/vendor/:id" element={<VendorDetailsPage />} />
                        <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/blog/:id" element={<BlogPostPage />} />
                        <Route path="/supabase-status" element={<SupabaseConnectionTest />} />
                        <Route path="/db-debug" element={<DbDebugPage />} />
                        
                        {/* Protected routes */}
                        <Route element={<ProtectedRoute />}>
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/chat" element={<ChatPage />} />
                          <Route path="/todos" element={<TodoList />} />
                          <Route path="/test-supabase" element={<SupabaseTest />} />
                        </Route>
                        
                        {/* Catch-all route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                    <Footer />
                  </>
                } />
              </Routes>
            </div>
          </TooltipProvider>
        </BrowserRouter>
      </AdminAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
