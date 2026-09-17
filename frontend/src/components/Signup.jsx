import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.error('Please complete all fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password
        })
      });

      const data = await res.json();

      if (data.success) {
        if (data.token) {
          localStorage.setItem('nexus_token', data.token);
          localStorage.setItem('nexus_user', data.name);
          localStorage.setItem('nexus_email', data.email);
        }
        toast.success('Account created! Welcome to Nexus AI.');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Backend server unreachable. Make sure python main.py is running.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-nexus-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-nexus-800 border border-nexus-500/50 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white">Create Enterprise Account</h1>
          <p className="text-xs text-slate-400 mt-1">Get started with RAG document intelligence</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-nexus-900 border border-nexus-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-primary-500 transition-colors"
              placeholder="Alex Walker"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-nexus-900 border border-nexus-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-primary-500 transition-colors"
              placeholder="alex@enterprise.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-nexus-900 border border-nexus-500/60 rounded-xl px-4 py-2.5 pr-10 text-xs text-slate-200 outline-none focus:border-primary-500 transition-colors"
                placeholder="Minimum 6 characters"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? 'Creating Workspace...' : 'Create Account'} <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center mt-5 text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
