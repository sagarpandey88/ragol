import { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { OAuthButtons } from '../components/auth/OAuthButtons';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function AuthPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700">
          {tab === 'login' ? 'Sign In' : 'Create Account'}
        </h2>
        <div className="flex border rounded-lg overflow-hidden mb-6">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>
        {tab === 'login' ? <LoginForm /> : <RegisterForm />}
        <div className="mt-6">
          <p className="text-center text-xs text-gray-400 mb-3">or</p>
          <OAuthButtons />
        </div>
      </div>
    </div>
  );
}
