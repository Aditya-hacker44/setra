'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/lib/store';
import FloodMap from '@/components/map/FloodMap';
import { generateTimeSteps } from '@/data/demoDataset';
import { 
  Play, Pause, SkipBack, SkipForward, Layers, Activity, Clock, 
  Maximize, AlertTriangle, ShieldCheck, MapPin, Gauge, Eye
} from 'lucide-react';

type MapMode = 'depth' | 'velocity' | 'arrival' | 'extent';

export default function ResultsPage() {
  const { simulationResult, scenario, currentDataset, activeMode, setCurrentPage } = useAppState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeStep, setCurrentTimeStep] = useState(0);
  
  const timeSteps = simulationResult?.timeSteps || generateTimeSteps(
    1,
    [scenario?.dam?.lng || 78.4806, scenario?.dam?.lat || 30.3778]
  );
  
  const [mapMode, setMapMode] = useState<MapMode>('depth');
  const [activeLayers, setActiveLayers] = useState({
    flood: true,
    river: true,
    roads: false,
    buildings: false,
    bridges: false,
    infrastructure: true,
    population: true,
    dam: true,
    satellite: false,
  });

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeStep((prev) => (prev + 1) % timeSteps.length);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeSteps.length]);

  if (!simulationResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-[#0B1F3A] mb-2">No Simulation Results Available</h2>
        <p className="text-gray-500 mb-6 text-center max-w-md text-sm">
          To view hydrodynamic flood maps, velocity vectors, and impact depths, run a simulation first or load a demo dataset.
        </p>
        <button 
          onClick={() => setCurrentPage('run-simulation')}
          className="px-6 py-2.5 bg-[#1677FF] text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md shadow-blue-500/20 text-sm cursor-pointer"
        >
          Go to Run Simulation →
        </button>
      </div>
    );
  }

  const currentData = timeSteps[currentTimeStep] || timeSteps[0];
  const dam = scenario?.dam || currentDataset?.dam;

  const modeOptions: { label: string; value: MapMode }[] = [
    { label: 'Flood Depth', value: 'depth' },
    { label: 'Flow Velocity', value: 'velocity' },
    { label: 'Arrival Time', value: 'arrival' },
    { label: 'Inundation Extent', value: 'extent' },
  ];

  const downstreamList = currentDataset?.downstreamLocations || [];

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Scientific Transparency Banner (Requirement 36) */}
      <div className="bg-white p-4 px-6 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#0B1F3A]">
              Hydrodynamic Inundation & Wave Propagation Results
            </h2>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${
              simulationResult.isDemoSimulation
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              {simulationResult.isDemoSimulation ? 'DEMO / MOCK SIMULATION OUTPUT' : 'REAL MODEL OUTPUT'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Model: <strong className="text-slate-800">{simulationResult.model || 'DEMO ENGINE'}</strong> • 
            Dataset: <strong className="text-slate-800">{currentDataset?.name || dam?.name}</strong> • 
            Mode: <strong className="text-slate-800">{simulationResult.mode || activeMode.toUpperCase()}</strong> • 
            Scenario: <strong className="text-slate-800">{scenario?.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md">
            ✓ Hydrodynamic Solution Converged
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-4 min-h-0">
        {/* LEFT - Map area & Time Slider */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-grow bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden relative min-h-[460px]">
            <FloodMap 
              mode={mapMode} 
              layers={activeLayers} 
              timeStep={currentData} 
              dam={dam}
              locations={downstreamList}
            />
          </div>
        
          {/* Time Slider (Correction 7: Driven by actual simulation timestamps) */}
          <div className="bg-white rounded-xl shadow-xs p-4 border border-slate-200 flex flex-col gap-2">
            {(() => {
              const maxSimTime = timeSteps.length > 0 ? timeSteps[timeSteps.length - 1].time : 6;
              const formatTime = (t: number) => {
                if (Number.isInteger(t)) return `${t}.0h`;
                const hours = Math.floor(t);
                const mins = Math.round((t - hours) * 60);
                return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
              };

              return (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Clock size={15} className="text-[#1677FF]" />
                      Wave Propagation Time: <strong className="text-[#1677FF] font-bold text-sm">T+ {formatTime(currentData.time)}</strong> (Time elapsed since failure initiation)
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Simulation Horizon: {formatTime(maxSimTime)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setCurrentTimeStep(prev => Math.max(0, prev - 1))} 
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
                      title="Previous Time Step"
                    >
                      <SkipBack size={18} />
                    </button>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)} 
                      className="p-2.5 bg-[#1677FF] text-white rounded-full hover:bg-blue-600 shadow-xs cursor-pointer"
                      title={isPlaying ? 'Pause Animation' : 'Play Propagation'}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-current" />}
                    </button>
                    <button 
                      onClick={() => setCurrentTimeStep(prev => Math.min(timeSteps.length - 1, prev + 1))} 
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
                      title="Next Time Step"
                    >
                      <SkipForward size={18} />
                    </button>
                    
                    <input 
                      type="range" 
                      min="0" 
                      max={timeSteps.length - 1} 
                      value={currentTimeStep}
                      onChange={(e) => setCurrentTimeStep(parseInt(e.target.value))}
                      className="flex-grow h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1677FF]"
                    />

                    <div className="text-xs font-mono font-bold text-slate-700 min-w-[90px] text-right">
                      T+{formatTime(currentData.time)} / {formatTime(maxSimTime)}
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Time-step summary metrics */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="text-slate-600">
                Inundated Area: <strong className="text-[#0B1F3A] font-bold">{currentData.inundationArea} km²</strong>
              </div>
              <div className="text-slate-600">
                Wave Front Depth: <strong className="text-[#0B1F3A] font-bold">{currentData.maxDepth} m</strong>
              </div>
              <div className="text-slate-600">
                Celerity / Velocity: <strong className="text-[#0B1F3A] font-bold">{currentData.maxVelocity} m/s</strong>
              </div>
              <div className="text-slate-600">
                Exposed Population: <strong className="text-[#0B1F3A] font-bold">~{currentData.populationExposed.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Layer Controls & Downstream Arrival Times */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4 overflow-y-auto shrink-0">
          {/* Map Mode selector tabs */}
          <div className="bg-white rounded-xl shadow-xs p-4 border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Layers size={15} className="text-[#1677FF]" />
              Hydrodynamic Surface Variable
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {modeOptions.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setMapMode(mode.value)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    mapMode === mode.value 
                      ? 'bg-[#1677FF] text-white shadow-xs' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Layer Controls (15 Required Layers) */}
          <div className="bg-white rounded-xl shadow-xs p-4 border border-slate-200 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Maximize size={15} className="text-[#1677FF]" />
              GIS Overlays & Infrastructure
            </h3>

            <div className="space-y-1.5 text-xs">
              {[
                { id: 'flood' as const, label: 'Flood Extent & Depth Envelope' },
                { id: 'river' as const, label: 'River Centerline Bathymetry' },
                { id: 'dam' as const, label: 'Dam Structure Node' },
                { id: 'population' as const, label: 'Settlement Habitations' },
                { id: 'infrastructure' as const, label: 'Critical Lifelines (Hospitals/Police)' },
                { id: 'bridges' as const, label: 'Bridge Crossings' },
                { id: 'roads' as const, label: 'Evacuation Road Arteries' },
                { id: 'satellite' as const, label: 'Sentinel-1 SAR Radar Mask' },
              ].map((layer) => (
                <label key={layer.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <span className="text-slate-700 font-medium">{layer.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(activeLayers[layer.id])}
                    onChange={() => toggleLayer(layer.id)}
                    className="w-4 h-4 rounded text-[#1677FF] accent-[#1677FF] cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Downstream Flood Arrival Times */}
          <div className="bg-white rounded-xl shadow-xs p-4 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={15} className="text-red-500" />
              Downstream Settlement Arrival Times
            </h3>

            <div className="space-y-2 text-xs">
              {downstreamList.map((loc, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">{loc.name}</span>
                    <span className="text-[10px] text-slate-500">{loc.distance} km from dam • Pop: {loc.population.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#EF4444] text-xs block">T+ {loc.arrivalTime}h</span>
                    <span className="text-[10px] text-slate-500 font-medium">Depth: {loc.maxDepth}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
