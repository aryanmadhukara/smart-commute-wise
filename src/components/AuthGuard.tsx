import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    if (error) setError(error.message);
    else setError('Check your email to confirm your account!');
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  };

  return (
    <Card className="w-full max-w-sm mx-auto border-commute-border shadow-commute">
      <CardContent className="p-8">
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="text-xs uppercase tracking-widest">Login</TabsTrigger>
            <TabsTrigger value="signup" className="text-xs uppercase tracking-widest">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="space-y-4">
            <div>
              <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="mt-2 bg-background border-border" />
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Password</Label>
              <Input value={password} onChange={e => setPassword(e.target.value)} type="password" className="mt-2 bg-background border-border" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleLogin} disabled={loading} className="w-full h-11 text-sm tracking-wide">Sign In</Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-card px-3 text-muted-foreground">or</span></div>
            </div>
            <Button variant="outline" onClick={handleGoogleLogin} className="w-full h-11 text-sm tracking-wide">Continue with Google</Button>
          </TabsContent>
          <TabsContent value="signup" className="space-y-4">
            <div>
              <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="mt-2 bg-background border-border" />
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Password</Label>
              <Input value={password} onChange={e => setPassword(e.target.value)} type="password" className="mt-2 bg-background border-border" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleSignup} disabled={loading} className="w-full h-11 text-sm tracking-wide">Create Account</Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function UserMenu({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-muted-foreground uppercase tracking-widest hidden sm:inline">{user.email}</span>
      <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()} className="text-muted-foreground hover:text-foreground">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
