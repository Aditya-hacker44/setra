'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings2, Save, Zap, Mountain, AlertTriangle, Activity, 
  Droplets, Ruler, Timer, FileEdit, CheckCircle2, ChevronDown, ChevronUp, Play,
  Waves, Gauge, ShieldAlert
} from 'lucide-react';
import { useAppState } from '@/lib/store';
import { dams, defaultScenario } from '@/data/demoDataset';
import { ScenarioType, FailureType } from '@/types';

export default function ScenarioSetupPage() {
  const { currentDataset, activeMode, loadDemoDataset, scenario, setScenario, setCurrentPage, setSimulationStatus } = useAppState();
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const isAvalancheDataset = currentDataset?.hazardType === 'AVALANCHE_DEBRIS_FLOW' || currentDataset?.isDam === false;
  const initialType: ScenarioType = isAvalancheDataset ? 'avalanche-debris-flow' : (scenario?.type || 'dam-break');
  const [scenarioType, setScenarioType] = useState<ScenarioType>(initialType);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const activeDam = currentDataset?.dam || (activeMode === 'demo' ? dams[0] : (scenario?.dam?.id !== 'unselected-dam' && scenario?.dam ? scenario.dam : {
    id: 'unselected-dam',
    name: 'No Dam Selected',
    state: '—',
    river: '—',
    basin: '—',
    height: 0,
    reservoirLevel: 0,
    maxReservoirLevel: 0,
    reservoirVolume: 0,
    spillwayCapacity: 0,
    lat: 20.5937,
    lng: 78.9629,
  }));

  // Form values with provenance
  const [formData, setFormData] = useState({
    name: scenario?.name || (isAvalancheDataset ? (currentDataset?.defaultScenarioName || '2021 Chamoli Rishi Ganga Event') : `${activeDam.name} — Overtopping Failure Scenario`),
    failureType: (scenario?.failureType || 'instantaneous') as FailureType,
    failureTrigger: scenario?.failureTrigger || (isAvalancheDataset ? 'Rock-Ice Avalanche Detachment (~27M m³)' : 'Extreme Inflow / PMF Exceedance'),
    reservoirLevel: scenario?.reservoirLevel || activeDam.reservoirLevel || (isAvalancheDataset ? 0 : 830),
    breachWidth: scenario?.breachWidth || 100,
    breachDepth: scenario?.breachDepth || 80,
    breachFormationTime: scenario?.breachFormationTime || 0.5,
    
    // Natural Lake / Blockage fields
    lakeArea: scenario?.naturalLake?.lakeAreaKm2 || 14.5,
    lakeStorage: scenario?.naturalLake?.estimatedStorageMCM || 185.0,
    blockageLocation: scenario?.naturalLake?.breachLocation || 'Rishikesh Valley Narrows',
    releaseCondition: scenario?.naturalLake?.releaseCondition || 'Erosive Overtopping Breach',
    
    // Controlled release fields
    gateCount: scenario?.controlledRelease?.gateCount || 4,
    dischargeCusecs: scenario?.controlledRelease?.dischargeCusecs || 1450,
    downstreamChannelCapacity: scenario?.controlledRelease?.downstreamChannelCapacity || 4500,

    // Surge fields
    surgeIntensityMm: 65,
    catchmentRunoffCoeff: 0.78,

    // Avalanche & Debris Flow fields
    detachmentVolumeMCM: scenario?.avalancheDebris?.detachmentVolumeMCM || 27.0,
    rockIceRatio: scenario?.avalancheDebris?.rockIceRatio || '80:20 (Granite-Gneiss & Glacial Ice)',
    initialVelocityMs: scenario?.avalancheDebris?.initialVelocityMs || 45.0,
    valleyEntrainmentFactor: scenario?.avalancheDebris?.valleyEntrainmentFactor || 1.85,
    triggerMechanism: scenario?.avalancheDebris?.triggerMechanism || 'Permafrost Degradation & Wedge Failure (~5,500m MSL)',

    // Numerical solver grid
    manningCoefficient: scenario?.manningCoefficient || 0.035,
    gridResolution: scenario?.gridResolution || 30,
    timestep: scenario?.timestep || 10,
    simulationDuration: scenario?.simulationDuration || 6,
  });

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScenarioTypeSelect = (type: ScenarioType) => {
    setScenarioType(type);
    let title = `${activeDam.name} — `;
    if (type === 'dam-break') title += `${formData.failureType.charAt(0).toUpperCase() + formData.failureType.slice(1)} Dam Break`;
    else if (type === 'river-blockage') title += 'Landslide Lake Outburst (GLOF/LLOF)';
    else if (type === 'normal-release') title += 'Normal Controlled Spillway Release';
    else if (type === 'high-release') title += 'Emergency High Spillway Release';
    else if (type === 'water-surge') title += 'Sudden Cloudburst Runoff Surge';
    else if (type === 'avalanche-debris-flow') title = currentDataset?.defaultScenarioName || '2021 Chamoli Rishi Ganga Event';
    handleInputChange('name', title);
  };

  const handleSaveScenario = (runAfter = false) => {
    if (!currentDataset && activeMode === 'demo') {
      loadDemoDataset();
    }
    const updated = {
      ...scenario,
      id: scenario?.id || `SCENARIO-${Date.now()}`,
      name: formData.name,
      type: scenarioType,
      hazardType: scenarioType === 'avalanche-debris-flow' ? 'AVALANCHE_DEBRIS_FLOW' : undefined,
      dam: activeDam,
      datasetId: currentDataset?.id || '',
      failureType: formData.failureType,
      failureTrigger: formData.failureTrigger,
      failureTriggerProvenance: 'SCENARIO ASSUMPTION' as const,
      reservoirLevel: Number(formData.reservoirLevel),
      reservoirLevelProvenance: Number(formData.reservoirLevel) === activeDam.reservoirLevel ? 'DATASET VALUE' as const : 'USER SUPPLIED' as const,
      breachWidth: Number(formData.breachWidth),
      breachWidthProvenance: 'SCENARIO ASSUMPTION' as const,
      breachDepth: Number(formData.breachDepth),
      breachFormationTime: Number(formData.breachFormationTime),
      breachFormationTimeProvenance: 'SCENARIO ASSUMPTION' as const,
      manningCoefficient: Number(formData.manningCoefficient),
      gridResolution: Number(formData.gridResolution),
      timestep: Number(formData.timestep),
      simulationDuration: Number(formData.simulationDuration),
      status: 'ready' as const,
      createdAt: new Date().toISOString(),
      naturalLake: scenarioType === 'river-blockage' ? {
        lakeAreaKm2: Number(formData.lakeArea),
        estimatedStorageMCM: Number(formData.lakeStorage),
        breachLocation: formData.blockageLocation,
        releaseCondition: formData.releaseCondition,
        provenance: 'SCENARIO ASSUMPTION' as const
      } : undefined,
      controlledRelease: (scenarioType === 'normal-release' || scenarioType === 'high-release') ? {
        gateCount: Number(formData.gateCount),
        dischargeCusecs: Number(formData.dischargeCusecs),
        downstreamChannelCapacity: Number(formData.downstreamChannelCapacity),
        isSpillwayOvertopping: scenarioType === 'high-release'
      } : undefined,
      avalancheDebris: scenarioType === 'avalanche-debris-flow' ? {
        detachmentVolumeMCM: Number(formData.detachmentVolumeMCM),
        rockIceRatio: formData.rockIceRatio,
        initialVelocityMs: Number(formData.initialVelocityMs),
        valleyEntrainmentFactor: Number(formData.valleyEntrainmentFactor),
        triggerMechanism: formData.triggerMechanism,
      } : undefined,
    };
    setScenario(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    if (runAfter) {
      setSimulationStatus('idle');
      setCurrentPage('run-simulation');
    }
  };

  return (
    <div className="w-full h-full p-4 lg:p-6 bg-[#F0F4F8] overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-4 gap-2">
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A] flex items-center gap-3">
              <Settings2 className="w-7 h-7 text-[#1677FF]" />
              Scenario Setup & Boundary Conditions
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Configure hydrodynamic breach parameters, controlled discharges, and numerical grid for <strong className="text-slate-700">{isAvalancheDataset ? currentDataset?.name : activeDam.name}</strong> ({isAvalancheDataset ? currentDataset?.riverSystem : activeDam.river}).
            </p>
          </div>
          <span className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-md font-semibold">
            Central Water Commission Guidelines
          </span>
        </div>

        {/* 6 Scenario Types Selector */}
        <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Select Hydrodynamic Scenario Type (Problem Statement 26161)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { id: 'dam-break' as const, label: '1. Dam Break', icon: Zap, desc: 'Breach outflow wave' },
              { id: 'normal-release' as const, label: '2. Normal Release', icon: Waves, desc: 'Controlled gates' },
              { id: 'high-release' as const, label: '3. High Release', icon: Gauge, desc: 'Emergency spillway' },
              { id: 'river-blockage' as const, label: '4. River Blockage', icon: Mountain, desc: 'Landslide lake outburst' },
              { id: 'water-surge' as const, label: '5. Water Surge', icon: ShieldAlert, desc: 'Sudden runoff pulse' },
              { id: 'avalanche-debris-flow' as const, label: '6. Avalanche / Debris', icon: Mountain, desc: 'Glacial detachment surge' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleScenarioTypeSelect(tab.id)}
                className={`p-3 rounded-lg flex flex-col items-start gap-1 transition-all text-left cursor-pointer border ${
                  scenarioType === tab.id
                    ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <tab.icon size={15} />
                  <span>{tab.label}</span>
                </div>
                <span className={`text-[10px] ${scenarioType === tab.id ? 'text-blue-200' : 'text-slate-400'}`}>
                  {tab.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLS: Configuration Form */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Scenario Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Scenario Identification & Title
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                />
              </div>

              {/* Dynamic Form Sections based on Scenario Type */}

              {/* 1. DAM BREAK CONFIGURATION (Requirement 8) */}
              {scenarioType === 'dam-break' && (
                <div className="space-y-6 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Dam Break Parameters & Breach Dimensions
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      Froehlich Outflow Equations
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Failure Type */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Failure Type</label>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          SCENARIO ASSUMPTION
                        </span>
                      </div>
                      <select
                        value={formData.failureType}
                        onChange={(e) => handleInputChange('failureType', e.target.value)}
                        className="w-full p-2 border rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                      >
                        <option value="instantaneous">Instantaneous Failure (Sudden Collapse)</option>
                        <option value="gradual">Gradual Failure (Progressive Erosion)</option>
                        <option value="overtopping">Overtopping Failure (Spillway Crest)</option>
                        <option value="piping">Piping Failure (Seepage Void)</option>
                        <option value="partial">Partial Breach</option>
                      </select>
                    </div>

                    {/* Failure Trigger */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Failure Trigger</label>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          SCENARIO ASSUMPTION
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formData.failureTrigger}
                        onChange={(e) => handleInputChange('failureTrigger', e.target.value)}
                        className="w-full p-2 border rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                      />
                    </div>

                    {/* Reservoir Level */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Initial Reservoir Level (m MSL)</label>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          DATASET VALUE (FRL: {activeDam.maxReservoirLevel}m)
                        </span>
                      </div>
                      <input
                        type="number"
                        value={formData.reservoirLevel}
                        onChange={(e) => handleInputChange('reservoirLevel', Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                      />
                    </div>

                    {/* Breach Width */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Breach Width (meters)</label>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          SCENARIO ASSUMPTION
                        </span>
                      </div>
                      <input
                        type="number"
                        value={formData.breachWidth}
                        onChange={(e) => handleInputChange('breachWidth', Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                      />
                    </div>

                    {/* Breach Formation Time */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Breach Formation Time (hours)</label>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          SCENARIO ASSUMPTION
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.breachFormationTime}
                        onChange={(e) => handleInputChange('breachFormationTime', Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                      />
                    </div>

                    {/* Simulation Duration */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Simulation Horizon (hours)</label>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          USER SUPPLIED
                        </span>
                      </div>
                      <input
                        type="number"
                        value={formData.simulationDuration}
                        onChange={(e) => handleInputChange('simulationDuration', Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. NATURAL LAKE / RIVER BLOCKAGE (Requirement 9) */}
              {scenarioType === 'river-blockage' && (
                <div className="space-y-6 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
                      <Mountain className="w-4 h-4 text-emerald-600" />
                      Natural Dam / Landslide Lake Break Parameters
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      GLOF / Landslide Dam Outburst
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Lake Area (km²)</label>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          SCENARIO ASSUMPTION
                        </span>
                      </div>
                      <input
                        type="number"
                        value={formData.lakeArea}
                        onChange={(e) => handleInputChange('lakeArea', Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Estimated Water Storage (MCM)</label>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          SCENARIO ASSUMPTION
                        </span>
                      </div>
                      <input
                        type="number"
                        value={formData.lakeStorage}
                        onChange={(e) => handleInputChange('lakeStorage', Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Breach Location</label>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          USER SUPPLIED
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formData.blockageLocation}
                        onChange={(e) => handleInputChange('blockageLocation', e.target.value)}
                        className="w-full p-2 border rounded-md text-xs font-medium"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Release Condition</label>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          SCENARIO ASSUMPTION
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formData.releaseCondition}
                        onChange={(e) => handleInputChange('releaseCondition', e.target.value)}
                        className="w-full p-2 border rounded-md text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3 & 4. NORMAL & HIGH WATER RELEASE (Requirement 7) */}
              {(scenarioType === 'normal-release' || scenarioType === 'high-release') && (
                <div className="space-y-6 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-blue-600" />
                      Controlled Spillway Gate Release Parameters
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      Standard Operating Procedure
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Operational Spillway Gates</label>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          DATASET VALUE
                        </span>
                      </div>
                      <input
                        type="number"
                        value={formData.gateCount}
                        onChange={(e) => handleInputChange('gateCount', Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Discharge Flow Rate (m³/s)</label>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          USER SUPPLIED
                        </span>
                      </div>
                      <input
                        type="number"
                        value={formData.dischargeCusecs}
                        onChange={(e) => handleInputChange('dischargeCusecs', Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Downstream Safe Bankfull Capacity (m³/s)</label>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          DATASET VALUE
                        </span>
                      </div>
                      <input
                        type="number"
                        value={formData.downstreamChannelCapacity}
                        onChange={(e) => handleInputChange('downstreamChannelCapacity', Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 5. SUDDEN WATER SURGE (Requirement 7) */}
              {scenarioType === 'water-surge' && (
                <div className="space-y-6 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      Sudden Flash Flood Runoff Pulse Parameters
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200">
                      Cloudburst Hydrograph
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Peak Rainfall Intensity (mm/hr)</label>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          SCENARIO ASSUMPTION
                        </span>
                      </div>
                      <input
                        type="number"
                        value={formData.surgeIntensityMm}
                        onChange={(e) => handleInputChange('surgeIntensityMm', Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Catchment Runoff Coefficient (C)</label>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          SCENARIO ASSUMPTION
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.catchmentRunoffCoeff}
                        onChange={(e) => handleInputChange('catchmentRunoffCoeff', Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 6. AVALANCHE & DEBRIS FLOW CONFIGURATION */}
              {scenarioType === 'avalanche-debris-flow' && (
                <div className="space-y-6 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
                      <Mountain className="w-4 h-4 text-amber-600" />
                      Avalanche / Debris Flow / Flash Flood Parameters
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      Ronti Peak Detachment & Flow Surge
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Detachment Volume (MCM)</label>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          SCIENTIFIC ESTIMATE (WIHG)
                        </span>
                      </div>
                      <input
                        type="number"
                        value={formData.detachmentVolumeMCM}
                        onChange={(e) => handleInputChange('detachmentVolumeMCM', Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Rock-to-Ice Ratio</label>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          OBSERVED LITHOLOGY
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formData.rockIceRatio}
                        onChange={(e) => handleInputChange('rockIceRatio', e.target.value)}
                        className="w-full p-2 border rounded-md text-xs font-medium"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Initial Flow Velocity (m/s)</label>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          NUMERICAL CALIBRATION
                        </span>
                      </div>
                      <input
                        type="number"
                        value={formData.initialVelocityMs}
                        onChange={(e) => handleInputChange('initialVelocityMs', Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Valley Bulk Entrainment Factor</label>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          DEBRIS RHEOLOGY
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.05"
                        value={formData.valleyEntrainmentFactor}
                        onChange={(e) => handleInputChange('valleyEntrainmentFactor', Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-xs font-semibold"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">Trigger Mechanism & Detachment Zone</label>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          GEOLOGICAL EVIDENCE
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formData.triggerMechanism}
                        onChange={(e) => handleInputChange('triggerMechanism', e.target.value)}
                        className="w-full p-2 border rounded-md text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Hydrodynamic Numerical Options */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-xs font-bold text-slate-700 py-1 hover:text-[#1677FF] cursor-pointer"
                >
                  <span>Advanced Numerical Grid & Manning Settings</span>
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showAdvanced && (
                  <div className="grid grid-cols-3 gap-4 pt-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Manning Roughness (n)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.manningCoefficient}
                        onChange={(e) => handleInputChange('manningCoefficient', Number(e.target.value))}
                        className="w-full p-2 border rounded-md font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Grid Resolution (m)</label>
                      <input
                        type="number"
                        value={formData.gridResolution}
                        onChange={(e) => handleInputChange('gridResolution', Number(e.target.value))}
                        className="w-full p-2 border rounded-md font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Timestep Δt (seconds)</label>
                      <input
                        type="number"
                        value={formData.timestep}
                        onChange={(e) => handleInputChange('timestep', Number(e.target.value))}
                        className="w-full p-2 border rounded-md font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleSaveScenario(false)}
                className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-[#0B1F3A] font-bold rounded-xl shadow-xs transition-all text-sm flex items-center gap-2 cursor-pointer"
              >
                <Save size={16} />
                <span>Save Scenario Parameters</span>
              </button>

              <button
                onClick={() => handleSaveScenario(true)}
                className="px-8 py-3 bg-[#1677FF] hover:bg-blue-600 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center gap-2 cursor-pointer"
              >
                <Play size={16} className="fill-current" />
                <span>Save & Proceed to Run Simulation</span>
              </button>
            </div>

            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2"
              >
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Scenario saved and registered for hydrodynamic compute.</span>
              </motion.div>
            )}
          </div>

          {/* RIGHT COL: Dam Specification & Provenance Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0B1F3A] border-b pb-2">
                Active Hydraulic Structure Specifications
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Dam Name:</span>
                  <strong className="text-slate-800">{activeDam.name}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">River Basin:</span>
                  <strong className="text-slate-800">{activeDam.river} ({activeDam.basin})</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Dam Height:</span>
                  <div className="text-right">
                    <strong className="text-slate-800 block">{activeDam.height} m</strong>
                    <span className="text-[9px] text-blue-600 font-bold">[DATASET VALUE]</span>
                  </div>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Full Reservoir Level (FRL):</span>
                  <div className="text-right">
                    <strong className="text-slate-800 block">{activeDam.maxReservoirLevel} m MSL</strong>
                    <span className="text-[9px] text-blue-600 font-bold">[DATASET VALUE]</span>
                  </div>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Gross Reservoir Storage:</span>
                  <div className="text-right">
                    <strong className="text-slate-800 block">{activeDam.reservoirVolume} MCM</strong>
                    <span className="text-[9px] text-blue-600 font-bold">[DATASET VALUE]</span>
                  </div>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Spillway Capacity:</span>
                  <div className="text-right">
                    <strong className="text-slate-800 block">{activeDam.spillwayCapacity || 15300} m³/s</strong>
                    <span className="text-[9px] text-blue-600 font-bold">[DATASET VALUE]</span>
                  </div>
                </div>
              </div>

              {/* Provenance Key */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] space-y-1">
                <span className="font-bold text-slate-700 block mb-1">Scientific Provenance Key:</span>
                <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>DATASET VALUE: CWC Verified Measurement</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>SCENARIO ASSUMPTION: Parametric Hypothesis</span>
                </div>
                <div className="flex items-center gap-1.5 text-purple-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>USER SUPPLIED: Operator Input</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
