import { useState } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Cloud,
  ShieldCheck,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

type Mode = 'signin' | 'signup';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const result = mode === 'signin'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);

    setBusy(false);

    if (result.error) {
      setError(friendlyError(result.error));
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-ink-50">
      {/* Left panel — branding / value props */}
      <div className="relative flex flex-col justify-between p-8 lg:p-12 lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl translate-y-1/3" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm">
              <GraduationCap className="w-6 h-6" />
            </span>
            <div>
              <p className="font-display font-bold text-lg leading-tight">My Mwalimu</p>
              <p className="text-primary-200 text-xs">AZ-900 Study Companion</p>
            </div>
          </div>
        </div>

        <div className="relative my-12 lg:my-0">
          <h1 className="font-display text-3xl lg:text-4xl font-bold leading-tight mb-3">
            Master Azure fundamentals, one concept at a time.
          </h1>
          <p className="text-primary-200 text-base lg:text-lg leading-relaxed max-w-md">
            Practice exams, flashcards, and a guided study buddy — everything you need to pass the AZ-900 certification.
          </p>

          <div className="mt-8 space-y-4 max-w-md">
            <Feature icon={<BookOpen className="w-5 h-5" />} title="15-question practice exams" desc="Timed and untimed modes with instant explanations" />
            <Feature icon={<Cloud className="w-5 h-5" />} title="Flashcards with smart filtering" desc="Mark cards as known or needs revision, filter to weak spots" />
            <Feature icon={<ShieldCheck className="w-5 h-5" />} title="Guided study buddy" desc="Plain-English definitions with real-world African examples" />
          </div>
        </div>

        <div className="relative text-primary-300 text-xs">
          Microsoft Certified: Azure Fundamentals (AZ-900)
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="card p-8 shadow-xl">
            <h2 className="font-display text-2xl font-bold text-ink-900">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-1.5 text-sm text-ink-500">
              {mode === 'signin'
                ? 'Sign in to continue your study journey.'
                : 'Start studying for the AZ-900 exam today.'}
            </p>

            {/* Mode toggle */}
            <div className="mt-6 flex p-1 bg-ink-100 rounded-lg">
              <button
                onClick={() => switchMode('signin')}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  mode === 'signin' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  mode === 'signup' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input pl-10"
                    autoComplete="email"
                    disabled={busy}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="input pl-10 pr-10"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    disabled={busy}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 p-0.5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-error-50 border border-error-200 text-sm text-error-700 animate-fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full py-3 text-base"
              >
                {busy ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Please wait…</>
                ) : (
                  <>
                    {mode === 'signin' ? 'Sign in' : 'Create account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-ink-400">
              {mode === 'signin' ? (
                <>
                  No account yet?{' '}
                  <button onClick={() => switchMode('signup')} className="font-semibold text-primary-600 hover:text-primary-700">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => switchMode('signin')} className="font-semibold text-primary-600 hover:text-primary-700">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-ink-400">
            By continuing you agree to our terms and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm shrink-0">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-primary-200 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function friendlyError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'Wrong email or password. Please try again.';
  }
  if (message.includes('User already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (message.includes('Password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  if (message.includes('Unable to validate email')) {
    return 'Please enter a valid email address.';
  }
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  return message;
}
