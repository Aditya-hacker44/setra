'use client';

import { useEffect, useRef, useState } from 'react';
import { TimeStep, Dam, DownstreamLocation } from '@/types';
import {
  riverGeoJSON,
  roadsGeoJSON,
  buildingsGeoJSON,
  criticalInfraGeoJSON,
  bridgesGeoJSON,
  downstreamLocations as defaultDownstream,
  tehriDam,
} from '@/data/demoDataset';
import L from 'leaflet';

// Fix Leaflet default marker icon issue in webpack/Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const damIcon = L.divIcon({
  html: '<div style="background:#EF4444;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">D</div>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const townIcon = L.divIcon({
  html: '<div style="background:#1677FF;color:white;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">T</div>',
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const infraIcons: Record<string, string> = {
  hospital: '🏥',
  police: '🚔',
  power: '⚡',
  school: '🏫',
  government: '🏛️',
};

interface FloodMapProps {
  timeStep?: TimeStep;
  height?: string;
  dam?: Dam;
  locations?: DownstreamLocation[];
  layers?: {
    flood?: boolean;
    river?: boolean;
    roads?: boolean;
    buildings?: boolean;
    bridges?: boolean;
    infrastructure?: boolean;
    population?: boolean;
    dam?: boolean;
    satellite?: boolean;
    dem?: boolean;
  };
  mode?: 'depth' | 'velocity' | 'arrival' | 'extent';
  showControls?: boolean;
}

