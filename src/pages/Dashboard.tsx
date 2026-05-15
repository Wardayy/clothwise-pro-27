import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { store } from '@/lib/store';
import { formatPKR } from '@/lib/currency';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart, TrendingUp, Package, BarChart3, AlertTriangle,
  ArrowUpRight, Wallet, Boxes, Clock, Plus,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend,
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: revenue } = useQuery({ queryKey: ['revenue'], queryFn: () => store.getRevenue() });
  const { data: inventory = [] } = useQuery({ queryKey: ['inventory'], queryFn: () => store.getInventory() });
  const { data: purchases = [] } = useQuery({ queryKey: ['purchases'], queryFn: () => store.getPurchases() });
  const { data: sales = [] } = useQuery({ queryKey: ['sales'], queryFn: () => store.getSales() });
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id], enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('full_name').eq('id', user!.id).maybeSingle();
      return data as { full_name: string | null } | null;
    },
  });

  const r = revenue ?? { totalPurchaseCost: 0, totalSalesRevenue: 0, profit: 0, loss: 0, isLoss: false };
  const lowStock = inventory.filter(i => i.current_stock > 0 && i.current_stock < 50);
  const outOfStock = inventory.filter(i => i.current_stock <= 0);

  const stats = [
    {
      label: 'Total Sales Revenue', value: formatPKR(r.totalSalesRevenue), sub: `${sales.length} sales`,
      icon: TrendingUp, accent: 'from-accent/15 to-accent/5', iconBg: 'bg-accent/15 text-accent',
    },
    {
      label: 'Total Purchase Cost', value: formatPKR(r.totalPurchaseCost), sub: `${purchases.length} orders`,
      icon: ShoppingCart, accent: 'from-primary/15 to-primary/5', iconBg: 'bg-primary/15 text-primary',
    },
    {
      label: r.isLoss ? 'Loss Detected' : 'Net Profit',
      value: r.isLoss ? formatPKR(0) : formatPKR(r.profit),
      sub: r.isLoss ? `Shortfall: ${formatPKR(r.loss)}` : 'After all costs',
      icon: r.isLoss ? AlertTriangle : Wallet,
      accent: r.isLoss ? 'from-destructive/15 to-destructive/5' : 'from-warning/15 to-warning/5',
      iconBg: r.isLoss ? 'bg-destructive/15 text-destructive' : 'bg-warning/15 text-warning',
    },
    {
      label: 'Current Inventory', value: `${inventory.reduce((s, i) => s + i.current_stock, 0).toLocaleString()}m`,
      sub: `${inventory.length} cloth types`,
      icon: Boxes, accent: 'from-info/15 to-info/5', iconBg: 'bg-info/15 text-info',
    },
  ];

  const chartData = inventory.map(i => ({
    name: i.cloth_name.length > 10 ? i.cloth_name.slice(0, 10) + '…' : i.cloth_name,
    Purchased: i.total_purchased, Sold: i.total_sold, Stock: i.current_stock,
  }));

  // Last 7 days revenue trend
  const today = new Date();
  const trendData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(today); d.setDate(d.getDate() - (6 - idx));
    const key = d.toISOString().slice(0, 10);
    const day = d.toLocaleDateString('en-PK', { weekday: 'short' });
    const dayRevenue = sales.filter(s => s.sale_date === key).reduce((sum, s) => sum + s.total_revenue, 0);
    const dayCost = purchases.filter(p => p.purchase_date === key).reduce((sum, p) => sum + p.total_cost, 0);
    return { day, Revenue: dayRevenue, Cost: dayCost };
  });

  const recent = [
    ...sales.slice(0, 5).map(s => ({ type: 'Sale', date: s.sale_date, amount: s.total_revenue, qty: s.quantity_meter, id: s.sale_id })),
    ...purchases.slice(0, 5).map(p => ({ type: 'Purchase', date: p.purchase_date, amount: p.total_cost, qty: p.quantity_meter, id: p.purchase_id })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const greetingName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin';
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero greeting */}
      <Card className="overflow-hidden border-0 shadow-elegant">
        <div className="relative gradient-hero animate-gradient text-white p-6 sm:p-8">
          <div className="absolute inset-0 textile-pattern opacity-30" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-1">
                {greet}
              </p>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold">
                Welcome back, {greetingName}
              </h1>
              <p className="text-white/70 text-sm mt-1.5">
                Here is what is happening across your textile business today.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90 hover-lift">
                <Link to="/sales/add"><Plus className="h-4 w-4" /> Record Sale</Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link to="/purchases/add"><Plus className="h-4 w-4" /> Add Purchase</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className={`border-border/60 hover-lift overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} opacity-60 pointer-events-none`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {s.label}
              </CardTitle>
              <div className={`h-9 w-9 rounded-lg ${s.iconBg} flex items-center justify-center`}>
                <s.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold font-heading">{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts row */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/20 text-warning flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {outOfStock.length} out of stock · {lowStock.length} running low
                </p>
                <p className="text-xs text-muted-foreground">Restock these cloth types soon to avoid lost sales.</p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/inventory/low-stock">View alerts <ArrowUpRight className="h-3 w-3" /></Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-heading">Revenue Trend (Last 7 days)</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Daily sales revenue vs purchase cost in PKR</p>
            </div>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => formatPKR(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="Revenue" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="Cost" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#costGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No transactions yet.</p>
            ) : recent.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${a.type === 'Sale' ? 'bg-accent/15 text-accent' : 'bg-primary/15 text-primary'}`}>
                  {a.type === 'Sale' ? <TrendingUp className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.type} · {a.qty}m</p>
                  <p className="text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}</p>
                </div>
                <Badge variant="secondary" className="font-heading text-xs">{formatPKR(a.amount)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> Inventory Overview
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Purchased vs sold vs current stock by cloth type</p>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number) => `${value.toLocaleString()}m`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Purchased" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Sold" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Stock" fill="hsl(var(--gold))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No data yet. Add purchases and sales to see analytics.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
