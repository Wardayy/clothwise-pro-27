import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { store } from '@/lib/store';
import { formatPKR } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function RecordSale() {
  const qc = useQueryClient();
  const { data: cloths = [] } = useQuery({ queryKey: ['cloths'], queryFn: () => store.getCloths() });
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: () => store.getCustomers() });
  const [clothId, setClothId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [busy, setBusy] = useState(false);

  const { data: stock = 0 } = useQuery({
    queryKey: ['stock', clothId],
    queryFn: () => store.getStock(clothId),
    enabled: !!clothId,
  });

  const total = (Number(quantity) || 0) * (Number(salePrice) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clothId || !customerId || !quantity || !salePrice) { toast.error('Please fill all fields'); return; }
    if (Number(quantity) > stock) { toast.error('Insufficient Stock! Available: ' + stock + 'm'); return; }
    setBusy(true);
    try {
      await store.addSale({ cloth_id: clothId, customer_id: customerId, quantity_meter: Number(quantity), sale_price: Number(salePrice), sale_date: date });
      toast.success('Sale recorded successfully');
      setClothId(''); setCustomerId(''); setQuantity(''); setSalePrice('');
      qc.invalidateQueries();
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-heading font-bold">Record Sale</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Sale Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cloth</Label>
                <Select value={clothId} onValueChange={setClothId}>
                  <SelectTrigger><SelectValue placeholder="Select Cloth" /></SelectTrigger>
                  <SelectContent>
                    {cloths.map(c => <SelectItem key={c.cloth_id} value={c.cloth_id}>{c.cloth_name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {clothId && <p className="text-xs text-muted-foreground">Stock: {stock}m</p>}
              </div>
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger><SelectValue placeholder="Select Customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => <SelectItem key={c.customer_id} value={c.customer_id}>{c.customer_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity (meters)</Label>
                <Input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Sale Price Per Meter (Rs)</Label>
                <Input type="number" min="1" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Sale Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Total Revenue</Label>
                <div className="h-10 flex items-center px-3 rounded-md bg-muted text-lg font-bold font-heading">{formatPKR(total)}</div>
              </div>
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={busy}>{busy ? 'Saving...' : 'Record Sale'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
