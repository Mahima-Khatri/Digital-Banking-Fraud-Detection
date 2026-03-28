import React, { useState, useEffect, useCallback, useRef } from 'react';
import { transactionAPI, auditAPI } from '../api';
import TransactionList from './TransactionList';
import MetricsCard from './MetricsCard';
import FraudChart from './FraudChart';
import FraudMap from './FraudMap';
import ThemeToggle from './ThemeToggle';
import TransactionDetailModal from './TransactionDetailModal';
import {
  Shield, AlertTriangle, TrendingUp, IndianRupee,
  Activity, LogOut, RefreshCw,
  LayoutDashboard, History, Bell, BarChart2, Search,
  Menu, PanelLeftClose, Settings as SettingsIcon, Timer, Map as MapIcon, Mail, Percent, Filter,
  ClipboardList, Server, Users, MessageSquare, CheckCircle
} from 'lucide-react';
import AnalyticsContent from './AnalyticsContent';
import FraudLocationAnalytics from './FraudLocationAnalytics';
import Settings from './Settings';
import AuditLog from './AuditLog';
import SystemStatus from './SystemStatus';
import UserManagement from './UserManagement';
import SupportRequest from './SupportRequest';
import { contactAPI } from '../api';

/* ─── audit helper ──────────────────────────────────────── */
const fireAudit = (user, action, category = 'NAVIGATION', severity = 'INFO', details = '') => {
  auditAPI.log({
    user:     user?.username || 'Unknown',
    role:     user?.role     || 'Unknown',
    action, category, severity, details
  }).catch(() => {}); // silent fail — never block UI
};

