import { store } from '@/lib/store';
import { formatPKR } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--warning))',
  'hsl(var(--chart-4))',
  'hsl(var(--destructive))',
];

export default function SalesAnalytics() {
  const cloths = store.getCloths();
  const sales = store.getSales();
  const purchases = store.getPurchases();

  const clothData = cloths.map(c => {
    const totalSales = sales.filter(s => s.cloth_id === c.cloth_id).reduce((sum, s) => sum + s.total_revenue, 0);
    const totalPurchases = purchases.filter(p => p.cloth_id === c.cloth_id).reduce((sum, p) => sum + p.total_cost, 0);
    return { name: c.cloth_name, sales: totalSales, purchases: totalPurchases };
  });

  const pieData = clothData.filter(d => d.sales > 0).map(d => ({ name: d.name, value: d.sales }));

  // Daily revenue
  const dailyMap: Record<string, number> = {};
  sales.forEach(s => {
    dailyMap[s.sale_date] = (dailyMap[s.sale_date] || 0) + s.total_revenue;
  });
  const dailyData = Object.entries(dailyMap).sort().map(([date, amount]) => ({ date, amount }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Sales Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Cloth</CardTitle></CardHeader>
          <CardContent>
            {clothData.some(d => d.sales > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={clothData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={v => `Rs ${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatPKR(v)} />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" name="Sales" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="purchases" fill="hsl(var(--muted-foreground))" name="Purchases" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No sales data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Sales Distribution</CardTitle></CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatPKR(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No sales data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Daily Revenue</CardTitle></CardHeader>
        <CardContent>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={v => `Rs ${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatPKR(v)} />
                <Bar dataKey="amount" fill="hsl(var(--accent))" name="Revenue" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">No daily data yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
