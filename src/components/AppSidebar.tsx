import {
  LayoutDashboard, ShoppingCart, TrendingUp, Package, BarChart3, Database, LogOut, ChevronDown
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

  return (
    <Collapsible defaultOpen={isActive}>
      <SidebarGroup>
        <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <Icon className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{label}</span>
              <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
            </>
          )}
        </CollapsibleTrigger>
        {!collapsed && (
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(item => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="pl-9 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        {item.title}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        )}
      </SidebarGroup>
    </Collapsible>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { logout, user } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <div className="px-4 py-5 border-b border-sidebar-border">
        {!collapsed ? (
          <div>
            <h2 className="text-base font-bold text-sidebar-primary-foreground font-heading tracking-tight">
              ClothWare
            </h2>
            <p className="text-xs text-sidebar-foreground/50 mt-0.5">Textile Management</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="text-lg font-bold text-sidebar-primary">C</span>
          </div>
        )}
      </div>
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavGroup label="Purchases" icon={ShoppingCart} items={purchaseItems} collapsed={collapsed} />
        <NavGroup label="Sales" icon={TrendingUp} items={saleItems} collapsed={collapsed} />
        <NavGroup label="Inventory" icon={Package} items={inventoryItems} collapsed={collapsed} />
        <NavGroup label="Revenue" icon={BarChart3} items={revenueItems} collapsed={collapsed} />
        <NavGroup label="Master Data" icon={Database} items={masterItems} collapsed={collapsed} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <p className="text-xs text-sidebar-foreground/50 mb-2 px-1">
            Logged in as <span className="font-medium text-sidebar-foreground">{user.username}</span>
          </p>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Logout"}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