const Dashboard = ({ user, loginTimestamp, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const isAdmin = user?.role === 'Admin';

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Transaction History', icon: History },
    { name: 'Fraud Alerts', icon: Bell },
    { name: 'Analytics', icon: BarChart2 },
    { name: 'Threat Map', icon: MapIcon },
    ...(isAdmin ? [{ name: 'User Management', icon: Users }] : []),
    { name: 'Audit Log', icon: ClipboardList },
    ...(!isAdmin ? [{ name: 'Contact Admin', icon: MessageSquare }] : []),
    ...(isAdmin ? [{ name: 'System Status', icon: Server }] : []),
    { name: 'Settings', icon: SettingsIcon },
  ];
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('All');
  const [historySearch, setHistorySearch] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const [lastSeenFraudCount, setLastSeenFraudCount] = useState(0);
  const [supportCount, setSupportCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [nextRefreshIn, setNextRefreshIn] = useState(20);
  const [isRunning, setIsRunning] = useState(true);
  const [txSpeed, setTxSpeed] = useState(20);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [adminResponses, setAdminResponses] = useState([]);

  const checkAdminResponses = useCallback(async () => {
    if (isAdmin) return; 
    try {
      const response = await contactAPI.getRequests();
      const unread = (response.data || []).filter(r => 
        r.email === user.email && 
        r.status === 'PROCESSED' && 
        r.adminResponse && 
        !r.readByAnalyst 
      );
      setAdminResponses(unread);
    } catch (err) {
      console.error('Failed to check admin responses:', err);
    }
  }, [isAdmin, user.email]);

  const handleMarkResponseRead = async (id) => {
    try {
      await contactAPI.markAsRead(id);
      setAdminResponses(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to mark response as read:', err);
    }
  };

  const WORLD_LOCATIONS = [
    { name: 'Mumbai', country: 'India', lat: 19.07, lng: 72.87 },
    { name: 'Delhi', country: 'India', lat: 28.61, lng: 77.20 },
    { name: 'Bangalore', country: 'India', lat: 12.97, lng: 77.59 },
    { name: 'New York', country: 'USA', lat: 40.71, lng: -74.00 },
    { name: 'London', country: 'United Kingdom', lat: 51.50, lng: -0.12 },
    { name: 'Singapore', country: 'Singapore', lat: 1.35, lng: 103.81 },
    { name: 'Moscow', country: 'Russia', lat: 55.75, lng: 37.61 },
    { name: 'Sao Paulo', country: 'Brazil', lat: -23.55, lng: -46.63 },
    { name: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.40 },
    { name: 'Beijing', country: 'China', lat: 39.90, lng: 116.40 },
    { name: 'Sydney', country: 'Australia', lat: -33.86, lng: 151.20 }
  ];

  // generateRandomTransactions logic has been moved to Java backend API.

  // Use refs for values needed inside intervals to avoid stale closures
  const isRunningRef = useRef(isRunning);
  const txSpeedRef = useRef(txSpeed);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { txSpeedRef.current = txSpeed; }, [txSpeed]);

  const performAutoGeneration = async () => {
    if (!isRunningRef.current) return;
    
    // Calculate transactions to generate (user rule: 10s=1, 20s=2, 30s=3)
    const count = Math.max(1, Math.floor(txSpeedRef.current / 10));
    
    setNextRefreshIn(txSpeedRef.current);
    try {
      const response = await transactionAPI.generate(count);
      handleTransactionAdded(response.data);
    } catch (error) {
      console.error('Auto-generation failed:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getAll();
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSupportCount = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const response = await contactAPI.getRequests();
      const pendingSupport = (response.data || []).filter(r => r.status === 'PENDING').length;
      setSupportCount(pendingSupport);
    } catch (err) {
      console.error('Failed to fetch support requests count:', err);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchTransactions();
    fetchSupportCount();
    checkAdminResponses();

    let genInterval;
    let countdownInterval;
    let pollInterval;

    const setupIntervals = () => {
        if (genInterval) clearInterval(genInterval);
        if (countdownInterval) clearInterval(countdownInterval);
        if (pollInterval) clearInterval(pollInterval);

        genInterval = setInterval(() => {
          performAutoGeneration();
        }, txSpeedRef.current * 1000);

        countdownInterval = setInterval(() => {
          setNextRefreshIn(prev => (prev > 0 ? prev - 1 : txSpeedRef.current));
        }, 1000);

        pollInterval = setInterval(() => {
          fetchTransactions();
          fetchSupportCount();
          checkAdminResponses();
        }, 30000); // Poll every 30s
    };

    setupIntervals();
    
    return () => {
      clearInterval(genInterval);
      clearInterval(countdownInterval);
      clearInterval(pollInterval);
    };
  }, [txSpeed, isRunning, fetchSupportCount, checkAdminResponses]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    await performAutoGeneration();
  };

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High-pitched A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // Descend to A4

      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio visualization blocked or failed', e);
    }
  };

  const handleTransactionAdded = (newTx) => {
    const txArray = Array.isArray(newTx) ? newTx : [newTx];
    const hasFraud = txArray.some(t => t.isFraud);

    if (hasFraud) {
      playAlertSound();
    }

    if (Array.isArray(newTx)) {
      setTransactions(prev => [...newTx, ...prev]);
    } else {
      setTransactions(prev => [newTx, ...prev]);
    }
  };

  const totalFraudCount = transactions.filter(t => t.isFraud).length;
  const mediumRiskCount = transactions.filter(t => t.isMediumRisk).length;
  const totalAlertsCount = totalFraudCount + mediumRiskCount;
  const unreadAlerts = Math.max(0, totalAlertsCount - lastSeenFraudCount);

  useEffect(() => {
    if (activeTab === 'Fraud Alerts') {
      setLastSeenFraudCount(totalFraudCount + mediumRiskCount);
    }
  }, [activeTab, totalFraudCount, mediumRiskCount]);

  // Handle fresh start session: Mark all existing alerts as seen when dashboard first loads
  const isFirstLoad = useRef(true);
  useEffect(() => {
    if (transactions.length > 0 && isFirstLoad.current) {
      setLastSeenFraudCount(totalAlertsCount);
      isFirstLoad.current = false;
    }
  }, [transactions, totalAlertsCount]);

  const fraudCount = totalFraudCount; // Keep for metrics
  const safeCount = transactions.filter(t => !t.isFraud && !t.isMediumRisk).length;
  const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const fraudAmount = transactions
    .filter(t => t.isFraud)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const fraudPercentage = transactions.length > 0 
    ? ((totalFraudCount / transactions.length) * 100).toFixed(2) 
    : "0.00";
  const activeAlerts = totalAlertsCount; // totalFraudCount + mediumRiskCount


  const formattedFraudAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(fraudAmount);

  const avgFraudScore = transactions.length > 0
    ? (transactions.reduce((sum, t) => sum + (t.fraudScore || 0), 0) / transactions.length).toFixed(2)
    : 0;

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background flex relative">

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 glass-card border-r border-border/40 fixed inset-y-0 left-0 z-50 flex flex-col rounded-none rounded-r-2xl transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0 outline-none' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center gap-3">
          <div className="bg-primary/20 p-2.5 rounded-xl">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text leading-tight">SecurePay</h1>
            <p className="text-xs text-muted-foreground">Monitor & Alert</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                // Log navigation events for audit trail
                const catMap = {
                  'Settings':         'SETTINGS',
                  'Fraud Alerts':     'SECURITY',
                  'Transaction History': 'DATA_ACCESS',
                  'Audit Log':        'SECURITY',
                };
                const sev = ['Fraud Alerts','Audit Log'].includes(item.name) ? 'WARNING' : 'INFO';
                fireAudit(user, `Navigated to ${item.name}`, catMap[item.name] || 'NAVIGATION', sev,
                  `User accessed the ${item.name} section.`);
              }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === item.name
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-x-1'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
            >
              <div className="flex items-center gap-4">
                <item.icon className="w-5 h-5" />
                {item.name}
              </div>
              {item.name === 'Fraud Alerts' && unreadAlerts > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === item.name ? 'bg-primary-foreground text-primary' : 'bg-destructive text-white'
                  }`}>
                  {unreadAlerts}
                </span>
              )}
            </button>
          ))}
        </nav>
        
        <div className="p-6 border-t border-border/40 bg-secondary/10">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Theme Mode</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>

        {/* Header */}
        <header className="glass-card rounded-none border-b border-border/40 sticky top-0 z-40 backdrop-blur-xl">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-primary transition-all shadow-sm flex items-center justify-center shrink-0"
                  title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                  {sidebarOpen ? (
                    <PanelLeftClose className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-4 min-w-0">
                <div className="text-right hidden sm:block border-r border-border/40 pr-4 lg:pr-6 shrink-0">
                  <h2 className="text-lg lg:text-xl font-bold gradient-text truncate">{activeTab}</h2>
                  <p className="text-[9px] lg:text-[10px] text-muted-foreground uppercase font-black tracking-wider leading-tight hidden xl:block">
                    {activeTab === 'Dashboard' && 'Real-time Monitoring'}
                    {activeTab === 'Transaction History' && 'History Log'}
                    {activeTab === 'Fraud Alerts' && 'Suspicious Activities'}
                    {activeTab === 'Analytics' && 'Performance Data'}
                    {activeTab === 'Settings' && 'Configuration & Profile'}
                    {activeTab === 'Audit Log' && 'Security Event Trail'}
                    {activeTab === 'Contact Admin' && 'Administrator Oversight'}
                  </p>
                </div>

                <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                  <div className="relative mr-2">
                    <button
                      onClick={() => setActiveTab('Fraud Alerts')}
                      className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors notification-btn"
                      title="View Fraud Alerts"
                    >
                      <Bell className={`w-5 h-5 text-muted-foreground ${unreadAlerts > 0 ? 'notification-pulse text-destructive' : ''}`} />
                      {unreadAlerts > 0 && (
                        <span className="notification-badge">
                          {unreadAlerts > 9 ? '9+' : unreadAlerts}
                        </span>
                      )}
                    </button>
                  </div>

                  {isAdmin && (
                    <div className="relative mr-2">
                      <button
                        onClick={() => setActiveTab('User Management')}
                        className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors notification-btn"
                        title="View Support & Access Requests"
                      >
                        <MessageSquare className={`w-5 h-5 text-muted-foreground ${supportCount > 0 ? 'text-primary' : ''}`} />
                        {supportCount > 0 && (
                          <span className="notification-badge bg-primary">
                            {supportCount > 9 ? '9+' : supportCount}
                          </span>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="relative mr-2">
                    <button
                      onClick={() => window.open("https://mail.google.com/mail/u/0/#inbox", "_blank")}
                      className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors notification-btn"
                      title="Open Gmail Inbox"
                    >
                      <Mail className={`w-5 h-5 text-muted-foreground ${unreadAlerts > 0 ? 'text-destructive' : ''}`} />
                      {unreadAlerts > 0 && (
                        <span className="notification-badge bg-destructive">
                          {unreadAlerts > 9 ? '9+' : unreadAlerts}
                        </span>
                      )}
                    </button>
                  </div>
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold text-foreground leading-none">{user.username}</p>
                    <div className="flex flex-col items-end">
                      <p className="text-[10px] text-muted-foreground font-medium">{user.email}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full mt-1 border border-border/40 font-bold uppercase tracking-wider ${
                        user.role === 'Admin' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    className="btn-secondary p-2.5 flex items-center justify-center transition-all hover:bg-destructive/10 hover:text-destructive border-border/40"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-8 flex flex-col relative">

          {/* Admin Response Notifications for Analysts */}
          {!isAdmin && adminResponses.length > 0 && (
            <div className="mb-6 space-y-3">
              {adminResponses.map((res) => (
                <div key={res.id} className="bg-primary/10 border-l-4 border-l-primary p-4 rounded-r-xl flex items-start justify-between gap-4 animate-in slide-in-from-right-4 duration-500 shadow-lg shadow-primary/5">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 p-2 rounded-lg">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Administrative Response Received</p>
                      <p className="text-sm font-bold text-foreground mb-2">Subject: {res.message?.substring(0, 50)}...</p>
                      <div className="p-3 bg-background/50 rounded-lg border border-primary/20 italic text-xs text-muted-foreground">
                        "{res.adminResponse}"
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleMarkResponseRead(res.id)}
                    className="btn-primary !px-3 !py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'Dashboard' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">Transaction Overview</h2>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 border border-success/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-live-pulse" />
                      <span className="text-[10px] font-black text-success uppercase tracking-widest leading-none">Live</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-full border border-border/40">
                    <Timer className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-black font-mono tracking-tighter">
                      AUTO-GEN IN: {nextRefreshIn}s
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  className="btn-secondary flex items-center gap-2"
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh & Generate New
                </button>
              </div>

              <div className="dashboard-grid mb-8">
                <MetricsCard title="Total Transactions" value={transactions.length} icon={Activity} color="primary" />
                <MetricsCard title="Fraud Detected" value={fraudCount} icon={AlertTriangle} color="destructive" />
                <MetricsCard title="Active Alerts" value={activeAlerts} icon={Bell} color="destructive" />
                <MetricsCard title="Fraud Percentage" value={`${fraudPercentage}%`} icon={Percent} color="destructive" />
                <MetricsCard title="Medium Risk" value={mediumRiskCount} icon={AlertTriangle} color="warning" />
                <MetricsCard title="Safe Transactions" value={safeCount} icon={Shield} color="accent" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <FraudChart transactions={transactions} />
              </div>


            </>
          )}


          {/* History Tab */}
          {activeTab === 'Transaction History' && (() => {
            const filtered = transactions
              .filter(t => {
                if (historyFilter === 'Safe') return !t.isFraud && !t.isMediumRisk;
                if (historyFilter === 'Medium') return t.isMediumRisk;
                if (historyFilter === 'Fraud') return t.isFraud;
                return true;
              })
              .filter(t => {
                if (!historySearch.trim()) return true;
                const q = historySearch.toLowerCase();
                return (
                  (t.transactionId || '').toLowerCase().includes(q) ||
                  (t.senderId || '').toLowerCase().includes(q) ||
                  (t.receiverId || '').toLowerCase().includes(q) ||
                  (t.senderAccount || '').toLowerCase().includes(q) ||
                  (t.receiverAccount || '').toLowerCase().includes(q)
                );
              })
              .filter(t => {
                const amount = t.amount || 0;
                const min = minAmount ? parseFloat(minAmount) : 0;
                const max = maxAmount ? parseFloat(maxAmount) : Infinity;
                return amount >= min && amount <= max;
              });

            return (
              <>
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-6">
                  <h3 className="text-xl font-bold">Transaction History</h3>

                  <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search USR / ACC..."
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        className="input-field !pl-9 !py-2 text-sm w-full sm:w-48"
                      />
                    </div>

                    {/* Amount Range */}
                    <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg border border-border/40">
                      <IndianRupee className="w-3.5 h-3.5 text-muted-foreground ml-2" />
                      <input
                        type="number"
                        placeholder="Min"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="bg-transparent text-xs w-16 focus:outline-none"
                      />
                      <span className="text-muted-foreground">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="bg-transparent text-xs w-16 focus:outline-none"
                      />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center bg-secondary rounded-lg p-1 overflow-x-auto no-scrollbar">
                      {['All', 'Safe', 'Medium', 'Fraud'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setHistoryFilter(f)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200 ${historyFilter === f
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>

                    {/* Refresh */}
                    <button onClick={handleRefresh} className="btn-secondary !py-2 !px-4 flex items-center gap-2 text-sm" disabled={refreshing}>
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>

                <TransactionList 
                  transactions={filtered} 
                  loading={loading} 
                  onTransactionClick={(tx) => setSelectedTransaction(tx)}
                  user={user}
                />
              </>
            );
          })()}

          {/* Fraud Alerts Tab */}
          {activeTab === 'Fraud Alerts' && (() => {
            const filtered = transactions
              .filter(t => t.isFraud || t.isMediumRisk)
              .filter(t => {
                if (historyFilter === 'Medium') return t.isMediumRisk;
                if (historyFilter === 'Fraud') return t.isFraud;
                return true;
              })
              .filter(t => {
                if (!historySearch.trim()) return true;
                const q = historySearch.toLowerCase();
                return (
                  (t.transactionId || '').toLowerCase().includes(q) ||
                  (t.senderId || '').toLowerCase().includes(q) ||
                  (t.receiverId || '').toLowerCase().includes(q)
                );
              })
              .filter(t => {
                const amount = t.amount || 0;
                const min = minAmount ? parseFloat(minAmount) : 0;
                const max = maxAmount ? parseFloat(maxAmount) : Infinity;
                return amount >= min && amount <= max;
              });

            return (
              <>
                <div className="dashboard-grid mb-6">
                  <MetricsCard title="Amount Blocked" value={formattedFraudAmount} icon={IndianRupee} color="destructive" />
                </div>
                
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search alerts..."
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        className="input-field !pl-9 !py-2 text-sm w-48"
                      />
                    </div>

                    {/* Amount Filter */}
                    <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg border border-border/40">
                      <input
                        type="number"
                        placeholder="Min ₹"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="bg-transparent text-xs w-16 px-1 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Max ₹"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="bg-transparent text-xs w-16 px-1 focus:outline-none"
                      />
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center bg-secondary rounded-lg p-1">
                      {['All', 'Medium', 'Fraud'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setHistoryFilter(f)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${historyFilter === f
                            ? 'bg-destructive text-white shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-auto">
                    <button 
                      onClick={() => window.open("https://mail.google.com/mail/u/0/#inbox", "_blank")}
                      className="btn-secondary flex items-center gap-2 text-xs py-2 px-4"
                    >
                      <Mail className="w-4 h-4" />
                      View Mail
                    </button>
                    <button onClick={handleRefresh} className="btn-secondary flex items-center gap-2 text-xs py-2 px-4" disabled={refreshing}>
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh Alerts
                    </button>
                  </div>
                </div>

                <TransactionList 
                  transactions={filtered} 
                  loading={loading} 
                  onTransactionClick={(tx) => setSelectedTransaction(tx)}
                  user={user}
                />
              </>
            );
          })()}

          {activeTab === 'Threat Map' && (
            <div className="flex-1 flex flex-col min-h-[700px]">
              <FraudMap transactions={transactions} />
              <FraudLocationAnalytics transactions={transactions} />
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'Analytics' && (
            <AnalyticsContent transactions={transactions} />
          )}

          {/* Settings Tab */}
          {activeTab === 'Settings' && (
            <Settings 
                user={user} 
                isRunning={isRunning} 
                setIsRunning={setIsRunning} 
                txSpeed={txSpeed}
                setTxSpeed={setTxSpeed}
            />
          )}

          {/* System Status Tab (Admin Only) */}
          {activeTab === 'System Status' && (
            <SystemStatus user={user} loginTimestamp={loginTimestamp} />
          )}

          {/* User Management Tab (Admin Only) */}
          {activeTab === 'User Management' && (
            <UserManagement currentUser={user} />
          )}

          {/* Audit Log Tab */}
          {activeTab === 'Audit Log' && (
            <AuditLog user={user} />
          )}

          {/* Contact Admin Tab */}
          {activeTab === 'Contact Admin' && (
            <SupportRequest user={user} />
          )}

        </main>

        {/* Footer */}
        <footer className="w-full mt-auto bg-primary text-primary-foreground py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="max-w-[1600px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs opacity-90 font-medium">
              © {new Date().getFullYear()} SecurePay. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-[10px] opacity-90 font-bold tracking-widest">
              <a href="#" className="hover:opacity-100 hover:underline transition-colors">Privacy Policy</a>
              <a href="#" className="hover:opacity-100 hover:underline transition-colors">Terms of Service</a>
              <a href="#" className="hover:opacity-100 hover:underline transition-colors">Support</a>
            </div>
          </div>
        </footer>

        {/* Transaction Detail Modal */}
        <TransactionDetailModal 
          transaction={selectedTransaction}
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          transactions={transactions}
        />

      </div>
    </div>
  );
};

export default Dashboard;