import React, { useState, useEffect } from 'react';
import { 
  UserPlus, User, Mail, Shield, ShieldAlert, 
  Trash2, Edit3, CheckCircle, XCircle, Search,
  Lock, Key, MoreHorizontal, Settings, MessageSquare, Clock, AlertCircle, ExternalLink,
  Eye, EyeOff
} from 'lucide-react';
import { userAPI, contactAPI } from '../api';

const UserManagement = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Access Requests State
  const [requests, setRequests] = useState([]);
  const [viewMode, setViewMode] = useState('USERS'); // 'USERS' or 'REQUESTS'
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [adminResponseText, setAdminResponseText] = useState('');

  const closeRequestModal = () => {
    setSelectedRequest(null);
    setIsRequestModalOpen(false);
    setAdminResponseText('');
  };

  const openRequestDetail = (request) => {
    setSelectedRequest(request);
    setIsRequestModalOpen(true);
    setAdminResponseText(request.adminResponse || '');
  };
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Analyst',
    permissions: 'READ_ONLY,VIEW_ALERTS'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getAll();
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load system users. Clearance level may be insufficient.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await contactAPI.getRequests();
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, []);

  const handleOpenModal = (user = null) => {
    setError(''); // Clear any previous errors
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '', // Don't show existing password
        role: user.role,
        permissions: user.permissions
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'Analyst',
        permissions: 'READ_ONLY,VIEW_ALERTS'
      });
    }
    setShowModal(true);
    setShowPassword(false); // Reset visibility when opening
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userAPI.update(editingUser.id, formData);
      } else {
        await userAPI.create(formData);
        if (activeRequestId) {
          await contactAPI.updateStatus(activeRequestId, 'PROCESSED');
          setActiveRequestId(null);
          fetchRequests();
        }
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleDeleteClick = (user) => {
    setError('');
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await userAPI.delete(userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete user. Primary administrators cannot be removed.');
      setShowDeleteModal(false);
    }
  };

  const handleProcessRequest = async (id, response = null) => {
    try {
      await contactAPI.updateStatus(id, 'PROCESSED', response);
      fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Transmission failed.';
      setError(`Failed to update request status: ${msg}`);
    }
  };

  const handleApproveRequest = (request) => {
    setFormData({
      username: request.name.split(' ')[0].toLowerCase() + Math.round(Math.random() * 100),
      email: request.email,
      password: 'TemporaryPassword123!',
      role: 'Analyst',
      permissions: 'READ_ONLY,VIEW_ALERTS'
    });
    setEditingUser(null);
    setShowModal(true);
    setActiveRequestId(request.id);
  };

  const handleIgnoreRequest = async (id) => {
    try {
      await contactAPI.updateStatus(id, 'IGNORED');
      fetchRequests();
    } catch (err) {
      setError('System failure while ignoring clearance request.');
    }
  };

  const handleDeleteRequest = async (id) => {
    console.log(">>> TRANSMISSION LOG PURGE COMMAND INITIATED FOR ID:", id);
    if (!window.confirm('PERMANENTLY ERASE THIS TRANSMISSION LOG?')) return;
    try {
        await contactAPI.delete(id);
        console.log(">>> INFRASTRUCTURE CONFIRMED DELETION FOR ID:", id);
        setRequests(prev => prev.filter(r => r.id !== id));
        if (selectedRequest?.id === id) closeRequestModal();
        alert('Transmission record has been purged successfully.');
    } catch (err) {
        console.error(">>> FAILED TO PURGE RECORD:", err);
        const status = err.response?.status || 'NETWORK_FAILURE';
        setError(`Failed to purge record. Server responded with: ${status}`);
        alert(`CRITICAL: Infrastructure failure during record erasure. (Code: ${status})`);
    }
  };

  const handleQuickApprove = async (request) => {
    try {
      const newUser = {
        username: request.name.split(' ')[0].toLowerCase() + Math.round(Math.random() * 1000),
        email: request.email,
        password: 'Welcome' + Math.round(Math.random() * 9999) + '!',
        role: 'Analyst',
        permissions: 'READ_ONLY,VIEW_ALERTS'
      };
      
      await userAPI.create(newUser);
      await contactAPI.updateStatus(request.id, 'PROCESSED');
      fetchUsers();
      fetchRequests();
      // Success alert or notification
      alert(`User ${newUser.username} provisioned and email sent to ${newUser.email}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Quick Provisioning failed.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Identity & Access</h2>
          <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mt-1">Manage personnel clearance levels</p>
        </div>
        <div className="flex gap-2 bg-secondary/20 p-1 rounded-xl border border-border/40">
          <button 
            onClick={() => setViewMode('USERS')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'USERS' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Personnel
          </button>
          <button 
            onClick={() => setViewMode('REQUESTS')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all relative ${
              viewMode === 'REQUESTS' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Access Requests
            {requests.filter(r => r.status === 'PENDING').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-[8px] flex items-center justify-center rounded-full animate-bounce">
                {requests.filter(r => r.status === 'PENDING').length}
              </span>
            )}
          </button>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn-primary flex items-center gap-2 w-fit shadow-lg shadow-primary/20"
        >
          <UserPlus className="w-4 h-4" />
          Propose New Analyst
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Personnel" value={users.length} icon={User} color="primary" />
        <StatCard label="Administrators" value={users.filter(u => u.role === 'Admin').length} icon={Shield} color="accent" />
        <StatCard label="Pending Requests" value={requests.filter(r => r.status === 'PENDING').length} icon={MessageSquare} color="warning" />
      </div>

      {/* Access Requests Table */}
      {viewMode === 'REQUESTS' && (
        <div className="glass-card !p-0 overflow-hidden border border-border/40 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="p-4 border-b border-border/40 bg-secondary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Incoming Clearance Requests
            </h3>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-4">
              {requests.length} Total Transmissions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/40 border-b border-border/40 text-[10px] uppercase font-black tracking-widest text-muted-foreground/80">
                  <th className="px-6 py-4">Requester</th>
                  <th className="px-6 py-4">Communication Details</th>
                  <th className="px-6 py-4">Message / Justification</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground text-sm font-bold uppercase tracking-widest italic opacity-50">
                      No communication detected on this channel
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => {
                    const isSupportTicket = r.message?.startsWith('[SUPPORT TICKET]');
                    const cleanMessage = isSupportTicket ? r.message.replace('[SUPPORT TICKET] ', '') : r.message;
                    
                    return (
                    <tr 
                      key={r.id} 
                      className={`transition-colors group border-l-2 ${
                        r.status === 'PENDING' 
                          ? (isSupportTicket ? 'border-l-primary bg-primary/[0.02]' : 'border-l-warning bg-warning/[0.02]') 
                          : 'border-l-transparent'
                      } hover:bg-secondary/20`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-secondary rounded-lg">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-bold text-foreground">{r.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight flex items-center gap-1.5">
                            <Mail className="w-3 h-3" /> {r.email}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> {new Date(r.requestTime).toLocaleString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          {isSupportTicket && (
                            <span className="w-fit flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/20 text-[8px] font-black uppercase text-primary tracking-widest border border-primary/20">
                              <AlertCircle className="w-2.5 h-2.5" /> Support Issue
                            </span>
                          )}
                          <p className="text-xs text-muted-foreground max-w-md line-clamp-2 italic leading-relaxed cursor-pointer hover:text-foreground transition-colors"
                             onClick={() => openRequestDetail({...r, cleanMessage})}>
                             "{cleanMessage}"
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest border ${
                          r.status === 'PENDING' ? 'text-warning bg-warning/10 border-warning/20' :
                          r.status === 'PROCESSED' ? 'text-green-500 bg-green-500/10 border-green-500/20' :
                          'text-destructive bg-destructive/10 border-destructive/20'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === 'PENDING' && (
                            <>
                              <button 
                                onClick={() => handleApproveRequest(r)}
                                className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors flex items-center gap-1"
                                title="Provision User"
                              >
                                <UserPlus className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase">Mod/Provision</span>
                              </button>
                              <button 
                                onClick={() => handleQuickApprove(r)}
                                className="p-1.5 hover:bg-green-500/10 rounded-lg text-green-500 transition-colors flex items-center gap-1 border border-green-500/20"
                                title="Quick Approve as Analyst"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase">Quick Allow</span>
                              </button>
                              <button 
                                onClick={() => handleIgnoreRequest(r.id)}
                                className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive transition-colors flex items-center gap-1 border border-destructive/20"
                                title="Reject Access Plane"
                              >
                                <XCircle className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase">Ignore</span>
                              </button>
                              <button 
                                onClick={() => openRequestDetail({...r, cleanMessage})}
                                className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground transition-colors flex items-center gap-1 border border-border/40"
                                title="Analyze Issue"
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase">Review Issue</span>
                              </button>
                              <button 
                                onClick={() => handleProcessRequest(r.id)}
                                className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                title="Mark as Read"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {/* Always allow clearing record */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteRequest(r.id); }}
                            className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive transition-colors border border-transparent hover:border-destructive/20 relative z-10 group/request-trash"
                            title="Purge Record"
                          >
                            <Trash2 className="w-4 h-4 pointer-events-none" />
                          </button>
                          
                          {r.status === 'PROCESSED' && (
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Resolved</span>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Global Error Display (For delete/bulk operations outside modal) */}
      {error && !showModal && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-destructive/20 p-2 rounded-lg">
            <XCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-destructive tracking-widest">Action Required / System Warning</p>
            <p className="text-sm font-bold text-foreground">{error}</p>
          </div>
          <button onClick={() => setError('')} className="ml-auto text-muted-foreground hover:text-foreground">
            <XCircle className="w-4 h-4 opacity-50" />
          </button>
        </div>
      )}

      {/* Users Table */}
      {viewMode === 'USERS' && (
        <div className="glass-card !p-0 overflow-hidden border border-border/40 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-4 border-b border-border/40 bg-secondary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or encrypted ID..."
              className="input-field !pl-10 !py-1.5 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-4">
            Encrypted Registry: {filteredUsers.length} Records Match
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/40 border-b border-border/40 text-[10px] uppercase font-black tracking-widest text-muted-foreground/80">
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Clearance Level</th>
                <th className="px-6 py-4">Active Permissions</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary rounded-lg">
                        <User className={`w-4 h-4 ${u.role === 'Admin' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{u.username}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest border ${
                      u.role === 'Admin' 
                        ? 'text-primary bg-primary/10 border-primary/20' 
                        : 'text-warning bg-warning/10 border-warning/20'
                    }`}>
                      LVL {u.role === 'Admin' ? '2 (ADMIN)' : '1 (ANALYST)'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {u.permissions?.split(',').map(p => (
                        <span key={p} className="text-[8px] font-black uppercase tracking-tight text-muted-foreground bg-secondary/40 px-1.5 py-0.5 rounded">
                          {p.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleOpenModal(u)}
                        className="p-1.5 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                        title="Mod Clear Credentials"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(u); }}
                        disabled={currentUser?.username === u.username}
                        className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed group/trash"
                        title="Cancel Global Access"
                      >
                        <Trash2 className="w-4 h-4 pointer-events-none" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal Integration */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg glass-card p-0 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-border/40 bg-secondary/30">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                {editingUser ? 'Modify Credentials' : 'Provision Analyst Clearance'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-3 animate-in fade-in zoom-in duration-200">
                  <XCircle className="w-5 h-5 text-destructive shrink-0" />
                  <p className="text-xs font-bold text-destructive uppercase tracking-tight">{error}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" required
                      className="input-field !pl-10 !py-2"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Clearance Level</label>
                  <div className="relative">
                    <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <select 
                      className="input-field !pl-10 !py-2 appearance-none"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="Analyst">Level 1: Analyst</option>
                      <option value="Admin">Level 2: Administrator</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Operational Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="email" required
                    className="input-field !pl-10 !py-2"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Secure Password {editingUser && '(Leave blank to keep)'}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type={showPassword ? "text" : "password"} required={!editingUser}
                    className="input-field !pl-10 !pr-10 !py-2"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Access Permissions (Comma-separated)</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" required
                    placeholder="READ_ONLY,VIEW_ALERTS"
                    className="input-field !pl-10 !py-2"
                    value={formData.permissions}
                    onChange={(e) => setFormData({...formData, permissions: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-2">
                  Abort
                </button>
                <button type="submit" className="btn-primary flex-1 py-2">
                  Commit Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-md glass-card p-0 overflow-hidden animate-in zoom-in duration-300 shadow-2xl border-destructive/20 ring-1 ring-destructive/10">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-destructive/20 animate-pulse">
                <Trash2 className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Cancel Global Access?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You are about to permanently delete <span className="text-foreground font-bold">@{userToDelete?.username}</span> from the secure database. This action is irreversible.
              </p>
              
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="flex-1 px-6 py-3 rounded-xl bg-secondary text-sm font-bold uppercase tracking-widest hover:bg-secondary/80 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="flex-1 px-6 py-3 rounded-xl bg-destructive text-white text-sm font-bold uppercase tracking-widest hover:bg-destructive/90 shadow-lg shadow-destructive/25 transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
            <div className="bg-destructive/5 py-2 px-4 border-t border-destructive/10 text-center">
               <p className="text-[10px] font-black uppercase tracking-widest text-destructive/60 flex items-center justify-center gap-2">
                 <ShieldAlert className="w-3 h-3" /> SECURITY PROTOCOL IRREVERSIBLE
               </p>
            </div>
          </div>
        </div>
      )}
      {/* Support Request Detail Modal */}
      {isRequestModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass-card max-w-lg w-full p-8 space-y-6 shadow-2xl border border-border/40 scale-in-center overflow-hidden relative">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                
                <div className="flex items-center justify-between border-b border-border/40 pb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${selectedRequest.message?.startsWith('[SUPPORT TICKET]') ? 'bg-primary/20 text-primary' : 'bg-warning/20 text-warning'}`}>
                            {selectedRequest.message?.startsWith('[SUPPORT TICKET]') ? <AlertCircle className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight">Transmission Details</h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Operator Communication Log</p>
                        </div>
                    </div>
                    <button onClick={closeRequestModal} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                        <XCircle className="w-6 h-6 text-muted-foreground" />
                    </button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Originator</p>
                            <p className="text-sm font-bold text-foreground truncate">{selectedRequest.name}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Timestamp</p>
                            <p className="text-sm font-bold text-foreground">{new Date(selectedRequest.requestTime).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Communications Channel</p>
                        <div className="p-3 bg-secondary/30 rounded-xl border border-border/20 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold opacity-80">{selectedRequest.email}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Detailed Observation / Justification</p>
                        <div className="p-6 bg-secondary/20 rounded-2xl border border-primary/10 relative">
                            <p className="text-sm text-foreground leading-relaxed italic whitespace-pre-wrap">
                                "{selectedRequest.cleanMessage || selectedRequest.message}"
                            </p>
                        </div>
                    </div>

                    {selectedRequest.status === 'PENDING' && (
                        <div className="space-y-2 pt-2">
                             <p className="text-[10px] font-black text-primary uppercase tracking-widest">Administrator Clearance Response</p>
                             <textarea 
                                className="input-field min-h-[100px] text-sm py-3"
                                placeholder="Type your response/instructions for the analyst..."
                                value={adminResponseText}
                                onChange={(e) => setAdminResponseText(e.target.value)}
                             />
                        </div>
                    )}

                    {selectedRequest.status === 'PROCESSED' && selectedRequest.adminResponse && (
                        <div className="space-y-2 pt-2">
                             <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Sent Response</p>
                             <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                                <p className="text-xs text-foreground leading-relaxed">{selectedRequest.adminResponse}</p>
                             </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-border/40 flex gap-4">
                    <button 
                        onClick={closeRequestModal}
                        className="btn-secondary flex-1 py-3 text-xs font-black uppercase tracking-widest"
                    >
                        Close Transcript
                    </button>
                    {selectedRequest.status === 'PENDING' && (
                        <button 
                            onClick={() => { handleProcessRequest(selectedRequest.id, adminResponseText); closeRequestModal(); }}
                            className="btn-primary flex-1 py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                            {selectedRequest.message?.startsWith('[SUPPORT TICKET]') ? 'Resolve & Send' : 'Save Response'}
                        </button>
                    )}
                    {selectedRequest.status === 'PENDING' && !selectedRequest.message?.startsWith('[SUPPORT TICKET]') && (
                        <button 
                            onClick={() => { handleApproveRequest(selectedRequest); closeRequestModal(); }}
                            className="btn-accent border-accent/20 border flex-1 py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/20"
                        >
                            Proceed to Provision
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className={`glass-card p-6 border-l-4 border-l-${color}`}>
    <div className="flex items-center gap-4 mb-2">
      <div className={`p-2 bg-${color}/10 rounded-lg`}>
        <Icon className={`w-5 h-5 text-${color}`} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
    <p className="text-3xl font-black">{value}</p>
  </div>
);

export default UserManagement;
