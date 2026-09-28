'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/store';
import { 
  Waves, Shield, Mail, ArrowRight, Lock, 
  CheckCircle2, AlertCircle, User, Building, 
  BadgeCheck, KeyRound, MapPin, FileCheck2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const { login, registerGovernmentUser, registeredUsers } = useAppState();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('register');
  
  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAgency, setRegAgency] = useState('Central Water Commission (CWC)');
  const [regDepartment, setRegDepartment] = useState('Ministry of Jal Shakti, Govt. of India');
  const [regDesignation, setRegDesignation] = useState('Executive Hydrologist');
  const [regState, setRegState] = useState('National HQ (New Delhi)');
  const [regGovId, setRegGovId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regCertified, setRegCertified] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Please provide all mandatory details (Name, Official Email, and Password).');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Security password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Password and Confirm Password do not match.');
      return;
    }

    if (!regCertified) {
      setRegError('You must verify authorized official status under the Dam Safety Act.');
      return;
    }

    setIsRegistering(true);

    setTimeout(() => {
      const res = registerGovernmentUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        agency: regAgency,
        department: regDepartment,
        designation: regDesignation,
        state: regState,
        govId: regGovId || `GOV-IN-${Math.floor(1000 + Math.random() * 9000)}`,
      });

      setIsRegistering(false);

      if (res.success) {
        setRegSuccess(res.message);
        // Pre-fill login email and switch to login tab smoothly
        setLoginEmail(regEmail);
        setLoginPassword(regPassword);
        setTimeout(() => {
          setActiveTab('signin');
        }, 1500);
      } else {
        setRegError(res.message);
      }
    }, 600);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    setTimeout(() => {
      const ok = login(loginEmail, loginPassword);
      setIsLoggingIn(false);
      if (!ok) {
        setLoginError('Invalid government credentials. If you have not registered yet, please use the "Register Official Account" tab.');
      }
    }, 500);
  };

  const handleSelectPreconfigured = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#061224] via-[#0B1F3A] to-[#122B4D] flex flex-col justify-between text-slate-100 p-4 sm:p-6">
      {/* Top Government Emblem Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 shadow-inner">
            <Waves className="w-6 h-6 text-[#20C4D9]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider text-white">SETRA</h1>
              <span className="text-[10px] bg-[#20C4D9]/20 text-[#20C4D9] border border-[#20C4D9]/30 px-2 py-0.5 rounded font-mono font-bold">
                GOVT. OF INDIA
              </span>
            </div>
            <p className="text-[11px] text-blue-200/70 tracking-wide font-medium">
              National Dam Safety Authority &amp; Central Water Commission Decision Support Platform
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-blue-200">
          <Shield size={14} className="text-[#20C4D9]" />
          <span>Dam Safety Act, 2021 Compliant</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-800 border border-slate-100 relative overflow-hidden"
        >
          {/* Top Decorative Header Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1677FF] via-[#20C4D9] to-[#0B1F3A]" />

          {/* Header Title */}
          <div className="text-center mb-6 pt-1">
            <div className="w-14 h-14 bg-[#0B1F3A] rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-lg">
              <Waves className="w-8 h-8 text-[#20C4D9]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0B1F3A]">Government Official Portal</h2>
            <p className="text-xs text-slate-500 mt-1">
              National Hydrodynamic Flood Inundation &amp; Risk Assessment System
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setRegError(null); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-white text-[#1677FF] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User size={14} />
              <span>1. Register Official Account</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('signin'); setLoginError(null); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'signin'
                  ? 'bg-white text-[#1677FF] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound size={14} />
              <span>2. Official Sign In</span>
            </button>
          </div>

          {/* TAB 1: REGISTRATION FORM */}
          {activeTab === 'register' && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              <div className="mb-4 p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                <BadgeCheck size={18} className="text-[#1677FF] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Government Officer Onboarding</span>
                  <p className="text-[11px] text-blue-800/80 mt-0.5">
                    Register your official credentials to access basin bathymetry, run hydrodynamic models, and generate NDMA disaster relief plans.
                  </p>
                </div>
              </div>

              {regSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {regError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Official Full Name *
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      placeholder="e.g. Dr. Arisudan Sharma"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1677FF] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Official Email Address *
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      placeholder="e.g. officer@cwc.gov.in"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1677FF] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Ministry / Agency
                    </label>
                    <select
                      value={regAgency}
                      onChange={(e) => setRegAgency(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1677FF] focus:bg-white"
                    >
                      <option value="Central Water Commission (CWC)">Central Water Commission (CWC)</option>
                      <option value="National Dam Safety Authority (NDSA)">National Dam Safety Authority (NDSA)</option>
                      <option value="National Disaster Management Authority (NDMA)">National Disaster Management Authority (NDMA)</option>
                      <option value="State Disaster Management Authority (SDMA)">State Disaster Management Authority (SDMA)</option>
                      <option value="State Water Resources Department (WRD)">State Water Resources Department (WRD)</option>
                      <option value="Central Electricity Authority (CEA)">Central Electricity Authority (CEA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Official Designation
                    </label>
                    <input
                      type="text"
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      placeholder="e.g. Superintending Engineer"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1677FF] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Jurisdiction / Cadre
                    </label>
                    <input
                      type="text"
                      value={regState}
                      onChange={(e) => setRegState(e.target.value)}
                      placeholder="e.g. Uttarakhand Basin Division"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1677FF] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Officer ID / Employee Code
                    </label>
                    <input
                      type="text"
                      value={regGovId}
                      onChange={(e) => setRegGovId(e.target.value)}
                      placeholder="e.g. CWC-ND-2026"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1677FF] focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Password (min 6 chars) *
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1677FF] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1677FF] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regCertified}
                      onChange={(e) => setRegCertified(e.target.checked)}
                      className="mt-0.5 accent-blue-600 rounded"
                    />
                    <span className="text-[11px] text-slate-600 leading-tight">
                      I certify that I am authorized personnel accessing the National Dam Safety &amp; Hydrodynamic Flood Modelling System under the Dam Safety Act, 2021.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-2.5 bg-[#1677FF] hover:bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  <FileCheck2 size={16} />
                  <span>{isRegistering ? 'Registering Official ID...' : 'Register Government Account'}</span>
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Already registered? Sign in with your official email &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: OFFICIAL SIGN IN */}
          {activeTab === 'signin' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              {loginError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Government Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      placeholder="e.g. director.flood@cwc.gov.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1677FF] focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Security Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1677FF] focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-[#1677FF] hover:bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>{isLoggingIn ? 'Authenticating with Secure Gateway...' : 'Sign In as Government Official'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Pre-Registered Official Accounts Helper */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Sample Registered Government Accounts
                </span>
                <div className="space-y-1.5">
                  <div
                    onClick={() => handleSelectPreconfigured('director.flood@cwc.gov.in', 'cwc@2026')}
                    className="p-2.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-lg cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">Dr. Arisudan Sharma</span>
                      <span className="text-slate-500 text-[11px]">director.flood@cwc.gov.in (Director, CWC)</span>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Autofill
                    </span>
                  </div>

                  <div
                    onClick={() => handleSelectPreconfigured('ndsa.inspector@nic.in', 'ndsa@2026')}
                    className="p-2.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-lg cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">Er. Sunita Verma</span>
                      <span className="text-slate-500 text-[11px]">ndsa.inspector@nic.in (Dam Inspector, NDSA)</span>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Autofill
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Need to register a new official email? Register here &rarr;
                </button>
              </div>
            </motion.div>
          )}

          <p className="text-[11px] text-center text-slate-400 mt-6 leading-relaxed">
            National Inundation Decision Support System. Authorised government officials only under Section 42 of the Dam Safety Act.
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-3 text-center text-xs text-blue-200/50 border-t border-white/10">
        <p>Government of India • Ministry of Jal Shakti • Central Water Commission (CWC) • National Dam Safety Authority</p>
      </footer>
    </div>
  );
}
