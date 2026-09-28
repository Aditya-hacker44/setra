'use client';

import { useAppState } from '@/lib/store';
import { PageId } from '@/types';
import { defaultScenario, tehriDemoDataset } from '@/data/demoDataset';
import { simulateFloodScenario } from '@/lib/simulationEngine';
import {
  LayoutDashboard,
  Database,
  Settings2,
  Play,
  Map,
  BarChart3,
  GitCompare,
  Satellite,
  FileDown,
  Info,
  Waves,
  RotateCcw,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

const navItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'data-input', label: 'Data Ingestion', icon: <Database size={18} /> },
  { id: 'scenario-setup', label: 'Scenario Setup', icon: <Settings2 size={18} /> },
  { id: 'run-simulation', label: 'Run Simulation', icon: <Play size={18} /> },
  { id: 'results', label: 'Results & GIS', icon: <Map size={18} /> },
  { id: 'impact', label: 'Impact Analysis', icon: <BarChart3 size={18} /> },
  { id: 'comparison', label: 'Scenario Comparison', icon: <GitCompare size={18} /> },
  { id: 'validation', label: 'Satellite Validation', icon: <Satellite size={18} /> },
  { id: 'reports', label: 'Reports & Export', icon: <FileDown size={18} /> },
  { id: 'about', label: 'About & Engines', icon: <Info size={18} /> },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen?: boolean; setIsOpen?: (v: boolean) => void }) {
  const { 
    currentPage, setCurrentPage, 
    activeMode, loadDemoDataset, resetDemo,
    setSimulationStatus, setSimulationResult, 
    setScenario, currentDataset,
    engineStatuses
  } = useAppState();

  const handleDemoMode = async () => {
    loadDemoDataset();
    setScenario(defaultScenario);
    setSimulationStatus('completed');
    const result = await simulateFloodScenario(defaultScenario, tehriDemoDataset);
    setSimulationResult(result);
  };

  const isDemoActive = activeMode === 'demo';

  return (
    <>
      {isOpen && setIsOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={`
        w-[240px] bg-[#0B1F3A] flex flex-col h-full shrink-0 border-r border-white/5 select-none
        fixed md:relative z-40 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Official Government / NDSA Logo */}
        <div className="px-5 pt-5 pb-3 relative">
          <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1677FF]/20 flex items-center justify-center border border-[#20C4D9]/30">
            <Waves className="text-[#20C4D9]" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wider">SETRA</h1>
            <p className="text-[9px] text-[#20C4D9] uppercase font-bold tracking-widest leading-tight">
              Govt. of India
            </p>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-white/50 leading-tight">
          National Dam Safety & Inundation Decision Support
        </div>
      </div>

      {/* Demo / Quick Dataset Controls */}
      <div className="px-3 pb-3 space-y-1.5">
        <button
          onClick={handleDemoMode}
          className={`w-full py-2 px-3 rounded-lg text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
            isDemoActive
              ? 'bg-[#20C4D9]/20 text-[#20C4D9] border border-[#20C4D9]/40'
              : 'bg-[#1677FF] text-white hover:bg-blue-600 border border-blue-400/30'
          }`}
        >
          {isDemoActive ? (
            <>
              <CheckCircle2 size={14} />
              <span>DEMO DATA LOADED</span>
            </>
          ) : (
            <>
              <Play size={14} className="fill-current" />
              <span>LOAD DEMO DATASET</span>
            </>
          )}
        </button>

        {isDemoActive && (
          <button
            onClick={resetDemo}
            className="w-full py-1.5 px-3 rounded-lg text-[11px] font-semibold tracking-wide bg-white/10 text-white/70 hover:bg-white/20 transition-all flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset Dataset & Run</span>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`sidebar-link w-full text-left cursor-pointer transition-colors ${
              currentPage === item.id ? 'active' : ''
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* System Status Indicators (Phase 27: Scientific Transparency) */}
      <div className="px-4 pb-4 pt-2 border-t border-white/10">
        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2 font-semibold">
          Service Health (Phase 27)
        </p>
        <div className="space-y-1.5">
          <StatusItem 
            label="GIS Preprocessor" 
            status={engineStatuses?.gis?.isAvailable ? 'CONNECTED' : 'OFFLINE'} 
            tone={engineStatuses?.gis?.isAvailable ? 'green' : 'amber'} 
          />
          <StatusItem 
            label="SPH / Delft3D" 
            status={
              (engineStatuses?.sph?.isAvailable || engineStatuses?.delft3d?.isAvailable) 
                ? 'CONNECTED' 
                : 'NOT CONFIGURED'
            } 
            tone={(engineStatuses?.sph?.isAvailable || engineStatuses?.delft3d?.isAvailable) ? 'green' : 'amber'} 
          />
          <StatusItem 
            label="Google Earth Engine" 
            status={engineStatuses?.gee?.isConfigured ? 'CONNECTED' : 'NOT CONFIGURED'} 
            tone={engineStatuses?.gee?.isConfigured ? 'green' : 'amber'} 
          />
          <StatusItem 
            label="2D Demo Solver" 
            status={isDemoActive ? "AVAILABLE" : "DEMO ONLY"} 
            tone={isDemoActive ? "blue" : "amber"} 
          />
        </div>
      </div>
    </aside>
    </>
  );
}

function StatusItem({ label, status, tone }: { label: string; status: string; tone: 'green' | 'amber' | 'blue' | 'red' }) {
  const dotColor = 
    tone === 'green' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' :
    tone === 'amber' ? 'bg-amber-400' :
    tone === 'blue' ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]' :
    'bg-rose-400';

  return (
    <div className="flex items-center justify-between gap-1 text-[11px]">
      <div className="flex items-center gap-1.5 truncate">
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
        <span className="text-white/70 truncate">{label}</span>
      </div>
      <span className="text-[9px] font-mono text-white/40 uppercase shrink-0">{status}</span>
    </div>
  );
}
