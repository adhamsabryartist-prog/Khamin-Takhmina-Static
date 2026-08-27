import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '../services/supabaseClient';

const ADMIN_EMAIL = 'adhamsabry.co@gmail.com';

export const AdminLogin = ({ onLogin, onAdminVerified }: { onLogin: () => void; onAdminVerified?: (email: string) => void }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check if already authenticated via Supabase session
    const supabase = getSupabaseClient();
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          if (session.user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            if (onAdminVerified) onAdminVerified(session.user.email);
          } else {
            setErrorMsg(`الحساب المسجل (${session.user.email}) ليس الحساب المعتمد للمدير.`);
          }
        }
      } catch (err) {
        console.error('Error checking auth session:', err);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        if (session.user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          if (onAdminVerified) onAdminVerified(session.user.email);
        } else {
          setErrorMsg(`الحساب المسجل (${session.user.email}) ليس الحساب المعتمد للمدير.`);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onAdminVerified]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const supabase = getSupabaseClient();

      // Ensure redirect uses query params (?admin=true) instead of hash (#admin)
      const redirectUrl = new URL(window.location.href);
      redirectUrl.hash = '';
      redirectUrl.searchParams.set('admin', 'true');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl.toString(),
        },
      });

      if (error) {
        // Fallback to legacy server google auth if supabase oauth not configured yet
        console.warn('Supabase OAuth error, falling back to server Google auth:', error.message);
        onLogin();
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      onLogin();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black/90 text-white p-4 backdrop-blur-md">
      <div className="bg-gray-900 border-2 border-purple-600/50 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30">
          <Shield className="w-8 h-8 text-white" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white">لوحة تحكم الإدارة</h1>
          <p className="text-sm text-gray-400 mt-1">الدخول مقتصر فقط على بريد المدير المعتمد</p>
          <p className="text-xs text-purple-400 font-mono mt-1 font-bold">{ADMIN_EMAIL}</p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm text-right">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          type="button"
          className="w-full py-3.5 bg-white hover:bg-gray-100 text-gray-900 active:scale-[0.98] rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-3"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>تسجيل الدخول بحساب Google المعتمد</span>
        </button>

        <p className="text-[11px] text-gray-500">
          لن يتم قبول أي حساب Google آخر سوى الحساب المخصص للمدير.
        </p>
      </div>
    </div>
  );
};

