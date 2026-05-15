import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { BrandLogo } from '@/components/BrandLogo';
import { ShieldCheck, BarChart3, Boxes, Mail, Phone, User, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [remember, setRemember] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background">Loading…</div>;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(signinEmail, signinPassword);
    setBusy(false);
    if (error) toast.error(error);
    else { toast.success('Welcome back!'); navigate('/dashboard'); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setBusy(true);
    const { error } = await signUp(email, password, fullName, phone);
    setBusy(false);
    if (error) toast.error(error);
    else { toast.success('Account created. Welcome to ClothWare!'); navigate('/dashboard'); }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Brand panel */}
      <div className="relative hidden lg:flex lg:w-1/2 gradient-hero animate-gradient overflow-hidden text-white p-12 flex-col justify-between">
        <div className="absolute inset-0 textile-pattern opacity-40" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute bottom-0 -left-24 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />

        <div className="relative z-10">
          <BrandLogo size="lg" textClassName="text-white" />
        </div>

        <div className="relative z-10 space-y-8 max-w-md">
          <div>
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-3">
              Textile ERP Platform
            </p>
            <h1 className="text-4xl xl:text-5xl font-heading font-bold leading-tight">
              Welcome to ClothWare Textile ERP
            </h1>
            <p className="mt-4 text-white/70 text-base leading-relaxed">
              Smart, end-to-end management for wholesale cloth trading — purchases, sales, inventory and profit, all in one premium dashboard.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              { icon: Boxes, label: 'Live inventory & stock automation' },
              { icon: BarChart3, label: 'Real-time profit & sales analytics in PKR' },
              { icon: ShieldCheck, label: 'Secure authentication & role-based access' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3 text-white/85 text-sm">
                <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <f.icon className="h-4 w-4 text-gold" />
                </div>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} ClothWare · Wholesale Textile Management System
        </p>
      </div>

      {/* Auth panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden mb-6 flex justify-center">
            <BrandLogo size="lg" showTagline />
          </div>
          <Card className="border-border/60 shadow-elegant">
            <CardContent className="p-6 sm:p-8">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <div className="mb-5">
                    <h2 className="text-xl font-heading font-bold">Welcome back</h2>
                    <p className="text-sm text-muted-foreground mt-1">Sign in to manage your textile business.</p>
                  </div>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" className="pl-9" value={signinEmail} onChange={e => setSigninEmail(e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="password" type="password" className="pl-9" value={signinPassword} onChange={e => setSigninPassword(e.target.value)} required />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={remember} onCheckedChange={v => setRemember(!!v)} />
                        <span className="text-muted-foreground">Remember me</span>
                      </label>
                      <button type="button" onClick={() => toast.info('Please contact your administrator to reset your password.')} className="text-primary hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <Button type="submit" className="w-full gradient-primary text-white font-semibold hover-lift" disabled={busy}>
                      {busy ? 'Signing in…' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <div className="mb-5">
                    <h2 className="text-xl font-heading font-bold">Create your account</h2>
                    <p className="text-sm text-muted-foreground mt-1">Start managing purchases, sales & inventory.</p>
                  </div>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="fullName" className="pl-9" value={fullName} onChange={e => setFullName(e.target.value)} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="email2">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="email2" type="email" className="pl-9" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="phone" type="tel" className="pl-9" value={phone} onChange={e => setPhone(e.target.value)} required />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="password2">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="password2" type="password" className="pl-9" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirm">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="confirm" type="password" className="pl-9" value={confirm} onChange={e => setConfirm(e.target.value)} minLength={6} required />
                        </div>
                      </div>
                    </div>
                    <Button type="submit" className="w-full gradient-primary text-white font-semibold hover-lift" disabled={busy}>
                      {busy ? 'Creating account…' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Protected by secure authentication · All financial values in PKR
          </p>
        </div>
      </div>
    </div>
  );
}
