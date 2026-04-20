import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Zap, Mail, Lock, Loader2, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setSuccessMessage('Account created! You can now log in.');
        setIsSignUp(false);
        setEmail('');
        setPassword('');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        onLoginSuccess();
        handleClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(provider: 'google' | 'github' | 'facebook') {
    setError('');
    setSocialLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `${provider} sign in failed`);
      setSocialLoading(null);
    }
  }

  function handleClose() {
    onClose();
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMessage('');
    setIsSignUp(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-violet-400/12 bg-[#130c24]/95 p-8 shadow-[0_28px_70px_rgba(4,2,12,0.95)] backdrop-blur-xl">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-violet-300 transition-colors hover:text-fuchsia-300"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="mb-8 flex justify-center">
            <div className="rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 p-3 shadow-lg shadow-violet-950/30">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>

          <h1 className="mb-2 text-center text-3xl font-bold text-violet-50">
            AI Hub
          </h1>
          <p className="mb-8 text-center text-violet-200/80">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4">
              <p className="text-sm text-rose-200">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <p className="text-sm text-emerald-200">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5 mb-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-violet-100">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-violet-300/70" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-violet-400/12 bg-white/5 py-3 pl-10 pr-4 text-violet-50 placeholder:text-violet-300/45 outline-none transition focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/30"
                  required
                  disabled={loading || socialLoading !== null}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-violet-100">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-violet-300/70" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="........"
                  className="w-full rounded-2xl border border-violet-400/12 bg-white/5 py-3 pl-10 pr-4 text-violet-50 placeholder:text-violet-300/45 outline-none transition focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/30"
                  required
                  disabled={loading || socialLoading !== null}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || socialLoading !== null}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 py-3 font-medium text-white shadow-lg shadow-violet-950/30 transition-all duration-200 hover:brightness-110 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-violet-400/20" />
            <span className="text-xs font-medium text-violet-300/60">Or sign in with</span>
            <div className="h-px flex-1 bg-violet-400/20" />
          </div>

          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={loading || socialLoading !== null}
              className="w-full rounded-2xl border border-violet-400/12 bg-white/5 py-2.5 font-medium text-violet-100 transition-all hover:bg-white/10 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {socialLoading === 'google' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <text x="12" y="18" fontSize="14" fontWeight="bold" textAnchor="middle">G</text>
                </svg>
              )}
              Google
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading || socialLoading !== null}
              className="w-full rounded-2xl border border-violet-400/12 bg-white/5 py-2.5 font-medium text-violet-100 transition-all hover:bg-white/10 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {socialLoading === 'facebook' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <text x="12" y="18" fontSize="14" fontWeight="bold" textAnchor="middle">f</text>
                </svg>
              )}
              Facebook
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              disabled={loading || socialLoading !== null}
              className="w-full rounded-2xl border border-violet-400/12 bg-white/5 py-2.5 font-medium text-violet-100 transition-all hover:bg-white/10 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {socialLoading === 'github' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
              GitHub
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-violet-200/80">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccessMessage('');
                  setEmail('');
                  setPassword('');
                }}
                className="ml-2 font-medium text-violet-300 transition-colors hover:text-fuchsia-300"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
