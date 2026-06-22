export type RegionId = "xunyi" | "wugong" | "yanan";

export type DiseaseLevel = "healthy" | "light" | "medium" | "severe";

export interface Region {
  id: RegionId;
  name: string;
  center: [number, number];
  description: string;
}

export interface Plot {
  id: string;
  regionId: RegionId;
  name: string;
  areaMu: number;
  healthRate: number;
  diseaseLevel: DiseaseLevel;
  diseaseName: string;
  coordinates: [number, number][];
}

export interface DashboardStats {
  monitoredPlots: number;
  healthyPlots: number;
  lightPlots: number;
  mediumPlots: number;
  severePlots: number;
  averageHealthRate: number;
}

export interface WarningInfo {
  id: string;
  regionId: RegionId;
  plotId: string;
  plotName: string;
  diseaseName: string;
  diseaseLevel: DiseaseLevel;
  healthRate: number;
  warningTime: string;
  suggestion: string;
}

export interface WeatherCondition {
  regionId: RegionId;
  temperature: number;
  windDirection: string;
  rainfall: number;
  soilMoisture: number;
  windSpeed: number;
  illuminance: number;
  humidity: number;
  soilTemperature: number;
}

export interface DiseaseCase {
  id: string;
  name: string;
  stage: string;
  riskLevel: DiseaseLevel;
  imageUrl: string;
  symptoms: string;
  prevention: string;
}
