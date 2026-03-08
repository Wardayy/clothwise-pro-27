import { store } from '@/lib/store';
import { formatPKR } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SalesHistory() {
  const sales = store.getSales();
  const cloths = store.getCloths();
  const customers = store.getCustomers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Sales History</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">All Sales</CardTitle></CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No sales recorded yet.</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cloth</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price/Meter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map(s => (
                    <TableRow key={s.sale_id}>
                      <TableCell>{cloths.find(c => c.cloth_id === s.cloth_id)?.cloth_name || 'Unknown'}</TableCell>
                      <TableCell>{customers.find(c => c.customer_id === s.customer_id)?.customer_name || 'Unknown'}</TableCell>
                      <TableCell>{s.quantity_meter}m</TableCell>
                      <TableCell>{formatPKR(s.sale_price)}</TableCell>
                      <TableCell>{s.sale_date}</TableCell>
                      <TableCell className="text-right font-medium">{formatPKR(s.total_revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
