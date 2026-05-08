import { useQuery } from '@tanstack/react-query';
import { store } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function LowStock() {
  const { data: all = [] } = useQuery({ queryKey: ['inventory'], queryFn: () => store.getInventory() });
  const inventory = all.filter(i => i.current_stock < 50);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Low Stock Alert</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Items with stock below 50 meters
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">All stock levels are healthy.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Cloth</TableHead><TableHead>Current Stock</TableHead><TableHead>Status</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map(i => (
                  <TableRow key={i.cloth_id}>
                    <TableCell className="font-medium">{i.cloth_name}</TableCell>
                    <TableCell>{i.current_stock}m</TableCell>
                    <TableCell>
                      {i.current_stock <= 0 ? <Badge variant="destructive">Out of Stock</Badge>
                        : <Badge className="bg-warning text-warning-foreground">Low</Badge>}
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
