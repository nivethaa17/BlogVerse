'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import { useToast } from '@/components/providers/ToastProvider';

const CATEGORIES = [
  'Technology', 'AI & ML', 'Web Development', 'Design', 'Finance',
  'Health', 'Science', 'Productivity', 'Career', 'Travel', 'Food', 'Lifestyle',
];

const ROLES = [
  { value: 'reader', label: 'Reader', desc: 'Discover and read great content' },
  { value: 'writer', label: 'Writer', desc: 'Create and publish your own blogs' },
  { value: 'both', label: 'Both', desc: 'Read and write content' },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'reader', preferences: [] as string[],
  });
  const { register, isLoading } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();

  const togglePref = (cat: string) => {
    setForm((f) => ({
      ...f,
      preferences: f.preferences.includes(cat)
        ? f.preferences.filter((p) => p !== cat)
        : [...f.preferences, cat],
    }));
  };

  const handleSubmit = async () => {
    try {
      await register(form as any);
      toast('Account created! Welcome to BlogVerse 🎉', 'success');
      router.push('/feed');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Registration failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BlogVerse
          </Link>
          <h2 className="mt-4 text-2xl font-semibold">Create your account</h2>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 w-12 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-8 shadow-sm">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => setStep(2)}
                disabled={!form.name || !form.email || form.password.length < 6}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Choose your role</h3>
              <div className="space-y-3">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setForm({ ...form, role: role.value })}
                    className={`w-full text-left p-4 border-2 rounded-xl transition-all ${
                      form.role === role.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{role.label}</div>
                    <div className="text-sm text-muted-foreground">{role.desc}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 border py-2.5 rounded-lg font-medium hover:bg-muted">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Select your interests</h3>
              <p className="text-sm text-muted-foreground mb-4">Pick topics you're interested in for a personalized experience</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => togglePref(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      form.preferences.includes(cat)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border py-2.5 rounded-lg font-medium hover:bg-muted">Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
