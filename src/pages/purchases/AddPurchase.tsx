import { useState } from 'react';
import { store } from '@/lib/store';
import { formatPKR } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AddPurchase() {
  const cloths = store.getCloths();
  const factories = store.getFactories();
  const [clothId, setClothId] = useState('');
  const [factoryId, setFactoryId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPerMeter, setCostPerMeter] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const total = (Number(quantity) || 0) * (Number(costPerMeter) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clothId || !factoryId || !quantity || !costPerMeter) {
      toast.error('Please fill all fields');
      return;
    }
    store.addPurchase({
      cloth_id: clothId,
      factory_id: factoryId,
      quantity_meter: Number(quantity),
      cost_per_meter: Number(costPerMeter),
      purchase_date: date,
    });
    toast.success('Purchase recorded successfully');
    setClothId(''); setFactoryId(''); setQuantity(''); setCostPerMeter('');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-heading font-bold">Add Purchase</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Purchase Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cloth</Label>
                <Select value={clothId} onValueChange={setClothId}>
                  <SelectTrigger><SelectValue placeholder="Select Cloth" /></SelectTrigger>
                  <SelectContent>
                    {cloths.map(c => <SelectItem key={c.cloth_id} value={c.cloth_id}>{c.cloth_name} ({c.cloth_type})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Factory</Label>
                <Select value={factoryId} onValueChange={setFactoryId}>
                  <SelectTrigger><SelectValue placeholder="Select Factory" /></SelectTrigger>
                  <SelectContent>
                    {factories.map(f => <SelectItem key={f.factory_id} value={f.factory_id}>{f.factory_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity (meters)</Label>
                <Input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Cost Per Meter (Rs)</Label>
                <Input type="number" min="1" value={costPerMeter} onChange={e => setCostPerMeter(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Total Cost</Label>
                <div className="h-10 flex items-center px-3 rounded-md bg-muted text-lg font-bold font-heading">
                  {formatPKR(total)}
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full sm:w-auto">Save Purchase</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
