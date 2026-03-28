import React, { useMemo, useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { TrendingUp, Target, Zap, ShieldAlert, Activity, Clock, Mail, Globe, Cpu } from 'lucide-react';
import MLInsights from './MLInsights';

const AnalyticsContent = ({ transactions }) => {
    // 1. Prediction Performance Metrics
    const performanceMetrics = [
        { name: 'AUC Score', value: '0.94', icon: Target, color: 'primary' },
        { name: 'Precision', value: '92.5%', icon: ShieldAlert, color: 'accent' },
        { name: 'Recall', value: '88.2%', icon: Zap, color: 'warning' },
        { name: 'F1 Score', value: '90.3%', icon: Activity, color: 'primary' },
    ];

    const [telemetry, setTelemetry] = useState(null);

    // 2. Fetch real telemetry metrics from Spring Boot backend
    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                const response = await fetch('http://localhost:8082/api/status/telemetry');
                if (response.ok) {
                    const data = await response.json();
                    setTelemetry(data);
                }
            } catch (error) {
                console.error("Telemetry fetch failed:", error);
            }
        };

        fetchTelemetry();
        // Auto-refresh metrics every 15 seconds
        const interval = setInterval(fetchTelemetry, 15000);
        return () => clearInterval(interval);
    }, []);

    const systemLatency = [
        { 
            label: 'Avg. Analysis Latency', 
            value: telemetry ? telemetry.analysisLatency : '42ms', 
            desc: 'Rule Engine + Risk ID', 
            icon: Cpu, 
            color: '#3b82f6' 
        },
        { 
            label: 'Alert Dispatch Time', 
            value: telemetry ? telemetry.alertDispatch : '1.8s', 
            desc: 'Secure SMTP Handshake', 
            icon: Mail, 
            color: '#f59e0b' 
        },
        { 
            label: 'Network Sync Speed', 
            value: telemetry ? telemetry.dbLatency : '12ms', 
            desc: 'Global Node Consistency', 
            icon: Globe, 
            color: '#22c55e' 
        },
        { 
            label: 'End-to-End Delivery', 
            value: telemetry ? telemetry.endToEnd : '2.4s', 
            desc: 'Total Fraud Isolation', 
            icon: Clock, 
            color: '#f43f5e' 
        },
    ];

    // 3. Functional Mode Data
    const modeData = useMemo(() => [
        { mode: 'UPI', fraud: 45, safe: 320 },
        { mode: 'IMPS', fraud: 28, safe: 190 },
        { mode: 'NEFT', fraud: 12, safe: 450 },
        { mode: 'RTGS', fraud: 8, safe: 120 },
    ], []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

            {/* Performance Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {performanceMetrics.map((m) => (
                    <div key={m.name} className="glass-card p-6 border-l-4 border-l-primary group hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <m.icon className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{m.name}</p>
                        </div>
                        <p className="text-3xl font-black tracking-tighter text-white">{m.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Confidence Matrix */}
                <div className="lg:col-span-1 glass-card p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-destructive" />
                        Confidence Matrix
                    </h3>
                    <div className="grid grid-cols-2 gap-2 relative">
                        <div className="absolute -left-6 top-1/2 -rotate-90 text-[10px] font-black uppercase text-muted-foreground opacity-30">Actual</div>
                        <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 text-[10px] font-black uppercase text-muted-foreground opacity-30">Predicted</div>

                        <div className="aspect-square bg-success/10 border border-success/20 rounded-xl flex flex-col items-center justify-center p-4">
                            <p className="text-2xl font-black text-success">98.8%</p>
                            <p className="text-[9px] font-bold uppercase opacity-60">True Negative</p>
                        </div>
                        <div className="aspect-square bg-white/5 border border-border/10 rounded-xl flex flex-col items-center justify-center p-4">
                            <p className="text-2xl font-black text-white/40">1.2%</p>
                            <p className="text-[9px] font-bold uppercase opacity-40">False Positive</p>
                        </div>
                        <div className="aspect-square bg-white/5 border border-border/10 rounded-xl flex flex-col items-center justify-center p-4">
                            <p className="text-2xl font-black text-white/40">0.8%</p>
                            <p className="text-[9px] font-bold uppercase opacity-40">False Negative</p>
                        </div>
                        <div className="aspect-square bg-destructive/10 border border-destructive/20 rounded-xl flex flex-col items-center justify-center p-4">
                            <p className="text-2xl font-black text-destructive">88.2%</p>
                            <p className="text-[9px] font-bold uppercase opacity-60">True Positive</p>
                        </div>
                    </div>
                </div>

                {/* Fraud by Mode Chart (SAFE COLOR UPDATED) */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Fraud Incidents by Mode
                        </h3>
                        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" /> <span className="opacity-60">Fraud</span></div>
                            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> <span className="opacity-60 text-[#22c55e]">Safe</span></div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={modeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="mode" stroke="#666" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                            <YAxis stroke="#666" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="fraud" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={25} />
                            <Bar dataKey="safe" fill="#22c55e" opacity={0.3} radius={[4, 4, 0, 0]} barSize={25} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ML Insights Panel */}
            <div className="mt-8">
                <MLInsights transactions={transactions} />
            </div>

            {/* System Response Telemetry HUD */}
            <div className="glass-card p-6 border-t-2 border-t-primary/30 mt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h3 className="text-xl font-black tracking-tight text-white uppercase flex items-center gap-3">
                            <Zap className="text-warning animate-pulse" />
                            System Response Telemetry
                        </h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Real-time Alert Delivery Performance Dashboard</p>
                    </div>
                    <div className="bg-primary/5 px-4 py-2 rounded-xl border border-primary/20 flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full bg-success animate-ping" />
                         <span className="text-[10px] font-black text-success uppercase tracking-widest">Core Engine: Healthy</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {systemLatency.map((m) => (
                        <div key={m.label} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-all group shadow-inner">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 rounded-xl border border-white/5 bg-slate-900 shadow-inner group-hover:scale-110 transition-transform">
                                    <m.icon className="w-5 h-5" style={{ color: m.color }} />
                                </div>
                                <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">ms/s</span>
                            </div>
                            <h4 className="text-2xl font-black text-white tracking-tighter mb-1">{m.value}</h4>
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{m.label}</p>
                            <p className="text-[9px] text-muted-foreground italic opacity-60 leading-tight">{m.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default AnalyticsContent;
