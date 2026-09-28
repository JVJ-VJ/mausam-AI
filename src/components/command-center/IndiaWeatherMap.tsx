import React, { useState, useEffect, useRef } from 'react';
import type { WeatherEvent, WeatherReport } from '../../types';
import { 
  projectCoordinates, 
  kmToPixels, 
  INDIA_OUTLINE_PATH 
} from '../../utils/geoProjection';
import { MapLegend } from './MapLegend';
import { MapLayerControl } from './MapLayerControl';
import type { MapLayerState } from './MapLayerControl';
import { EventDetails } from './EventDetails';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Info,
  Compass,
  Wind,
  CloudRain,
  Sun,
  Waves,
  Mountain,
  CloudLightning,
  Snowflake,
  AlertTriangle
} from 'lucide-react';

interface IndiaWeatherMapProps {
  events: WeatherEvent[];
  reports?: WeatherReport[];
  selectedEventId?: string | null;
  onSelectEvent: (eventId: string | null) => void;
  renderInlineDetails?: boolean;
  className?: string;
}

export const IndiaWeatherMap: React.FC<IndiaWeatherMapProps> = ({
  events,
  reports = [],
  selectedEventId,
  onSelectEvent,
  renderInlineDetails = false,
  className = '',
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showLayers, setShowLayers] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [viewBox, setViewBox] = useState('-250 0 1300 900');

  const [layers, setLayers] = useState<MapLayerState>({
    events: true,
    reports: true,
    rainfall: true,
    temperature: false,
    wind: true,
    floodRisk: false,
    stormActivity: true,
    radarSweep: true,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Dynamically compute viewBox aspect ratio so map fills 100% width and height without letterboxing
  useEffect(() => {
    if (!containerRef.current) return;
    const updateViewBox = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth > 0 && clientHeight > 0) {
        const aspect = clientWidth / clientHeight;
        const svgHeight = 900;
        const svgWidth = Math.max(900, Math.round(svgHeight * aspect));
        const minX = Math.round(430 - svgWidth / 2);
        setViewBox(`${minX} 0 ${svgWidth} ${svgHeight}`);
      }
    };

    updateViewBox();
    const observer = new ResizeObserver(updateViewBox);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(2.6, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.8, z - 0.25));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const toggleLayer = (key: keyof MapLayerState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Find currently selected event object
  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  // Center on event when requested
  const focusOnEvent = (event: WeatherEvent) => {
    const projected = projectCoordinates(event.location.lat, event.location.lng, 800, 900, 1.4, { x: 0, y: 0 });
    setZoom(1.4);
    setPan({
      x: 400 - projected.x,
      y: 450 - projected.y,
    });
    onSelectEvent(event.id);
  };

  // Meteorological severity style mapping
  const severityColors = {
    critical: { fill: '#DC2626', stroke: '#DC2626', ring: 'rgba(220, 38, 38, 0.25)' },
    high: { fill: '#F97316', stroke: '#F97316', ring: 'rgba(249, 115, 22, 0.22)' },
    moderate: { fill: '#F59E0B', stroke: '#F59E0B', ring: 'rgba(245, 158, 11, 0.20)' },
    low: { fill: '#059669', stroke: '#059669', ring: 'rgba(5, 150, 105, 0.20)' },
    informational: { fill: '#0284C7', stroke: '#0284C7', ring: 'rgba(2, 132, 199, 0.20)' },
  };

  const getEventLucideIcon = (type: string) => {
    switch (type) {
      case 'cyclone':
        return Wind;
      case 'heavy_rainfall':
        return CloudRain;
      case 'heatwave':
        return Sun;
      case 'flood':
        return Waves;
      case 'thunderstorm':
        return CloudLightning;
      case 'landslide':
        return Mountain;
      case 'coldwave':
        return Snowflake;
      case 'high_wind':
        return Wind;
      case 'drought':
        return Sun;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[540px] lg:h-[580px] xl:h-[600px] min-w-0 rounded-2xl overflow-hidden bg-gradient-to-b from-[#071321] via-[#0B1F33] to-[#102A43] border border-[#1E3A5F] shadow-atmospheric select-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      aria-label="Interactive India Weather Geospatial Map"
    >
      {/* Top Left Floating Meteorological Header */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#071321]/90 border border-white/20 backdrop-blur-md shadow-lg text-white">
          <Compass className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="text-xs font-bold tracking-wider uppercase font-sans text-white">
            PAN-INDIA WEATHER INTELLIGENCE
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/25 border border-sky-400/40 text-sky-200 font-bold">
            [{events.length} ACTIVE EVENTS]
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-300 px-1 drop-shadow">
          Live event positioning &bull; simulated telemetry
        </span>
      </div>

      {/* Top Right High-Contrast GIS Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowLayers((s) => !s);
            setShowLegend(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all cursor-pointer border ${
            showLayers
              ? 'bg-[#0EA5E9] text-white border-sky-400 shadow-md ring-1 ring-sky-300'
              : 'bg-[#071321]/90 border-white/20 text-white hover:bg-sky-500/20 hover:border-sky-400/50 shadow-md'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>Layers</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowLegend((s) => !s);
            setShowLayers(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all cursor-pointer border ${
            showLegend
              ? 'bg-[#0EA5E9] text-white border-sky-400 shadow-md ring-1 ring-sky-300'
              : 'bg-[#071321]/90 border-white/20 text-white hover:bg-sky-500/20 hover:border-sky-400/50 shadow-md'
          }`}
        >
          <Info className="w-3.5 h-3.5 text-teal-400" />
          <span>Legend</span>
        </button>
      </div>

      {/* Zoom / Reset GIS Navigation Toolbar (Bottom Right) */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-1.5 bg-[#071321]/90 border border-white/20 p-1.5 rounded-2xl backdrop-blur-md shadow-2xl text-white">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          title="Zoom In"
          aria-label="Zoom In"
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-[#0EA5E9] text-white transition-colors cursor-pointer border border-white/10 hover:border-sky-400"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          title="Zoom Out"
          aria-label="Zoom Out"
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-[#0EA5E9] text-white transition-colors cursor-pointer border border-white/10 hover:border-sky-400"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-white/15 my-0.5" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
          title="Reset View"
          aria-label="Reset View"
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-[#0EA5E9] text-white transition-colors cursor-pointer border border-white/10 hover:border-sky-400"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Layer Toggles Drawer */}
      {showLayers && (
        <div
          className="absolute top-14 right-4 z-30 w-64 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <MapLayerControl layers={layers} onToggleLayer={toggleLayer} />
        </div>
      )}

      {/* Map Legend Drawer */}
      {showLegend && (
        <div
          className="absolute top-14 right-4 z-30 w-64 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <MapLegend />
        </div>
      )}

      {/* Event Details Drawer (Only when explicitly enabled for inline mode) */}
      {selectedEvent && renderInlineDetails && (
        <div
          className="absolute bottom-5 left-5 z-30 max-w-sm w-full animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <EventDetails
            event={selectedEvent}
            onClose={() => onSelectEvent(null)}
            onFocusMap={focusOnEvent}
          />
        </div>
      )}

      {/* Main SVG Vector Geospatial Canvas */}
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full block"
        onClick={() => onSelectEvent(null)}
      >
        <defs>
          {/* Subtle Geospatial Coordinate Grid */}
          <pattern id="geoGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
          </pattern>

          {/* Deep Atmospheric Ocean Gradient (Prompt Section 11 & 13) */}
          <radialGradient id="oceanGradient" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor="#0B304A" />
            <stop offset="35%" stopColor="#08263E" />
            <stop offset="70%" stopColor="#061C2F" />
            <stop offset="100%" stopColor="#041522" />
          </radialGradient>

          {/* Subtle Ocean Light Bloom */}
          <radialGradient id="oceanBloom" cx="45%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.08)" />
            <stop offset="50%" stopColor="rgba(14, 165, 233, 0.03)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* India landmass multi-stop atmospheric terrain fill (Prompt Section 11 & 14) */}
          <linearGradient id="indiaLand" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4B8CB5" />
            <stop offset="50%" stopColor="#367BA6" />
            <stop offset="100%" stopColor="#245D83" />
          </linearGradient>

          {/* India internal atmospheric terrain highlight */}
          <linearGradient id="indiaHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.18)" />
            <stop offset="40%" stopColor="rgba(186, 230, 253, 0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Rainfall Simulated Overlay Gradient */}
          <radialGradient id="rainTrough" cx="40%" cy="60%" r="45%">
            <stop offset="0%" stopColor="rgba(14, 165, 233, 0.22)" />
            <stop offset="70%" stopColor="rgba(2, 132, 199, 0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Thermal Heatwave Overlay Gradient */}
          <radialGradient id="heatCorridor" cx="45%" cy="38%" r="40%">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0.18)" />
            <stop offset="75%" stopColor="rgba(249, 115, 22, 0.06)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Soft Moisture & Atmospheric Precipitation Zones */}
          <radialGradient id="moistureBlob1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.09)" />
            <stop offset="60%" stopColor="rgba(14, 165, 233, 0.04)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="moistureBlob2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(20, 184, 166, 0.08)" />
            <stop offset="70%" stopColor="rgba(14, 165, 233, 0.02)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="thermalZone" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0.10)" />
            <stop offset="60%" stopColor="rgba(249, 115, 22, 0.06)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Gentle Radar Scan */}
          <radialGradient id="radarScan" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.07)" />
            <stop offset="60%" stopColor="rgba(56, 189, 248, 0.02)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Ocean Background & Coordinate Grid - Expands beyond visible bounds */}
        <rect x="-3000" y="-1500" width="8000" height="4000" fill="url(#oceanGradient)" />
        <rect x="-3000" y="-1500" width="8000" height="4000" fill="url(#oceanBloom)" />
        <rect x="-3000" y="-1500" width="8000" height="4000" fill="url(#geoGrid)" />

        {/* Transform Group for Zoom and Pan */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transformOrigin: '400px 450px' }}>
          
          {/* Maritime Regions / Offshore Accents */}
          <g opacity="0.45">
            <text x="50" y="650" fill="rgba(147, 197, 253, 0.45)" fontSize="14" fontFamily="sans-serif" fontWeight="600" letterSpacing="4">
              ARABIAN SEA
            </text>
            <text x="740" y="630" fill="rgba(147, 197, 253, 0.45)" fontSize="14" fontFamily="sans-serif" fontWeight="600" letterSpacing="4">
              BAY OF BENGAL
            </text>
            <text x="360" y="880" fill="rgba(147, 197, 253, 0.4)" fontSize="13" fontFamily="sans-serif" fontWeight="600" letterSpacing="3">
              INDIAN OCEAN
            </text>
          </g>

          {/* Subtle Bathymetric Depth Contours (Prompt Section 11 & 13) */}
          <g fill="none" stroke="rgba(56, 189, 248, 0.05)" strokeWidth="1" strokeDasharray="6 14" className="pointer-events-none">
            <path d="M 0 550 Q 140 580 260 680 T 360 840" />
            <path d="M 0 620 Q 180 660 300 760 T 380 920" />
            <path d="M 540 850 Q 640 720 740 650 T 900 620" />
            <path d="M 580 920 Q 700 780 800 720 T 900 700" />
          </g>

          {/* India Boundary Polygon Shape with Atmospheric Edge (Prompt Section 11 & 14) */}
          <path
            d={INDIA_OUTLINE_PATH}
            fill="url(#indiaLand)"
            stroke="rgba(186, 230, 253, 0.55)"
            strokeWidth="1.6"
            strokeLinejoin="round"
            className="filter drop-shadow-[0_6px_24px_rgba(0,0,0,0.5)]"
          />
          {/* Internal atmospheric highlight */}
          <path
            d={INDIA_OUTLINE_PATH}
            fill="url(#indiaHighlight)"
            className="pointer-events-none"
          />

          {/* Simulated Meteorological Layers */}
          {layers.rainfall && (
            <ellipse
              cx="340"
              cy="620"
              rx="90"
              ry="160"
              fill="url(#rainTrough)"
              className="pointer-events-none opacity-85"
            />
          )}

          {layers.temperature && (
            <ellipse
              cx="380"
              cy="340"
              rx="130"
              ry="90"
              fill="url(#heatCorridor)"
              className="pointer-events-none opacity-80"
            />
          )}

          {/* Dynamic Regional Wind-Flow Streamlines (Thin, subtle, NO black polygons) */}
          {layers.wind && (
            <g
              fill="none"
              stroke="rgba(125, 211, 252, 0.18)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray="6 18"
              className="pointer-events-none"
            >
              {/* Arabian Sea to Western Peninsular Flow */}
              <path d="M 60 720 Q 180 660 300 680 T 420 630" fill="none" className="animate-wind-flow" />
              <path d="M 90 620 Q 220 560 360 580 T 500 530" fill="none" className="animate-wind-flow" style={{ animationDelay: '-3s' }} />
              <path d="M 120 520 Q 240 470 380 490 T 540 450" fill="none" className="animate-wind-flow" style={{ animationDelay: '-6s' }} />

              {/* Bay of Bengal to Eastern / Northeast Flow */}
              <path d="M 520 680 Q 620 600 680 520 T 760 420" fill="none" className="animate-wind-flow" style={{ animationDelay: '-2s' }} />
              <path d="M 560 740 Q 660 670 720 590 T 780 490" fill="none" className="animate-wind-flow" style={{ animationDelay: '-5s' }} />
              <path d="M 480 600 Q 580 540 650 470 T 720 380" fill="none" className="animate-wind-flow" style={{ animationDelay: '-8s' }} />

              {/* Northern / Himalayan Atmospheric Jet Stream Curve */}
              <path d="M 220 280 Q 380 230 520 250 T 680 220" fill="none" className="animate-wind-flow" style={{ animationDelay: '-4s' }} />
              <path d="M 260 210 Q 400 170 540 190 T 660 170" fill="none" className="animate-wind-flow" style={{ animationDelay: '-7s' }} />
            </g>
          )}

          {/* Gentle Meteorological Radar Sweep & Range Rings */}
          {layers.radarSweep && (
            <g className="pointer-events-none">
              <circle cx="430" cy="450" r="260" fill="none" stroke="rgba(56, 189, 248, 0.04)" strokeWidth="0.8" strokeDasharray="6 10" />
              <circle cx="430" cy="450" r="390" fill="none" stroke="rgba(56, 189, 248, 0.03)" strokeWidth="0.8" />
              <circle cx="430" cy="450" r="390" fill="url(#radarScan)" />
              <line
                x1="430"
                y1="450"
                x2="430"
                y2="60"
                stroke="rgba(56, 189, 248, 0.09)"
                strokeWidth="1"
                className="animate-sweep"
                style={{ transformOrigin: '430px 450px', animationDuration: '16s' }}
              />
            </g>
          )}

          {/* Simulated Citizen/Sensor Reports (subtle soft dots) */}
          {layers.reports &&
            reports.slice(0, 25).map((rpt) => {
              const pos = projectCoordinates(rpt.location.lat, rpt.location.lng, 800, 900, 1, { x: 0, y: 0 });
              return (
                <g key={rpt.id} className="transition-opacity">
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={rpt.credibilityTier === 'high' ? 3.5 : 2.5}
                    fill={rpt.credibilityTier === 'high' ? '#14B8A6' : '#94A3B8'}
                    opacity={0.7}
                  />
                </g>
              );
            })}

          {/* Weather System Depth Influence Zones (Visual representation of existing events) */}
          {layers.events &&
            events.map((evt) => {
              const pos = projectCoordinates(evt.location.lat, evt.location.lng, 800, 900, 1, { x: 0, y: 0 });
              if (evt.type === 'cyclone') {
                return (
                  <g key={`sys-${evt.id}`} className="pointer-events-none">
                    <circle cx={pos.x} cy={pos.y} r="85" fill="url(#moistureBlob1)" opacity="0.6" />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="52"
                      fill="none"
                      stroke="rgba(56, 189, 248, 0.14)"
                      strokeWidth="1"
                      strokeDasharray="5 7"
                      className="animate-spin"
                      style={{ animationDuration: '36s', transformOrigin: `${pos.x}px ${pos.y}px` }}
                    />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="30"
                      fill="none"
                      stroke="rgba(56, 189, 248, 0.18)"
                      strokeWidth="0.8"
                      strokeDasharray="3 5"
                      className="animate-spin"
                      style={{ animationDuration: '24s', animationDirection: 'reverse', transformOrigin: `${pos.x}px ${pos.y}px` }}
                    />
                    <circle cx={pos.x} cy={pos.y} r="7" fill="none" stroke="rgba(56, 189, 248, 0.22)" strokeWidth="1" />
                  </g>
                );
              }
              if (evt.type === 'heatwave') {
                return (
                  <g key={`sys-${evt.id}`} className="pointer-events-none">
                    <circle cx={pos.x} cy={pos.y} r="75" fill="url(#thermalZone)" opacity="0.85" />
                    <circle cx={pos.x} cy={pos.y} r="45" fill="url(#thermalZone)" opacity="0.5" />
                  </g>
                );
              }
              if (evt.type === 'heavy_rainfall' || evt.type === 'storm') {
                return (
                  <ellipse key={`sys-${evt.id}`} cx={pos.x} cy={pos.y} rx="65" ry="42" fill="url(#moistureBlob1)" opacity="0.8" className="pointer-events-none" />
                );
              }
              if (evt.type === 'flood') {
                return (
                  <ellipse key={`sys-${evt.id}`} cx={pos.x} cy={pos.y} rx="60" ry="38" fill="url(#moistureBlob2)" opacity="0.8" className="pointer-events-none" />
                );
              }
              if (evt.type === 'thunderstorm') {
                return (
                  <g key={`sys-${evt.id}`} className="pointer-events-none">
                    <circle cx={pos.x} cy={pos.y} r="50" fill="url(#moistureBlob1)" opacity="0.75" />
                    <circle cx={pos.x} cy={pos.y} r="25" fill="rgba(99, 102, 241, 0.08)" />
                  </g>
                );
              }
              if (evt.type === 'landslide') {
                return (
                  <circle key={`sys-${evt.id}`} cx={pos.x} cy={pos.y} r="40" fill="rgba(180, 83, 9, 0.08)" className="pointer-events-none" />
                );
              }
              return null;
            })}

          {/* Weather Events Layer (Atmospheric Meteorological Markers) */}
          {layers.events &&
            events.map((evt) => {
              const pos = projectCoordinates(evt.location.lat, evt.location.lng, 800, 900, 1, { x: 0, y: 0 });
              const isSelected = selectedEventId === evt.id;
              const isCritical = evt.severity === 'critical';
              const isHigh = evt.severity === 'high';
              const sev = severityColors[evt.severity] || severityColors.informational;
              const pixelRadius = kmToPixels(evt.affectedRadiusKm, 800, 1);
              const IconComponent = getEventLucideIcon(evt.type);
              const markerSize = isSelected ? 30 : 24;
              const iconSize = isSelected ? 16 : 13;

              return (
                <g
                  key={evt.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEvent(evt.id);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Atmospheric Focus Zone on Selected Event (Prompt Section 15 & 19) */}
                  {isSelected && (
                    <g className="pointer-events-none">
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={Math.max(pixelRadius * 1.25, 42)}
                        fill={
                          evt.type === 'cyclone'
                            ? 'rgba(239, 68, 68, 0.12)'
                            : evt.type === 'heatwave'
                            ? 'rgba(245, 158, 11, 0.14)'
                            : evt.type === 'heavy_rainfall' || evt.type === 'storm'
                            ? 'rgba(56, 189, 248, 0.15)'
                            : evt.type === 'flood'
                            ? 'rgba(20, 184, 166, 0.14)'
                            : 'rgba(99, 102, 241, 0.12)'
                        }
                        stroke={
                          evt.type === 'cyclone'
                            ? 'rgba(239, 68, 68, 0.45)'
                            : evt.type === 'heatwave'
                            ? 'rgba(245, 158, 11, 0.45)'
                            : evt.type === 'heavy_rainfall' || evt.type === 'storm'
                            ? 'rgba(56, 189, 248, 0.45)'
                            : evt.type === 'flood'
                            ? 'rgba(20, 184, 166, 0.45)'
                            : 'rgba(99, 102, 241, 0.45)'
                        }
                        strokeWidth="1.5"
                        strokeDasharray="6 6"
                        className="animate-spin"
                        style={{ animationDuration: '45s', transformOrigin: `${pos.x}px ${pos.y}px` }}
                      />
                    </g>
                  )}

                  {/* Affected Radius Circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={pixelRadius}
                    fill={sev.ring}
                    stroke={sev.fill}
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                    opacity={isSelected ? 0.9 : 0.45}
                    className="transition-opacity group-hover:opacity-80 pointer-events-none"
                  />

                  {/* Gentle Expanding Wave Ring for Critical events ONLY */}
                  {isCritical && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 22 : 17}
                      fill="none"
                      stroke={sev.fill}
                      strokeWidth="1.5"
                      opacity="0.55"
                      className="animate-ping pointer-events-none"
                      style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                    />
                  )}

                  {/* Dark translucent navy base + thin severity-colored border + Lucide Icon */}
                  <foreignObject
                    x={pos.x - markerSize / 2}
                    y={pos.y - markerSize / 2}
                    width={markerSize}
                    height={markerSize}
                    className="overflow-visible pointer-events-none"
                  >
                    <div
                      className={`w-full h-full rounded-lg flex items-center justify-center transition-all duration-250 ease-out group-hover:scale-[1.08] ${
                        !isCritical && !isHigh ? 'animate-marker-breathe' : ''
                      } ${
                        isSelected ? 'scale-110 ring-2 ring-white/70' : ''
                      }`}
                      style={{
                        backgroundColor: 'rgba(7, 19, 33, 0.90)',
                        border: `1.5px solid ${sev.fill}`,
                        boxShadow: isSelected
                          ? `0 0 16px ${sev.fill}, 0 2px 8px rgba(0,0,0,0.6)`
                          : `0 2px 8px rgba(0,0,0,0.6), 0 0 10px ${sev.ring}`,
                      }}
                    >
                      <IconComponent
                        size={iconSize}
                        style={{ color: sev.fill }}
                        strokeWidth={2.2}
                      />
                    </div>
                  </foreignObject>

                  {/* Event Label Tooltip on hover or selected */}
                  <g
                    transform={`translate(${pos.x + markerSize / 2 + 6}, ${pos.y - 14})`}
                    className={`pointer-events-none transition-opacity duration-150 ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <rect
                      x="0"
                      y="0"
                      width={Math.min(240, evt.title.length * 6.5 + 44)}
                      height="28"
                      rx="8"
                      fill="rgba(7, 19, 33, 0.95)"
                      stroke={sev.fill}
                      strokeWidth="1.2"
                      className="filter drop-shadow-lg"
                    />
                    <text
                      x="10"
                      y="18"
                      fill="#FFFFFF"
                      fontSize="11"
                      fontFamily="sans-serif"
                      fontWeight="600"
                    >
                      {evt.title.length > 26 ? `${evt.title.slice(0, 26)}...` : evt.title}
                    </text>
                  </g>
                </g>
              );
            })}
        </g>
      </svg>
    </div>
  );
};
