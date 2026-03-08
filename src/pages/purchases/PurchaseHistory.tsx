import { store } from '@/lib/store';
import { formatPKR } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PurchaseHistory() {
  const purchases = store.getPurchases();
  const cloths = store.getCloths();
  const factories = store.getFactories();

  const getName = (arr: { cloth_id?: string; factory_id?: string; cloth_name?: string; factory_name?: string }[], id: string, key: string) =>
    arr.find((a: any) => a[key] === id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Purchase History</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">All Purchases</CardTitle></CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No purchases recorded yet.</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cloth</TableHead>
                    <TableHead>Factory</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Cost/Meter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map(p => {
                    const cloth = getName(cloths as any, p.cloth_id, 'cloth_id') as any;
                    const factory = getName(factories as any, p.factory_id, 'factory_id') as any;
                    return (
                      <TableRow key={p.purchase_id}>
                        <TableCell>{cloth?.cloth_name || 'Unknown'}</TableCell>
                        <TableCell>{factory?.factory_name || 'Unknown'}</TableCell>
                        <TableCell>{p.quantity_meter}m</TableCell>
                        <TableCell>{formatPKR(p.cost_per_meter)}</TableCell>
                        <TableCell>{p.purchase_date}</TableCell>
                        <TableCell className="text-right font-medium">{formatPKR(p.total_cost)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
