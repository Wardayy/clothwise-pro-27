import { useState } from 'react';
import { store, type Cloth } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

export default function ManageCloth() {
  const [cloths, setCloths] = useState(store.getCloths());
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const refresh = () => setCloths(store.getCloths());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !type.trim()) { toast.error('Fill all fields'); return; }
    if (editId) {
      store.updateCloth(editId, { cloth_name: name, cloth_type: type });
      toast.success('Cloth updated');
      setEditId(null);
    } else {
      store.addCloth({ cloth_name: name, cloth_type: type });
      toast.success('Cloth added');
    }
    setName(''); setType(''); refresh();
  };

  const handleEdit = (c: Cloth) => { setEditId(c.cloth_id); setName(c.cloth_name); setType(c.cloth_type); };
  const handleDelete = (id: string) => { store.deleteCloth(id); toast.success('Deleted'); refresh(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Manage Cloth</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">{editId ? 'Edit Cloth' : 'Add Cloth'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="space-y-1 flex-1"><Label>Cloth Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cotton" /></div>
            <div className="space-y-1 flex-1"><Label>Cloth Type</Label><Input value={type} onChange={e => setType(e.target.value)} placeholder="e.g. Natural" /></div>
            <div className="flex items-end gap-2">
              <Button type="submit">{editId ? 'Update' : 'Add'}</Button>
              {editId && <Button type="button" variant="outline" onClick={() => { setEditId(null); setName(''); setType(''); }}>Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {cloths.map(c => (
                <TableRow key={c.cloth_id}>
                  <TableCell className="font-medium">{c.cloth_name}</TableCell>
                  <TableCell>{c.cloth_type}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(c.cloth_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
