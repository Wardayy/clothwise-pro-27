import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { store } from '@/lib/store';
import { formatPKR } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SearchSale() {
  const [clothId, setClothId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState('');
  const { data: cloths = [] } = useQuery({ queryKey: ['cloths'], queryFn: () => store.getCloths() });
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: () => store.getCustomers() });
  const { data: allSales = [] } = useQuery({ queryKey: ['sales'], queryFn: () => store.getSales() });

  const sales = allSales.filter(s => {
    if (clothId && clothId !== 'all' && s.cloth_id !== clothId) return false;
    if (customerId && customerId !== 'all' && s.customer_id !== customerId) return false;
    if (date && s.sale_date !== date) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Search Sales</h1>
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
              <Label>Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {customers.map(c => <SelectItem key={c.customer_id} value={c.customer_id}>{c.customer_name}</SelectItem>)}
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
          {sales.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No results found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cloth</TableHead><TableHead>Customer</TableHead><TableHead>Qty</TableHead>
                  <TableHead>Price/m</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map(s => (
                  <TableRow key={s.sale_id}>
                    <TableCell>{cloths.find(c => c.cloth_id === s.cloth_id)?.cloth_name}</TableCell>
                    <TableCell>{customers.find(c => c.customer_id === s.customer_id)?.customer_name}</TableCell>
                    <TableCell>{s.quantity_meter}m</TableCell>
                    <TableCell>{formatPKR(s.sale_price)}</TableCell>
                    <TableCell>{s.sale_date}</TableCell>
                    <TableCell className="text-right font-medium">{formatPKR(s.total_revenue)}</TableCell>
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
