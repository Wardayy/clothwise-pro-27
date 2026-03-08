import { useState } from 'react';
import { store, type Factory } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

export default function ManageFactory() {
  const [factories, setFactories] = useState(store.getFactories());
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const refresh = () => setFactories(store.getFactories());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) { toast.error('Fill all fields'); return; }
    if (editId) {
      store.updateFactory(editId, { factory_name: name, location });
      toast.success('Factory updated'); setEditId(null);
    } else {
      store.addFactory({ factory_name: name, location });
      toast.success('Factory added');
    }
    setName(''); setLocation(''); refresh();
  };

  const handleEdit = (f: Factory) => { setEditId(f.factory_id); setName(f.factory_name); setLocation(f.location); };
  const handleDelete = (id: string) => { store.deleteFactory(id); toast.success('Deleted'); refresh(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Manage Factories</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">{editId ? 'Edit Factory' : 'Add Factory'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="space-y-1 flex-1"><Label>Factory Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Faisalabad Textiles" /></div>
            <div className="space-y-1 flex-1"><Label>Location</Label><Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Faisalabad" /></div>
            <div className="flex items-end gap-2">
              <Button type="submit">{editId ? 'Update' : 'Add'}</Button>
              {editId && <Button type="button" variant="outline" onClick={() => { setEditId(null); setName(''); setLocation(''); }}>Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Location</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {factories.map(f => (
                <TableRow key={f.factory_id}>
                  <TableCell className="font-medium">{f.factory_name}</TableCell>
                  <TableCell>{f.location}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(f)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(f.factory_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
