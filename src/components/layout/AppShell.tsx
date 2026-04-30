import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Home, Settings, LogOut, Shield, Menu, CreditCard, Plug } from "lucide-react";
import { PaymentTestModeBanner } from "@/components/billing/PaymentTestModeBanner";
import mrFlowLogo from "@/assets/mrflow-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useIsSuperAdmin, useTenant } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/properties", label: "Imóveis", icon: Home },
  { to: "/app/integrations", label: "Integrações", icon: Plug },
  { to: "/app/billing", label: "Planos", icon: CreditCard },
  { to: "/app/settings", label: "Configurações", icon: Settings },
];

function NavItems({ onClick }: { onClick?: () => void }) {
  const { data: isAdmin } = useIsSuperAdmin();
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent-soft text-accent-foreground"
                : "text-sidebar-foreground hover:bg-muted"
            }`
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
      {isAdmin && (
        <NavLink
          to="/admin"
          onClick={onClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors mt-4 border-t pt-4 ${
              isActive ? "bg-accent-soft text-accent-foreground" : "text-sidebar-foreground hover:bg-muted"
            }`
          }
        >
          <Shield className="h-4 w-4" />
          Super Admin
        </NavLink>
      )}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-3 border-b">
      <img src={mrFlowLogo} alt="Mr Flow" className="h-9 w-auto" />
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Welcome Hub</div>
    </div>
  );
}

export default function AppShell() {
  const { signOut, user } = useAuth();
  const { data: tenant } = useTenant();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border flex-col">
        <Brand />
        <div className="flex-1 overflow-y-auto"><NavItems /></div>
        <div className="border-t p-3">
          <div className="px-3 py-2 mb-2">
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            <div className="text-sm font-medium truncate">{tenant?.name ?? "—"}</div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden h-14 border-b bg-card flex items-center px-4 gap-3 sticky top-0 z-30">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <Brand />
              <NavItems onClick={() => setOpen(false)} />
              <div className="border-t p-3 mt-4">
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="font-semibold flex items-center gap-2">
            <Home className="h-4 w-4 text-primary" /> Mr Flow Host
          </div>
        </header>

        <PaymentTestModeBanner />
        <main className="flex-1 overflow-x-hidden bg-[#f7f7f8]"><Outlet /></main>
      </div>
    </div>
  );
}