export default function FloodMap({
  timeStep,
  height = '100%',
  dam = tehriDam,
  locations,
  layers = { flood: true, river: true, dam: true, population: true },
  mode = 'depth',
  showControls = true,
}: FloodMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const floodLayerRef = useRef<L.GeoJSON | null>(null);
  const satelliteLayerRef = useRef<L.LayerGroup | null>(null);
  const damLayerRef = useRef<L.LayerGroup | null>(null);
  const riverLayerRef = useRef<L.LayerGroup | null>(null);
  const roadsLayerRef = useRef<L.LayerGroup | null>(null);
  const buildingsLayerRef = useRef<L.LayerGroup | null>(null);
  const bridgesLayerRef = useRef<L.LayerGroup | null>(null);
  const infraLayerRef = useRef<L.LayerGroup | null>(null);
  const popLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const activeLocations = locations || defaultDownstream;

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [dam.lat, dam.lng],
      zoom: 9,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors | NDSA SETRA GIS',
      maxZoom: 18,
    }).addTo(map);

    damLayerRef.current = L.layerGroup();
    popLayerRef.current = L.layerGroup();
    riverLayerRef.current = L.layerGroup();
    roadsLayerRef.current = L.layerGroup();
    buildingsLayerRef.current = L.layerGroup();
    bridgesLayerRef.current = L.layerGroup();
    infraLayerRef.current = L.layerGroup();
    satelliteLayerRef.current = L.layerGroup();

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center and vector entities when dam or dataset changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;

    map.setView([dam.lat, dam.lng], 9);

    // Update Dam marker
    if (damLayerRef.current) {
      damLayerRef.current.clearLayers();
      L.marker([dam.lat, dam.lng], { icon: damIcon })
        .bindPopup(
          `<b>${dam.name}</b><br/>River: ${dam.river}<br/>Height: ${dam.height}m MSL<br/>FRL: ${dam.maxReservoirLevel}m<br/>Storage: ${dam.reservoirVolume} MCM`
        )
        .addTo(damLayerRef.current);
    }

    // Update settlements
    if (popLayerRef.current) {
      popLayerRef.current.clearLayers();
      activeLocations.forEach((loc) => {
        L.marker([loc.lat, loc.lng], { icon: townIcon })
          .bindPopup(
            `<b>${loc.name}</b><br/>Distance: ${loc.distance} km<br/>Pop: ${loc.population.toLocaleString()}<br/>Arrival Time: ${loc.arrivalTime}h<br/>Max Depth: ${loc.maxDepth}m`
          )
          .addTo(popLayerRef.current!);
      });
    }

    // Update river layer
    if (riverLayerRef.current) {
      riverLayerRef.current.clearLayers();
      // Use dataset-specific river coordinates where available; otherwise offset around dam
      const isRishiGanga = dam.id === 'source-ronti-peak';
      const isTehri = dam.id === 'tehri-dam';
      const coords = isTehri ? riverGeoJSON.features[0].geometry.coordinates 
        : isRishiGanga ? [
          [79.7320, 30.3780],  // Ronti Peak detachment zone
          [79.7100, 30.4100],  // Upper Ronti Gad
          [79.6950, 30.4850],  // Raini / Rishiganga HEP
          [79.6280, 30.4950],  // Tapovan Vishnugad NTPC
          [79.6100, 30.5050],  // Rini / Lata Valley
          [79.5630, 30.5520],  // Joshimath / confluence
        ] : [
          [dam.lng + 0.1, dam.lat + 0.15],
          [dam.lng + 0.05, dam.lat + 0.08],
          [dam.lng, dam.lat],
          [dam.lng - 0.08, dam.lat - 0.07],
          [dam.lng - 0.15, dam.lat - 0.15],
          [dam.lng - 0.25, dam.lat - 0.22],
          [dam.lng - 0.38, dam.lat - 0.30],
        ];

      const riverLabel = isRishiGanga ? 'Ronti Gad → Rishiganga → Dhauliganga' : `${dam.river} Hydro-Enforced Channel`;
      L.polyline(coords.map((c: any) => [c[1], c[0]]), {
        color: '#3B82F6',
        weight: 3.5,
        opacity: 0.85,
      }).bindPopup(`<b>${riverLabel}</b>`).addTo(riverLayerRef.current);
    }

    // Update infrastructure
    if (infraLayerRef.current) {
      infraLayerRef.current.clearLayers();
      criticalInfraGeoJSON.features.forEach((f) => {
        const coords = f.geometry.coordinates as unknown as [number, number];
        const emoji = infraIcons[f.properties.type as string] || '📍';
        const icon = L.divIcon({
          html: `<div style="font-size:18px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));">${emoji}</div>`,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        L.marker([coords[1], coords[0]], { icon })
          .bindPopup(`<b>${f.properties.name}</b><br/>Facility: ${f.properties.type}<br/>Status: Indexed`)
          .addTo(infraLayerRef.current!);
      });
    }

    // Update roads
    if (roadsLayerRef.current) {
      roadsLayerRef.current.clearLayers();
      L.geoJSON(roadsGeoJSON as GeoJSON.GeoJsonObject, {
        style: { color: '#64748B', weight: 2.5, opacity: 0.7, dashArray: '6 4' },
      }).addTo(roadsLayerRef.current);
    }

    // Update bridges
    if (bridgesLayerRef.current) {
      bridgesLayerRef.current.clearLayers();
      bridgesGeoJSON.features.forEach((f) => {
        const coords = f.geometry.coordinates as unknown as [number, number];
        L.circleMarker([coords[1], coords[0]], {
          radius: 6,
          color: '#8B5CF6',
          fillColor: '#8B5CF6',
          fillOpacity: 0.6,
          weight: 1.5,
        })
          .bindPopup(`<b>${f.properties.name}</b><br/>Type: ${f.properties.type}`)
          .addTo(bridgesLayerRef.current!);
      });
    }
  }, [mapReady, dam, activeLocations]);

  // Synchronize active layers with the map
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;

    const syncLayer = (group: L.LayerGroup | null, visible: boolean | undefined) => {
      if (!group) return;
      const isVisible = visible !== false;
      if (isVisible && !map.hasLayer(group)) {
        map.addLayer(group);
      } else if (!isVisible && map.hasLayer(group)) {
        map.removeLayer(group);
      }
    };

    syncLayer(damLayerRef.current, layers.dam);
    syncLayer(popLayerRef.current, layers.population !== undefined ? layers.population : true);
    syncLayer(riverLayerRef.current, layers.river);
    syncLayer(roadsLayerRef.current, layers.roads);
    syncLayer(buildingsLayerRef.current, layers.buildings);
    syncLayer(bridgesLayerRef.current, layers.bridges);
    syncLayer(infraLayerRef.current, layers.infrastructure);
    syncLayer(satelliteLayerRef.current, layers.satellite);
  }, [mapReady, layers]);

  // Update flood polygons when timeStep or mode changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;

    if (floodLayerRef.current) {
      map.removeLayer(floodLayerRef.current);
      floodLayerRef.current = null;
    }

    if (!timeStep || !layers.flood) return;

    const getColor = (val: number): string => {
      if (mode === 'velocity') {
        return val > 5 ? '#1E3A5F' : val > 3 ? '#1677FF' : '#93C5FD';
      }
      if (mode === 'arrival') {
        return val > 3 ? '#EF4444' : val > 1.5 ? '#EAB308' : '#22C55E';
      }
      // depth mode
      if (val > 5) return '#EF4444';
      if (val > 2) return '#F97316';
      if (val > 1) return '#EAB308';
      if (val > 0.5) return '#20C4D9';
      return '#3B82F6';
    };

    const floodGeoJSON = timeStep.floodExtentGeoJSON;
    if (floodGeoJSON) {
      const maxVal = mode === 'velocity' ? timeStep.maxVelocity : timeStep.maxDepth;
      const depthRings = [0.25, 0.45, 0.65, 0.82, 1.0];
      const featureGroup = L.featureGroup();

      depthRings.forEach((scale, idx) => {
        const coords = (floodGeoJSON.geometry.coordinates as number[][][])[0];
        if (!coords) return;
        const center = [dam.lng, dam.lat];
        const scaledCoords = coords.map((c) => [
          center[0] + (c[0] - center[0]) * scale,
          center[1] + (c[1] - center[1]) * scale,
        ]);

        const valAtRing = maxVal * (1 - scale * 0.7);
        const color = getColor(valAtRing);

        const polygon = L.polygon(
          scaledCoords.map((c) => [c[1], c[0]] as L.LatLngTuple),
          {
            color: color,
            fillColor: color,
            fillOpacity: 0.28 - idx * 0.03,
            weight: idx === depthRings.length - 1 ? 2.5 : 1,
            opacity: 0.7,
          }
        ).bindPopup(
          `<b>T+ ${timeStep.time}h Inundation Ring</b><br/>Area: ${timeStep.inundationArea} km²<br/>${mode === 'velocity' ? 'Velocity: ' + timeStep.maxVelocity + ' m/s' : 'Depth: ' + timeStep.maxDepth + ' m'}`
        );
        featureGroup.addLayer(polygon);
      });

      floodLayerRef.current = featureGroup as unknown as L.GeoJSON;
      featureGroup.addTo(map);
    }
  }, [timeStep, mode, layers.flood, mapReady, dam]);

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />

      {/* Flood Legend */}
      {showControls && (
        <div className="absolute bottom-4 left-4 glass-card bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 z-[1000] text-xs">
          <p className="font-bold text-[#0B1F3A] mb-2 uppercase tracking-wide text-[10px]">
            {mode === 'depth' ? 'Flood Depth (m)' : mode === 'velocity' ? 'Flow Velocity (m/s)' : mode === 'arrival' ? 'Arrival Time (hrs)' : 'Inundation Extent'}
          </p>
          <div className="space-y-1">
            {mode === 'depth' && (
              <>
                <LegendItem color="#3B82F6" label="0 – 0.5 m (Low risk)" />
                <LegendItem color="#20C4D9" label="0.5 – 1 m (Moderate)" />
                <LegendItem color="#EAB308" label="1 – 2 m (High)" />
                <LegendItem color="#F97316" label="2 – 5 m (Very High)" />
                <LegendItem color="#EF4444" label="> 5 m (Catastrophic)" />
              </>
            )}
            {mode === 'velocity' && (
              <>
                <LegendItem color="#93C5FD" label="< 2 m/s (Slow)" />
                <LegendItem color="#1677FF" label="2 – 5 m/s (Moderate)" />
                <LegendItem color="#1E3A5F" label="> 5 m/s (Rapid Torrent)" />
              </>
            )}
            {mode === 'arrival' && (
              <>
                <LegendItem color="#22C55E" label="< 1.5 hrs" />
                <LegendItem color="#EAB308" label="1.5 – 3.0 hrs" />
                <LegendItem color="#EF4444" label="> 3.0 hrs" />
              </>
            )}
            {mode === 'extent' && (
              <>
                <LegendItem color="#20C4D9" label="Peak Inundation Extent" />
                <LegendItem color="#3B82F6" label="Active River Reach" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-3.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-slate-700 font-medium">{label}</span>
    </div>
  );
}
