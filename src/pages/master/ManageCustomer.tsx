import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { store, type Customer } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

export default function ManageCustomer() {
  const qc = useQueryClient();
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: () => store.getCustomers() });
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ['customers'] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) { toast.error('Fill all fields'); return; }
    try {
      if (editId) { await store.updateCustomer(editId, { customer_name: name, contact }); toast.success('Customer updated'); setEditId(null); }
      else { await store.addCustomer({ customer_name: name, contact }); toast.success('Customer added'); }
      setName(''); setContact(''); refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleEdit = (c: Customer) => { setEditId(c.customer_id); setName(c.customer_name); setContact(c.contact); };
  const handleDelete = async (id: string) => {
    try { await store.deleteCustomer(id); toast.success('Deleted'); refresh(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Manage Customers</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">{editId ? 'Edit Customer' : 'Add Customer'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="space-y-1 flex-1"><Label>Customer Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="space-y-1 flex-1"><Label>Contact</Label><Input value={contact} onChange={e => setContact(e.target.value)} /></div>
            <div className="flex items-end gap-2">
              <Button type="submit">{editId ? 'Update' : 'Add'}</Button>
              {editId && <Button type="button" variant="outline" onClick={() => { setEditId(null); setName(''); setContact(''); }}>Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {customers.map(c => (
                <TableRow key={c.customer_id}>
                  <TableCell className="font-medium">{c.customer_name}</TableCell>
                  <TableCell>{c.contact}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(c.customer_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
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
