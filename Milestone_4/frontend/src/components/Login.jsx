import React, { useState } from 'react';
import { authAPI, contactAPI } from '../api';
import { Shield, Lock, User, AlertCircle } from 'lucide-react';

const Login = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Access Request State
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactStatus, setContactStatus] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      setFailedAttempts(0); // reset on success
      localStorage.setItem('token', response.data.token);
      onSuccess(response.data.user);
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 3) {
        setError("User is blocked due to 3 failed login attempts.");
        alert("User is blocked");
      } else {
        setError("Please fill correct details");
        alert("Please fill correct details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactStatus(null);
    try {
      await contactAPI.sendRequest(contactForm);
      setContactStatus({ type: 'success', message: 'Request transmitted successfully. Admin will review your credentials.' });
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setShowContactModal(false), 3000);
    } catch (err) {
      setContactStatus({ type: 'error', message: 'Transmission failed. Secure channel unavailable.' });
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px]"></div>
      </div>
      
      <div className="glass-card p-8 w-full max-w-md relative z-10 animate-float" style={{ animationDuration: '6s' }}>
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Shield className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 gradient-text">
          Welcome Back
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-6">
          Sign in to access the Fraud Detection System
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg mb-6 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="form-label">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
              <input
                type="text"
                className="input-field !pl-10"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e)=>setFormData({...formData,username:e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
              <input
                type="password"
                className="input-field !pl-10"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e)=>setFormData({...formData,password:e.target.value})}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center mt-6 pt-6 border-t border-border/40">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest font-bold">New Personnel?</p>
            <button 
              type="button"
              onClick={() => setShowContactModal(true)}
              className="text-sm font-bold text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
            >
              Request System Access
            </button>
          </div>

        </form>
      </div>

      {/* Contact Admin Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowContactModal(false)} />
          <div className="relative w-full max-w-md glass-card p-0 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-border/40 bg-secondary/30">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                Access Request Protocol
              </h3>
            </div>
            
            <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
              {contactStatus && (
                <div className={`p-3 rounded-lg flex items-center gap-3 text-xs font-bold uppercase tracking-tight ${
                  contactStatus.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}>
                  {contactStatus.message}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Full Name</label>
                <input 
                  type="text" required
                  className="input-field !py-2"
                  placeholder="e.g. John Doe"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Official Email</label>
                <input 
                  type="email" required
                  className="input-field !py-2"
                  placeholder="e.g. john@securepay.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Reason for Access</label>
                <textarea 
                  required
                  className="input-field !py-2 min-h-[100px] resize-none"
                  placeholder="Please describe your role and why you need access..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowContactModal(false)} className="btn-secondary flex-1 py-2">
                  Cancel
                </button>
                <button type="submit" disabled={contactLoading} className="btn-primary flex-1 py-2">
                  {contactLoading ? 'Transmitting...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;