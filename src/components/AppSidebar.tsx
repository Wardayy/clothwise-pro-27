import {
  LayoutDashboard, ShoppingCart, TrendingUp, Package, BarChart3, Database, LogOut, ChevronDown, UserCircle2,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BrandLogo } from "@/components/BrandLogo";
import logo from "@/assets/logo.png";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
];

const purchaseItems = [
  { title: "Add Purchase", url: "/purchases/add" },
  { title: "Purchase History", url: "/purchases/history" },
  { title: "Search Purchase", url: "/purchases/search" },
];

const saleItems = [
  { title: "Record Sale", url: "/sales/add" },
  { title: "Sales History", url: "/sales/history" },
  { title: "Search Sale", url: "/sales/search" },
];

const inventoryItems = [
  { title: "View Stock", url: "/inventory" },
  { title: "Low Stock Alert", url: "/inventory/low-stock" },
];

const revenueItems = [
  { title: "Profit Report", url: "/revenue" },
  { title: "Sales Analytics", url: "/revenue/analytics" },
];

const masterItems = [
  { title: "Manage Cloth", url: "/master/cloth" },
  { title: "Manage Factory", url: "/master/factory" },
  { title: "Manage Customer", url: "/master/customer" },
];

interface NavGroupProps {
  label: string;
  icon: React.ElementType;
  items: { title: string; url: string }[];
  collapsed: boolean;
}

function NavGroup({ label, icon: Icon, items, collapsed }: NavGroupProps) {
  const location = useLocation();
  const isActive = items.some(i => location.pathname.startsWith(i.url));

  if (collapsed) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={label}
                className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                asChild
              >
                <NavLink to={items[0].url} className="text-sidebar-foreground">
                  <Icon className="h-4 w-4" />
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <Collapsible defaultOpen={isActive} className="group/collapsible">
      <SidebarGroup className="py-0.5">
        <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200">
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="ml-6 pl-4 py-1.5 text-sm text-sidebar-foreground/60 hover:text-sidebar-accent-foreground border-l border-sidebar-border/60 hover:border-sidebar-primary transition-colors"
                      activeClassName="text-sidebar-primary font-semibold border-sidebar-primary"
                    >
                      {item.title}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut, user } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="px-4 py-4 border-b border-sidebar-border/60">
        {!collapsed ? (
          <BrandLogo size="md" textClassName="text-sidebar-primary" showTagline taglineClassName="text-sidebar-foreground/50" />
        ) : (
          <div className="flex justify-center">
            <img src={logo} alt="ClothWare" width={32} height={32} className="h-8 w-8 rounded-md" />
          </div>
        )}
      </div>

      <SidebarContent className="py-3 px-2">
        <SidebarGroup className="py-0.5">
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
                      activeClassName="bg-sidebar-primary/15 text-sidebar-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <p className="px-3 mt-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Operations
          </p>
        )}
        <NavGroup label="Purchases" icon={ShoppingCart} items={purchaseItems} collapsed={collapsed} />
        <NavGroup label="Sales" icon={TrendingUp} items={saleItems} collapsed={collapsed} />
        <NavGroup label="Inventory" icon={Package} items={inventoryItems} collapsed={collapsed} />

        {!collapsed && (
          <p className="px-3 mt-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Insights
          </p>
        )}
        <NavGroup label="Revenue" icon={BarChart3} items={revenueItems} collapsed={collapsed} />

        {!collapsed && (
          <p className="px-3 mt-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Configuration
          </p>
        )}
        <NavGroup label="Master Data" icon={Database} items={masterItems} collapsed={collapsed} />

        <SidebarGroup className="py-0.5 mt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={collapsed ? "My Profile" : undefined}>
                  <NavLink
                    to="/profile"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
                    activeClassName="bg-sidebar-primary/15 text-sidebar-primary font-semibold"
                  >
                    <UserCircle2 className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>My Profile</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        {!collapsed && user && (
          <div className="rounded-lg bg-sidebar-accent/40 p-2.5 mb-2">
            <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Signed in as</p>
            <p className="text-xs font-medium text-sidebar-foreground truncate mt-0.5">{user.email}</p>
          </div>
        )}
        <button
          onClick={() => signOut()}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Sign out"}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
