import { useState } from 'react';
import { store } from '@/lib/store';
import { formatPKR } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SearchPurchase() {
  const [clothId, setClothId] = useState('');
  const [factoryId, setFactoryId] = useState('');
  const [date, setDate] = useState('');
  const cloths = store.getCloths();
  const factories = store.getFactories();

  const purchases = store.getPurchases().filter(p => {
    if (clothId && p.cloth_id !== clothId) return false;
    if (factoryId && p.factory_id !== factoryId) return false;
    if (date && p.purchase_date !== date) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Search Purchases</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cloth</Label>
              <Select value={clothId} onValueChange={setClothId}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {cloths.map(c => <SelectItem key={c.cloth_id} value={c.cloth_id}>{c.cloth_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Factory</Label>
              <Select value={factoryId} onValueChange={setFactoryId}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {factories.map(f => <SelectItem key={f.factory_id} value={f.factory_id}>{f.factory_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          {purchases.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No results found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cloth</TableHead>
                  <TableHead>Factory</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Cost/m</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map(p => (
                  <TableRow key={p.purchase_id}>
                    <TableCell>{cloths.find(c => c.cloth_id === p.cloth_id)?.cloth_name}</TableCell>
                    <TableCell>{factories.find(f => f.factory_id === p.factory_id)?.factory_name}</TableCell>
                    <TableCell>{p.quantity_meter}m</TableCell>
                    <TableCell>{formatPKR(p.cost_per_meter)}</TableCell>
                    <TableCell>{p.purchase_date}</TableCell>
                    <TableCell className="text-right font-medium">{formatPKR(p.total_cost)}</TableCell>
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
