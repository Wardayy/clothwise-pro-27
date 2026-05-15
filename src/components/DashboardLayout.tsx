import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, LogOut, User as UserIcon, Settings, Moon, Sun, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { store } from "@/lib/store";

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, setDark] as const;
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function DashboardLayout() {
  const { user, loading, signOut } = useAuth();
  const [dark, setDark] = useDarkMode();
  const now = useClock();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('full_name, phone_number, created_at').eq('id', user!.id).maybeSingle();
      return data as { full_name: string | null; phone_number: string | null; created_at: string } | null;
    },
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'], queryFn: () => store.getInventory(),
    enabled: !!user, staleTime: 30_000,
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Admin';
  const initials = displayName.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
  const lowStock = inventory.filter(i => i.current_stock > 0 && i.current_stock < 50);
  const outOfStock = inventory.filter(i => i.current_stock <= 0);
  const notifications = [
    ...outOfStock.map(i => ({ icon: Package, color: 'text-destructive', title: `${i.cloth_name} is out of stock`, sub: 'Restock required' })),
    ...lowStock.map(i => ({ icon: ShoppingCart, color: 'text-warning', title: `${i.cloth_name} running low`, sub: `${i.current_stock}m remaining` })),
  ].slice(0, 6);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center border-b bg-card/80 backdrop-blur-md px-3 sm:px-6 gap-3 shrink-0 sticky top-0 z-30">
            <SidebarTrigger className="hover:bg-muted rounded-md" />

            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search cloth, customer, factory…" className="pl-9 h-9 bg-muted/40 border-transparent focus-visible:bg-background" />
              </div>
            </div>

            <div className="flex-1 md:hidden" />

            <div className="hidden lg:flex flex-col items-end leading-tight mr-2">
              <span className="text-xs text-muted-foreground">
                {now.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <span className="text-sm font-semibold tabular-nums">
                {now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} className="rounded-full" aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="p-3 border-b flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-sm">Notifications</h3>
                  <Badge variant="secondary" className="text-xs">{notifications.length}</Badge>
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">All clear — no alerts.</p>
                  ) : notifications.map((n, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 hover:bg-muted/50 border-b last:border-b-0">
                      <n.icon className={`h-4 w-4 mt-0.5 ${n.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/inventory/low-stock" className="block text-center text-xs text-primary font-medium p-2 border-t hover:bg-muted/50">
                  View all stock alerts
                </Link>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-muted/60 rounded-full pr-2 pl-1 py-1 transition-colors" aria-label="Profile menu">
                  <div className="h-8 w-8 rounded-full gradient-primary text-white flex items-center justify-center text-xs font-bold font-heading">
                    {initials}
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-xs text-muted-foreground">Welcome back,</span>
                    <span className="text-sm font-semibold truncate max-w-[120px]">{displayName}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-heading">{displayName}</span>
                  <span className="text-xs text-muted-foreground font-normal truncate">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer"><UserIcon className="h-4 w-4 mr-2" /> My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer"><Settings className="h-4 w-4 mr-2" /> Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <Outlet />
          </main>

          <footer className="border-t bg-card/50 px-6 py-3 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} ClothWare · Smart Textile Business Management</p>
            <p className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-accent" />
              All financial values in PKR (Rs)
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
