import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Zap } from 'lucide-react';
import { Logo } from './Logo';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('nexus_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  async function performLogin(loginEmail, loginPassword) {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim().toLowerCase(), password: loginPassword, remember_me: rememberMe })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('nexus_token', data.token);
        localStorage.setItem('nexus_user', data.name);
        localStorage.setItem('nexus_email', data.email);
        toast.success(`Welcome, ${data.name}!`);
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      toast.error('Backend server unreachable. Please make sure python main.py is running on port 8000.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    performLogin(email, password);
  };

  const handleQuickDemo = () => {
    setEmail('admin@nexus.ai');
    setPassword('admin123');
    performLogin('admin@nexus.ai', 'admin123');
  };

  return (
    <div className="min-h-screen bg-nexus-900 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md bg-nexus-800 border border-nexus-500/50 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <p className="text-center text-xs text-slate-400 mb-6">Enterprise Document Intelligence Workspace</p>

        {/* Quick Demo Login Option */}
        <button
          type="button"
          onClick={handleQuickDemo}
          disabled={isLoading}
          className="w-full mb-5 py-2.5 px-4 bg-nexus-700/80 hover:bg-nexus-600 border border-primary-500/50 hover:border-primary-400 text-primary-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow"
        >
          <Zap size={14} className="text-yellow-400" /> 1-Click Demo Login (admin@nexus.ai)
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-[1px] flex-1 bg-nexus-500/40"></div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500">or sign in with password</span>
          <div className="h-[1px] flex-1 bg-nexus-500/40"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email</label>
            <div className="relative">
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-nexus-900 border border-nexus-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-primary-500 transition-colors"
                placeholder="admin@nexus.ai"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-nexus-900 border border-nexus-500/60 rounded-xl px-4 py-2.5 pr-10 text-xs text-slate-200 outline-none focus:border-primary-500 transition-colors"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-nexus-500 bg-nexus-900 text-primary-500"
              />
              Remember session
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2.5 bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? 'Signing In...' : 'Sign In to Workspace'} <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400">
          Don't have an enterprise account?{' '}
          <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}