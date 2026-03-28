import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MapPin, TrendingUp, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

const FraudLocationAnalytics = ({ transactions }) => {
    // Geographic Data Analysis
    const locationData = useMemo(() => {
        const locationMap = {};
        const recentTransactions = transactions.slice(0, 100);
        
        recentTransactions.forEach(tx => {
            const loc = tx.senderLocation || 'Unknown';
            if (!locationMap[loc]) {
                locationMap[loc] = { name: loc, count: 0, totalScore: 0, fraudCount: 0 };
            }
            locationMap[loc].count++;
            const score = Math.round((tx.fraudScore || 0) * 100);
            locationMap[loc].totalScore += score;
            if (tx.isFraud) locationMap[loc].fraudCount++;
        });

        return Object.values(locationMap)
            .map(loc => ({
                ...loc,
                avgScore: Math.round(loc.totalScore / loc.count),
                label: `${loc.name.slice(0, 3).toUpperCase()}-${loc.fraudCount}`
            }))
            .sort((a, b) => b.avgScore - a.avgScore)
            .slice(0, 10);
    }, [transactions]);

    // Risk Driver Analysis (Why are they being flagged?)
    const riskDrivers = useMemo(() => {
        const counts = { amount: 0, location: 0, device: 0, time: 0 };
        const riskyOnes = transactions.slice(0, 100).filter(t => t.isFraud || t.isMediumRisk);
        
        riskyOnes.forEach(tx => {
            if (tx.amount > 20000) counts.amount++;
            if (tx.senderLocation === 'International / Proxy') counts.location++;
            if (tx.senderDevice && tx.senderDevice !== 'Authorized Device') counts.device++;
            
            try {
                if (tx.transactionTime && tx.transactionTime.toLowerCase().includes('am')) {
                    const hour = parseInt(tx.transactionTime.split(':')[0]);
                    if (hour === 12 || hour < 5) counts.time++;
                }
            } catch (e) {}
        });

        const total = riskyOnes.length || 1;
        return [
            { key: 'Amount', name: 'Critical Amount', value: Math.round((counts.amount / total) * 100), icon: Activity, color: '#f59e0b' },
            { key: 'Location', name: 'Unknown Location', value: Math.round((counts.location / total) * 100), icon: MapPin, color: '#dc2626' },
            { key: 'Device', name: 'Non-Secure Device', value: Math.round((counts.device / total) * 100), icon: ShieldCheck, color: '#3b82f6' },
            { key: 'Time', name: 'After-Hours Activity', value: Math.round((counts.time / total) * 100), icon: Activity, color: '#8b5cf6' },
        ].sort((a, b) => b.value - a.value);
    }, [transactions]);

    return (
        <div className="space-y-6 mt-8">
            {/* Geographic Distribution Chart */}
            <div className="glass-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h3 className="text-xl font-black flex items-center gap-2 text-foreground">
                            <MapPin className="w-5 h-5 text-primary" />
                            Security Distribution by Region
                        </h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">
                            Spatial Risk Profiling (Recent 100 Events)
                        </p>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={locationData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis 
                                dataKey="label" 
                                stroke="#64748b" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                tick={{ fill: '#64748b', fontWeight: 800 }}
                            />
                            <YAxis 
                                stroke="#64748b" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                tick={{ fill: '#64748b' }}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                contentStyle={{ 
                                    backgroundColor: '#0f172a', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    borderRadius: '12px',
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                    padding: '12px'
                                }}
                                itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: '800' }}
                                labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}
                            />
                            <Bar 
                                dataKey="avgScore" 
                                radius={[6, 6, 0, 0]} 
                                barSize={40}
                            >
                                {locationData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.avgScore > 70 ? '#dc2626' : entry.avgScore > 40 ? '#f59e0b' : '#3b82f6'} 
                                        fillOpacity={0.8}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Risk Drivers Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
                        <TrendingUp className="w-5 h-5 text-accent" />
                        Key Risk Determinants
                    </h3>
                    <div className="space-y-5">
                        {riskDrivers.map((driver) => (
                            <div key={driver.key} className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-secondary/30">
                                            <driver.icon className="w-3 h-3" style={{ color: driver.color }} />
                                        </div>
                                        <span>{driver.name}</span>
                                    </div>
                                    <span style={{ color: driver.color }}>{driver.value}% Intensity</span>
                                </div>
                                <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full transition-all duration-1000 ease-out"
                                        style={{ 
                                            width: `${driver.value}%`, 
                                            backgroundColor: driver.color,
                                            boxShadow: `0 0 10px ${driver.color}40`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold mb-2 text-foreground">Quick Insights</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Based on the current threat matrix, {riskDrivers[0]?.name.toLowerCase()} is the primary driver of suspicious activity, appearing in {riskDrivers[0]?.value}% of flagged events.
                        </p>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-border/40">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 animate-pulse">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-tighter text-destructive">Imminent Threat</p>
                                <p className="text-[11px] font-bold text-foreground">Multiple proxies detected in Asia-Pacific nodes.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FraudLocationAnalytics;
