import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Shield, Clock, User, Activity, AlertTriangle, CheckCircle,
  Info, RefreshCw, Trash2, Download, Filter, Search, ChevronDown,
  Eye, Lock, LogIn, LogOut, Settings as SettingsIcon, Database
} from 'lucide-react';
import { auditAPI } from '../api';

/* ─── helpers ─────────────────────────────────────────────── */
const categoryMeta = {
  AUTH:       { label: 'Authentication', color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20'   },
  DATA_ACCESS:{ label: 'Data Access',    color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  NAVIGATION: { label: 'Navigation',     color: 'text-cyan-400',   bg: 'bg-cyan-400/10',   border: 'border-cyan-400/20'   },
  SETTINGS:   { label: 'Settings',       color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  SECURITY:   { label: 'Security',       color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20'    },
  GENERAL:    { label: 'General',        color: 'text-muted-foreground', bg: 'bg-secondary/40', border: 'border-border/40' }
};

const severityMeta = {
  INFO:    { icon: Info,          color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
  SUCCESS: { icon: CheckCircle,   color: 'text-green-400',  bg: 'bg-green-400/10'  },
  WARNING: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  CRITICAL:{ icon: AlertTriangle, color: 'text-red-400',    bg: 'bg-red-400/10'    }
};

const categoryIcon = {
  AUTH:       LogIn,
  DATA_ACCESS:Database,
  NAVIGATION: Activity,
  SETTINGS:   SettingsIcon,
  SECURITY:   Shield,
  GENERAL:    Info
};

/* ─── sub-components ─────────────────────────────────────── */
const StatBadge = ({ label, value, color }) => (
  <div className={`flex flex-col items-center px-5 py-3 rounded-xl border ${color} bg-opacity-10`}>
    <span className="text-2xl font-black">{value}</span>
    <span className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mt-0.5">{label}</span>
  </div>
);

const LogRow = ({ entry }) => {
  const [expanded, setExpanded] = useState(false);
  const cat  = categoryMeta[entry.category]  || categoryMeta.GENERAL;
  const sev  = severityMeta[entry.severity]  || severityMeta.INFO;
  const CatIcon = categoryIcon[entry.category] || Info;
  const SevIcon = sev.icon;

  return (
    <div
      className={`border-l-2 rounded-r-xl transition-all duration-200 ${cat.border} ${cat.bg} hover:brightness-110 cursor-pointer`}
      onClick={() => setExpanded(p => !p)}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Severity dot */}
        <div className={`mt-0.5 p-1.5 rounded-lg ${sev.bg} shrink-0`}>
          <SevIcon className={`w-3.5 h-3.5 ${sev.color}`} />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-foreground">{entry.action}</span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${cat.border} ${cat.color} ${cat.bg}`}>
              {cat.label}
            </span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${sev.bg} ${sev.color}`}>
              {entry.severity}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="font-semibold">{entry.user}</span>
            </span>
            <span className={`px-1.5 py-0.5 rounded font-black ${
              entry.role === 'Admin'
                ? 'bg-primary/10 text-primary'
                : 'bg-accent/10 text-accent'
            }`}>
              {entry.role}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {entry.timestamp}
            </span>
          </div>
        </div>

        {/* Expand icon */}
        <ChevronDown className={`w-4 h-4 text-muted-foreground/50 shrink-0 transition-transform mt-1 ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {/* Expanded detail */}
      {expanded && entry.details && (
        <div className="px-4 pb-3 pt-1 border-t border-border/20 ml-9">
          <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{entry.details}</p>
        </div>
      )}
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────── */
const AuditLog = ({ user }) => {
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [catFilter, setCatFilter] = useState('ALL');

  const [search, setSearch]       = useState('');
  const [clearing, setClearing]   = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLogs = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await auditAPI.getLogs(200);
      setLogs(res.data || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleClear = async () => {
    if (!window.confirm('Clear all audit logs? This cannot be undone.')) return;
    setClearing(true);
    try {
      await auditAPI.clearLogs();
      setLogs([]);
    } finally {
      setClearing(false);
    }
  };

  const exportCSV = () => {
    const csv = [
      'Timestamp,User,Role,Action,Category,Severity,Details',
      ...logs.map(l =>
        `"${l.timestamp}","${l.user}","${l.role}","${l.action}","${l.category}","${l.severity}","${l.details}"`
      )
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Audit Log', 14, 15);
    
    const tableColumn = ["Timestamp", "User", "Role", "Action", "Category", "Severity"];
    const tableRows = [];
    
    logs.forEach(log => {
      const logData = [
        log.timestamp || '-',
        log.user || '-',
        log.role || '-',
        log.action || '-',
        log.category || '-',
        log.severity || '-'
      ];
      tableRows.push(logData);
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20
    });
    
    doc.save(`audit_log_${new Date().toISOString().slice(0, 10)}.pdf`);
    setExportOpen(false);
  };

  // Filtered view
  const filtered = logs.filter(l => {
    if (catFilter !== 'ALL' && l.category !== catFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.action.toLowerCase().includes(q)  ||
        l.user.toLowerCase().includes(q)    ||
        l.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Stats
  const stats = {
    total:    logs.length,
    critical: logs.filter(l => l.severity === 'CRITICAL').length,
    warning:  logs.filter(l => l.severity === 'WARNING').length,
    auth:     logs.filter(l => l.category === 'AUTH').length,
    settings: logs.filter(l => l.category === 'SETTINGS').length,
  };

  const CATEGORIES = ['ALL', 'AUTH', 'DATA_ACCESS', 'NAVIGATION', 'SETTINGS', 'SECURITY', 'GENERAL'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight">Audit Log</h2>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
              Security Event Trail
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            className="btn-secondary !py-2 !px-4 flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="btn-secondary !py-2 !px-4 flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-zinc-900 border border-zinc-700 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] overflow-hidden z-[100]">
                <button
                  onClick={exportCSV}
                  className="w-full text-left px-4 py-2.5 text-sm hover:focus-visible hover:bg-zinc-800 font-medium transition-colors border-b border-zinc-700/50 text-white flex items-center gap-2"
                >
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400">CSV</span> Download CSV
                </button>
                <button
                  onClick={exportPDF}
                  className="w-full text-left px-4 py-2.5 text-sm hover:focus-visible hover:bg-zinc-800 font-medium transition-colors text-white flex items-center gap-2"
                >
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-400">PDF</span> Download PDF
                </button>
              </div>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Logs
            </button>
          )}
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="flex flex-wrap gap-3">
        <StatBadge label="Total Events"  value={stats.total}    color="border-border/40 text-foreground" />
        <StatBadge label="Critical"      value={stats.critical} color="border-red-400/20 text-red-400" />
        <StatBadge label="Warnings"      value={stats.warning}  color="border-yellow-400/20 text-yellow-400" />
        <StatBadge label="Auth Events"   value={stats.auth}     color="border-blue-400/20 text-blue-400" />
        <StatBadge label="Config Changes"value={stats.settings} color="border-yellow-400/20 text-yellow-400" />
      </div>

      {/* ── Filters ── */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search actions, users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field !pl-9 !py-2 text-sm w-full"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                catFilter === c
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground bg-secondary/40'
              }`}
            >
              {c === 'ALL' ? 'All' : categoryMeta[c]?.label || c}
            </button>
          ))}
        </div>


      </div>

      {/* ── Access restriction notice for Analysts ── */}
      {!isAdmin && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-400/5 border border-yellow-400/20 text-yellow-400">
          <Eye className="w-4 h-4 shrink-0" />
          <p className="text-xs font-bold">
            You are viewing audit logs in <span className="font-black uppercase">read-only</span> mode. Only Admins can clear logs.
          </p>
        </div>
      )}

      {/* ── Log list ── */}
      {loading ? (
        <div className="glass-card p-12 text-center animate-pulse">
          <div className="mx-auto w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Loading audit trail…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-bold text-muted-foreground">No audit events found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Events are recorded as you interact with the system.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest pl-1">
            Showing {filtered.length} of {logs.length} events
          </p>
          {filtered.map(entry => (
            <LogRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLog;
