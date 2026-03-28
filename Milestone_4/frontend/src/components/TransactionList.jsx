import React, { useState } from "react";
import { AlertTriangle, CheckCircle, Info, ChevronRight, Eye, EyeOff } from "lucide-react";

/* ─── masking helpers ─────────────────────────────────────── */
const maskMobile = (mobile) => {
  if (!mobile) return "N/A";
  const s = String(mobile);
  if (s.length < 4) return s;
  return `${s.slice(0, 2)}****${s.slice(-2)}`;
};

const maskAccount = (acc) => {
  if (!acc) return "N/A";
  const s = String(acc);
  return s.length > 4 ? `XXXXXX${s.slice(-4)}` : s;
};

/* ─── Reveal toggle (Admin only) ─────────────────────────── */
const RevealableCell = ({ value, masked, isAdmin }) => {
  const [revealed, setRevealed] = useState(false);
  if (!isAdmin) return <span className="text-sm font-mono opacity-70">{masked}</span>;
  return (
    <div className="flex items-center gap-1.5 group/reveal">
      <span className={`text-sm font-mono opacity-70 transition-all duration-200 ${revealed ? '' : 'blur-[2px]'}`}>
        {revealed ? value || "N/A" : masked}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); setRevealed(p => !p); }}
        title={revealed ? "Hide" : "Reveal"}
        className="opacity-0 group-hover/reveal:opacity-100 transition-opacity p-0.5 rounded hover:bg-secondary/60"
      >
        {revealed
          ? <EyeOff className="w-3 h-3 text-muted-foreground" />
          : <Eye className="w-3 h-3 text-primary" />
        }
      </button>
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────── */
const TransactionList = ({ transactions, loading, onTransactionClick, user }) => {
  const isAdmin = user?.role === "Admin";

  if (loading) {
    return (
      <div className="glass-card p-12 text-center animate-pulse">
        <div className="mx-auto w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Downloading encrypted cloud data...</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
          <Info className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-bold">No transactions detected in this cycle</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Waiting for auto-generation or manual entry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Sensitive data notice */}
      {!isAdmin && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/30 border border-border/30 text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
          <EyeOff className="w-3.5 h-3.5 shrink-0" />
          Sensitive fields (mobile numbers) are masked. Admin role required to reveal.
        </div>
      )}
      {isAdmin && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20 text-[10px] text-primary font-bold uppercase tracking-wide">
          <Eye className="w-3.5 h-3.5 shrink-0" />
          Admin view: hover over masked fields to reveal sensitive data.
        </div>
      )}

      <div className="glass-card overflow-hidden !p-0 border border-border/40 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/30 border-b border-border/40">
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/80">Transaction ID</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/80">Type</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/80">Mode</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/80 text-right">Amount (₹)</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/80">Sender</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/80">Mobile</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/80">Receiver</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/80">Fraud Status</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/80 text-right">Risk Score</th>
                <th className="px-4 py-5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {transactions.map((tx) => (
                <tr
                  key={tx.transactionId}
                  onClick={() => onTransactionClick && onTransactionClick(tx)}
                  className="group hover:bg-primary/5 transition-all duration-200 cursor-pointer active:scale-[0.99] origin-left animate-row-highlight"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold opacity-80 group-hover:text-primary transition-colors">
                      {tx.transactionId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight ${tx.transactionType === 'Credit' ? 'text-green-500 bg-green-500/10' : 'text-blue-500 bg-blue-500/10'}`}>
                      {tx.transactionType?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm opacity-80">{tx.transactionMode}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold">
                      {new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(tx.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm opacity-70 truncate max-w-[80px] block">{tx.senderId}</span>
                  </td>
                  {/* ── Masked mobile ── */}
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <RevealableCell
                      value={tx.senderMobile}
                      masked={maskMobile(tx.senderMobile)}
                      isAdmin={isAdmin}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm opacity-70 truncate max-w-[80px] block">{tx.receiverId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      {tx.isFraud ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-destructive uppercase">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Fraud
                        </span>
                      ) : tx.isMediumRisk ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-warning uppercase">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Medium Risk
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-accent uppercase">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Safe
                        </span>
                      )}
                      {(tx.reason || tx.riskReason) && (
                        <span className="text-[9px] text-muted-foreground font-semibold block leading-tight truncate max-w-[130px]" title={tx.reason || tx.riskReason}>
                          {tx.reason || tx.riskReason}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-bold ${tx.isFraud ? 'text-destructive' : tx.isMediumRisk ? 'text-warning' : 'text-accent'}`}>
                        {Math.round(tx.fraudScore * 100)}
                      </span>
                      <div className="w-16 h-1 bg-secondary rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${tx.isFraud ? 'bg-destructive' : tx.isMediumRisk ? 'bg-warning' : 'bg-accent'}`}
                          style={{ width: `${Math.min(100, tx.fraudScore * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;