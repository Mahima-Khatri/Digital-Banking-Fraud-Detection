import React from 'react';
import { 
  X, Shield, AlertTriangle, CheckCircle, 
  MapPin, User, 
  CreditCard, Calendar, ArrowRightLeft, 
  Fingerprint, Smartphone, Mail, History
} from 'lucide-react';

const TransactionDetailModal = ({ transaction, isOpen, onClose, transactions = [] }) => {
  if (!isOpen || !transaction) return null;

  const maskAccount = (acc) => {
    if (!acc) return 'N/A';
    const s = String(acc);
    return s.length > 4 ? `XXXXXX${s.slice(-4)}` : s;
  };

  const userHistoryCount = transactions.filter(t => 
    t.senderId === transaction.senderId && t.transactionId !== transaction.transactionId
  ).length;

  const getStatusColor = () => {
    if (transaction.isFraud) return 'text-destructive bg-destructive/10 border-destructive/20';
    if (transaction.isMediumRisk) return 'text-warning bg-warning/10 border-warning/20';
    return 'text-accent bg-accent/10 border-accent/20';
  };

  const getStatusIcon = () => {
    if (transaction.isFraud) return <AlertTriangle className="w-5 h-5" />;
    if (transaction.isMediumRisk) return <AlertTriangle className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  const getDetectionReason = () => {
    if (transaction.riskReason) return transaction.riskReason;
    if (transaction.isFraud) {
      if (transaction.senderLocation === 'International / Proxy') 
        return "Suspicious Location (International / Proxy), Potential Account Takeover.";
      if (transaction.senderDevice === 'Unrecognized VPN')
        return "New Device (Unrecognized VPN), Anomalous Access Pattern.";
      return "Critical Risk: High-velocity transaction pattern detected.";
    }
    if (transaction.isMediumRisk) return "Medium Risk: Transaction amount exceeds typical user threshold.";
    return "Safe: Analysis complete. Regular patterns observed.";
  };


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg glass-card overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-4 border-b border-border/40 flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg border ${getStatusColor()}`}>
              {getStatusIcon()}
            </div>
            <div>
              <h2 className="text-lg font-bold">Transaction Details</h2>
              <p className="text-[10px] text-muted-foreground font-mono">{transaction.transactionId}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-secondary/20 border border-border/40">
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Amount</p>
              <h3 className="text-xl font-black text-primary">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(transaction.amount)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-secondary/20 border border-border/40">
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Risk Analysis</p>
              <div className="flex flex-col gap-1">
                <span className={`w-fit px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor()}`}>
                  {transaction.prediction || (transaction.isFraud ? 'FRAUD' : transaction.isMediumRisk ? 'MEDIUM RISK' : 'SAFE')}
                </span>
                <span className="text-xs font-bold">{Math.round(transaction.fraudScore * 100)} Risk Score</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-xs font-bold text-muted-foreground border-b border-border/40 pb-1.5">
                <User className="w-3.5 h-3.5" /> Sender
              </h4>
              <div className="space-y-2">
                <InfoRow label="ID" value={transaction.senderId} />
                <InfoRow label="Account" value={maskAccount(transaction.senderAccount)} />
                <InfoRow label="Location" value={transaction.senderLocation} icon={<MapPin className="w-3 h-3" />} />
                <InfoRow label="Device" value={transaction.senderDevice} icon={<Smartphone className="w-3 h-3" />} />
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/20">
                  <History className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    User History: {userHistoryCount} previous transactions
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-xs font-bold text-muted-foreground border-b border-border/40 pb-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5" /> Receiver
              </h4>
              <div className="space-y-2">
                <InfoRow label="ID" value={transaction.receiverId} />
                <InfoRow label="Account" value={maskAccount(transaction.receiverAccount)} />
                <InfoRow label="Location" value={transaction.receiverLocation} icon={<MapPin className="w-3 h-3" />} />
              </div>
            </div>

          </div>

          {/* Transaction Metadata */}
          <div className="mt-5 space-y-3">
            <h4 className="flex items-center gap-2 text-xs font-bold text-muted-foreground border-b border-border/40 pb-1.5">
              <Shield className="w-3.5 h-3.5" /> Security & Metadata
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-2 rounded-lg bg-secondary/10 border border-border/20">
                <p className="text-[9px] text-muted-foreground uppercase font-bold mb-0.5">Type</p>
                <p className="text-[11px] font-bold truncate">{transaction.transactionMode}</p>
              </div>
              <div className="p-2 rounded-lg bg-secondary/10 border border-border/20">
                <p className="text-[9px] text-muted-foreground uppercase font-bold mb-0.5">Auth</p>
                <p className="text-[11px] font-bold truncate">{transaction.authType || 'OTP'}</p>
              </div>
              <div className="p-2 rounded-lg bg-secondary/10 border border-border/20">
                <p className="text-[9px] text-muted-foreground uppercase font-bold mb-0.5">Time</p>
                <p className="text-[11px] font-bold truncate">{transaction.transactionTime}</p>
              </div>
            </div>
          </div>

          <div className={`mt-5 p-3 rounded-lg border ${getStatusColor()} flex items-start gap-3`}>
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs">
                Decision: {transaction.isFraud ? 'BLOCKED' : transaction.isMediumRisk ? 'FLAGGED' : 'SAFE'}
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-current/10">
                <span className="font-black uppercase text-[8px] opacity-70 block mb-0.5 tracking-widest">Detection Analysis</span>
                <p className="text-[11px] leading-snug font-bold text-foreground/90">
                  {getDetectionReason()}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/40 bg-secondary/30 flex justify-end gap-3">
          <button 
            onClick={() => window.open("https://mail.google.com/mail/u/0/#inbox", "_blank")}
            className="btn-secondary flex items-center gap-2 px-3 py-1 text-xs"
          >
            <Mail className="w-3.5 h-3.5" />
            View Mail
          </button>
          <button 
            onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg font-medium text-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, icon }) => (
  <div className="flex flex-col">
    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{label}</span>
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-primary opacity-70">{icon}</span>}
      <span className="text-sm font-semibold truncate">{value || 'N/A'}</span>
    </div>
  </div>
);

export default TransactionDetailModal;
