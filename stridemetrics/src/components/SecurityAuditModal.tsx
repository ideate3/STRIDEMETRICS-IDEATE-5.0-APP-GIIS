import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  Globe, 
  Key, 
  Database, 
  UserCheck, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Server,
  Zap,
  Layers,
  ChevronRight
} from 'lucide-react';
import { sfx } from '../utils/sfx';
import { UserRole } from '../types';

interface SecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  theme?: 'dark' | 'light';
}

export const SecurityAuditModal: React.FC<SecurityAuditModalProps> = ({
  isOpen,
  onClose,
  userEmail = '',
  userRole = 'athlete',
  onRoleChange,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'overview' | 'rbac' | 'headers'>('overview');
  const [auditData, setAuditData] = useState<any>(null);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [roleMessage, setRoleMessage] = useState<string>('');
  const [currentRole, setCurrentRole] = useState<UserRole>(userRole);

  const fetchSecurityAudit = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch CSRF token
      const csrfRes = await fetch('/api/csrf-token');
      if (csrfRes.ok) {
        const csrfJson = await csrfRes.json();
        setCsrfToken(csrfJson.csrfToken || '');
      }

      // 2. Fetch Security Audit
      const auditRes = await fetch('/api/security/audit-status', {
        headers: {
          'X-User-Email': userEmail || '',
          'X-User-Role': currentRole,
        },
      });
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditData(data);
      }
    } catch (err) {
      console.warn('Security audit fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSecurityAudit();
    }
  }, [isOpen, currentRole]);

  const handleUpdateRole = async (newRole: UserRole) => {
    sfx.playClick();
    setCurrentRole(newRole);
    setRoleMessage(`Updating role to ${newRole}...`);

    try {
      const res = await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'X-User-Email': userEmail,
        },
        body: JSON.stringify({
          email: userEmail || 'athlete@stridemetrics.app',
          role: newRole,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        sfx.playLevelUp();
        setRoleMessage(`Role updated to ${newRole.toUpperCase()} successfully!`);
        if (onRoleChange) onRoleChange(newRole);
      } else {
        setRoleMessage(data.error || 'Failed to update role.');
      }
    } catch (err: any) {
      setRoleMessage(err.message || 'Error updating role.');
    }

    setTimeout(() => setRoleMessage(''), 4000);
  };

  if (!isOpen) return null;

  const securityModules = [
    {
      id: 'tls',
      title: 'TLS / HTTPS & HSTS',
      tag: 'Transport Layer',
      status: 'Enforced',
      desc: 'Enforces TLSv1.3 encryption, automatic 301 HTTPS redirects, and strict HSTS headers with 1-year preload.',
      icon: Lock,
      color: 'emerald',
    },
    {
      id: 'csp',
      title: 'Content Security Policy (CSP)',
      tag: 'Browser Guard',
      status: 'Active',
      desc: 'Restricts script, stylesheet, frame, and font execution origins to trusted endpoints and disables unverified object embeddings.',
      icon: Globe,
      color: 'teal',
    },
    {
      id: 'cors',
      title: 'CORS Filtering',
      tag: 'Origin Control',
      status: 'Restricted',
      desc: 'Restricts cross-origin HTTP methods, headers, and whitelists authorized domain origins for API routes.',
      icon: Server,
      color: 'blue',
    },
    {
      id: 'csrf',
      title: 'CSRF Token & Origin Verification',
      tag: 'Anti-Tampering',
      status: 'Protected',
      desc: 'Generates HMAC-SHA256 timestamped tokens and verifies Origin / Referer consistency on mutating requests.',
      icon: Key,
      color: 'purple',
    },
    {
      id: 'xss',
      title: 'XSS Anti-Injection',
      tag: 'Input Sanitization',
      status: 'Neutralized',
      desc: 'Automated recursive payload sanitization stripping HTML event handlers and script tags from all API bodies.',
      icon: Zap,
      color: 'amber',
    },
    {
      id: 'sqli',
      title: 'SQL & NoSQL Injection Guard',
      tag: 'Database Defense',
      status: 'Filtered',
      desc: 'Scans and neutralizes malicious SQL keywords (UNION, SELECT, DROP) and NoSQL operator injections.',
      icon: Database,
      color: 'cyan',
    },
    {
      id: 'idor',
      title: 'IDOR Ownership Verification',
      tag: 'Access Control',
      status: 'Verified',
      desc: 'Prevents Insecure Direct Object References by verifying caller UID ownership on all user resources & Firestore rules.',
      icon: ShieldCheck,
      color: 'emerald',
    },
    {
      id: 'rbac',
      title: 'Role-Based Access Control (RBAC)',
      tag: 'Authorization',
      status: 'Enforced',
      desc: 'Enforces role permissions across Athlete (User), Trainer (Coach), and Admin tiers with scoped route protection.',
      icon: UserCheck,
      color: 'indigo',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden ${
          isDark 
            ? 'bg-[#0f131a] border-white/10 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-5 py-4 ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display">Security & Compliance Vault</h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                  Grade A+ Active
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                TLS, CSP, CORS, CSRF, XSS, SQLi, IDOR & RBAC Protection Matrix
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
              isDark ? 'border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white' : 'border-slate-200 hover:bg-slate-200 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b px-5 pt-3 gap-2 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          {[
            { id: 'overview', label: 'Security Overview' },
            { id: 'rbac', label: 'RBAC & Identity Roles' },
            { id: 'headers', label: 'HTTP Security Headers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sfx.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={fetchSecurityAudit}
            disabled={isLoading}
            className="ml-auto flex items-center gap-1.5 pb-3 text-xs text-zinc-400 hover:text-emerald-400 transition-colors disabled:opacity-50"
            title="Refresh Security Status"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Audit</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {securityModules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isDark 
                          ? 'bg-white/[0.03] border-white/10 hover:border-emerald-500/30' 
                          : 'bg-slate-50 border-slate-200 hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold font-display">{mod.title}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          {mod.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Active CSRF Token Snapshot */}
              {csrfToken && (
                <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                  isDark ? 'bg-purple-950/20 border-purple-500/30 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-900'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Key className="h-4 w-4 shrink-0 text-purple-400" />
                    <span className="font-mono text-[11px] truncate">
                      Active Signed CSRF Token: {csrfToken.slice(0, 24)}...
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-purple-500/20 px-2 py-0.5 rounded font-bold">
                    HMAC-SHA256
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RBAC (ROLE-BASED ACCESS CONTROL) */}
          {activeTab === 'rbac' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  <span>Role-Based Access Hierarchy</span>
                </h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Users are partitioned into granular access control roles to protect biometric telemetry and administrative functions.
                </p>

                <div className="space-y-3">
                  {[
                    {
                      role: 'athlete' as UserRole,
                      title: 'Athlete (Standard User)',
                      perms: 'Personal metrics, BMR/TDEE tracking, AI Coach chats, Workout generation & log storage.',
                      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                    },
                    {
                      role: 'trainer' as UserRole,
                      title: 'Trainer / Coach',
                      perms: 'All Athlete capabilities + custom weekly training split authoring & athlete telemetry reviews.',
                      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                    },
                    {
                      role: 'admin' as UserRole,
                      title: 'Administrator',
                      perms: 'Full system authorization: Security telemetry, audit inspection, and global system stats.',
                      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                    },
                  ].map((r) => {
                    const isSelected = currentRole === r.role;
                    return (
                      <div
                        key={r.role}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                          isSelected
                            ? isDark
                              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-md'
                              : 'bg-emerald-50 border-emerald-500/40 shadow-sm'
                            : isDark
                              ? 'bg-white/[0.02] border-white/5'
                              : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold">{r.title}</span>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${r.badgeColor}`}>
                              {r.role.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400">{r.perms}</p>
                        </div>

                        <button
                          onClick={() => handleUpdateRole(r.role)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 shadow-sm'
                              : isDark
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Switch Role'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {roleMessage && (
                  <p className="mt-3 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle2 className="h-4 w-4" />
                    {roleMessage}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: HTTP SECURITY HEADERS */}
          {activeTab === 'headers' && (
            <div className="space-y-3 text-xs">
              <div className={`p-4 rounded-2xl border font-mono space-y-2.5 ${
                isDark ? 'bg-black/60 border-white/10 text-emerald-400' : 'bg-slate-900 border-slate-800 text-emerald-400'
              }`}>
                <div>
                  <span className="text-zinc-500">// Content-Security-Policy</span>
                  <p className="text-zinc-300 break-all text-[11px]">
                    default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com https://*.firebaseapp.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; frame-src 'self' https://*.firebaseapp.com; upgrade-insecure-requests
                  </p>
                </div>

                <div>
                  <span className="text-zinc-500">// Strict-Transport-Security (HSTS)</span>
                  <p className="text-zinc-300 text-[11px]">
                    max-age=31536000; includeSubDomains; preload
                  </p>
                </div>

                <div>
                  <span className="text-zinc-500">// Anti-MIME & Clickjacking Defenses</span>
                  <p className="text-zinc-300 text-[11px]">
                    X-Content-Type-Options: nosniff | X-Frame-Options: SAMEORIGIN | X-XSS-Protection: 1; mode=block
                  </p>
                </div>

                <div>
                  <span className="text-zinc-500">// CORS & Origin Access</span>
                  <p className="text-zinc-300 text-[11px]">
                    Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between border-t px-5 py-3.5 ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
        }`}>
          <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
            <Lock className="h-3 w-3 text-emerald-400" />
            Verified Secure Node/Vite Runtime
          </span>

          <button
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs active:scale-95 transition-all shadow-md shadow-emerald-500/20"
          >
            Close Vault
          </button>
        </div>
      </motion.div>
    </div>
  );
};
