import { useQuery } from '@tanstack/react-query';
import { store } from '@/lib/store';
import { formatPKR } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, Package, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: revenue } = useQuery({ queryKey: ['revenue'], queryFn: () => store.getRevenue() });
  const { data: inventory = [] } = useQuery({ queryKey: ['inventory'], queryFn: () => store.getInventory() });
  const { data: purchases = [] } = useQuery({ queryKey: ['purchases'], queryFn: () => store.getPurchases() });
  const { data: sales = [] } = useQuery({ queryKey: ['sales'], queryFn: () => store.getSales() });

  const stats = [
    { label: 'Total Purchases', value: formatPKR(revenue?.totalPurchaseCost ?? 0), icon: ShoppingCart, count: purchases.length },
    { label: 'Total Sales', value: formatPKR(revenue?.totalSalesRevenue ?? 0), icon: TrendingUp, count: sales.length },
    { label: 'Profit', value: formatPKR(revenue?.profit ?? 0), icon: BarChart3, count: null },
    { label: 'Cloth Types', value: inventory.length.toString(), icon: Package, count: null },
  ];

  const chartData = inventory.map(i => ({ name: i.cloth_name, purchased: i.total_purchased, sold: i.total_sold, stock: i.current_stock }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Business overview at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading">{s.value}</div>
              {s.count !== null && <p className="text-xs text-muted-foreground mt-1">{s.count} transactions</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-heading">Inventory Overview</CardTitle></CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value: number) => `${value}m`} />
                <Bar dataKey="purchased" fill="hsl(var(--primary))" name="Purchased" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sold" fill="hsl(var(--accent))" name="Sold" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stock" fill="hsl(var(--warning))" name="Stock" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">No data yet. Add purchases and sales to see the chart.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
