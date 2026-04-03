import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { currentUser } from "@/data/mock";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ArrowLeftRight,
  Store,
  CreditCard,
  FileCheck,
  BarChart3,
  Settings,
  ScrollText,
  LogOut,
  Leaf,
} from "lucide-react";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/admin" },
  { label: "Users", icon: Users, path: "/admin/users" },
  { label: "KYC Review", icon: ShieldCheck, path: "/admin/kyc" },
  { label: "Transactions", icon: ArrowLeftRight, path: "/admin/transactions" },
  { label: "Merchants", icon: Store, path: "/admin/merchants" },
  { label: "Cards", icon: CreditCard, path: "/admin/cards" },
  { label: "Compliance", icon: FileCheck, path: "/admin/compliance" },
  { label: "Reports", icon: BarChart3, path: "/admin/reports" },
  { label: "Audit Log", icon: ScrollText, path: "/admin/audit-log" },
  { label: "System", icon: Settings, path: "/admin/settings" },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo + Admin badge */}
      <div className="flex items-center gap-2.5 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary">
          <Leaf className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          NeoBank
        </span>
        <Badge className="ml-1 rounded-md bg-sidebar-primary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sidebar-primary">
          Admin
        </Badge>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
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
        ))}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Bottom: user */}
      <div className="p-3">
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
              Administrator
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-white"
            onClick={() => navigate("/login")}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
