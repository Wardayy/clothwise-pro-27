import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, Mail, Phone, Calendar, Shield, KeyRound, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, updatePassword } = useAuth();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle();
      if (error) throw error;
      return data as { id: string; full_name: string | null; phone_number: string | null; created_at: string } | null;
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['my-roles', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', user!.id);
      if (error) throw error;
      return (data as { role: string }[]).map(r => r.role);
    },
  });

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setPhone(profile.phone_number ?? '');
    }
  }, [profile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), phone_number: phone.trim() })
      .eq('id', user.id);
    setSavingProfile(false);
    if (error) return toast.error(error.message);
    toast.success('Profile updated');
    qc.invalidateQueries({ queryKey: ['profile', user.id] });
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    setSavingPwd(true);
    const { error } = await updatePassword(newPassword);
    setSavingPwd(false);
    if (error) return toast.error(error);
    toast.success('Password updated');
    setNewPassword(''); setConfirmPassword('');
  };

  const role = roles[0] ?? 'user';
  const initials = (fullName || user?.email || 'U').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your personal information and security.</p>
      </div>

      <Card className="overflow-hidden border-border/60">
        <div className="h-24 gradient-hero" />
        <CardContent className="-mt-12 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="h-24 w-24 rounded-2xl border-4 border-card bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold font-heading shadow-elegant">
              {initials}
            </div>
            <div className="flex-1 pt-2">
              <h2 className="text-xl font-heading font-bold">{fullName || 'Unnamed User'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Badge className="gradient-gold text-gold-foreground border-0 self-start sm:self-end capitalize">
              <Shield className="h-3 w-3 mr-1" /> {role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-primary" /> Profile Details
            </CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
              <form onSubmit={saveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</Label>
                  <Input value={user?.email ?? ''} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">Email is managed by your administrator.</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone Number</Label>
                  <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="03XX-XXXXXXX" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Member since</p>
                    <p className="text-sm font-medium mt-1">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Shield className="h-3 w-3" /> Role</p>
                    <p className="text-sm font-medium mt-1 capitalize">{role}</p>
                  </div>
                </div>
                <Button type="submit" disabled={savingProfile} className="gradient-primary text-white">
                  <Save className="h-4 w-4" /> {savingProfile ? 'Saving…' : 'Save Changes'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-accent" /> Change Password
            </CardTitle>
            <CardDescription>Use a strong password to protect your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} required />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={6} required />
              </div>
              <Button type="submit" disabled={savingPwd} variant="outline">
                {savingPwd ? 'Updating…' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
