import { useQuery } from '@tanstack/react-query';
import { store } from '@/lib/store';
import { formatPKR } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, TrendingUp, Wallet, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

export default function ProfitReport() {
  const { data: revenue } = useQuery({ queryKey: ['revenue'], queryFn: () => store.getRevenue() });
  const { data: cloths = [] } = useQuery({ queryKey: ['cloths'], queryFn: () => store.getCloths() });
  const { data: purchases = [] } = useQuery({ queryKey: ['purchases'], queryFn: () => store.getPurchases() });
  const { data: sales = [] } = useQuery({ queryKey: ['sales'], queryFn: () => store.getSales() });

  const clothProfits = cloths.map(c => {
    const totalPurchase = purchases.filter(p => p.cloth_id === c.cloth_id).reduce((s, p) => s + p.total_cost, 0);
    const totalSale = sales.filter(s => s.cloth_id === c.cloth_id).reduce((s, sa) => s + sa.total_revenue, 0);
    const raw = totalSale - totalPurchase;
    return {
      cloth_name: c.cloth_name, totalPurchase, totalSale,
      profit: Math.max(0, raw),
      loss: raw < 0 ? Math.abs(raw) : 0,
      isLoss: raw < 0,
    };
  });

  const r = revenue ?? { totalPurchaseCost: 0, totalSalesRevenue: 0, profit: 0, loss: 0, isLoss: false };
  const margin = r.totalSalesRevenue > 0 ? ((r.totalSalesRevenue - r.totalPurchaseCost) / r.totalSalesRevenue) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Profit Report</h1>
          <p className="text-muted-foreground text-sm mt-1">Financial performance of your textile business in PKR.</p>
        </div>
        <Badge className={r.isLoss ? 'bg-destructive/15 text-destructive border-0' : 'bg-success/15 text-success border-0'}>
          {r.isLoss ? <ArrowDown className="h-3 w-3 mr-1" /> : <ArrowUp className="h-3 w-3 mr-1" />}
          {r.isLoss ? 'Loss Detected' : `Margin ${margin.toFixed(1)}%`}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center"><TrendingUp className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold font-heading">{formatPKR(r.totalSalesRevenue)}</p></CardContent>
        </Card>
        <Card className="border-border/60 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Purchase Cost</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center"><ShoppingCart className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold font-heading">{formatPKR(r.totalPurchaseCost)}</p></CardContent>
        </Card>
        <Card className="border-border/60 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Net Profit</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-success/15 text-success flex items-center justify-center"><Wallet className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-heading text-success">{formatPKR(r.profit)}</p>
          </CardContent>
        </Card>
        <Card className={`border-border/60 hover-lift ${r.isLoss ? 'bg-destructive/5 border-destructive/30' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</CardTitle>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${r.isLoss ? 'bg-destructive/15 text-destructive' : 'bg-success/15 text-success'}`}>
              {r.isLoss ? <AlertTriangle className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
            </div>
          </CardHeader>
          <CardContent>
            {r.isLoss ? (
              <>
                <p className="text-base font-bold font-heading text-destructive">Loss Detected</p>
                <p className="text-xs text-muted-foreground mt-1">Shortfall: {formatPKR(r.loss)}</p>
              </>
            ) : (
              <>
                <p className="text-base font-bold font-heading text-success">Profitable</p>
                <p className="text-xs text-muted-foreground mt-1">Margin {margin.toFixed(1)}%</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-heading">Profit by Cloth Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cloth</TableHead>
                <TableHead>Purchase Cost</TableHead>
                <TableHead>Sales Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Profit (PKR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clothProfits.map(cp => (
                <TableRow key={cp.cloth_name}>
                  <TableCell className="font-medium">{cp.cloth_name}</TableCell>
                  <TableCell>{formatPKR(cp.totalPurchase)}</TableCell>
                  <TableCell>{formatPKR(cp.totalSale)}</TableCell>
                  <TableCell>
                    {cp.isLoss
                      ? <Badge className="bg-destructive/15 text-destructive border-0">Loss</Badge>
                      : cp.profit > 0
                        ? <Badge className="bg-success/15 text-success border-0">Profit</Badge>
                        : <Badge variant="secondary">No Activity</Badge>}
                  </TableCell>
                  <TableCell className={`text-right font-bold font-heading ${cp.isLoss ? 'text-destructive' : 'text-success'}`}>
                    {cp.isLoss ? `-${formatPKR(cp.loss)}` : formatPKR(cp.profit)}
                  </TableCell>
                </TableRow>
              ))}
              {clothProfits.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No data yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
