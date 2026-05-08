import { useQuery } from '@tanstack/react-query';
import { store } from '@/lib/store';
import { formatPKR } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PurchaseHistory() {
  const { data: purchases = [] } = useQuery({ queryKey: ['purchases'], queryFn: () => store.getPurchases() });
  const { data: cloths = [] } = useQuery({ queryKey: ['cloths'], queryFn: () => store.getCloths() });
  const { data: factories = [] } = useQuery({ queryKey: ['factories'], queryFn: () => store.getFactories() });

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
                    <TableHead>Cloth</TableHead><TableHead>Factory</TableHead><TableHead>Quantity</TableHead>
                    <TableHead>Cost/Meter</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map(p => (
                    <TableRow key={p.purchase_id}>
                      <TableCell>{cloths.find(c => c.cloth_id === p.cloth_id)?.cloth_name || 'Unknown'}</TableCell>
                      <TableCell>{factories.find(f => f.factory_id === p.factory_id)?.factory_name || 'Unknown'}</TableCell>
                      <TableCell>{p.quantity_meter}m</TableCell>
                      <TableCell>{formatPKR(p.cost_per_meter)}</TableCell>
                      <TableCell>{p.purchase_date}</TableCell>
                      <TableCell className="text-right font-medium">{formatPKR(p.total_cost)}</TableCell>
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
