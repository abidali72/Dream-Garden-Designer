export type ZoneType =
  | 'vegetable'
  | 'perennial_border'
  | 'patio_seating'
  | 'water_feature'
  | 'pollinator_path'
  | 'herb_spiral'
  | 'shade_sanctuary'
  | 'lawn_turf'
  | 'orchard_trees'
  | 'compost_utility';

export interface GardenZone {
  id: string;
  name: string;
  type: ZoneType;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  wPercent: number; // 10 to 80
  hPercent: number; // 10 to 80
  sunExposure: string;
  description: string;
  recommendedSoil?: string;
  keyFeatures?: string[];
  color?: string;
}

export type PlantType =
  | 'Perennial'
  | 'Shrub'
  | 'Tree'
  | 'Edible / Vegetable'
  | 'Herb'
  | 'Climber'
  | 'Groundcover'
  | 'Ornamental Grass';

export interface GardenPlant {
  id: string;
  commonName: string;
  botanicalName: string;
  type: PlantType;
  zoneId: string;
  sunRequirement: string;
  waterNeeds: string;
  matureHeight: string;
  matureSpread: string;
  bloomSeason?: string;
  foliageColor?: string;
  flowerColor?: string;
  pollinatorFriendly?: boolean;
  companionPlants?: string[];
  landscapeRole?: string;
  careTip: string;
  defaultVisualPrompt: string;
  generatedImageUrl?: string;
}

export interface HardscapingElement {
  id: string;
  name: string;
  type: string;
  material: string;
  xPercent: number;
  yPercent: number;
  description: string;
}

export interface CompanionRelationship {
  plantA: string;
  plantB: string;
  relationship: 'beneficial' | 'antagonistic';
  benefitReason: string;
}

export interface SeasonalGuide {
  spring: string[];
  summer: string[];
  autumn: string[];
  winter: string[];
}

export interface GardenDimensions {
  widthFt: number;
  lengthFt: number;
  totalSqFt: number;
  shape: string;
}

export interface GardenDesign {
  id: string;
  title: string;
  style: string;
  summary: string;
  dimensions: GardenDimensions;
  zones: GardenZone[];
  plants: GardenPlant[];
  hardscaping: HardscapingElement[];
  companionPlantingMatrix: CompanionRelationship[];
  seasonalGuide: SeasonalGuide;
  soilAndWateringStrategy: string;
  recommendedVisualPrompt: string;
  renderedImageUrl?: string;
  beforeEditImageUrl?: string;
  createdAt: string;
}

export interface GardenPreferences {
  style: string;
  dimensions: {
    widthFt: number;
    lengthFt: number;
    shape: string;
  };
  sunlight: string;
  soilType: string;
  hardinessZone: string;
  priorities: string[];
  specialFeatures: string[];
  lifestyleNotes: string;
}

export interface GeneratedImageHistoryItem {
  id: string;
  url: string;
  prompt: string;
  isEdit: boolean;
  parentUrl?: string;
  timestamp: string;
  type: 'garden_overall' | 'plant_portrait' | 'zone_detail' | 'user_upload';
}
