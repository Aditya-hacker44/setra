'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, CheckCircle2, Loader2, Cpu, Activity, Eye, AlertTriangle, 
  Terminal, ShieldCheck, RotateCcw, ArrowRight, XCircle
} from 'lucide-react';
import { useAppState } from '@/lib/store';
import { simulateFloodScenario } from '@/lib/simulationEngine';
import { calculateValidation } from '@/lib/validationEngine';
import { JobLogEntry } from '@/types';

export default function RunSimulationPage() {
  const { 
    scenario, currentDataset, simulationStatus, 
    setSimulationStatus, setSimulationResult, 
    setValidationResults, setCurrentPage,
    activeMode, setActiveMode,
    selectedModel, setSelectedModel,
    engineStatuses,
    simulationLogs, addSimulationLog, clearSimulationLogs
  } = useAppState();

  const [activeStep, setActiveStep] = useState<number>(-1);
  const [failedStepIndex, setFailedStepIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [engineNotConfiguredError, setEngineNotConfiguredError] = useState<string | null>(null);

  const hasSph = Boolean(engineStatuses?.sph?.isAvailable);
  const hasDelft3D = Boolean(engineStatuses?.delft3d?.isAvailable);
  const hasRealEngine = hasSph || hasDelft3D;

  // Exact 6-Stage Pipeline per SIH Hydrodynamic Simulation Protocol & Correction 6
  const steps = [
    { id: 'mesh', label: '1. Mesh Generation', description: 'Generating computational shallow water mesh and metric projected UTM grid' },
    { id: 'boundary', label: '2. Boundary Condition Setup', description: 'Configuring inflow hydrograph, dynamic dam breach weir, and stage-discharge curves' },
    { id: 'hydro', label: '3. Hydrodynamic Propagation', description: 'Solving 2D depth-averaged shallow water equations and shock-capturing wave front' },
    { id: 'wse', label: '4. Water Surface Elevation Solver', description: 'Computing dynamic water surface elevations, inundation depth envelope, and velocity field' },
    { id: 'hazard', label: '5. Hazard Calculation', description: 'Computing hazard intensity rating (depth × velocity) and downstream critical infrastructure exposure' },
    { id: 'results', label: '6. Result Post-Processing', description: 'Compiling standardized GeoJSON polygons, arrival contours, and export packages' },
  ];

  const handleStartSimulation = async () => {
    if (!scenario) return;
    setEngineNotConfiguredError(null);
    setFailedStepIndex(null);
    clearSimulationLogs();

    const now = () => new Date().toLocaleTimeString();

    // Check Real Data Mode enforcement (Requirements 1, 2, 3, 10, 11)
    if (activeMode === 'real') {
      if (!currentDataset) {
        const msg = 'DATASET NOT SELECTED: A real river basin dataset must be selected before starting simulation.';
        setEngineNotConfiguredError(msg);
        addSimulationLog({ timestamp: now(), level: 'ERROR', message: `REAL SIMULATION BLOCKED: No river basin dataset selected.` });
        return;
      }
      if (selectedModel === 'demo') {
        const msg = 'INVALID SOLVER: Demo Engine cannot be used in Real Data Mode. Only native SPH or Delft3D engines are supported.';
        setEngineNotConfiguredError(msg);
        addSimulationLog({ timestamp: now(), level: 'ERROR', message: `REAL SIMULATION BLOCKED: Demo Engine is prohibited in Real Data Mode.` });
        return;
      }
      const isSelectedModelAvailable = selectedModel === 'sph' ? hasSph : hasDelft3D;
      if (!isSelectedModelAvailable) {
        const modelUpper = selectedModel.toUpperCase();
        const msg = `REAL SIMULATION BLOCKED: ${modelUpper} is NOT CONFIGURED. Install native ${
          selectedModel === 'sph' ? 'PySPH / DualSPHysics' : 'Deltares Delft3D-FM'
        } solver binary to run real hydrodynamic simulations.`;
        setEngineNotConfiguredError(msg);
        addSimulationLog({
          timestamp: now(),
          level: 'ERROR',
          message: `REAL SIMULATION BLOCKED: ${modelUpper} solver is not configured.`
        });
        return;
      }
    }

    setIsRunning(true);
    setSimulationStatus('running');
    setActiveStep(0);
    setProgress(5);

    addSimulationLog({ timestamp: now(), level: 'INFO', message: `Job initialized. Model: ${selectedModel.toUpperCase()} | Mode: ${activeMode.toUpperCase()}` });
    addSimulationLog({ timestamp: now(), level: 'INFO', message: `Dataset: ${currentDataset?.name || 'Sample Basin'} | Scenario: ${scenario.name}` });

    try {
      const result = await simulateFloodScenario(
        scenario, 
        currentDataset,
        selectedModel,
        activeMode,
        (step, stepIndex) => {
          setProgress(step.progress || 0);
          setActiveStep(stepIndex);
          if (step.progress === 100) {
            addSimulationLog({
              timestamp: now(),
              level: 'INFO',
              message: `Completed: ${step.label}`
            });
          }
        }
      );

      setSimulationResult(result);
      const val = calculateValidation(result, currentDataset || undefined);
      setValidationResults(val);

      addSimulationLog({
        timestamp: now(),
        level: 'SUCCESS',
        message: `Peak Inundation Extent: ${result.inundationArea} km² | Max Depth: ${result.maxDepth}m | Arrival: ${result.arrivalTime}h`
      });

      setIsRunning(false);
      setSimulationStatus('completed');
      setActiveStep(steps.length);
      setProgress(100);

    } catch (error: any) {
      console.error("Simulation failed:", error);
      setIsRunning(false);
      setSimulationStatus('failed');
      setEngineNotConfiguredError(error.message || 'Simulation execution failed');
      addSimulationLog({
        timestamp: now(),
        level: 'ERROR',
        message: error.message || 'Simulation execution error'
      });
    }
  };

  const handleSwitchToDemoAndRun = () => {
    setActiveMode('demo');
    setSelectedModel('demo');
    setEngineNotConfiguredError(null);
    setTimeout(() => {
      handleStartSimulation();
    }, 100);
  };

  const isCompleted = simulationStatus === 'completed';

  return (
    <div className="w-full h-full bg-[#F0F4F8] overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-[#0B1F3A] pt-8 pb-20 px-6 lg:px-8 text-white">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                <Cpu className="w-6 h-6 text-[#20C4D9]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Hydrodynamic Simulation Engine</h1>
                <p className="text-xs text-blue-200/80 mt-0.5">
                  Execute 2D hydrodynamic solvers for Indian dam & river basins
                </p>
              </div>
            </div>

            {/* Operating Mode Indicator */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-xs">
              <span className="text-slate-300">Mode:</span>
              <strong className={activeMode === 'demo' ? 'text-[#20C4D9]' : 'text-emerald-400 font-bold'}>
                {activeMode === 'demo' ? 'DEMO MODE' : 'REAL DATA MODE'}
              </strong>
            </div>
          </div>

          {/* Scenario & Model Selection Card */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {activeMode === 'demo' ? (
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold rounded uppercase tracking-wider border border-amber-400/30">
                      DEMO MODE
                    </span>
                    <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-300 font-mono text-[10px] font-bold rounded uppercase tracking-wider border border-cyan-400/30">
                      Output: DEMONSTRATION / MOCK DATA
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    Sample Dataset: {currentDataset?.name || 'No Dataset Selected'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 bg-white/10 rounded text-[11px] font-medium border border-white/10">
                      {currentDataset?.isDam === false ? 'Source' : 'Dam'}: {currentDataset?.dam?.name || '—'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-white/10 rounded text-[11px] font-medium border border-white/10">
                      River: {currentDataset?.riverSystem || currentDataset?.dam?.river || '—'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-white/10 rounded text-[11px] font-medium border border-white/10">
                      Model: Demo Engine
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#20C4D9]/20 text-[#20C4D9] rounded text-[11px] font-bold border border-[#20C4D9]/30 capitalize">
                      {scenario?.failureType || 'instantaneous'} Failure
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-300 font-mono text-[10px] font-bold rounded uppercase tracking-wider border border-emerald-400/30">
                      Mode: REAL DATA MODE
                    </span>
                    <span className="px-2 py-0.5 bg-blue-400/20 text-blue-300 font-mono text-[10px] font-bold rounded uppercase tracking-wider border border-blue-400/30">
                      Model: {selectedModel.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    Active Dataset: {currentDataset ? currentDataset.name : 'NO DATASET SELECTED'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {currentDataset?.isDam === false ? (
                      <>
                        <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-200 rounded text-[11px] font-bold border border-amber-400/30">
                          Hazard: {currentDataset.hazardTypeDescription || 'Avalanche / Debris Flow'}
                        </span>
                        <span className="px-2.5 py-0.5 bg-white/10 rounded text-[11px] font-medium border border-white/10">
                          Event: {currentDataset.eventDate || '7 February 2021'}
                        </span>
                        <span className="px-2.5 py-0.5 bg-white/10 rounded text-[11px] font-medium border border-white/10">
                          Source: {currentDataset.sourceLocation?.name || 'Ronti Peak (~5,500m MSL)'}
                        </span>
                        <span className="px-2.5 py-0.5 bg-white/10 rounded text-[11px] font-medium border border-white/10">
                          River System: {currentDataset.riverSystem || 'Ronti Gad → Rishiganga → Dhauliganga'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="px-2.5 py-0.5 bg-white/10 rounded text-[11px] font-medium border border-white/10">
                          Dam: {currentDataset ? currentDataset.dam.name : '—'}
                        </span>
                        <span className="px-2.5 py-0.5 bg-white/10 rounded text-[11px] font-medium border border-white/10">
                          River: {currentDataset ? currentDataset.dam.river : '—'}
                        </span>
                      </>
                    )}
                    <span className="px-2.5 py-0.5 bg-white/10 rounded text-[11px] font-medium border border-white/10">
                      DEM: {currentDataset ? (currentDataset.demResolution || 'CartoDEM / SRTM 30m') : '—'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-white/10 rounded text-[11px] font-medium border border-white/10">
                      CRS: {currentDataset ? (currentDataset.modelCrs || currentDataset.sourceCrs || 'EPSG:32644 (UTM 44N)') : '—'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-white/10 rounded text-[11px] font-medium border border-white/10">
                      Hydrological Data: {currentDataset ? (currentDataset.hydrologicalSeries ? (currentDataset.citation || 'CWC Inflow Telemetry') : 'DATA NOT AVAILABLE (Ungauged)') : '—'}
                    </span>
                    {currentDataset && (
                      <span className="px-2.5 py-0.5 bg-[#20C4D9]/20 text-[#20C4D9] rounded text-[11px] font-bold border border-[#20C4D9]/30 capitalize">
                        {currentDataset.isDam === false ? 'Avalanche / Debris Flow' : `${scenario?.failureType || 'instantaneous'} Failure`}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Model Engine Selector (Requirements 2, 3) */}
              <div className="space-y-1">
                <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">
                  Select Modelling Engine:
                </span>
                {activeMode === 'demo' ? (
                  <div className="bg-[#061224] rounded-lg p-1 flex gap-1 shadow-inner border border-white/10">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-md text-xs font-bold bg-[#20C4D9] text-[#0B1F3A] shadow-md cursor-default"
                    >
                      Demo Engine (Calibrated)
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#061224] rounded-lg p-1 flex gap-1 shadow-inner border border-white/10">
                    {[
                      { 
                        id: 'delft3d' as const, 
                        label: 'Delft3D', 
                        isAvailable: hasDelft3D,
                        status: hasDelft3D ? 'CONFIGURED' : 'NOT CONFIGURED'
                      },
                      { 
                        id: 'sph' as const, 
                        label: 'SPH', 
                        isAvailable: hasSph,
                        status: hasSph ? 'CONFIGURED' : 'NOT CONFIGURED'
                      },
                    ].map(model => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          if (model.isAvailable) {
                            setSelectedModel(model.id);
                          } else {
                            setEngineNotConfiguredError(
                              `${model.label} ENGINE NOT CONFIGURED: Install native solver binaries (${
                                model.id === 'delft3d' ? 'Deltares Delft3D-FM' : 'PySPH / DualSPHysics'
                              }) and configure backend environment path to enable real execution.`
                            );
                          }
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          selectedModel === model.id 
                            ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>{model.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          model.isAvailable ? 'bg-emerald-900/60 text-emerald-300' : 'bg-red-950/80 text-red-300'
                        }`}>
                          {model.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Execution Container */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 -mt-10 pb-16 space-y-6">
        {/* REAL MODEL ENGINE NOT CONFIGURED Banner (Requirement 2) */}
        {activeMode === 'real' && !hasRealEngine && (
          <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-6 text-red-950 shadow-md space-y-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-red-900 uppercase tracking-wide">
                  REAL MODEL ENGINE NOT CONFIGURED
                </h3>
                <p className="text-xs text-red-800 font-semibold mt-0.5">
                  Real Data Mode requires a validated local or server installation of a certified hydrodynamic solver engine.
                </p>
              </div>
            </div>
            <div className="bg-white/80 rounded-xl p-3 border border-red-200 text-xs font-mono space-y-1 text-slate-800">
              <div className="flex justify-between items-center font-bold">
                <span>Available Solvers:</span>
              </div>
              <div className="flex justify-between items-center pl-2">
                <span>• SPH:</span>
                <span className="font-bold text-red-700">NOT CONFIGURED</span>
              </div>
              <div className="flex justify-between items-center pl-2">
                <span>• Delft3D:</span>
                <span className="font-bold text-red-700">NOT CONFIGURED</span>
              </div>
            </div>
            <p className="text-xs text-red-800 leading-relaxed">
              In accordance with SIH Problem Statement 26161 scientific transparency guidelines, SETRA never generates fake SPH or Delft3D outputs. Real hydrodynamic compute is blocked until a real engine is available. You can switch to Demo Mode to evaluate the platform with calibrated demonstration data.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleSwitchToDemoAndRun}
                className="px-4 py-2 bg-[#0B1F3A] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Switch to Demo Mode (Sample Dataset)</span>
              </button>
            </div>
          </div>
        )}

        {/* DATASET NOT SELECTED Alert (Requirement 1, 10) */}
        {activeMode === 'real' && !currentDataset && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6 text-amber-950 shadow-md space-y-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-amber-900 uppercase tracking-wide">
                  DATASET NOT SELECTED
                </h3>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">
                  Real Data Mode cannot run without an ingested and validated river basin dataset.
                </p>
              </div>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Please select a river basin dataset from the Dashboard or ingest custom DEM, river geometry, and dam structure data in Data Ingestion before executing a real simulation.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setCurrentPage('data-input')}
                className="px-4 py-2 bg-[#1677FF] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowRight size={14} />
                <span>Go to Data Ingestion</span>
              </button>
            </div>
          </div>
        )}

        {/* Other Diagnostic Notice if explicit error occurred */}
        {engineNotConfiguredError && activeMode === 'demo' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6 text-amber-950 shadow-md space-y-3"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-amber-900 uppercase tracking-wide">
                  Modelling Engine Notice
                </h3>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">
                  {engineNotConfiguredError}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8 space-y-8">
          {/* Simulation Stages Pipeline */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Hydrodynamic Pipeline Execution Stages
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {steps.map((step, index) => {
                const isFailed = failedStepIndex === index;
                const isAborted = failedStepIndex !== null && index > failedStepIndex;
                const isPast = (activeStep > index || isCompleted) && !isFailed && !isAborted;
                const isCurrent = activeStep === index && !isFailed;

                return (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isFailed ? 'bg-red-50 border-red-300 ring-1 ring-red-300' :
                      isAborted ? 'bg-slate-50 border-slate-200 opacity-40' :
                      isPast ? 'bg-emerald-50/50 border-emerald-200' :
                      isCurrent ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-300' :
                      'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isFailed ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : isPast ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-[#1677FF] animate-spin" />
                      ) : isAborted ? (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-slate-200" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-bold ${
                          isFailed ? 'text-red-900' :
                          isAborted ? 'text-slate-400' :
                          isPast ? 'text-emerald-900' :
                          isCurrent ? 'text-blue-900' :
                          'text-slate-600'
                        }`}>
                          {step.label}
                        </h4>
                        {isFailed && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-800 uppercase">
                            FAILED HERE
                          </span>
                        )}
                        {isAborted && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 uppercase">
                            ABORTED
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isFailed ? 'text-red-700 font-medium' : isAborted ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isFailed && engineNotConfiguredError 
                          ? engineNotConfiguredError.split('.')[0] + '.'
                          : step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real Simulation Job Logs Terminal (Requirement 26) */}
          <div className="bg-[#061224] rounded-xl p-4 text-white font-mono text-xs shadow-inner space-y-2 border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-slate-400 text-[11px]">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-[#20C4D9]" />
                <span className="font-bold uppercase tracking-wider text-slate-300">Simulation Job System Logs</span>
              </div>
              <span>Progress: {progress}%</span>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto pt-1">
              {simulationLogs.length === 0 ? (
                <p className="text-slate-500 italic">Ready to run simulation. Click "START SIMULATION" to launch hydrodynamic job.</p>
              ) : (
                simulationLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-500">[{log.timestamp}]</span>
                    <span className={
                      log.level === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                      log.level === 'WARNING' ? 'text-amber-400 font-semibold' :
                      log.level === 'ERROR' ? 'text-red-400 font-bold' :
                      'text-slate-300'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-col items-center justify-center pt-2">
            {!isRunning && !isCompleted && (
              activeMode === 'real' ? (
                !currentDataset ? (
                  <button
                    disabled
                    className="bg-slate-300 text-slate-500 px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2.5 cursor-not-allowed opacity-85 shadow-none"
                    title="Real simulation blocked: select or ingest a river basin dataset first"
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span>REAL SIMULATION BLOCKED — DATASET NOT SELECTED</span>
                  </button>
                ) : !hasRealEngine ? (
                  <button
                    disabled
                    className="bg-slate-300 text-slate-500 px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2.5 cursor-not-allowed opacity-85 shadow-none"
                    title="Real simulation blocked: real hydrodynamic solver not configured"
                  >
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span>REAL SIMULATION BLOCKED — SOLVER NOT CONFIGURED</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartSimulation}
                    className="bg-[#1677FF] hover:bg-blue-600 text-white px-10 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>START REAL HYDRODYNAMIC SIMULATION</span>
                  </button>
                )
              ) : (
                <button
                  onClick={handleStartSimulation}
                  className="bg-[#1677FF] hover:bg-blue-600 text-white px-10 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>START HYDRODYNAMIC SIMULATION (DEMO)</span>
                </button>
              )
            )}

            {isRunning && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0B1F3A]">
                  <Loader2 className="w-5 h-5 animate-spin text-[#1677FF]" />
                  <span>Computing Hydrodynamic Wave Routing ({progress}%)...</span>
                </div>
                <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1677FF] transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 text-sm font-bold">
                  <CheckCircle2 size={18} />
                  <span>SIMULATION COMPLETED SUCCESSFULLY</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSimulationStatus('idle');
                      setProgress(0);
                      setActiveStep(-1);
                    }}
                    className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Re-run Simulation
                  </button>
                  <button
                    onClick={() => setCurrentPage('results')}
                    className="px-8 py-2.5 bg-[#20C4D9] hover:bg-cyan-500 text-[#0B1F3A] font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Eye size={16} />
                    <span>VIEW RESULTS & FLOOD MAPS</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
