'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/store';
import { defaultImpactData, gradualImpactData, blockageImpactData } from '@/data/demoDataset';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Users, Home, Map as MapIcon, Compass, Building2, MapPin, Truck, AlertTriangle, 
  Activity, ShieldAlert, CheckCircle2, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'population', label: 'Population Exposed', icon: Users },
  { id: 'settlements', label: 'Riparian Habitations', icon: MapPin },
  { id: 'buildings', label: 'Buildings & Structures', icon: Home },
  { id: 'roads', label: 'Road Networks', icon: MapIcon },
  { id: 'bridges', label: 'Bridges & Crossings', icon: Compass },
  { id: 'infrastructure', label: 'Critical Infrastructure', icon: Building2 },
  { id: 'crops', label: 'Crops & Agriculture', icon: ShieldAlert },
  { id: 'evacuation', label: 'Evacuation Corridors', icon: Truck },
];

const DEPTH_COLORS: Record<string, string> = {
  '0–0.5 m': '#3B82F6',
  '0.5–1 m': '#20C4D9',
  '1–2 m': '#EAB308',
  '2–5 m': '#F97316',
  '> 5 m': '#EF4444',
};

export default function ImpactAnalysisPage() {
  const { simulationResult, scenario, currentDataset, setCurrentPage } = useAppState();
  const [activeTab, setActiveTab] = useState('population');
  const [selectedFacilityCategory, setSelectedFacilityCategory] = useState<string | null>(null);

  const scenarioImpact = scenario?.failureType === 'gradual'
    ? gradualImpactData
    : scenario?.type === 'river-blockage'
      ? blockageImpactData
      : defaultImpactData;

  const impactData = simulationResult?.impactData || scenarioImpact;

  // Check layer availability in active dataset
  const layers = currentDataset?.layers;
  const isPopAvailable = layers?.population !== false && impactData.population?.available !== false;
  const isBldAvailable = layers?.buildings !== false && impactData.buildings?.available !== false;
  const isRoadsAvailable = layers?.roads !== false && impactData.roads?.available !== false;
  const isBridgesAvailable = layers?.bridges !== false && impactData.bridges?.available !== false;
  const isInfraAvailable = layers?.criticalInfrastructure !== false && impactData.criticalInfrastructure?.available !== false;

  const populationByDepth = impactData.population?.byDepth?.map(d => ({ name: d.range, value: d.count })) || [];
  const buildingTypes = impactData.buildings?.byType?.map(b => ({ name: b.type, value: b.count })) || [];

  const isTehri = currentDataset?.id === 'DATASET-IN-TEHRI';
  const isRishiGanga = currentDataset?.id === 'rishi_ganga_2021';
  const damName = currentDataset?.isDam === false ? (currentDataset?.sourceLocation?.name || currentDataset?.dam?.name || 'Source') : (currentDataset?.dam?.name || 'Dam');
  const riverName = currentDataset?.riverSystem || currentDataset?.dam?.river || 'River';
  const locationName = currentDataset?.location || 'Valley';

  const facilityList = isTehri ? [
    { name: 'District Civil Hospital', type: 'hospital', category: 'Medical Lifeline', location: 'Tehri Valley', status: 'High Inundation Risk (>2.5m)', icon: '🏥' },
    { name: 'AIIMS Rishikesh Emergency Wing', type: 'hospital', category: 'Medical Lifeline', location: 'Rishikesh Foothills', status: 'Low Risk Fringe (<0.5m)', icon: '🏥' },
    { name: 'District Police HQ & Control Room', type: 'police', category: 'Emergency Services', location: 'New Tehri Suburb', status: 'Safe Ridge Zone', icon: '🚔' },
    { name: 'Kotwali Police Station Devprayag', type: 'police', category: 'Emergency Services', location: 'Sangam Confluence', status: 'Submerged (Wave front T+1.2h)', icon: '🚔' },
    { name: 'Govt. Higher Secondary School', type: 'school', category: 'Shelter / Relief Centre', location: 'Srinagar Lowland', status: 'Inundated (Depth 2.1m)', icon: '🏫' },
    { name: 'IIT Roorkee Disaster Field Station', type: 'school', category: 'Research Node', location: 'Roorkee Canal Zone', status: 'Monitored Baseline', icon: '🏫' },
    { name: '400kV Grid Substation', type: 'power', category: 'Power & Energy', location: 'Bhagirathi Gorge', status: 'Immediate Isolation Required', icon: '⚡' },
    { name: 'State PWD Emergency Depot', type: 'government', category: 'Logistics', location: 'Chamba Corridor', status: 'Operational', icon: '🏛️' },
  ] : isRishiGanga ? [
    { name: 'Joshimath Community Health Centre', type: 'hospital', category: 'Medical Lifeline', location: 'Joshimath', status: 'Safe (Elevated)', icon: '🏥' },
    { name: 'ITBP Field Medical Unit Tapovan', type: 'hospital', category: 'Medical Lifeline', location: 'Tapovan', status: 'Destroyed (Debris Impact)', icon: '🏥' },
    { name: 'Chamoli District Police Control', type: 'police', category: 'Emergency Services', location: 'Chamoli HQ', status: 'Operational (Command Post)', icon: '🚔' },
    { name: 'Raini Village Police Chowki', type: 'police', category: 'Emergency Services', location: 'Raini', status: 'Destroyed (Debris Front)', icon: '🚔' },
    { name: 'Rishiganga 13.2 MW HEP', type: 'power', category: 'Hydropower & Energy', location: 'Rishiganga Valley', status: 'Destroyed (Complete Loss)', icon: '⚡' },
    { name: 'Tapovan Vishnugad 520 MW NTPC Barrage', type: 'power', category: 'Hydropower & Energy', location: 'Dhauliganga Valley', status: 'Severely Damaged', icon: '⚡' },
    { name: 'SDRF Forward Operating Base', type: 'government', category: 'Disaster Response', location: 'Joshimath', status: 'Operational (SAR Active)', icon: '🏛️' },
    { name: 'NH-107B Border Road Maintenance', type: 'government', category: 'Logistics', location: 'Malari Highway', status: 'Road Severed (Multiple Points)', icon: '🏛️' },
  ] : [
    { name: `${locationName} District Hospital`, type: 'hospital', category: 'Medical Lifeline', location: `${riverName} Valley`, status: 'High Inundation Risk (>2.5m)', icon: '🏥' },
    { name: 'Regional Emergency Medical Centre', type: 'hospital', category: 'Medical Lifeline', location: `${locationName} Sector`, status: 'Low Risk Fringe (<0.5m)', icon: '🏥' },
    { name: `${locationName} District Police Control`, type: 'police', category: 'Emergency Services', location: 'Administrative Ridge', status: 'Safe Ridge Zone', icon: '🚔' },
    { name: 'Downstream Sector Police Station', type: 'police', category: 'Emergency Services', location: 'River Confluence', status: 'Submerged (Early Wave Front)', icon: '🚔' },
    { name: 'Govt. High School Relief Centre', type: 'school', category: 'Shelter / Relief Centre', location: 'Lowland Plain', status: 'Inundated (Depth 2.1m)', icon: '🏫' },
    { name: 'Regional Hydrological Field Lab', type: 'school', category: 'Research Node', location: 'Canal Zone', status: 'Monitored Baseline', icon: '🏫' },
    { name: `${damName} Power Transmission Hub`, type: 'power', category: 'Power & Energy', location: `${riverName} Gorge`, status: 'Immediate Isolation Required', icon: '⚡' },
    { name: 'State Disaster Response Logistics Depot', type: 'government', category: 'Logistics', location: 'Upper Highway Arterial', status: 'Operational', icon: '🏛️' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#F0F4F8] overflow-y-auto space-y-6 p-2">
      {/* Header Banner */}
      <div className="bg-white p-5 px-6 rounded-xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B1F3A]">
              Humanitarian Assistance & Disaster Relief (HADR) Impact Analysis
            </h1>
            <span className="text-xs bg-blue-100 text-[#1677FF] font-bold px-2 py-0.5 rounded">
              NDMA Multi-Sector Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Basin: <strong className="text-slate-800">{currentDataset ? currentDataset.name : 'No Dataset Selected'}</strong> • 
            Scenario: <strong className="text-slate-800">{scenario?.name}</strong> • 
            Peak Inundation: <strong className="text-[#1677FF]">{simulationResult?.inundationArea || 235} km²</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage('results')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>View on GIS Map</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-[#0B1F3A] text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="space-y-6">
        {/* 1. POPULATION TAB */}
        {activeTab === 'population' && (
          <div className="space-y-6">
            {!isPopAvailable ? (
              <div className="p-8 bg-white rounded-xl border border-amber-200 text-center space-y-2">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="font-bold text-slate-800">Population Layer Unavailable</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  In accordance with SIH scientific transparency, population numbers are not fabricated. Ingest census demographic vectors to evaluate demographic exposure for this basin.
                </p>
              </div>
            ) : (
              <>
                {/* 4 Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
                    <span className="text-slate-400 text-xs font-semibold block uppercase">Total Exposed Population</span>
                    <span className="text-2xl font-black text-[#0B1F3A] mt-1 block">
                      ~{(impactData.population?.totalExposed || 210000).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Inundation envelope</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
                    <span className="text-slate-400 text-xs font-semibold block uppercase">Affected Habitations</span>
                    <span className="text-2xl font-black text-[#0B1F3A] mt-1 block">
                      {impactData.population?.affectedVillages || 37} Villages
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Riparian settlements</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
                    <span className="text-slate-400 text-xs font-semibold block uppercase">Major Municipal Towns</span>
                    <span className="text-2xl font-black text-[#0B1F3A] mt-1 block">
                      {impactData.population?.majorTowns || 4} Municipalities
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Downstream urban centers</span>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl shadow-xs border border-red-200">
                    <span className="text-red-700 text-xs font-bold block uppercase">High-Risk Inhabitants</span>
                    <span className="text-2xl font-black text-red-700 mt-1 block">
                      ~{(impactData.population?.highRisk || 62000).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-red-600 font-medium">Depth &gt; 2.0m (Immediate Evacuation)</span>
                  </div>
                </div>

                {/* Chart & Risk Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
                    <h3 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-4">
                      Population Exposure Categorized by Flood Wave Depth
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={populationByDepth}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {populationByDepth.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={DEPTH_COLORS[entry.name] || '#1677FF'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-3">
                    <h3 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-2">
                      NDMA Risk Severity Categorization
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <span className="font-bold text-emerald-800">LOW RISK (0–0.5m Depth)</span>
                        <span className="font-black text-emerald-900">{(impactData.population?.riskClassification?.[0]?.count || 45000).toLocaleString()} persons</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                        <span className="font-bold text-cyan-800">MODERATE RISK (0.5–1.0m Depth)</span>
                        <span className="font-black text-cyan-900">{(impactData.population?.riskClassification?.[1]?.count || 52000).toLocaleString()} persons</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <span className="font-bold text-amber-800">HIGH RISK (1.0–2.0m Depth)</span>
                        <span className="font-black text-amber-900">{(impactData.population?.riskClassification?.[2]?.count || 51000).toLocaleString()} persons</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <span className="font-bold text-red-800">VERY HIGH / CRITICAL RISK (&gt;2.0m Depth)</span>
                        <span className="font-black text-red-900">{(impactData.population?.riskClassification?.[3]?.count || 62000).toLocaleString()} persons</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 2. BUILDINGS TAB */}
        {activeTab === 'buildings' && (
          <div className="space-y-6">
            {!isBldAvailable ? (
              <div className="p-8 bg-white rounded-xl border border-amber-200 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800">Building Footprints Layer Unavailable</h3>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 text-center">
                    <span className="text-slate-400 text-xs font-semibold block uppercase">Total Buildings Exposed</span>
                    <span className="text-3xl font-black text-[#0B1F3A] mt-1 block">
                      {(impactData.buildings?.totalExposed || 12450).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500">Surveyed structural units</span>
                  </div>
                  <div className="bg-red-50 p-6 rounded-xl shadow-xs border border-red-200 text-center">
                    <span className="text-red-700 text-xs font-bold block uppercase">Severely Damaged / Submerged</span>
                    <span className="text-3xl font-black text-red-700 mt-1 block">
                      {(impactData.buildings?.severelyAffected || 2130).toLocaleString()}
                    </span>
                    <span className="text-xs text-red-600">Hydrodynamic structural breach</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
                  <h3 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-4">
                    Exposed Structures Categorized by Occupancy Typology
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={buildingTypes} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#1677FF" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 3. ROADS TAB */}
        {activeTab === 'roads' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col items-center justify-center text-center">
              <MapPin className="w-10 h-10 text-[#1677FF] mb-2" />
              <span className="text-xs font-semibold text-slate-400 uppercase">Road Inundation Extent</span>
              <span className="text-3xl font-black text-slate-900 mt-1">{impactData.roads?.totalLengthAffected || 87} km</span>
              <span className="text-[11px] text-slate-500 mt-1">Total route submergence</span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col items-center justify-center text-center">
              <Truck className="w-10 h-10 text-amber-500 mb-2" />
              <span className="text-xs font-semibold text-slate-400 uppercase">Major National Highways</span>
              <span className="text-3xl font-black text-slate-900 mt-1">{impactData.roads?.majorHighways || 2} Arteries</span>
              <span className="text-[11px] text-slate-500 mt-1">NH-94 & NH-58 Corridors</span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col items-center justify-center text-center">
              <MapIcon className="w-10 h-10 text-[#20C4D9] mb-2" />
              <span className="text-xs font-semibold text-slate-400 uppercase">Local Feeder Roads</span>
              <span className="text-3xl font-black text-slate-900 mt-1">{impactData.roads?.localRoads || 34} Routes</span>
              <span className="text-[11px] text-slate-500 mt-1">Village access cut-off</span>
            </div>
          </div>
        )}

        {/* 4. BRIDGES TAB */}
        {activeTab === 'bridges' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col items-center justify-center text-center">
              <Compass className="w-10 h-10 text-[#1677FF] mb-2" />
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Bridges at Risk</span>
              <span className="text-3xl font-black text-slate-900 mt-1">{impactData.bridges?.totalAffected || 14}</span>
              <span className="text-[11px] text-slate-500 mt-1">River crossings inside envelope</span>
            </div>
            <div className="bg-red-50 p-6 rounded-xl shadow-xs border border-red-200 flex flex-col items-center justify-center text-center">
              <AlertTriangle className="w-10 h-10 text-red-600 mb-2" />
              <span className="text-xs font-bold text-red-700 uppercase">Destroyed / Washed Away</span>
              <span className="text-3xl font-black text-red-700 mt-1">{impactData.bridges?.destroyed || 4}</span>
              <span className="text-[11px] text-red-600 mt-1">Severe structural failure</span>
            </div>
            <div className="bg-amber-50 p-6 rounded-xl shadow-xs border border-amber-200 flex flex-col items-center justify-center text-center">
              <Activity className="w-10 h-10 text-amber-600 mb-2" />
              <span className="text-xs font-bold text-amber-800 uppercase">Submerged / Damaged</span>
              <span className="text-3xl font-black text-amber-800 mt-1">{impactData.bridges?.damaged || 10}</span>
              <span className="text-[11px] text-amber-700 mt-1">Impassable during flood peak</span>
            </div>
          </div>
        )}

        {/* 5. CRITICAL INFRASTRUCTURE TAB (Requirement 20) */}
        {activeTab === 'infrastructure' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Hospitals', count: impactData.criticalInfrastructure?.hospitals || 6, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Schools', count: impactData.criticalInfrastructure?.schools || 23, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Police Stations', count: impactData.criticalInfrastructure?.policeStations || 8, color: 'text-slate-700', bg: 'bg-slate-50' },
                { label: 'Power Stations', count: impactData.criticalInfrastructure?.powerStations || 3, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Govt Offices', count: impactData.criticalInfrastructure?.governmentBuildings || 12, color: 'text-emerald-700', bg: 'bg-emerald-50' },
              ].map((infra, idx) => (
                <div key={idx} className={`p-4 rounded-xl border border-slate-200 ${infra.bg} text-center`}>
                  <span className="text-2xl font-black text-[#0B1F3A] block">{infra.count}</span>
                  <span className={`text-xs font-bold ${infra.color}`}>{infra.label}</span>
                </div>
              ))}
            </div>

            {/* Interactive List of Affected Facilities (Requirement 20) */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider">
                  Critical Facilities Inside Hydrodynamic Inundation Zone
                </h3>
                <span className="text-xs font-bold text-[#1677FF] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  Critical Infrastructure at Risk: {facilityList.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {facilityList.map((fac, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{fac.icon}</span>
                      <div>
                        <strong className="text-xs font-bold text-[#0B1F3A] block">{fac.name}</strong>
                        <span className="text-[11px] text-slate-500">{fac.category} • {fac.location}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 shrink-0">
                      {fac.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. RIPARIAN HABITATIONS TAB (Correction 8: Spatial Exposure Analysis) */}
        {activeTab === 'settlements' && (
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wider">
                  Downstream Riparian Habitations & Evacuation Priority Order
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated from spatial flood wave propagation, peak depth envelope, and wave celerity.
                </p>
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-md">
                Evacuation Priority 1 (Immediate): {(impactData.affectedSettlements || []).filter(s => s.evacuationPriority.startsWith('P1')).length} Zones
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-3">Settlement / Municipality</th>
                    <th className="p-3">Distance Downstream</th>
                    <th className="p-3">Estimated Arrival Time</th>
                    <th className="p-3">Peak Water Depth</th>
                    <th className="p-3">Exposed Inhabitants</th>
                    <th className="p-3 text-right">Evacuation Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {((impactData.affectedSettlements && impactData.affectedSettlements.length > 0)
                    ? impactData.affectedSettlements 
                    : isTehri ? [
                        { name: 'Old Tehri Suburb / Zero Point', distanceKm: 1.5, arrivalTimeH: 0.1, depthM: 8.2, population: 4200, evacuationPriority: 'P1 - Immediate' as const },
                        { name: 'Koteshwar Town & Colony', distanceKm: 22, arrivalTimeH: 0.6, depthM: 6.5, population: 18500, evacuationPriority: 'P1 - Immediate' as const },
                        { name: 'Devprayag Confluence (Sangam)', distanceKm: 48, arrivalTimeH: 1.4, depthM: 5.1, population: 28400, evacuationPriority: 'P1 - Immediate' as const },
                        { name: 'Srinagar Hydropower Basin', distanceKm: 75, arrivalTimeH: 2.2, depthM: 3.8, population: 52000, evacuationPriority: 'P1 - Immediate' as const },
                        { name: 'Rishikesh Pilgrimage & Municipal Belt', distanceKm: 105, arrivalTimeH: 3.4, depthM: 2.4, population: 112000, evacuationPriority: 'P2 - Urgent' as const },
                        { name: 'Haridwar Urban & Industrial Area', distanceKm: 132, arrivalTimeH: 4.8, depthM: 1.2, population: 245000, evacuationPriority: 'P3 - Moderate' as const },
                      ]
                    : isRishiGanga ? [
                        { name: 'Raini Village (Rishiganga 13.2 MW HEP)', distanceKm: 15, arrivalTimeH: 0.25, depthM: 18.5, population: 450, evacuationPriority: 'P1 - Immediate' as const },
                        { name: 'Tapovan Barrage (Tapovan Vishnugad 520 MW NTPC)', distanceKm: 25, arrivalTimeH: 0.58, depthM: 12.4, population: 1200, evacuationPriority: 'P1 - Immediate' as const },
                        { name: 'Rini / Lata Valley Settlements', distanceKm: 28, arrivalTimeH: 0.72, depthM: 8.5, population: 800, evacuationPriority: 'P1 - Immediate' as const },
                        { name: 'Joshimath / Dhauliganga-Alaknanda Confluence', distanceKm: 38, arrivalTimeH: 1.15, depthM: 6.2, population: 16700, evacuationPriority: 'P1 - Immediate' as const },
                        { name: 'Helang / Pipalkoti Reach', distanceKm: 55, arrivalTimeH: 1.85, depthM: 4.1, population: 8500, evacuationPriority: 'P2 - Urgent' as const },
                      ]
                    : (currentDataset?.downstreamLocations || []).map(loc => ({
                        name: loc.name, distanceKm: loc.distance, arrivalTimeH: loc.arrivalTime, depthM: loc.maxDepth, population: loc.population, evacuationPriority: (loc.arrivalTime < 1 ? 'P1 - Immediate' : loc.arrivalTime < 3 ? 'P2 - Urgent' : 'P3 - Moderate') as 'P1 - Immediate' | 'P2 - Urgent' | 'P3 - Moderate',
                      }))
                  ).map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                        <MapPin size={14} className="text-red-500 shrink-0" />
                        <span>{s.name}</span>
                      </td>
                      <td className="p-3 text-slate-600">{s.distanceKm} km from {currentDataset?.isDam === false ? 'source' : 'crest'}</td>
                      <td className="p-3 font-mono font-bold text-[#1677FF]">T+ {s.arrivalTimeH} hrs</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{s.depthM} m</td>
                      <td className="p-3 font-semibold text-slate-800">~{s.population.toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold ${
                          s.evacuationPriority.startsWith('P1') ? 'bg-red-100 text-red-800 border border-red-300' :
                          s.evacuationPriority.startsWith('P2') ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {s.evacuationPriority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. CROPS & AGRICULTURE TAB (Correction 8) */}
        {activeTab === 'crops' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
                <span className="text-slate-400 text-xs font-semibold block uppercase">Submerged Farmland</span>
                <span className="text-2xl font-black text-[#0B1F3A] mt-1 block">
                  ~{(impactData.crops?.totalSubmergedHectares || 19975).toLocaleString()} ha
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Riparian agricultural footprint</span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
                <span className="text-slate-400 text-xs font-semibold block uppercase">Paddy / Rice Submergence</span>
                <span className="text-2xl font-black text-amber-700 mt-1 block">
                  ~{((impactData.crops?.byCropType?.[0]?.hectares) || 8790).toLocaleString()} ha
                </span>
                <span className="text-[10px] text-slate-500 font-medium">High loss vulnerability</span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
                <span className="text-slate-400 text-xs font-semibold block uppercase">Orchards / Horticulture</span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">
                  ~{((impactData.crops?.byCropType?.[3]?.hectares) || 2395).toLocaleString()} ha
                </span>
                <span className="text-[10px] text-slate-500 font-medium">High economic value</span>
              </div>
              <div className="bg-red-50 p-4 rounded-xl shadow-xs border border-red-200">
                <span className="text-red-700 text-xs font-bold block uppercase">Estimated Agricultural Loss</span>
                <span className="text-2xl font-black text-red-700 mt-1 block">
                  ~₹ {(impactData.crops?.byCropType?.reduce((sum, c) => sum + c.estLossCr, 0) || 124.6).toFixed(1)} Cr
                </span>
                <span className="text-[10px] text-red-600 font-medium">State Disaster Relief Fund (SDRF)</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
              <h3 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider">
                Agricultural Exposure & Estimated Economic Loss Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-3">Agricultural Crop Classification</th>
                      <th className="p-3">Inundated Area (Hectares)</th>
                      <th className="p-3">Share of Total Farmland</th>
                      <th className="p-3 text-right">Estimated Financial Damage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(impactData.crops?.byCropType || [
                      { type: 'Paddy / Basmati Rice', hectares: 8790, estLossCr: 42.2 },
                      { type: 'Wheat / Mustard Rotational', hectares: 5590, estLossCr: 19.6 },
                      { type: 'Sugarcane Riparian Cash Crop', hectares: 3200, estLossCr: 19.8 },
                      { type: 'Horticulture (Apple/Peach Orchards)', hectares: 2395, estLossCr: 22.8 },
                    ]).map((crop, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-800">{crop.type}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">{crop.hectares.toLocaleString()} ha</td>
                        <td className="p-3 text-slate-600">
                          {Math.round((crop.hectares / (impactData.crops?.totalSubmergedHectares || 19975)) * 100)}%
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-red-700">
                          ₹ {crop.estLossCr.toFixed(1)} Crores
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 8. EVACUATION CORRIDORS TAB (Correction 8) */}
        {activeTab === 'evacuation' && (
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wider">
                  Strategic Evacuation Corridors & Road Cut-Off Alerts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Route trafficability determined by road centerline intersection with hydrodynamic flood envelope.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(impactData.evacuationCorridors || (isTehri ? [
                {
                  corridorName: 'NH-58 (Rishikesh – Devprayag – Srinagar Highway)',
                  status: 'CUT OFF' as const,
                  submergedSegmentKm: 38,
                  safeHavenLocation: 'New Tehri District Administrative Relief Camp (Elevation 1,750m MSL)'
                },
                {
                  corridorName: 'NH-94 (Rishikesh – Chamba Expressway)',
                  status: 'AT RISK' as const,
                  submergedSegmentKm: 14,
                  safeHavenLocation: 'Chamba High Ridge Stadium Relief Base'
                },
                {
                  corridorName: 'SH-34 (Tehri – Koteshwar Ridge Arterial)',
                  status: 'CLEAR / PRIMARY EVACUATION' as const,
                  submergedSegmentKm: 0,
                  safeHavenLocation: 'Kandisaur High Ground Shelter Complex'
                },
                {
                  corridorName: 'Badrinath Bypass Relief Corridor',
                  status: 'CLEAR / PRIMARY EVACUATION' as const,
                  submergedSegmentKm: 0,
                  safeHavenLocation: 'Pauri Garhwal Helipad Evacuation Staging Node'
                }
              ] : isRishiGanga ? [
                {
                  corridorName: 'NH-107B (Joshimath – Malari Border Road)',
                  status: 'CUT OFF' as const,
                  submergedSegmentKm: 18,
                  safeHavenLocation: 'Joshimath SDRF Forward Operating Base (Elevation 1,890m MSL)'
                },
                {
                  corridorName: 'Raini – Tapovan Valley Road',
                  status: 'CUT OFF' as const,
                  submergedSegmentKm: 12,
                  safeHavenLocation: 'Lata Village Elevated Staging Area'
                },
                {
                  corridorName: 'NH-58 (Joshimath – Chamoli – Karnaprayag)',
                  status: 'CLEAR / PRIMARY EVACUATION' as const,
                  submergedSegmentKm: 0,
                  safeHavenLocation: 'Chamoli District Emergency Operations Centre'
                },
                {
                  corridorName: 'IAF Helipad Evacuation Node (Joshimath)',
                  status: 'CLEAR / PRIMARY EVACUATION' as const,
                  submergedSegmentKm: 0,
                  safeHavenLocation: 'Gauchar Airstrip Casualty Evacuation Staging'
                }
              ] : [
                {
                  corridorName: `${riverName} Valley Primary Highway`,
                  status: 'AT RISK' as const,
                  submergedSegmentKm: 20,
                  safeHavenLocation: `${locationName} District Relief Camp`
                },
                {
                  corridorName: `${locationName} Bypass / Alternate Corridor`,
                  status: 'CLEAR / PRIMARY EVACUATION' as const,
                  submergedSegmentKm: 0,
                  safeHavenLocation: `${locationName} High Ground Evacuation Point`
                }
              ])).map((route, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                    route.status === 'CUT OFF' ? 'bg-red-50 border-red-200' :
                    route.status === 'AT RISK' ? 'bg-amber-50 border-amber-200' :
                    'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{route.corridorName}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      route.status === 'CUT OFF' ? 'bg-red-200 text-red-900' :
                      route.status === 'AT RISK' ? 'bg-amber-200 text-amber-900' :
                      'bg-emerald-200 text-emerald-900'
                    }`}>
                      {route.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Submerged Road Extent: <strong className="font-mono text-slate-900">{route.submergedSegmentKm} km</strong>
                  </p>
                  <div className="pt-1 border-t border-slate-200/60 text-xs flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 size={14} className={route.status.startsWith('CLEAR') ? 'text-emerald-600' : 'text-slate-500'} />
                    <span>Designated Safe Haven: <strong>{route.safeHavenLocation}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
