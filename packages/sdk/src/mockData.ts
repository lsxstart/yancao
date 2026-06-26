import type {
  DashboardStats,
  DiseaseCase,
  Plot,
  Region,
  WarningInfo,
  WeatherCondition
} from "@yancao/domain";

export const regions: Region[] = [
  { id: "xunyi", name: "旬邑", center: [120, 60], description: "山地烟田重点监测区" },
  { id: "fuxian", name: "富县", center: [320, 160], description: "塬区烟田重点监测区" },
  { id: "baoji", name: "宝鸡", center: [520, 90], description: "丘陵烟叶病害预警区" }
];

export const plots: Plot[] = [
  {
    id: "xunyi-003",
    regionId: "xunyi",
    name: "旬邑01号地块",
    areaMu: 42.6,
    healthRate: 68.85,
    diseaseLevel: "severe",
    diseaseName: "白发病",
    coordinates: [[80, 80], [155, 66], [180, 124], [112, 148]]
  },
  {
    id: "xunyi-001",
    regionId: "xunyi",
    name: "旬邑02号地块",
    areaMu: 38.4,
    healthRate: 76.2,
    diseaseLevel: "medium",
    diseaseName: "黑胫病",
    coordinates: [[190, 145], [285, 132], [306, 205], [216, 222]]
  },
  {
    id: "xunyi-007",
    regionId: "xunyi",
    name: "旬邑03号地块",
    areaMu: 31.8,
    healthRate: 83.4,
    diseaseLevel: "light",
    diseaseName: "病毒病",
    coordinates: [[96, 210], [176, 226], [158, 288], [72, 265]]
  },
  {
    id: "fuxian-002",
    regionId: "fuxian",
    name: "富县002号地块",
    areaMu: 55.2,
    healthRate: 91.5,
    diseaseLevel: "healthy",
    diseaseName: "健康",
    coordinates: [[350, 180], [454, 168], [482, 236], [370, 258]]
  },
  {
    id: "baoji-006",
    regionId: "baoji",
    name: "宝鸡006号地块",
    areaMu: 47.9,
    healthRate: 72.1,
    diseaseLevel: "medium",
    diseaseName: "赤星病",
    coordinates: [[505, 75], [608, 98], [590, 168], [486, 145]]
  }
];

export const warnings: WarningInfo[] = [
  {
    id: "warn-001",
    regionId: "xunyi",
    plotId: "xunyi-003",
    plotName: "旬邑01号地块",
    diseaseName: "白发病",
    diseaseLevel: "severe",
    healthRate: 68.85,
    warningTime: "2026-06-07 17:50:04",
    suggestion: "建议立即开展喷药防治，并复查无人机影像。"
  },
  {
    id: "warn-002",
    regionId: "xunyi",
    plotId: "xunyi-001",
    plotName: "旬邑02号地块",
    diseaseName: "黑胫病",
    diseaseLevel: "medium",
    healthRate: 76.2,
    warningTime: "2026-06-07 15:39:34",
    suggestion: "加强排水和病株巡查，必要时补充药剂处理。"
  },
  {
    id: "warn-003",
    regionId: "baoji",
    plotId: "baoji-006",
    plotName: "宝鸡006号地块",
    diseaseName: "赤星病",
    diseaseLevel: "medium",
    healthRate: 72.1,
    warningTime: "2026-06-05 10:39:25",
    suggestion: "连续阴雨后注意扩散风险，建议三日内复测。"
  }
];

export const weatherConditions: WeatherCondition[] = [
  {
    regionId: "xunyi",
    temperature: 23.2,
    windDirection: "西北风",
    rainfall: 0.3,
    soilMoisture: 16.7,
    windSpeed: 1.2,
    illuminance: 50000,
    humidity: 43.2,
    soilTemperature: 23.1
  },
  {
    regionId: "fuxian",
    temperature: 25.6,
    windDirection: "东南风",
    rainfall: 0.1,
    soilMoisture: 19.8,
    windSpeed: 1.8,
    illuminance: 53600,
    humidity: 45.9,
    soilTemperature: 24.4
  },
  {
    regionId: "baoji",
    temperature: 21.8,
    windDirection: "北风",
    rainfall: 0.8,
    soilMoisture: 22.5,
    windSpeed: 2.4,
    illuminance: 46200,
    humidity: 51.3,
    soilTemperature: 21.9
  }
];

export const diseaseCases: DiseaseCase[] = [
  {
    id: "case-white-mold",
    name: "白发病枪杆",
    stage: "出苗期",
    riskLevel: "severe",
    imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
    symptoms: "叶片褪绿、扭曲，后期中心萎黄，植株生长受阻。",
    prevention: "轮作、控制湿度、及时清除病株，并按规则使用药剂。"
  },
  {
    id: "case-virus",
    name: "病毒病叶斑",
    stage: "旺长期",
    riskLevel: "medium",
    imageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80",
    symptoms: "叶面出现花叶、皱缩、黄化，植株长势不均。",
    prevention: "控制蚜虫传播，及时拔除中心病株，避免机械传播。"
  }
];

export function buildStats(regionId: string): DashboardStats {
  const regionPlots = plots.filter((plot) => plot.regionId === regionId);
  const count = (level: Plot["diseaseLevel"]) =>
    regionPlots.filter((plot) => plot.diseaseLevel === level).length;
  const healthSum = regionPlots.reduce((sum, plot) => sum + plot.healthRate, 0);

  return {
    monitoredPlots: regionPlots.length,
    healthyPlots: count("healthy"),
    lightPlots: count("light"),
    mediumPlots: count("medium"),
    severePlots: count("severe"),
    averageHealthRate: Number((healthSum / Math.max(regionPlots.length, 1)).toFixed(1))
  };
}
