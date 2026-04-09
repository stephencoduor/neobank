import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { currentUser, notifications } from "@/data/mock";
import { authService } from "@/services/auth-service";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Send,
  ArrowDownLeft,
  QrCode,
  Receipt,
  Store,
  Settings,
  Bell,
  LogOut,
  Leaf,
  Landmark,
  PiggyBank,
  BarChart3,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Accounts", icon: Wallet, path: "/accounts" },
  { label: "Cards", icon: CreditCard, path: "/cards" },
  { label: "Loans", icon: Landmark, path: "/loans" },
  { label: "Savings", icon: PiggyBank, path: "/savings" },
  { label: "Send Money", icon: Send, path: "/payments/send" },
  { label: "Request Money", icon: ArrowDownLeft, path: "/payments/request" },
  { label: "QR Payments", icon: QrCode, path: "/payments/qr" },
  { label: "Pay Bills", icon: Receipt, path: "/payments/bills" },
  { label: "Reports", icon: BarChart3, path: "/reports" },
  { label: "Merchant", icon: Store, path: "/merchant", merchantOnly: true },
  { label: "Settings", icon: Settings, path: "/settings" },
] as const;

const unreadCount = notifications.filter((n) => !n.read).length;

export default function AppSidebar() {
  const navigate = useNavigate();
  const isMerchant = true; // In real app, derive from user role

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary">
          <Leaf className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          NeoBank
        </span>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          if ("merchantOnly" in item && item.merchantOnly && !isMerchant)
            return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0",
                      isActive && "text-sidebar-primary"
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Bottom section */}
      <div className="space-y-2 p-3">
        {/* Notification row */}
        <button
          onClick={() => navigate("/notifications")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full bg-sidebar-primary px-1.5 text-[10px] font-bold text-sidebar-primary-foreground">
              {unreadCount}
            </Badge>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <Avatar className="h-8 w-8 border border-sidebar-border">
            <AvatarFallback className="bg-sidebar-accent text-xs font-semibold text-sidebar-primary">
              {currentUser.firstName[0]}
              {currentUser.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-white">
              {currentUser.firstName} {currentUser.lastName}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/50">
              {currentUser.phone}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-white"
            onClick={() => { authService.logout(); navigate("/login"); }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
