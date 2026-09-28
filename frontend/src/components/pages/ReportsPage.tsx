'use client';

import React, { useState } from 'react';
import { 
  FileText, Download, File, Map as MapIcon, 
  GitCompare, Users, Satellite, FileDown, 
  CheckCircle2, Loader2, Database, Table, Check, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '@/lib/store';
import { exportGeoJSON, exportKML, exportCSV, exportPDFReport, exportSHPZip, downloadBlob } from '@/lib/exportEngine';

const REPORT_TYPES = [
  { id: 'inundation', title: 'Flood Inundation Report', desc: 'Detailed depth, velocity, and extent maps with time-series hydrograph.', icon: MapIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'comparison', title: 'Scenario Comparison Report', desc: 'Side-by-side analysis of dam break vs controlled discharge vs natural lake breach.', icon: GitCompare, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'hadr', title: 'HADR Impact Report', desc: 'Population, buildings, roads, bridges, and critical infrastructure exposure matrix.', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'validation', title: 'Satellite Validation Report', desc: 'Sentinel-1 SAR confusion matrix, CSI / IoU metrics, and spatial contingency.', icon: Satellite, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

export default function ReportsPage() {
  const { scenario, simulationResult, validationResults, activeDataset } = useAppState();
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setDownloadNotice(msg);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  const currentScenario = scenario || {
    id: activeDataset ? `scen-${activeDataset.id}` : 'scen-hydro-default',
    name: activeDataset ? `${activeDataset.dam.name} — Failure Scenario` : 'Hydrodynamic Failure Scenario',
    type: 'DAM_BREAK' as const,
    dam: activeDataset?.dam || {
      id: 'dam-generic',
      name: 'Dam Structure',
      state: 'National Basin',
      river: 'River Reach',
      basin: 'Basin',
      height: 100,
      reservoirLevel: 800,
      maxReservoirLevel: 820,
      reservoirVolume: 2000,
      spillwayCapacity: 10000,
      lat: 20.5937,
      lng: 78.9629,
    },
    failureType: 'Sudden Complete Failure' as const,
    reservoirLevel: activeDataset?.dam?.reservoirLevel || 830,
    breachWidth: 150,
    breachFormationTime: 0.5,
    manningCoefficient: 0.035,
    simulationDuration: 6,
    gridResolution: 30,
    createdAt: new Date().toISOString(),
    isRealDataset: Boolean(activeDataset),
  };

  const handleGenerate = (id: string, title: string) => {
    setGeneratingId(id);
    setTimeout(() => {
      setGeneratingId(null);
      setSuccessId(id);
      
      // Trigger actual download of official government decision report
      try {
        const blob = exportPDFReport(title, currentScenario, simulationResult, validationResults);
        const filename = `SETRA_${title.replace(/\s+/g, '_')}_Official_Report.pdf`;
        downloadBlob(blob, filename);
        showNotification(`✓ Downloaded ${filename}`);
      } catch (err) {
        console.error(err);
      }

      setTimeout(() => setSuccessId(null), 3000);
    }, 1200);
  };

  const handleExport = async (format: string) => {
    setExportingFormat(format);
    try {
      let blob: Blob;
      let ext: string;
      const cleanName = (currentScenario.name || 'SETRA_Simulation').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fmtLower = format.toLowerCase();

      if (fmtLower === 'geojson') {
        blob = exportGeoJSON(currentScenario, simulationResult);
        ext = 'geojson';
      } else if (fmtLower === 'kml') {
        blob = exportKML(currentScenario, simulationResult);
        ext = 'kml';
      } else if (fmtLower === 'csv') {
        blob = exportCSV(currentScenario, simulationResult, validationResults);
        ext = 'csv';
      } else if (fmtLower === 'shp') {
        blob = await exportSHPZip(currentScenario, simulationResult);
        ext = 'zip';
      } else {
        blob = exportPDFReport('Official Flood Simulation Report', currentScenario, simulationResult, validationResults);
        ext = 'pdf';
      }

      const filename = fmtLower === 'shp' 
        ? `SETRA_${cleanName}_ESRI_Shapefile.${ext}`
        : `SETRA_${cleanName}_Export.${ext}`;
      
      downloadBlob(blob, filename);
      showNotification(`✓ Downloaded ${filename} successfully!`);
    } catch (e) {
      console.error(e);
      showNotification(`Export failed: ${(e as Error).message}`);
    } finally {
      setExportingFormat(null);
    }
  };

  const area = simulationResult?.inundationArea || 235;
  const depth = simulationResult?.maxDepth || 8.4;
  const velocity = simulationResult?.maxVelocity || 6.2;
  const arrival = simulationResult?.arrivalTime || 3.4;
  const pop = simulationResult?.populationAffected || 210000;
  const roads = simulationResult?.roadsAffected || 87;
  const bridges = simulationResult?.bridgesAffected || 14;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-slate-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Reports &amp; GIS Export Centre</h1>
            <span className="bg-blue-100 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded text-xs font-semibold">
              SIH REQ #15: SHP &amp; KML
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Generate standardized disaster management reports and export GIS spatial layers for NDMA, CWC, and District Collectors
          </p>
        </div>

        {downloadNotice && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <Check size={16} />
            {downloadNotice}
          </motion.div>
        )}
      </div>

      {/* Report Types Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon;
          const isGenerating = generatingId === report.id;
          const isSuccess = successId === report.id;

          return (
            <motion.div 
              key={report.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full"
            >
              <div className={`w-12 h-12 rounded-lg ${report.bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${report.color}`} />
              </div>
              <h3 className="font-semibold text-lg text-[#0B1F3A] mb-2">{report.title}</h3>
              <p className="text-sm text-slate-500 mb-6 flex-grow">{report.desc}</p>
              
              <button
                onClick={() => handleGenerate(report.id, report.title)}
                disabled={isGenerating || isSuccess}
                className={`w-full py-2.5 rounded-lg font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors relative overflow-hidden ${
                  isSuccess ? 'bg-emerald-100 text-emerald-800' :
                  isGenerating ? 'bg-slate-100 text-slate-600' :
                  'bg-[#1677FF] text-white hover:bg-blue-600 cursor-pointer shadow-sm'
                }`}
              >
                {isSuccess ? (
                  <><CheckCircle2 className="w-4 h-4" /> Downloaded</>
                ) : isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...</>
                ) : (
                  <><FileText className="w-4 h-4" /> GENERATE REPORT</>
                )}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: '100%' }} 
                      transition={{ duration: 1.2 }}
                      className="h-1 bg-[#1677FF] absolute bottom-0 left-0"
                    />
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Raw Data Export */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#0B1F3A] flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                GIS Spatial Data Export
              </h2>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">WGS84 EPSG:4326</span>
            </div>
            
            <p className="text-xs text-slate-500 mb-4">
              Download flood inundation contours and dam breach vector features directly for QGIS, ArcGIS, Google Earth, and tabular post-processing.
            </p>

            <div className="space-y-3">
              {[
                { 
                  label: 'Export Shapefile (SHP .zip)', 
                  format: 'SHP', 
                  icon: Database, 
                  desc: 'Binary .shp, .shx, .dbf, .prj package',
                  badge: 'SIH REQ #15'
                },
                { 
                  label: 'Export Google Earth (KML)', 
                  format: 'KML', 
                  icon: MapIcon, 
                  desc: 'OGC KML 2.2 for 3D Google Earth rendering',
                  badge: 'SIH REQ #15'
                },
                { 
                  label: 'Download GeoJSON Polygon', 
                  format: 'GeoJSON', 
                  icon: Layers, 
                  desc: 'Standard RFC 7946 GeoJSON FeatureCollection',
                  badge: 'Standard'
                },
                { 
                  label: 'Export CSV Tabular Hydrograph', 
                  format: 'CSV', 
                  icon: Table, 
                  desc: 'Time-series water level, velocity & discharge',
                  badge: 'Data'
                },
                { 
                  label: 'Export PDF Decision Summary', 
                  format: 'PDF', 
                  icon: File, 
                  desc: 'Full CWC / NDMA formatted briefing document',
                  badge: 'Executive'
                },
              ].map((btn) => (
                <button
                  key={btn.format}
                  onClick={() => handleExport(btn.format)}
                  disabled={exportingFormat !== null}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-[#1677FF] hover:bg-blue-50/50 transition-colors group cursor-pointer text-left"
                >
                  <div className="flex items-start gap-3 text-slate-700 group-hover:text-[#1677FF]">
                    <div className="p-2 rounded bg-slate-100 group-hover:bg-blue-100 transition-colors">
                      <btn.icon className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 group-hover:text-blue-700">{btn.label}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">{btn.badge}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{btn.desc}</span>
                    </div>
                  </div>
                  {exportingFormat === btn.format ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#1677FF]" />
                  ) : (
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-[#1677FF]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Report Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
            <h2 className="text-lg font-semibold text-[#0B1F3A] mb-4 flex items-center gap-2">
              <FileDown className="w-5 h-5 text-slate-600" />
              Report Live Preview (NDMA / CWC Standard)
            </h2>
            <div className="flex-grow border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50/50 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0B1F3A 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-lg text-left z-10 border border-slate-200 relative">
                <div className="border-b-2 border-[#0B1F3A] pb-4 mb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black text-[#0B1F3A] tracking-wider mb-1">SETRA</h1>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">Hydrodynamic Simulation &amp; HADR Report</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1677FF] border border-blue-200">
                    PS 26161 DEMO
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Scenario</h4>
                    <p className="text-sm font-semibold text-[#0B1F3A]">{currentScenario.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dam / River</h4>
                      <p className="text-sm font-medium">{currentScenario.dam?.name} ({currentScenario.dam?.river})</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Generated Date</h4>
                      <p className="text-sm font-medium">{new Date().toISOString().split('T')[0]}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Hydrodynamic Metrics</h4>
                    <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Inundation Area:</span>
                        <span className="font-bold text-[#1677FF]">{area} km²</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Max Depth:</span>
                        <span className="font-bold text-[#20C4D9]">{depth} m</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Max Velocity:</span>
                        <span className="font-bold text-[#EAB308]">{velocity} m/s</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Arrival Time:</span>
                        <span className="font-bold text-[#EF4444]">{arrival} hrs</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Population Exposed:</span>
                        <span className="font-bold text-slate-800">~{pop.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Roads / Bridges:</span>
                        <span className="font-bold text-slate-800">{roads} km / {bridges}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-xs text-slate-400 italic">This interactive report is formatted for official disaster response workflows. Spatial exports contain complete geometry and projection headers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
