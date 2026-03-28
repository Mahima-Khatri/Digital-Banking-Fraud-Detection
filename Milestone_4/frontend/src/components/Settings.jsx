import React, { useState, useEffect } from 'react';
import {
    User, Bell, Mail, Monitor, Save, Lock,
    Play, Square, Zap, Activity, Shield, Eye, EyeOff,
    CheckCircle, XCircle, AlertTriangle, Key, Database, BarChart2, Server
} from 'lucide-react';
import { settingsAPI } from '../api';

const Settings = ({ user, isRunning, setIsRunning, txSpeed, setTxSpeed }) => {
    const [fraudScenario, setFraudScenario] = useState('basic');
    const [profile, setProfile] = useState({
        name: user?.username || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notifications, setNotifications] = useState({
        email: true,
        inApp: true
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await settingsAPI.getEmailAlertStatus();
                setNotifications(prev => ({ ...prev, email: response.data }));
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        };
        fetchSettings();
    }, []);

    const handleEmailToggle = async (val) => {
        try {
            await settingsAPI.toggleEmailAlert(val);
            setNotifications({ ...notifications, email: val });
        } catch (error) {
            console.error('Failed to update email alert status:', error);
            alert('Failed to update notification settings. Please check your connection.');
        }
    };

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        console.log('Profile updated:', profile);
        alert('Profile settings updated successfully!');
    };

    const Toggle = ({ enabled, onChange, label, icon: Icon }) => (
        <div className="flex items-center justify-between p-4 glass-card bg-secondary/20 hover:bg-secondary/40 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${enabled ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-foreground uppercase tracking-tight">{label}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black opacity-60">Status: {enabled ? 'Active' : 'Disabled'}</p>
                </div>
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${enabled ? 'bg-primary' : 'bg-secondary'
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">

            {/* ─── Security Indicators ─── */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold uppercase tracking-tight">Security Indicators</h2>
                </div>

                <div className="glass-card p-8 space-y-8">

                    {/* Role Badge */}
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black border-2 ${
                                user?.role === 'Admin'
                                    ? 'bg-primary/10 border-primary/40 text-primary'
                                    : 'bg-accent/10 border-accent/40 text-accent'
                            }`}>
                                {user?.role === 'Admin' ? '👑' : '🔍'}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${
                                user?.role === 'Admin'
                                    ? 'bg-primary/10 border-primary/30 text-primary'
                                    : 'bg-accent/10 border-accent/30 text-accent'
                            }`}>
                                {user?.role || 'Unknown'}
                            </span>
                        </div>

                        <div className="flex-1 space-y-3">
                            <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-0.5">Logged in as</p>
                                <p className="text-lg font-bold text-foreground">{user?.username}</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Key className="w-4 h-4 text-primary" />
                                <span className="text-sm font-bold">
                                    Clearance Level:&nbsp;
                                    <span className={user?.role === 'Admin' ? 'text-primary' : 'text-accent'}>
                                        {user?.role === 'Admin' ? 'LEVEL 2 — FULL ACCESS' : 'LEVEL 1 — READ ONLY'}
                                    </span>
                                </span>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-bold ${
                                user?.role === 'Admin'
                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                    : 'bg-blue-400/10 border-blue-400/20 text-blue-400'
                            }`}>
                                <CheckCircle className="w-4 h-4 shrink-0" />
                                Session authenticated &amp; active
                            </div>
                        </div>
                    </div>

                    {/* Permission Matrix */}
                    <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">Permission Matrix</p>
                        <div className="overflow-x-auto rounded-xl border border-border/40">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-secondary/40 border-b border-border/40">
                                        <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Capability</th>
                                        <th className="px-5 py-3 text-center text-[10px] font-black uppercase tracking-widest text-primary">Admin</th>
                                        <th className="px-5 py-3 text-center text-[10px] font-black uppercase tracking-widest text-accent">Analyst</th>
                                        <th className="px-5 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">You</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {[
                                        { cap: 'View Dashboard & Metrics',       icon: BarChart2,  admin: true,  analyst: true  },
                                        { cap: 'View Transaction History',        icon: Database,   admin: true,  analyst: true  },
                                        { cap: 'View Fraud Alerts',              icon: AlertTriangle, admin: true, analyst: true },
                                        { cap: 'Reveal Masked Sensitive Data',   icon: Eye,        admin: true,  analyst: false },
                                        { cap: 'Toggle Email Alerts',            icon: Mail,       admin: true,  analyst: false },
                                        { cap: 'View & Export Audit Logs',       icon: Shield,     admin: true,  analyst: true  },
                                        { cap: 'Clear Audit Logs',              icon: Shield,     admin: true,  analyst: false },
                                        { cap: 'Start/Stop Simulation',         icon: Activity,   admin: true,  analyst: true  },
                                        { cap: 'Control Simulation Parameters', icon: Zap,        admin: true,  analyst: false },
                                        { cap: 'View System Infrastructure',    icon: Server,     admin: true,  analyst: false },
                                        { cap: 'Configure Notification Settings',icon: Bell,       admin: true,  analyst: false },
                                    ].map(({ cap, icon: Icon, admin, analyst }) => {
                                        const youHave = user?.role === 'Admin' ? admin : analyst;
                                        return (
                                            <tr key={cap} className={`transition-colors hover:bg-secondary/20 ${youHave ? '' : 'opacity-60'}`}>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                        <span className="font-semibold text-xs">{cap}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    {admin ? <CheckCircle className="w-4 h-4 text-green-400 mx-auto" /> : <XCircle className="w-4 h-4 text-destructive mx-auto" />}
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    {analyst ? <CheckCircle className="w-4 h-4 text-green-400 mx-auto" /> : <XCircle className="w-4 h-4 text-destructive mx-auto" />}
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    {youHave
                                                        ? <CheckCircle className="w-4 h-4 text-primary mx-auto" />
                                                        : <XCircle className="w-4 h-4 text-destructive mx-auto" />
                                                    }
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Masked data notice */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border/40">
                        <EyeOff className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold mb-1">Data Masking Policy</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Sensitive fields (mobile numbers, full account numbers) are masked by default
                                for all users. {user?.role === 'Admin'
                                    ? 'As an Admin, you can hover over any masked field in transaction tables to reveal the actual value.'
                                    : 'Only Admin-role users can reveal masked data. Contact your administrator for elevated access.'}
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* Profile Settings */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <User className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold uppercase tracking-tight">Profile Settings</h2>
                </div>

                <form onSubmit={handleProfileUpdate} className="glass-card p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="input-field !pl-11"
                                    placeholder="Your Name"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="input-field !pl-11 opacity-60 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border/40">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1 block mb-4">Change Password</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    className="input-field !pl-11"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    className="input-field !pl-11"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="input-field !pl-11"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="btn-primary px-8 flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Update Profile
                        </button>
                    </div>
                </form>
            </section>

            {/* Notification Settings */}
            <section className={user?.role !== 'Admin' ? 'opacity-60 grayscale-[0.5]' : ''}>
                <div className="flex items-center gap-2 mb-6">
                    <Bell className="w-6 h-6 text-warning" />
                    <h2 className="text-xl font-bold uppercase tracking-tight">Notification Channels</h2>
                    {user?.role !== 'Admin' && (
                        <span className="text-[10px] font-black bg-destructive/10 text-destructive px-2 py-0.5 rounded-full border border-destructive/20 ml-2">
                            Admin Only
                        </span>
                    )}
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${user?.role !== 'Admin' ? 'pointer-events-none' : ''}`}>
                    <Toggle
                        label="Email Alerts"
                        enabled={notifications.email}
                        onChange={user?.role === 'Admin' ? handleEmailToggle : () => {}}
                        icon={Mail}
                    />
                    <Toggle
                        label="In-App Alerts"
                        enabled={notifications.inApp}
                        onChange={user?.role === 'Admin' ? (val) => setNotifications({ ...notifications, inApp: val }) : () => {}}
                        icon={Monitor}
                    />
                </div>
            </section>

            {/* ─── Simulation Control ─── */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-6 h-6 text-accent" />
                    <h2 className="text-xl font-bold uppercase tracking-tight">Simulation Control</h2>
                </div>

                <div className="glass-card p-8 space-y-8">

                    {/* Status badge */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Current Status</span>
                        <span
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                                isRunning
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-destructive/10 text-destructive border-destructive/30'
                            }`}
                        >
                            <span
                                className={`w-2 h-2 rounded-full ${
                                    isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-destructive'
                                }`}
                            />
                            {isRunning ? 'RUNNING' : 'STOPPED'}
                        </span>
                    </div>

                    {/* Start / Stop buttons */}
                    <div className="flex items-center gap-4">
                        <button
                            id="sim-start-btn"
                            onClick={() => setIsRunning(true)}
                            disabled={isRunning}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                                isRunning
                                    ? 'opacity-40 cursor-not-allowed bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5'
                            }`}
                        >
                            <Play className="w-4 h-4" />
                            Start Simulation
                        </button>

                        <button
                            id="sim-stop-btn"
                            onClick={() => setIsRunning(false)}
                            disabled={!isRunning}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                                !isRunning
                                    ? 'opacity-40 cursor-not-allowed bg-destructive/10 text-destructive border border-destructive/20'
                                    : 'bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/25 hover:shadow-destructive/40 hover:-translate-y-0.5'
                            }`}
                        >
                            <Square className="w-4 h-4" />
                            Stop Simulation
                        </button>
                    </div>

                    <div className={`border-t border-border/40 pt-6 space-y-6 ${user?.role !== 'Admin' ? 'opacity-40 pointer-events-none grayscale-[0.6]' : ''}`}>
                        {user?.role !== 'Admin' && (
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-3.5 h-3.5 text-destructive" />
                                <span className="text-[10px] font-black uppercase text-destructive tracking-widest">Parameter control restricted to Admin</span>
                            </div>
                        )}
                        {/* Fraud Scenario Dropdown */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1 block">
                                Fraud Scenario
                            </label>
                            <div className="relative">
                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                <select
                                    id="fraud-scenario-select"
                                    value={fraudScenario}
                                    onChange={(e) => setFraudScenario(e.target.value)}
                                    className="input-field !pl-11 appearance-none cursor-pointer"
                                >
                                    <option value="basic">Basic — Normal traffic</option>
                                    <option value="high_risk">High Risk — Elevated fraud rate</option>
                                    <option value="mixed">Mixed — Randomised risk blend</option>
                                </select>
                            </div>
                            <p className="text-[10px] text-muted-foreground pl-1">
                                {fraudScenario === 'basic' && 'Simulates everyday low-risk transactions.'}
                                {fraudScenario === 'high_risk' && 'Generates frequent high-risk and international transactions.'}
                                {fraudScenario === 'mixed' && 'Randomly blends safe, medium, and high-risk patterns.'}
                            </p>
                        </div>

                        {/* Transaction Speed Slider */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">
                                    Transaction Speed
                                </label>
                                <span className="text-xs font-bold text-primary">
                                    Every {txSpeed}s
                                </span>
                            </div>
                            <input
                                id="tx-speed-slider"
                                type="range"
                                min={10}
                                max={120}
                                step={5}
                                value={txSpeed}
                                onChange={(e) => setTxSpeed(Number(e.target.value))}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${
                                        ((txSpeed - 10) / (120 - 10)) * 100
                                    }%, var(--color-secondary) ${
                                        ((txSpeed - 10) / (120 - 10)) * 100
                                    }%, var(--color-secondary) 100%)`
                                }}
                            />
                            <div className="flex justify-between text-[9px] text-muted-foreground font-bold uppercase tracking-widest px-0.5">
                                <span>10s (Fast)</span>
                                <span>120s (Slow)</span>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
            


        </div>
    );
};

export default Settings;
