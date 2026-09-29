import React, { useState } from 'react';
import { 
  Sun, 
  Droplets, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Compass, 
  CheckCircle2, 
  Sparkles,
  TreeDeciduous,
  Waves,
  Armchair,
  Flower2,
  Carrot,
  Sliders,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { GardenDesign, GardenZone, GardenPlant, HardscapingElement } from '../types/garden';

interface InteractiveCanvasProps {
  garden: GardenDesign;
  selectedZone: GardenZone | null;
  onSelectZone: (zone: GardenZone | null) => void;
  onSelectPlant: (plant: GardenPlant) => void;
  onGenerateZoneVisual: (zone: GardenZone) => void;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  garden,
  selectedZone,
  onSelectZone,
  onSelectPlant,
  onGenerateZoneVisual,
}) => {
  const [zoom, setZoom] = useState(1);
  const [activeLayer, setActiveLayer] = useState<'all' | 'sunlight' | 'plants' | 'hardscape'>('all');
  const [sunTime, setSunTime] = useState<'morning' | 'noon' | 'afternoon'>('noon');
  const [hoveredZone, setHoveredZone] = useState<GardenZone | null>(null);
  const [hoveredHardscape, setHoveredHardscape] = useState<HardscapingElement | null>(null);

  const { widthFt, lengthFt, totalSqFt } = garden.dimensions;

  // Filter plants in selected zone
  const zonePlants = selectedZone
    ? garden.plants.filter((p) => p.zoneId === selectedZone.id)
    : [];

  const getZoneColor = (type: GardenZone['type']) => {
    switch (type) {
      case 'vegetable':
        return {
          bg: 'bg-amber-950/40 border-amber-600/70 text-amber-200',
          accent: 'border-amber-500 bg-amber-500/20 text-amber-300',
          icon: <Carrot className="w-4 h-4 text-amber-400" />,
        };
      case 'perennial_border':
        return {
          bg: 'bg-rose-950/40 border-rose-500/70 text-rose-200',
          accent: 'border-rose-400 bg-rose-500/20 text-rose-300',
          icon: <Flower2 className="w-4 h-4 text-rose-300" />,
        };
      case 'patio_seating':
        return {
          bg: 'bg-stone-900/70 border-stone-500/80 text-stone-200',
          accent: 'border-stone-400 bg-stone-500/20 text-stone-300',
          icon: <Armchair className="w-4 h-4 text-stone-300" />,
        };
      case 'water_feature':
        return {
          bg: 'bg-cyan-950/40 border-cyan-500/70 text-cyan-200',
          accent: 'border-cyan-400 bg-cyan-500/20 text-cyan-300',
          icon: <Waves className="w-4 h-4 text-cyan-300" />,
        };
      case 'pollinator_path':
        return {
          bg: 'bg-yellow-950/40 border-yellow-500/70 text-yellow-200',
          accent: 'border-yellow-400 bg-yellow-500/20 text-yellow-300',
          icon: <Flower2 className="w-4 h-4 text-yellow-300" />,
        };
      case 'herb_spiral':
        return {
          bg: 'bg-lime-950/40 border-lime-500/70 text-lime-200',
          accent: 'border-lime-400 bg-lime-500/20 text-lime-300',
          icon: <TreeDeciduous className="w-4 h-4 text-lime-400" />,
        };
      case 'shade_sanctuary':
        return {
          bg: 'bg-emerald-950/70 border-emerald-600/80 text-emerald-200',
          accent: 'border-emerald-500 bg-emerald-500/20 text-emerald-300',
          icon: <TreeDeciduous className="w-4 h-4 text-emerald-400" />,
        };
      default:
        return {
          bg: 'bg-emerald-950/40 border-emerald-700/70 text-emerald-300',
          accent: 'border-emerald-600 bg-emerald-600/20 text-emerald-300',
          icon: <Compass className="w-4 h-4 text-emerald-400" />,
        };
    }
  };

  // Sunlight overlay style based on time of day
  const getSunlightOverlay = () => {
    if (activeLayer !== 'sunlight') return null;
    if (sunTime === 'morning') {
      return 'bg-gradient-to-tr from-amber-500/25 via-yellow-400/10 to-transparent pointer-events-none';
    }
    if (sunTime === 'noon') {
      return 'bg-gradient-to-b from-yellow-300/20 via-amber-200/15 to-yellow-400/20 pointer-events-none';
    }
    return 'bg-gradient-to-tl from-orange-600/30 via-amber-500/20 to-transparent pointer-events-none';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Main Canvas Planner Column */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        {/* Canvas Toolbar */}
        <div className="bg-[#121c15] p-3 rounded-2xl border border-emerald-900/60 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          {/* Layer toggles */}
          <div className="flex items-center gap-1.5 bg-[#0c130e] p-1 rounded-xl border border-emerald-950 overflow-x-auto">
            <button
              onClick={() => setActiveLayer('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[32px] ${
                activeLayer === 'all'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-400/70 hover:text-emerald-200'
              }`}
            >
              Master Layout
            </button>
            <button
              onClick={() => setActiveLayer('sunlight')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[32px] ${
                activeLayer === 'sunlight'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-emerald-400/70 hover:text-amber-300'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Sunlight Sim</span>
            </button>
            <button
              onClick={() => setActiveLayer('plants')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[32px] ${
                activeLayer === 'plants'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400/70 hover:text-emerald-200'
              }`}
            >
              <TreeDeciduous className="w-3.5 h-3.5" />
              <span>Plant Dots</span>
            </button>
            <button
              onClick={() => setActiveLayer('hardscape')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[32px] ${
                activeLayer === 'hardscape'
                  ? 'bg-stone-700 text-white shadow-sm'
                  : 'text-emerald-400/70 hover:text-stone-300'
              }`}
            >
              <Armchair className="w-3.5 h-3.5" />
              <span>Structures</span>
            </button>
          </div>

          {/* Sunlight time selector when active */}
          {activeLayer === 'sunlight' && (
            <div className="flex items-center gap-1 bg-amber-950/50 p-1 rounded-xl border border-amber-800/60">
              <span className="text-[11px] text-amber-300/90 px-2 font-mono uppercase">Time:</span>
              <button
                onClick={() => setSunTime('morning')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium ${
                  sunTime === 'morning' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-300/80 hover:text-amber-100'
                }`}
              >
                8 AM (East)
              </button>
              <button
                onClick={() => setSunTime('noon')}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold ${
                  sunTime === 'noon' ? 'bg-amber-500 text-stone-900 shadow-sm' : 'text-amber-300/80 hover:text-amber-100'
                }`}
              >
                12 PM (Zenith)
              </button>
              <button
                onClick={() => setSunTime('afternoon')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium ${
                  sunTime === 'afternoon' ? 'bg-orange-600 text-white shadow-sm' : 'text-amber-300/80 hover:text-amber-100'
                }`}
              >
                4 PM (Golden)
              </button>
            </div>
          )}

          {/* Scale Metric and Zoom controls */}
          <div className="flex items-center gap-3">
            <div className="text-xs text-emerald-400/90 font-mono hidden sm:flex items-center gap-1.5">
              <span>{widthFt}' × {lengthFt}'</span>
              <span className="opacity-40">·</span>
              <span>{totalSqFt.toLocaleString()} sq ft</span>
            </div>

            <div className="flex items-center gap-1 bg-[#0c130e] p-1 rounded-xl border border-emerald-950">
              <button
                onClick={() => setZoom((prev) => Math.max(0.7, Math.round((prev - 0.1) * 10) / 10))}
                title="Zoom Out"
                className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-100 hover:bg-emerald-900/40 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-emerald-300 w-10 text-center select-none">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((prev) => Math.min(1.5, Math.round((prev + 0.1) * 10) / 10))}
                title="Zoom In"
                className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-100 hover:bg-emerald-900/40 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1)}
                title="Reset Zoom"
                className="p-1.5 rounded-lg text-emerald-400/70 hover:text-emerald-100 hover:bg-emerald-900/40 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Zone Selector Strip for fast access */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[10px] font-mono uppercase text-emerald-500/80 shrink-0 whitespace-nowrap pl-1">
            Zones ({garden.zones.length}):
          </span>
          {garden.zones.map((zone) => {
            const isSelected = selectedZone?.id === zone.id;
            const colors = getZoneColor(zone.type);
            return (
              <button
                key={zone.id}
                onClick={() => onSelectZone(isSelected ? null : zone)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-400 font-semibold shadow-md'
                    : 'bg-[#121c15] text-emerald-300/80 border-emerald-900/60 hover:border-emerald-700 hover:text-white'
                }`}
              >
                <span className="shrink-0">{colors.icon}</span>
                <span className="truncate max-w-[140px]">{zone.name}</span>
              </button>
            );
          })}
        </div>

        {/* The 2D Interactive Blueprint Area */}
        <div className="relative w-full aspect-[16/11] sm:aspect-[16/10] bg-[#0c130e] rounded-3xl border-2 border-emerald-900/80 overflow-hidden shadow-2xl p-4 sm:p-6 flex items-center justify-center bg-blueprint-grid">
          {/* Compass Rose */}
          <div className="absolute top-4 right-4 z-20 flex flex-col items-center bg-[#121c15]/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-emerald-900/80 shadow-md">
            <span className="text-[10px] font-mono font-bold text-amber-400">N</span>
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-mono text-emerald-400/60">North</span>
          </div>

          {/* Scale rule bar bottom left */}
          <div className="absolute bottom-4 left-4 z-20 bg-[#121c15]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-900/80 shadow-md flex items-center gap-2">
            <div className="w-16 h-1.5 bg-emerald-500/80 rounded-full"></div>
            <span className="text-[11px] font-mono text-emerald-300">10 ft / 3m scale</span>
          </div>

          {/* Garden Canvas Inner Container with scale transform */}
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            className="relative w-full h-full border border-emerald-800/40 rounded-2xl overflow-hidden bg-soil-pattern transition-transform duration-200"
          >
            {/* Sunlight simulation overlay */}
            <div className={`absolute inset-0 ${getSunlightOverlay()} transition-all duration-700 z-10`} />

            {/* Perimeter boundary label */}
            <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-500/60 tracking-wider select-none">
              LOT BOUNDARY: {widthFt}FT WIDE
            </div>
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-emerald-500/60 tracking-wider select-none">
              {lengthFt}FT DEEP
            </div>

            {/* Render Garden Zones */}
            {garden.zones.map((zone) => {
              const colors = getZoneColor(zone.type);
              const isSelected = selectedZone?.id === zone.id;
              const isHovered = hoveredZone?.id === zone.id;
              const zonePlantsCount = garden.plants.filter((p) => p.zoneId === zone.id).length;

              return (
                <div
                  key={zone.id}
                  onClick={() => onSelectZone(isSelected ? null : zone)}
                  onMouseEnter={() => setHoveredZone(zone)}
                  onMouseLeave={() => setHoveredZone(null)}
                  style={{
                    left: `${zone.xPercent}%`,
                    top: `${zone.yPercent}%`,
                    width: `${zone.wPercent}%`,
                    height: `${zone.hPercent}%`,
                  }}
                  className={`absolute rounded-xl cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between p-2 sm:p-2.5 select-none backdrop-blur-sm ${
                    colors.bg
                  } ${
                    isSelected
                      ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#0c130e] border-emerald-400 z-20 shadow-xl'
                      : isHovered
                      ? 'border-emerald-300 scale-[1.01] z-10 shadow-lg'
                      : 'border-emerald-900/60 hover:border-emerald-700/80'
                  }`}
                >
                  {/* Zone Header */}
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="p-1 rounded-md bg-black/50 border border-white/10 shrink-0">
                        {colors.icon}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold truncate text-white drop-shadow-sm">
                        {zone.name}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>

                  {/* Zone details & plant counts */}
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-emerald-200/80 mt-1">
                    <span className="truncate max-w-[120px]">{zone.sunExposure.split('(')[0]}</span>
                    {zonePlantsCount > 0 && (
                      <span className="bg-black/50 px-1.5 py-0.5 rounded text-emerald-300 font-medium">
                        {zonePlantsCount} plants
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Render Hardscaping Elements */}
            {(activeLayer === 'all' || activeLayer === 'hardscape') &&
              garden.hardscaping.map((item) => (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredHardscape(item)}
                  onMouseLeave={() => setHoveredHardscape(null)}
                  style={{
                    left: `${item.xPercent}%`,
                    top: `${item.yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute z-25 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-stone-900/90 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-lg group-hover:scale-115 transition-transform">
                    {item.type.includes('fountain') || item.type.includes('water') ? (
                      <Waves className="w-4 h-4 text-cyan-400" />
                    ) : item.type.includes('pergola') || item.type.includes('arbor') ? (
                      <TreeDeciduous className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Armchair className="w-4 h-4 text-stone-200" />
                    )}
                  </div>

                  {/* Hardscape hover tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-[#121c15] text-[11px] text-emerald-200 rounded-lg border border-emerald-800 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                    <span className="font-semibold text-white">{item.name}</span>
                    <span className="block text-[10px] text-emerald-400/80">{item.material}</span>
                  </div>
                </div>
              ))}

            {/* Plant placement markers if plants layer active */}
            {(activeLayer === 'all' || activeLayer === 'plants') &&
              garden.plants.map((plant, index) => {
                const targetZone = garden.zones.find((z) => z.id === plant.zoneId);
                if (!targetZone) return null;

                // Safely distribute plants inside zone boundaries
                const plantsInThisZone = garden.plants.filter((p) => p.zoneId === targetZone.id);
                const plantIdx = plantsInThisZone.findIndex((p) => p.id === plant.id);
                const count = Math.max(plantsInThisZone.length, 1);
                
                const cols = Math.min(count, 3);
                const rows = Math.ceil(count / cols);
                const col = plantIdx % cols;
                const row = Math.floor(plantIdx / cols);

                // Safe percentage inside zone
                const marginX = targetZone.wPercent * 0.15;
                const marginY = targetZone.hPercent * 0.25;
                const usableW = targetZone.wPercent - marginX * 2;
                const usableH = targetZone.hPercent - marginY * 1.5;

                const posX = targetZone.xPercent + marginX + (cols > 1 ? (col * usableW) / (cols - 1) : usableW / 2);
                const posY = targetZone.yPercent + marginY + (rows > 1 ? (row * usableH) / (rows - 1) : usableH / 2);

                return (
                  <button
                    key={plant.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlant(plant);
                    }}
                    style={{ left: `${posX}%`, top: `${posY}%` }}
                    title={`${plant.commonName} (${plant.botanicalName})`}
                    className="absolute z-20 group -translate-x-1/2 -translate-y-1/2 focus:outline-none p-1"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-emerald-950 group-hover:scale-130 transition-transform">
                      {plant.commonName[0]}
                    </div>

                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-[#0c130e] text-[10px] text-emerald-100 rounded-lg border border-emerald-700 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                      {plant.commonName}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-[#121c15]/70 p-3 rounded-2xl border border-emerald-950 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-300/80">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500"></span>
              <span>Edibles & Potager</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-400"></span>
              <span>Perennial Borders</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-stone-600/40 border border-stone-400"></span>
              <span>Patio / Hardscape</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-600/30 border border-emerald-400"></span>
              <span>Shade Sanctuary</span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-400/70">
            Click any zone to inspect plants & microclimates
          </span>
        </div>
      </div>

      {/* Inspector / Zone Details Sidebar Column */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {selectedZone ? (
          <div className="bg-[#121c15] rounded-3xl border border-emerald-800/80 p-5 shadow-xl flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-2 border-b border-emerald-900/60 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Zone Inspector
                </span>
                <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                  {selectedZone.name}
                </h3>
              </div>
              <button
                onClick={() => onSelectZone(null)}
                className="text-xs text-emerald-400 hover:text-white px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-900/80 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-emerald-200/90 leading-relaxed">
              <p>{selectedZone.description}</p>

              <div className="bg-[#0c130e] p-3 rounded-2xl border border-emerald-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400/70 font-mono">Sun Exposure</span>
                  <span className="font-semibold text-emerald-100">{selectedZone.sunExposure}</span>
                </div>
                {selectedZone.recommendedSoil && (
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400/70 font-mono">Recommended Soil</span>
                    <span className="font-medium text-emerald-200 text-right max-w-[160px] truncate">
                      {selectedZone.recommendedSoil}
                    </span>
                  </div>
                )}
              </div>

              {selectedZone.keyFeatures && selectedZone.keyFeatures.length > 0 && (
                <div>
                  <span className="text-[11px] font-mono uppercase text-emerald-400/80 tracking-wide block mb-1.5">
                    Planned Features
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedZone.keyFeatures.map((feat, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-emerald-950 text-emerald-300 px-2 py-1 rounded-lg border border-emerald-800/50"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Plants planted in this zone */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-emerald-400 tracking-wide font-semibold">
                    Flora In This Zone ({zonePlants.length})
                  </span>
                </div>

                {zonePlants.length === 0 ? (
                  <p className="text-[11px] text-emerald-400/60 italic">
                    No botanical specimens assigned to this zone yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {zonePlants.map((plant) => (
                      <div
                        key={plant.id}
                        onClick={() => onSelectPlant(plant)}
                        className="p-2.5 rounded-xl bg-[#0c130e] border border-emerald-950 hover:border-emerald-700 cursor-pointer transition-colors flex items-center justify-between gap-2 group"
                      >
                        <div>
                          <div className="font-medium text-white text-xs group-hover:text-emerald-200">{plant.commonName}</div>
                          <div className="text-[10px] text-emerald-400/70 italic font-serif">
                            {plant.botanicalName}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-950">
                            {plant.type}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-600 group-hover:text-emerald-300 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate Visual for this Zone */}
              <button
                onClick={() => onGenerateZoneVisual(selectedZone)}
                className="w-full mt-2 py-3 px-3.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>Synthesize Zone Photorealistic Visual</span>
              </button>
            </div>
          </div>
        ) : (
          /* General Garden Overview Card */
          <div className="bg-[#121c15] rounded-3xl border border-emerald-900/60 p-5 shadow-xl flex flex-col gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Active Garden Plan
              </span>
              <h2 className="text-xl font-serif font-bold text-white mt-1 leading-snug">
                {garden.title}
              </h2>
              <p className="text-xs text-emerald-300/80 mt-1 italic">{garden.style}</p>
            </div>

            <p className="text-xs text-emerald-200/80 leading-relaxed bg-[#0c130e] p-3 rounded-2xl border border-emerald-950">
              {garden.summary}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#0c130e] p-2.5 rounded-xl border border-emerald-950">
                <span className="text-[10px] font-mono text-emerald-400/70 block">Lot Footprint</span>
                <span className="font-semibold text-white font-mono mt-0.5 block">
                  {garden.dimensions.totalSqFt.toLocaleString()} sq ft
                </span>
              </div>
              <div className="bg-[#0c130e] p-2.5 rounded-xl border border-emerald-950">
                <span className="text-[10px] font-mono text-emerald-400/70 block">Total Species</span>
                <span className="font-semibold text-white font-mono mt-0.5 block">
                  {garden.plants.length} Varieties
                </span>
              </div>
            </div>

            {/* Soil and Irrigation strategy */}
            <div className="text-xs space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-semibold">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hydrology & Soil Strategy</span>
              </span>
              <p className="text-emerald-300/80 text-[11px] leading-relaxed">
                {garden.soilAndWateringStrategy}
              </p>
            </div>

            {/* Hardscape features list */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2 font-semibold">
                <Armchair className="w-3.5 h-3.5 text-amber-400" />
                <span>Architectural Hardscapes</span>
              </span>
              <div className="space-y-1.5">
                {garden.hardscaping.map((h) => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-xl bg-[#0c130e] border border-emerald-950 text-xs"
                  >
                    <div className="font-medium text-white">{h.name}</div>
                    <div className="text-[10px] text-emerald-400/70">{h.material}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
