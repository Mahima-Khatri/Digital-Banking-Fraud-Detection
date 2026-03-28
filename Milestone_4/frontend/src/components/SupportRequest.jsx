import React, { useState } from 'react';
import { MessageSquare, Send, Shield, Info, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { contactAPI } from '../api';

const SupportRequest = ({ user }) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchHistory = React.useCallback(async () => {
        setLoadingHistory(true);
        try {
            const response = await contactAPI.getRequests();
            // Filter only what belongs to this analyst
            const myRequests = (response.data || [])
                .filter(r => r.email === user.email)
                .sort((a, b) => new Date(b.requestTime) - new Date(a.requestTime));
            setHistory(myRequests);
        } catch (err) {
            console.error('Failed to fetch transmission history');
        } finally {
            setLoadingHistory(false);
        }
    }, [user.email]);

    React.useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        setError('');
        try {
            await contactAPI.sendRequest({
                name: user.username + " (Active Analyst)",
                email: user.email,
                message: "[MESSAGE] " + message
            });
            setSuccess(true);
            setMessage('');
            fetchHistory();
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            setError('Failed to transmit message to Central Command.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                    <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">Central Support Terminal</h2>
                <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Direct communication with Administrative Oversight</p>
            </div>

            <div className="glass-card p-8 border border-border/40 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Shield className="w-32 h-32" />
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Originator</p>
                            <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl border border-border/20 text-sm font-bold opacity-80">
                                <Shield className="w-4 h-4 text-primary" />
                                @{user.username}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Operational Role</p>
                            <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl border border-border/20 text-sm font-bold opacity-80 uppercase tracking-tighter">
                                {user.role}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Encrypted Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Report system issues, request clearance changes, or contact administration..."
                                className="input-field min-h-[150px] !py-4"
                                required
                            />
                        </div>

                        {success && (
                            <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center gap-3 animate-in zoom-in duration-300">
                                <CheckCircle className="w-5 h-5 text-success" />
                                <p className="text-xs font-bold text-success uppercase tracking-tight">Transmission confirmed. Administrator notified.</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3 animate-in zoom-in duration-300">
                                <AlertCircle className="w-5 h-5 text-destructive" />
                                <p className="text-xs font-bold text-destructive uppercase tracking-tight">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={sending || !message.trim()}
                            className="btn-primary w-full py-4 flex items-center justify-center gap-3 shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            <Send className={`w-5 h-5 ${sending ? 'animate-pulse' : ''}`} />
                            <span className="uppercase font-black tracking-widest">{sending ? 'Transmitting...' : 'Send Transmission'}</span>
                        </button>
                    </form>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-secondary/20 rounded-xl border border-border/40">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-medium tracking-wide">
                    Communications through this secure terminal are logged for audit purposes. 
                    Admins will review your message and reach out via the secure ops panel or registered email.
                </p>
            </div>

            {/* Transmission History Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Recent Transmission Logs
                    </h3>
                    {loadingHistory && <div className="animate-spin w-3 h-3 border border-primary border-t-transparent rounded-full" />}
                </div>

                <div className="space-y-3">
                    {history.length === 0 && !loadingHistory ? (
                        <div className="p-8 text-center glass-card border-dashed border-border/40 opacity-50">
                            <p className="text-[10px] font-bold uppercase tracking-tight">No prior transmissions detected.</p>
                        </div>
                    ) : (
                        history.slice(0, 5).map((log) => (
                            <div key={log.id} className="glass-card p-4 border border-border/40 flex items-center justify-between group hover:border-primary/20 transition-all">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground font-medium">{new Date(log.requestTime).toLocaleString()}</p>
                                    <p className="text-xs font-bold text-foreground line-clamp-1 italic">
                                        "{log.message.replace('[MESSAGE] ', '')}"
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                        log.status === 'PENDING' ? 'text-warning bg-warning/10 border-warning/20' :
                                        log.status === 'PROCESSED' ? 'text-green-500 bg-green-500/10 border-green-500/20' :
                                        'text-primary bg-primary/10 border-primary/20'
                                    }`}>
                                        {log.status === 'PROCESSED' ? 'READ / ACKNOWLEDGED' : log.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportRequest;
