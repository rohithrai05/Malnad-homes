
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, AlertCircle, Camera, Upload, CheckCircle, KeyRound, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'verify' | 'forgotPassword' | 'resetSent';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const { login, signup, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    repeatPassword: '',
    photo: null as File | null
  });
  const [error, setError] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode('login');
      setError('');
      setFormData({ name: '', email: '', password: '', repeatPassword: '', photo: null });
      setIsAdminMode(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && formData.password !== formData.repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        onClose();
      } else if (mode === 'signup') {
        if (!formData.name) throw new Error("Name is required");
        await signup(formData.name, formData.email, formData.password, formData.photo);
        // On successful signup, switch to verify mode
        setMode('verify');
      } else if (mode === 'forgotPassword') {
        await resetPassword(formData.email);
        setMode('resetSent');
      }
    } catch (err: any) {
      if (err.message === "Email not verified") {
        setMode('verify');
      } else if (err.message?.includes("Database error saving new user")) {
        setError("System configuration error: Please run the SQL setup script in Supabase to fix database triggers.");
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photo: e.target.files[0] });
    }
  };

  const switchToLogin = () => {
    setMode('login');
    setError('');
  };

  const switchToSignup = () => {
    setMode('signup');
    setError('');
    setFormData({ name: '', email: '', password: '', repeatPassword: '', photo: null });
  };

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
    setMode('login'); // Always force login view
    setError('');
  };

  // Verification Screen
  if (mode === 'verify') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 p-8 text-center">
          <button onClick={onClose} className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full">
            <X className="h-5 w-5" />
          </button>
          
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-emerald-500" />
          </div>
          
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4">Verify Your Email</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            We have sent a verification email to <span className="text-emerald-500 font-medium">{formData.email}</span>. 
            Please verify it and log in to continue.
          </p>

          <Button 
            onClick={switchToLogin} 
            className="w-full"
            size="lg"
          >
            Back to Log In
          </Button>
        </div>
      </div>
    );
  }

  // Password Reset Sent Screen
  if (mode === 'resetSent') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 p-8 text-center">
          <button onClick={onClose} className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full">
            <X className="h-5 w-5" />
          </button>
          
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4">Check Your Inbox</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            We sent you a password change link to <span className="text-emerald-500 font-medium">{formData.email}</span>.
          </p>

          <Button 
            onClick={switchToLogin} 
            className="w-full"
            size="lg"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Forgot Password Form
  if (mode === 'forgotPassword') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity duration-300" onClick={onClose}></div>
        
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="px-8 pt-8 pb-2 text-center relative">
            <button onClick={onClose} className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
              <X className="h-5 w-5" />
            </button>
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700">
               <KeyRound className="h-6 w-6 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2">Reset Password</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your email and we'll send you a link to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full group text-lg" isLoading={loading} size="lg">
              Get Reset Link
            </Button>
          </form>

          <div className="px-8 pb-8 pt-2 text-center border-t border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950/30">
            <button onClick={switchToLogin} className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto">
              <ArrowRight className="h-4 w-4 rotate-180" /> Back to Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login / Signup Form
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className={`relative w-full max-w-md bg-white dark:bg-slate-900 border ${isAdminMode ? 'border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)]' : 'border-slate-200 dark:border-slate-800 shadow-2xl'} rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300`}>
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center relative">
          <button 
            onClick={onClose}
            className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </button>
          
          {isAdminMode ? (
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold uppercase tracking-widest mb-2 border border-red-500/20">
                <Shield className="h-3 w-3" /> Admin Portal
             </div>
          ) : null}

          <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            {mode === 'login' ? (isAdminMode ? 'Admin Login' : 'Welcome Back') : 'Join Us'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {mode === 'login' 
              ? (isAdminMode ? 'Secure access for administrators only.' : 'Sign in to access your bookings and favorites') 
              : 'Create an account to start your Malnad journey'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-6 space-y-5 pt-4">
          {mode === 'signup' && (
            <>
              {/* Profile Photo Upload */}
              <div className="flex justify-center mb-4">
                <div className="relative group cursor-pointer">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden transition-colors hover:border-emerald-500">
                    {formData.photo ? (
                      <img 
                        src={URL.createObjectURL(formData.photo)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="h-8 w-8 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="absolute bottom-0 right-0 bg-emerald-500 p-1 rounded-full text-white shadow-lg">
                    <Upload className="h-3 w-3" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <Mail className={`absolute left-4 top-3.5 h-5 w-5 transition-colors ${isAdminMode ? 'text-red-400' : 'text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500'}`} />
              <input
                type="email"
                required
                placeholder={isAdminMode ? "admin@malnadhomes.in" : "name@example.com"}
                className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all ${isAdminMode ? 'border-red-500/30 focus:ring-2 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500'}`}
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
               <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
               {mode === 'login' && !isAdminMode && (
                 <button 
                    type="button" 
                    onClick={() => setMode('forgotPassword')}
                    className="text-xs text-emerald-500 hover:text-emerald-400 font-medium"
                 >
                    Forgot Password?
                 </button>
               )}
            </div>
            <div className="relative group">
              <Lock className={`absolute left-4 top-3.5 h-5 w-5 transition-colors ${isAdminMode ? 'text-red-400' : 'text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500'}`} />
              <input
                type="password"
                required
                placeholder="••••••••"
                className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all ${isAdminMode ? 'border-red-500/30 focus:ring-2 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500'}`}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Repeat Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                  value={formData.repeatPassword}
                  onChange={e => setFormData({...formData, repeatPassword: e.target.value})}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm animate-in fade-in slide-in-from-top-1 text-left">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="font-medium leading-tight">{error}</span>
            </div>
          )}

          <div className="pt-2">
            {isAdminMode ? (
               <Button 
                 type="submit" 
                 className="w-full group text-lg bg-red-600 hover:bg-red-500 border-red-600 hover:border-red-500 shadow-red-900/20" 
                 isLoading={loading}
                 size="lg"
               >
                 Admin Access
                 {!loading && <Shield className="ml-2 h-5 w-5" />}
               </Button>
            ) : (
               <Button 
                 type="submit" 
                 className="w-full group text-lg" 
                 isLoading={loading}
                 size="lg"
               >
                 {mode === 'login' ? 'Sign In' : 'Create Account'}
                 {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
               </Button>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 pb-4 pt-2 text-center border-t border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950/30">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={mode === 'login' ? switchToSignup : switchToLogin}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-bold transition-colors ml-1"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
          
          <button 
            onClick={toggleAdminMode}
            className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isAdminMode ? 'text-red-500 hover:text-red-400' : 'text-slate-300 hover:text-slate-500'}`}
          >
            {isAdminMode ? 'Back to User Login' : 'Admin Access'}
          </button>
        </div>
      </div>
    </div>
  );
};
