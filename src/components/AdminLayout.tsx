import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/lib/admin-auth-context";
import {
  BarChart3,
  Calendar,
  Home,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Users,
  X,
  Database,
  BookOpen,
  LayoutDashboard,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "react-router-dom";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: <Home className="h-5 w-5" /> },
  { title: "Users", href: "/admin/users", icon: <Users className="h-5 w-5" /> },
  { title: "Event Requests", href: "/admin/event-requests", icon: <Calendar className="h-5 w-5" /> },
  { title: "Vendor Bookings", href: "/admin/vendor-bookings", icon: <BookOpen className="h-5 w-5" /> },
  { title: "Vendors", href: "/admin/vendors", icon: <ShoppingBag className="h-5 w-5" /> },
  { title: "Blog", href: "/admin/blog", icon: <BookOpen className="h-5 w-5" /> },
  { title: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="h-5 w-5" /> },
  { title: "Settings", href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
  { title: "Database Status", href: "/admin/db-status", icon: <Database className="h-5 w-5" /> },
];

const AdminLayout = () => {
  const { adminUser, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  if (!adminUser) return null;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold">EventBuddy Admin</h1>
            <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-md uppercase">Beta</span>
          </div>
          <ScrollArea className="flex-1 py-4">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-gray-100 dark:bg-gray-700 text-primary"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </NavLink>
              ))}
            </nav>
          </ScrollArea>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{adminUser.name?.charAt(0) || "A"}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{adminUser.name}</p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{adminUser.role}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 dark:text-red-400"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden ml-2 mt-2">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">EventBuddy Admin</h1>
              <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-md uppercase">Beta</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <ScrollArea className="flex-1 py-4 h-[calc(100vh-8rem)]">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-gray-100 dark:bg-gray-700 text-primary"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`
                  }
                  onClick={() => setOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </NavLink>
              ))}
            </nav>
          </ScrollArea>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{adminUser.name?.charAt(0) || "A"}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{adminUser.name}</p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{adminUser.role}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 dark:text-red-400"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 