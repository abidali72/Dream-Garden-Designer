import React, { useState } from 'react';
import { 
  Search, 
  Sun, 
  Droplets, 
  Sparkles, 
  RefreshCw, 
  ArrowUpDown, 
  Calendar, 
  HeartHandshake, 
  Flower2, 
  Bug, 
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { GardenPlant, CompanionRelationship, SeasonalGuide, PlantType } from '../types/garden';

interface PlantCatalogProps {
  plants: GardenPlant[];
  companionMatrix: CompanionRelationship[];
  seasonalGuide: SeasonalGuide;
  onGeneratePlantVisual: (plant: GardenPlant) => Promise<void>;
  onSelectPlant: (plant: GardenPlant) => void;
  generatingPlantId: string | null;
}

export const PlantCatalog: React.FC<PlantCatalogProps> = ({
  plants,
  companionMatrix,
  seasonalGuide,
  onGeneratePlantVisual,
  onSelectPlant,
  generatingPlantId,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'companions' | 'calendar'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedSeason, setSelectedSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring');
  const [sortBy, setSortBy] = useState<'name' | 'water' | 'type'>('name');

  const plantTypes: (string | PlantType)[] = [
    'All',
    'Perennial',
    'Edible / Vegetable',
    'Herb',
    'Shrub',
    'Tree',
    'Climber',
    'Ornamental Grass',
    'Groundcover',
  ];

  const filteredPlants = plants
    .filter((plant) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        plant.commonName.toLowerCase().includes(q) ||
        plant.botanicalName.toLowerCase().includes(q) ||
        plant.careTip.toLowerCase().includes(q) ||
        (plant.companionPlants && plant.companionPlants.some((c) => c.toLowerCase().includes(q)));
      const matchesType = selectedType === 'All' || plant.type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.commonName.localeCompare(b.commonName);
      if (sortBy === 'type') return a.type.localeCompare(b.type);
      if (sortBy === 'water') return a.waterNeeds.localeCompare(b.waterNeeds);
      return 0;
    });

  return (
    <div className="flex flex-col gap-6">
      {/* Catalog Sub-navigation */}
      <div className="bg-[#121c15] p-3 rounded-2xl border border-emerald-900/60 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-[#0c130e] p-1 rounded-xl border border-emerald-950 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[32px] ${
              activeSubTab === 'catalog'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-300/70 hover:text-emerald-100 hover:bg-emerald-900/30'
            }`}
          >
            <Flower2 className="w-3.5 h-3.5" />
            <span>Botanical Palette ({plants.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('companions')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[32px] ${
              activeSubTab === 'companions'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-300/70 hover:text-emerald-100 hover:bg-emerald-900/30'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Companion Synergies</span>
          </button>

          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[32px] ${
              activeSubTab === 'calendar'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-300/70 hover:text-emerald-100 hover:bg-emerald-900/30'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>4-Season Care Timeline</span>
          </button>
        </div>

        {/* Search & Sort inputs for catalog */}
        {activeSubTab === 'catalog' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-emerald-400/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search botanical names..."
                className="w-full bg-[#0c130e] border border-emerald-900/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#0c130e] px-2 py-1 rounded-xl border border-emerald-900/80 text-xs">
              <ArrowUpDown className="w-3 h-3 text-emerald-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-emerald-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="name" className="bg-[#121c15]">Name</option>
                <option value="type" className="bg-[#121c15]">Type</option>
                <option value="water" className="bg-[#121c15]">Water</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Subtab 1: Plant Catalog Grid */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {plantTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] ${
                  selectedType === type
                    ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                    : 'bg-[#121c15] text-emerald-300/70 hover:text-emerald-100 hover:bg-emerald-900/40 border border-emerald-950'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Plant cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlants.map((plant) => {
              const isGeneratingThis = generatingPlantId === plant.id;

              return (
                <div
                  key={plant.id}
                  onClick={() => onSelectPlant(plant)}
                  className="bg-[#121c15] rounded-3xl border border-emerald-900/60 overflow-hidden shadow-xl hover:border-emerald-500/80 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  {/* Top card visual thumbnail */}
                  <div className="relative aspect-[16/10] bg-[#0c130e] overflow-hidden">
                    {plant.generatedImageUrl ? (
                      <img
                        src={plant.generatedImageUrl}
                        alt={plant.commonName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-[#121c15] to-[#0c130e]">
                        <Flower2 className="w-8 h-8 text-emerald-600/60 mb-2" />
                        <span className="text-[11px] font-mono text-emerald-400/70">
                          Click to inspect & synthesize visual
                        </span>
                        <button
                          disabled={isGeneratingThis}
                          onClick={(e) => {
                            e.stopPropagation();
                            onGeneratePlantVisual(plant);
                          }}
                          className="mt-2 text-[11px] px-3 py-1 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 flex items-center gap-1.5 transition-colors font-medium"
                        >
                          {isGeneratingThis ? (
                            <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                          )}
                          <span>Synthesize Visual</span>
                        </button>
                      </div>
                    )}

                    {/* Badge type overlay */}
                    <div className="absolute top-3 left-3 bg-[#0c130e]/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-900/80 text-[10px] font-mono text-emerald-300">
                      {plant.type}
                    </div>

                    {plant.pollinatorFriendly && (
                      <div className="absolute top-3 right-3 bg-amber-950/85 backdrop-blur-md px-2 py-0.5 rounded-md border border-amber-800/60 text-[10px] font-mono text-amber-300 flex items-center gap-1">
                        <Bug className="w-3 h-3" />
                        <span>Pollinator</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-serif font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {plant.commonName}
                        </h4>
                        <p className="text-xs text-emerald-400/80 italic font-serif">
                          {plant.botanicalName}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                    </div>

                    {/* Metric specs */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-emerald-300/80 bg-[#0c130e] p-2.5 rounded-xl border border-emerald-950">
                      <div className="flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{plant.sunRequirement}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{plant.waterNeeds}</span>
                      </div>
                      <div className="col-span-2 text-[10px] text-emerald-400/70 pt-1 border-t border-emerald-950/80">
                        Mature: {plant.matureHeight} H × {plant.matureSpread} W
                      </div>
                    </div>

                    {/* Companion synergies */}
                    {plant.companionPlants && plant.companionPlants.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/70 block mb-1">
                          Key Companions
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {plant.companionPlants.map((comp, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-emerald-950/90 text-emerald-200 px-2 py-0.5 rounded-md border border-emerald-800/50"
                            >
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Care tip */}
                    <p className="text-[11px] text-emerald-200/80 leading-relaxed bg-[#0c130e]/60 p-2.5 rounded-xl border border-emerald-950 line-clamp-2">
                      <strong className="text-emerald-400 font-medium">Care Tip: </strong>
                      {plant.careTip}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="p-3 bg-[#0c130e] border-t border-emerald-950 flex items-center justify-between text-[11px] text-emerald-400">
                    <span className="text-[10px] font-mono text-emerald-500/80">
                      Click card for details
                    </span>
                    {plant.generatedImageUrl && (
                      <button
                        disabled={isGeneratingThis}
                        onClick={(e) => {
                          e.stopPropagation();
                          onGeneratePlantVisual(plant);
                        }}
                        className="text-[10px] font-mono text-emerald-400/80 hover:text-emerald-200 flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${isGeneratingThis ? 'animate-spin' : ''}`} />
                        <span>Re-synthesize</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 2: Companion Planting Matrix */}
      {activeSubTab === 'companions' && (
        <div className="space-y-4">
          <div className="bg-[#121c15] p-5 rounded-3xl border border-emerald-900/60 shadow-xl">
            <h3 className="text-xl font-serif font-bold text-white mb-1">
              Mutualistic Companion Planting Synergies
            </h3>
            <p className="text-xs text-emerald-300/80 leading-relaxed">
              Botanical companions optimize pest resilience, stimulate nutrient uptake, and share microclimates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companionMatrix.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#121c15] p-5 rounded-3xl border border-emerald-900/60 shadow-lg flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs">{item.plantA}</span>
                    <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-white text-xs">{item.plantB}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/60">
                    {item.relationship}
                  </span>
                </div>

                <p className="text-xs text-emerald-200/80 leading-relaxed bg-[#0c130e] p-3 rounded-2xl border border-emerald-950">
                  {item.benefitReason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: 4-Season Horticultural Care Timeline */}
      {activeSubTab === 'calendar' && (
        <div className="bg-[#121c15] p-6 rounded-3xl border border-emerald-900/60 shadow-xl space-y-5">
          <div>
            <h3 className="text-xl font-serif font-bold text-white mb-1">
              Four-Season Garden Maintenance Timeline
            </h3>
            <p className="text-xs text-emerald-300/80">
              Proactive seasonal stewardship to keep your garden vibrant, healthy, and high-yielding all year round.
            </p>
          </div>

          {/* Season Selector Tabs */}
          <div className="grid grid-cols-4 gap-2 bg-[#0c130e] p-1.5 rounded-2xl border border-emerald-950">
            {(['spring', 'summer', 'autumn', 'winter'] as const).map((season) => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`py-2 text-xs font-semibold rounded-xl capitalize transition-all ${
                  selectedSeason === season
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-emerald-300/70 hover:text-emerald-100 hover:bg-emerald-900/30'
                }`}
              >
                {season}
              </button>
            ))}
          </div>

          {/* Season Tasks Checklist */}
          <div className="space-y-2.5 pt-2">
            {seasonalGuide[selectedSeason]?.map((task, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#0c130e] border border-emerald-950 text-xs text-emerald-200/90 flex items-start gap-3 leading-relaxed"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 font-mono text-[10px]">
                  {idx + 1}
                </div>
                <span>{task}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
