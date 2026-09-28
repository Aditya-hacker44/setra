'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/lib/store';
import FloodMap from '@/components/map/FloodMap';
import { generateTimeSteps } from '@/data/mockData';
import { 
  MapPin, Timer, Users, Activity, 
  ChevronLeft, ChevronRight, Play, Pause, Waves, 
  Database, ShieldCheck, AlertCircle, Compass, Zap, Building2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { 
    scenario, setScenario, simulationResult, 
    simulationStatus, setSimulationStatus, setCurrentPage, 
    activeMode, selectedModel, activeDataset, setActiveDatasetId, allDatasets,
    timeSliderIndex, setTimeSliderIndex, qualityReport
  } = useAppState();
  
  const activeDam = activeDataset?.dam;

  // Local scenario configuration parameters synced with activeDataset
  const [failureType, setFailureType] = useState<string>(
    scenario?.failureType ? (scenario.failureType.charAt(0).toUpperCase() + scenario.failureType.slice(1)) : 'Sudden Complete Failure'
  );
  const [waterLevel, setWaterLevel] = useState<number>(scenario?.reservoirLevel || activeDam?.maxReservoirLevel || 830);
  const [breachWidth, setBreachWidth] = useState<number>(scenario?.breachWidth || 120);
  const [breachTime, setBreachTime] = useState<number>(scenario?.breachFormationTime || 0.5);
  const [simDuration, setSimDuration] = useState<number>(scenario?.simulationDuration || 6);

  // Time steps from simulation result or dynamically computed from active dataset
  const timeSteps = simulationResult?.timeSteps || generateTimeSteps(
    failureType.toLowerCase().includes('gradual') ? 0.72 : 1,
    [activeDam?.lng ?? 78.4806, activeDam?.lat ?? 30.3778]
  );
  
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeSliderIndex((prev: number) => (prev + 1) % timeSteps.length);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeSteps.length, setTimeSliderIndex]);

  const currentStep = timeSteps[timeSliderIndex] || timeSteps[0];
  const isSimulated = Boolean(simulationResult);
  const downstreamLocations = activeDataset?.downstreamLocations || activeDataset?.downstreamSettlements || [];

  const handleDatasetChange = (datasetId: string) => {
    setActiveDatasetId(datasetId);
    const target = allDatasets.find((d: any) => d.id === datasetId) || allDatasets[0];
    if (target?.dam) {
      setWaterLevel(target.dam.normalWaterLevel || target.dam.height);
    }
  };

  const handleRunSimulation = () => {
    if (!activeDataset) {
      setCurrentPage('run-simulation');
      return;
    }
    setScenario({
      ...scenario,
      id: `scen-${activeDataset.id}-run`,
      dam: activeDataset.dam,
      failureType: failureType as any,
      reservoirLevel: waterLevel,
      breachWidth,
      breachFormationTime: breachTime,
      simulationDuration: simDuration,
      name: activeDataset.isDam === false 
        ? (activeDataset.defaultScenarioName || activeDataset.name)
        : `${activeDataset.dam.name} — ${failureType}`,
    });
    setSimulationStatus('running');
    setCurrentPage('run-simulation');
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6 text-[#0B1F3A]">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Top Command Center Header */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#0B1F3A]">Hydrodynamic Flood Command Center</h1>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono uppercase tracking-wide border ${
                activeMode === 'real'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                {activeMode === 'real' ? 'REAL DATA MODE' : 'DEMO MODE'}
              </span>
              <span className="text-xs bg-blue-50 text-[#1677FF] border border-blue-200 px-2 py-0.5 rounded font-mono">
                Model: {simulationResult?.model || selectedModel}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Active Basin: {activeDataset ? (
                activeDataset.isDam === false ? (
                  <span><strong className="text-slate-700">{activeDataset.name}</strong> • <strong className="text-slate-700">{activeDataset.riverSystem}</strong> ({activeDataset.state})</span>
                ) : (
                  <span><strong className="text-slate-700">{activeDataset.dam?.name || activeDataset.name}</strong> on <strong className="text-slate-700">{activeDataset.dam?.river || activeDataset.riverSystem}</strong> ({activeDataset.dam?.basin || activeDataset.state})</span>
                )
              ) : (
                <span className="text-amber-700 font-semibold">No Dataset Selected — Choose a basin from the selector or ingest custom data</span>
              )} • SIH Problem Statement ID 26161
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
              <Database size={16} className="text-blue-600" />
              <label htmlFor="dashboard-dataset-select" className="sr-only">Switch River Basin Dataset</label>
              <select
                id="dashboard-dataset-select"
                aria-label="Switch River Basin Dataset"
                value={activeDataset?.id || ''}
                onChange={(e) => handleDatasetChange(e.target.value)}
                className="text-xs font-semibold bg-transparent border-none text-slate-800 focus:outline-none cursor-pointer"
              >
                {!activeDataset && (
                  <option value="" disabled>-- Select a River Basin Dataset --</option>
                )}
                {allDatasets.map((ds: any) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.dropdownLabel || (ds.isDam === false ? `${ds.name} (${ds.state})` : `${ds.dam?.name || ds.name} — ${ds.dam?.river || ds.riverSystem || 'River'} (${ds.state})`)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setCurrentPage('data-input')}
              className="text-xs px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-medium text-slate-700 transition-colors shadow-2xs"
            >
              Dataset QA ({qualityReport?.overallQuality || 'Valid'})
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white shadow-sm border border-slate-200 rounded-xl flex items-center space-x-3 border-t-4 border-t-[#1677FF]">
            <div className="p-2.5 bg-blue-50 text-[#1677FF] rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Target Dam</p>
              <p className="font-bold text-sm text-[#0B1F3A]">{activeDam?.name || 'No Dam Selected'}</p>
              <p className="text-xs text-slate-500">{activeDam ? `${activeDam.state} (H: ${activeDam.height}m)` : 'Real Data Mode'}</p>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-4 bg-white shadow-sm border border-slate-200 rounded-xl flex items-center space-x-3 border-t-4 border-t-[#20C4D9]">
            <div className="p-2.5 bg-cyan-50 text-[#20C4D9] rounded-lg">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">River Reach</p>
              <p className="font-bold text-sm text-[#0B1F3A]">{activeDam?.river || 'Select Basin'}</p>
              <p className="text-xs text-slate-500">{activeDam?.basin || 'Data Ingestion'}</p>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-4 bg-white shadow-sm border border-slate-200 rounded-xl flex items-center space-x-3 border-t-4 border-t-[#EAB308]">
            <div className="p-2.5 bg-amber-50 text-[#EAB308] rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Scenario</p>
              <p className="font-bold text-sm text-[#0B1F3A] truncate max-w-[130px]">{scenario?.name || 'Dam Break'}</p>
              <p className="text-xs text-slate-500">{scenario?.type || 'DAM_BREAK'}</p>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-4 bg-white shadow-sm border border-slate-200 rounded-xl flex items-center space-x-3 border-t-4 border-t-[#F97316]">
            <div className="p-2.5 bg-orange-50 text-[#F97316] rounded-lg">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Peak Discharge</p>
              <p className="font-bold text-sm text-[#0B1F3A]">
                {simulationResult?.peakDischarge ? `${simulationResult.peakDischarge.toLocaleString()} m³/s` : '18,500 m³/s'}
              </p>
              <p className="text-xs text-slate-500">Hydrograph Crest</p>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-4 bg-white shadow-sm border border-slate-200 rounded-xl flex items-center space-x-3 border-t-4 border-t-[#EF4444]">
            <div className="p-2.5 bg-rose-50 text-[#EF4444] rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Population Exposed</p>
              <p className="font-bold text-sm text-[#0B1F3A]">
                {simulationResult?.populationAffected ? `~${(simulationResult.populationAffected / 100000).toFixed(1)} Lakh` : '~2.1 Lakh'}
              </p>
              <p className="text-xs text-slate-500">Downstream Catchment</p>
            </div>
          </motion.div>
        </div>

        {/* 3-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 min-h-[640px]">
          
          {/* LEFT: Scenario Quick Configuration */}
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-[320px] bg-white shadow-sm border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2 text-[#0B1F3A]">
                <Activity className="w-4 h-4 text-blue-600" /> Scenario Parameterization
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700">SIH 26161</span>
            </div>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Scenario Type</label>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 font-semibold flex items-center justify-between">
                  <span>{scenario?.name || (activeDam ? `${activeDam.name} Dam Break` : 'Dam Break Scenario')}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">
                    {scenario?.type || 'DAM_BREAK'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Failure Mechanism</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Sudden Failure', 'Overtopping', 'Piping Breach', 'High Release'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFailureType(type)}
                      className={`py-1.5 px-2 rounded text-[11px] font-medium border text-left transition-colors ${
                        failureType === type 
                          ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-semibold mb-1">
                  <span>Reservoir Elevation</span>
                  <span className="text-[#1677FF] font-bold font-mono">{waterLevel} m MSL</span>
                </div>
                <input 
                  type="range" 
                  min={activeDam?.height ? Math.round(activeDam.height * 0.5) : 100} 
                  max={activeDam?.maxReservoirLevel || 900} 
                  value={waterLevel} 
                  onChange={(e) => setWaterLevel(Number(e.target.value))} 
                  className="w-full accent-blue-600" 
                />
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck size={12} className="text-emerald-500" /> Max Crest: {activeDam?.maxReservoirLevel || activeDam?.height || 835}m
                </span>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-semibold mb-1">
                  <span>Breach Width</span>
                  <span className="text-[#1677FF] font-bold font-mono">{breachWidth} m</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="250" 
                  value={breachWidth} 
                  onChange={(e) => setBreachWidth(Number(e.target.value))} 
                  className="w-full accent-blue-600" 
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-semibold mb-1">
                  <span>Breach Time</span>
                  <span className="text-[#1677FF] font-bold font-mono">{breachTime} hrs</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="4" 
                  step="0.1" 
                  value={breachTime} 
                  onChange={(e) => setBreachTime(Number(e.target.value))} 
                  className="w-full accent-blue-600" 
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-semibold mb-1">
                  <span>Simulation Duration</span>
                  <span className="text-[#1677FF] font-bold font-mono">{simDuration} hrs</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="24" 
                  value={simDuration} 
                  onChange={(e) => setSimDuration(Number(e.target.value))} 
                  className="w-full accent-blue-600" 
                />
              </div>
            </div>

            <div className="mt-auto pt-3 border-t border-slate-200">
              <button 
                onClick={handleRunSimulation}
                className="w-full py-2.5 bg-[#1677FF] hover:bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Zap size={14} /> RUN HYDRODYNAMIC SIMULATION
              </button>
            </div>
          </motion.div>

          {/* CENTER: GIS Map & Timeline Slider */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-4">
            <div className="flex-1 bg-white shadow-sm rounded-xl overflow-hidden relative border border-slate-200 min-h-[460px]">
              <FloodMap timeStep={timeSteps[timeSliderIndex]} dam={activeDam} locations={downstreamLocations} />
            </div>
            
            {/* Simulation Timeline Slider */}
            <div className="bg-white shadow-sm rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  className="p-2.5 bg-[#1677FF] text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                  aria-label={isPlaying ? 'Pause timeline animation' : 'Play timeline animation'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <div className="flex-1 px-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span className="font-mono">T = {currentStep.time} hrs ({Math.round(currentStep.time * 60)} min)</span>
                    <span className="text-slate-400 font-mono">T_max = {simDuration} hrs</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={timeSteps.length - 1} 
                    value={timeSliderIndex} 
                    onChange={(e) => {
                      setTimeSliderIndex(Number(e.target.value));
                      setIsPlaying(false);
                    }}
                    className="w-full accent-blue-600" 
                  />
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => { setIsPlaying(false); setTimeSliderIndex((prev: number) => Math.max(0, prev - 1)); }} 
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700"
                    aria-label="Previous step"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { setIsPlaying(false); setTimeSliderIndex((prev: number) => Math.min(timeSteps.length - 1, prev + 1)); }} 
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700"
                    aria-label="Next step"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Hydrodynamic Summary & Downstream Settlements */}
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-[300px] flex flex-col gap-4">
            <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-5">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
                <h2 className="text-base font-bold text-[#0B1F3A]">Hydrodynamic Output</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  isSimulated ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {simulationStatus.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Inundation Area</p>
                  <p className="text-xl font-bold text-[#1677FF] mt-0.5">
                    {currentStep.inundationArea} <span className="text-xs font-normal text-slate-500">km²</span>
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Peak Water Depth</p>
                  <p className="text-xl font-bold text-[#20C4D9] mt-0.5">
                    {currentStep.maxDepth} <span className="text-xs font-normal text-slate-500">m</span>
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Maximum Flow Velocity</p>
                  <p className="text-xl font-bold text-[#EAB308] mt-0.5">
                    {currentStep.maxVelocity} <span className="text-xs font-normal text-slate-500">m/s</span>
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Lead Arrival Time</p>
                  <p className="text-xl font-bold text-[#EF4444] mt-0.5">
                    T+ {simulationResult?.arrivalTime || 3.4} <span className="text-xs font-normal text-slate-500">hrs</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className={`p-2 rounded text-[10px] font-mono leading-relaxed text-center ${
                    simulationResult?.isDemoSimulation 
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  }`}>
                    {simulationResult?.isDemoSimulation 
                      ? 'DEMO / MOCK HYDRODYNAMIC DATA' 
                      : 'REAL HYDRODYNAMIC SOLVER OUTPUT'}
                  </div>
                </div>
              </div>
            </div>

            {/* Downstream Settlements Table */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-5 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <h2 className="text-base font-bold text-[#0B1F3A] flex items-center gap-1.5">
                  <Building2 size={16} className="text-slate-600" /> Downstream Catchments
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">{downstreamLocations.length} Points</span>
              </div>

              <div className="space-y-2.5">
                {downstreamLocations.map((loc: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                    <div className="font-bold text-xs text-[#0B1F3A] flex justify-between">
                      <span>{loc.name}</span>
                      <span className="text-rose-600 font-mono">{loc.maxDepth}m</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between mt-1">
                      <span>Distance: {loc.distance} km</span>
                      <span className="font-mono text-blue-700">ETA: {loc.arrivalTime}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
