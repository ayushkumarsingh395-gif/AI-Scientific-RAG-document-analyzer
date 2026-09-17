import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Key, Shield, LogOut, Trash2, Check, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const UserProfile = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(localStorage.getItem('nexus_user') || 'Admin User');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('nexus_email') || 'admin@nexus.ai');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error('Please enter old and new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    const token = localStorage.getItem('nexus_token');
    setIsUpdatingPassword(true);
    try {
      const res = await fetch(`${API_BASE}/user/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Password change failed');
      toast.success('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    localStorage.removeItem('nexus_email');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-nexus-900 text-slate-200 p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-nexus-500/40">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg bg-nexus-800 border border-nexus-500/50 hover:bg-nexus-700 text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-lg font-bold text-white">Account & Security Center</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Card */}
          <div className="md:col-span-1 bg-nexus-800/80 border border-nexus-500/50 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-md">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <h2 className="text-lg font-semibold text-white">{userName}</h2>
            <p className="text-xs text-slate-400 mt-1">{userEmail}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[11px] font-medium mt-3">
              <Shield size={12} /> Enterprise Role
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full mt-6 py-2 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>

          {/* Settings Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Password Update Form */}
            <div className="bg-nexus-800/80 border border-nexus-500/50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-nexus-500/40">
                <Lock size={18} className="text-primary-400" />
                <h3 className="text-sm font-semibold text-white">Change Workspace Password</h3>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-nexus-900 border border-nexus-500/60 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-nexus-900 border border-nexus-500/60 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-nexus-900 border border-nexus-500/60 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-primary-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full py-2.5 bg-primary-500 hover:bg-primary-400 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check size={16} /> {isUpdatingPassword ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
