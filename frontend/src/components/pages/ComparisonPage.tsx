'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Map, Filter, Activity, ArrowRight, Check, Layers, Cpu, GitCompare } from 'lucide-react';
import { useAppState } from '@/lib/store';
import { 
  defaultScenario, 
  gradualScenario, 
  blockageScenario, 
  normalReleaseScenario,
  highReleaseScenario,
  defaultImpactData, 
  gradualImpactData, 
  blockageImpactData, 
  scenarioComparison 
} from '@/data/demoDataset';
import { simulateFloodScenario } from '@/lib/simulationEngine';

export default function ComparisonPage() {
  const { 
    scenario, setScenario, 
    setSimulationResult, setSimulationStatus, 
    setCurrentTimeStep, setCurrentPage,
    currentDataset, engineStatuses
  } = useAppState();

  const [compareTab, setCompareTab] = useState<'scenarios' | 'models'>('scenarios');
  const [syncMapViews, setSyncMapViews] = useState(true);

  const scenarios = [
    { 
      id: 'scenarioA', 
      name: 'Scenario A: Instantaneous Dam Break', 
      desc: 'Catastrophic sudden structural breach', 
      color: '#EF4444',
      scenarioObj: defaultScenario,
      area: 235,
      depth: 8.4,
      velocity: 6.2,
      discharge: 18500,
      arrival: 3.4,
      population: 210000,
      buildings: 12450,
      roads: 87,
      bridges: 14
    },
    { 
      id: 'scenarioB', 
      name: 'Scenario B: Gradual Piping Breach', 
      desc: 'Progressive erosion failure over 2 hours', 
      color: '#F97316',
      scenarioObj: gradualScenario,
      area: 168,
      depth: 5.8,
      velocity: 4.1,
      discharge: 9200,
      arrival: 5.2,
      population: 142000,
      buildings: 8200,
      roads: 62,
      bridges: 9
    },
    { 
      id: 'scenarioC', 
      name: 'Scenario C: Landslide Lake Outburst', 
      desc: 'Debris dam breach / river blockage', 
      color: '#EAB308',
      scenarioObj: blockageScenario,
      area: 95,
      depth: 4.2,
      velocity: 3.5,
      discharge: 6800,
      arrival: 2.8,
      population: 85000,
      buildings: 4800,
      roads: 35,
      bridges: 5
    },
  ];

  // Chart data for visual comparison
  const chartData = [
    { name: 'Inundation Area (km²)', ScenarioA: 235, ScenarioB: 168, ScenarioC: 95 },
    { name: 'Max Depth (m)', ScenarioA: 8.4, ScenarioB: 5.8, ScenarioC: 4.2 },
    { name: 'Max Velocity (m/s)', ScenarioA: 6.2, ScenarioB: 4.1, ScenarioC: 3.5 },
    { name: 'Peak Outflow (100 m³/s)', ScenarioA: 185, ScenarioB: 92, ScenarioC: 68 },
    { name: 'Arrival Time (hrs)', ScenarioA: 3.4, ScenarioB: 5.2, ScenarioC: 2.8 },
  ];

  const handleSelectScenarioToView = async (sc: typeof scenarios[0]) => {
    const result = await simulateFloodScenario(sc.scenarioObj, currentDataset);
    setScenario(sc.scenarioObj);
    setSimulationResult(result);
    setSimulationStatus('completed');
    setCurrentTimeStep(0);
    setCurrentPage('results');
  };

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto p-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Multi-Scenario & Model Comparison</h1>
            <span className="text-xs bg-blue-100 text-[#1677FF] font-bold px-2 py-0.5 rounded">
              SIH Problem Statement 26161
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Compare hydrodynamic metrics across failure mechanisms and solver architectures for <strong className="text-slate-800">{currentDataset?.dam.name}</strong>.
          </p>
        </div>
        
        {/* Sub-Tabs: Scenarios vs Models */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setCompareTab('scenarios')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              compareTab === 'scenarios' ? 'bg-[#0B1F3A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scenario A vs B vs C
          </button>
          <button
            onClick={() => setCompareTab('models')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              compareTab === 'models' ? 'bg-[#0B1F3A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SPH vs Delft3D vs Demo
          </button>
        </div>
      </div>

      {/* VIEW 1: SCENARIO COMPARISON (A vs B vs C) */}
      {compareTab === 'scenarios' && (
        <div className="space-y-6">
          {/* 3 Scenario Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scenarios.map((sc, idx) => {
              const isSelected = scenario?.id === sc.scenarioObj.id;
              return (
                <motion.div
                  key={sc.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-white rounded-xl shadow-xs border p-5 flex flex-col justify-between transition-all ${
                    isSelected ? 'border-[#1677FF] ring-1 ring-[#1677FF]' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ backgroundColor: `${sc.color}15`, color: sc.color }}>
                        {sc.name.split(':')[0]}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-[#1677FF] bg-blue-50 px-2 py-0.5 rounded">
                          CURRENTLY LOADED
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[#0B1F3A]">{sc.name.split(':')[1] || sc.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{sc.desc}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Inundation Area:</span>
                        <strong className="text-slate-800">{sc.area} km²</strong>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Max Depth:</span>
                        <strong className="text-slate-800">{sc.depth} m</strong>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Max Velocity:</span>
                        <strong className="text-slate-800">{sc.velocity} m/s</strong>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Peak Discharge:</span>
                        <strong className="text-slate-800">{sc.discharge} m³/s</strong>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Devprayag Arrival:</span>
                        <strong className="text-red-600 font-bold">T+ {sc.arrival} hrs</strong>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Exposed Population:</span>
                        <strong className="text-slate-800">~{sc.population.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectScenarioToView(sc)}
                    className="mt-4 w-full py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-[#1677FF] text-slate-700 hover:text-[#1677FF] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Load & View on Map</span>
                    <ArrowRight size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Comparison Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider">
              Cross-Scenario Normalized Hydrodynamic Metrics
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="ScenarioA" name="Instantaneous Failure" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ScenarioB" name="Gradual Piping Failure" fill="#F97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ScenarioC" name="Landslide Lake Outburst" fill="#EAB308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Full Tabular Matrix */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider">
                Full Hydrodynamic & HADR Comparative Metrics Matrix
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Evaluation Metric</th>
                    <th className="p-3 text-red-600">Scenario A (Instantaneous)</th>
                    <th className="p-3 text-amber-600">Scenario B (Gradual Piping)</th>
                    <th className="p-3 text-yellow-600">Scenario C (River Blockage)</th>
                    <th className="p-3">Scientific Significance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Peak Inundation Area</td>
                    <td className="p-3 font-bold text-red-600">235 km²</td>
                    <td className="p-3">168 km² (-28.5%)</td>
                    <td className="p-3">95 km² (-59.6%)</td>
                    <td className="p-3 text-slate-500">Maximum spatial floodplain envelope</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Maximum Wave Depth</td>
                    <td className="p-3 font-bold text-red-600">8.4 m</td>
                    <td className="p-3">5.8 m</td>
                    <td className="p-3">4.2 m</td>
                    <td className="p-3 text-slate-500">Governs structural collapse threshold</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Maximum Flow Velocity</td>
                    <td className="p-3 font-bold text-red-600">6.2 m/s</td>
                    <td className="p-3">4.1 m/s</td>
                    <td className="p-3">3.5 m/s</td>
                    <td className="p-3 text-slate-500">High kinetic scour & erosion risk</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Peak Breach Outflow</td>
                    <td className="p-3 font-bold text-red-600">18,500 m³/s</td>
                    <td className="p-3">9,200 m³/s</td>
                    <td className="p-3">6,800 m³/s</td>
                    <td className="p-3 text-slate-500">Peak hydrograph crest value</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Flood Wave Arrival Time (Sangam)</td>
                    <td className="p-3 font-bold text-red-600">3.4 hrs</td>
                    <td className="p-3">5.2 hrs (+53% warning window)</td>
                    <td className="p-3">2.8 hrs (Steep gorge channel)</td>
                    <td className="p-3 text-slate-500">Available civil evacuation window</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Exposed Population</td>
                    <td className="p-3 font-bold text-red-600">~2,10,000</td>
                    <td className="p-3">~1,42,000</td>
                    <td className="p-3">~85,000</td>
                    <td className="p-3 text-slate-500">Demographic exposure under envelope</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">Disrupted Road Corridors</td>
                    <td className="p-3 font-bold text-red-600">87 km (NH-94/58)</td>
                    <td className="p-3">62 km</td>
                    <td className="p-3">35 km</td>
                    <td className="p-3 text-slate-500">HADR supply chain accessibility</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MODEL COMPARISON (SPH vs Delft3D vs Demo Engine) (Requirement 15) */}
      {compareTab === 'models' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#1677FF]" />
              Hydrodynamic Model Architecture Comparison
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Scientific comparison between Smooth Particle Hydrodynamics (SPH), Delft3D Flexible Mesh, and SETRA Calibrated Engine.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Feature / Dimension</th>
                  <th className="p-3.5 text-blue-700">SPH (Smoothed Particle Hydrodynamics)</th>
                  <th className="p-3.5 text-cyan-700">Delft3D Flexible Mesh (D-Flow FM)</th>
                  <th className="p-3.5 text-slate-800">SETRA Calibrated Engine (Demo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold">Local Engine Status</td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      {engineStatuses?.sph?.status || 'ENGINE_NOT_CONFIGURED'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      {engineStatuses?.delft3d?.status || 'ENGINE_NOT_CONFIGURED'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      AVAILABLE & CALIBRATED
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold">Mathematical Formulation</td>
                  <td className="p-3.5">Lagrangian mesh-free Navier-Stokes particle tracking</td>
                  <td className="p-3.5">Eulerian 2D depth-averaged shallow water equations</td>
                  <td className="p-3.5">Parametric 2D shallow water wave routing solution</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold">Primary Strength</td>
                  <td className="p-3.5">Violent free-surface wave breaking & near-field dam crest collapse</td>
                  <td className="p-3.5">Long-reach floodplain routing across hundred-kilometer river corridors</td>
                  <td className="p-3.5">Rapid emergency decision-support & instantaneous response</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold">Grid / Resolution</td>
                  <td className="p-3.5">Particle spacing (0.5m – 2m)</td>
                  <td className="p-3.5">Unstructured curvilinear flexible mesh (10m – 30m)</td>
                  <td className="p-3.5">CartoDEM 30m regular grid</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold">Computational Cost</td>
                  <td className="p-3.5">Extremely High (GPU multi-core cluster required)</td>
                  <td className="p-3.5">High (Multi-threaded HPC nodes)</td>
                  <td className="p-3.5">Real-time / Instantaneous</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold">Current Real Results</td>
                  <td className="p-3.5 text-slate-400 italic">Configure SPH_ENGINE_PATH to load real SPH run</td>
                  <td className="p-3.5 text-slate-400 italic">Configure DELFT3D_PATH to load real Delft3D run</td>
                  <td className="p-3.5 font-bold text-emerald-600">Calibrated results active</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
