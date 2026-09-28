'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/store';
import { Bell, Shield, User, LogOut, CheckCircle2, AlertTriangle, X, Database, Cpu, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const { 
    activeMode, setActiveMode, 
    currentDataset, 
    currentUser, logout,
    engineStatuses 
  } = useAppState();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: '1', title: 'Dataset Validated', time: '10m ago', text: `${currentDataset ? currentDataset.name : 'Basin'} layers QA/QC verified.`, type: 'info' },
    { id: '2', title: 'Sentinel-1 SAR Synced', time: '1h ago', text: 'Satellite baseline flood mask available for cross-validation.', type: 'success' },
    { id: '3', title: 'Telemetry Inflow', time: '3h ago', text: `Hydrograph series active for ${currentDataset?.dam.river || 'monitored'} basin.`, type: 'warning' },
  ];

  return (
    <div className="flex flex-col z-30 relative shrink-0">
      {/* Government of India Top Banner */}
      <div className="bg-[#F9FAFB] border-b border-slate-200 px-4 md:px-6 py-1.5 flex justify-between items-center text-[11px] font-medium text-slate-600">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 uppercase font-bold text-[#0B1F3A]">
            <span className="text-orange-500">■</span>
            भारत सरकार | Government of India
          </span>
          <span className="hidden sm:inline-block border-l border-slate-300 pl-3">
            Ministry of Jal Shakti, Department of Water Resources
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <a href="#" className="hover:text-[#1677FF] transition-colors">Skip to Main Content</a>
          <a href="#" className="hover:text-[#1677FF] transition-colors">A-</a>
          <a href="#" className="hover:text-[#1677FF] transition-colors">A</a>
          <a href="#" className="hover:text-[#1677FF] transition-colors">A+</a>
          <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
            <span>English</span>
            <span>|</span>
            <a href="#" className="hover:text-[#1677FF] transition-colors">हिन्दी</a>
          </div>
        </div>
      </div>

      <header className="h-[70px] bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
        {/* Left: Official Title & Current Dataset */}
      <div className="flex items-center gap-3 md:gap-4">
        {toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            className="p-1.5 -ml-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors md:hidden"
          >
            <Menu size={22} />
          </button>
        )}
        <div>
          <h2 className="text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
            SETRA
            <span className="hidden lg:inline-block text-sm font-normal text-slate-500 border-l border-slate-200 pl-3">
              Hydrodynamic Flood Modelling & Risk Assessment
            </span>
          </h2>
        </div>

        {/* Current Active Dataset Pill */}
        {currentDataset ? (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
            <Database size={13} className="text-[#1677FF]" />
            <span className="text-slate-400 font-normal">Active Dataset:</span>
            <strong className="text-[#0B1F3A] font-semibold truncate max-w-[200px]">
              {currentDataset.name}
            </strong>
          </div>
        ) : activeMode === 'real' ? (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800">
            <Database size={13} className="text-amber-600" />
            <span className="font-normal text-amber-600">Active Dataset:</span>
            <strong className="font-bold">NO DATASET SELECTED</strong>
          </div>
        ) : null}
      </div>

      {/* Right: Mode Toggle, System Status, Notifications, Profile */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* DEMO MODE / REAL DATA MODE Toggle (Requirement 30) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveMode('demo')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'demo'
                ? 'bg-[#20C4D9] text-[#0B1F3A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            DEMO MODE
          </button>
          <button
            onClick={() => setActiveMode('real')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'real'
                ? 'bg-[#0B1F3A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            REAL DATA MODE
          </button>
        </div>

        {/* System Status (Phase 27 Verified) */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-2xs ${
          engineStatuses?.gis?.isAvailable 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
            : 'bg-amber-50 text-amber-800 border-amber-300'
        }`}>
          <Shield size={14} className={engineStatuses?.gis?.isAvailable ? 'text-emerald-600' : 'text-amber-600'} />
          <span className="text-xs font-semibold">
            {engineStatuses?.gis?.isAvailable ? 'GIS Preprocessor Active' : 'GIS Preprocessor Offline'}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell size={18} className="text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 text-slate-800 z-50"
              >
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A]">Notifications</h4>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-2.5">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex justify-between items-center font-bold text-[#0B1F3A] mb-0.5">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                      </div>
                      <p className="text-slate-600">{n.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Admin Profile & Logout */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-3 border-l border-slate-200 cursor-pointer group text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1677FF] to-[#20C4D9] flex items-center justify-center text-white shadow-xs">
              <User size={16} />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-[#0B1F3A] leading-tight group-hover:text-[#1677FF] transition-colors">
                {currentUser?.name || 'Dr. R. Sharma'}
              </p>
              <p className="text-[10px] text-slate-500">
                {currentUser?.agency || 'National Dam Safety Authority'}
              </p>
            </div>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 text-slate-800 z-50"
              >
                <div className="pb-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-[#0B1F3A]">{currentUser?.name || 'Dr. R. Sharma'}</p>
                  <p className="text-[11px] text-slate-500">{currentUser?.email || 'demo@setra.in'}</p>
                  <p className="text-[10px] text-blue-700 font-semibold mt-1 bg-blue-50 px-2 py-0.5 rounded inline-block">
                    {currentUser?.designation || 'Director (Flood Forecasting)'}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out / Return to Login</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
    </div>
  );
}
