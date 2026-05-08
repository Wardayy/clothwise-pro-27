import { useQuery } from '@tanstack/react-query';
import { store } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function ViewStock() {
  const { data: inventory = [] } = useQuery({ queryKey: ['inventory'], queryFn: () => store.getInventory() });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Inventory - View Stock</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Current Stock Levels</CardTitle></CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No cloth types registered.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cloth Name</TableHead><TableHead>Type</TableHead><TableHead>Total Purchased</TableHead>
                  <TableHead>Total Sold</TableHead><TableHead>Current Stock</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map(i => (
                  <TableRow key={i.cloth_id}>
                    <TableCell className="font-medium">{i.cloth_name}</TableCell>
                    <TableCell>{i.cloth_type}</TableCell>
                    <TableCell>{i.total_purchased}m</TableCell>
                    <TableCell>{i.total_sold}m</TableCell>
                    <TableCell className="font-bold">{i.current_stock}m</TableCell>
                    <TableCell>
                      {i.current_stock <= 0 ? <Badge variant="destructive">Out of Stock</Badge>
                        : i.current_stock < 50 ? <Badge className="bg-warning text-warning-foreground">Low Stock</Badge>
                        : <Badge className="bg-success text-success-foreground">In Stock</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
