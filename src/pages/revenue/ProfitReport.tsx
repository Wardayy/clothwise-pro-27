import { store } from '@/lib/store';
import { formatPKR } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ProfitReport() {
  const revenue = store.getRevenue();
  const cloths = store.getCloths();
  const purchases = store.getPurchases();
  const sales = store.getSales();

  const clothProfits = cloths.map(c => {
    const totalPurchase = purchases.filter(p => p.cloth_id === c.cloth_id).reduce((s, p) => s + p.total_cost, 0);
    const totalSale = sales.filter(s => s.cloth_id === c.cloth_id).reduce((s, sa) => s + sa.total_revenue, 0);
    return { cloth_name: c.cloth_name, totalPurchase, totalSale, profit: totalSale - totalPurchase };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Profit Report</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Purchase Cost</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold font-heading">{formatPKR(revenue.totalPurchaseCost)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Sales Revenue</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold font-heading">{formatPKR(revenue.totalSalesRevenue)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Net Profit</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold font-heading ${revenue.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatPKR(revenue.profit)}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Profit by Cloth Type</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cloth</TableHead>
                <TableHead>Purchase Cost</TableHead>
                <TableHead>Sales Revenue</TableHead>
                <TableHead className="text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clothProfits.map(cp => (
                <TableRow key={cp.cloth_name}>
                  <TableCell className="font-medium">{cp.cloth_name}</TableCell>
                  <TableCell>{formatPKR(cp.totalPurchase)}</TableCell>
                  <TableCell>{formatPKR(cp.totalSale)}</TableCell>
                  <TableCell className={`text-right font-bold ${cp.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatPKR(cp.profit)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
