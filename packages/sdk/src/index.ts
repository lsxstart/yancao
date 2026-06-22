import type { RegionId } from "@yancao/domain";
import {
  buildStats,
  diseaseCases,
  plots,
  regions,
  warnings,
  weatherConditions
} from "./mockData";

const wait = <T>(data: T) =>
  new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(data), 180);
  });

export const tobaccoApi = {
  getRegions: () => wait(regions),
  getPlots: (regionId: RegionId) => wait(plots.filter((plot) => plot.regionId === regionId)),
  getPlotDetail: (plotId: string) => wait(plots.find((plot) => plot.id === plotId) ?? null),
  getWarnings: (regionId: RegionId) =>
    wait(warnings.filter((warning) => warning.regionId === regionId)),
  getWeather: (regionId: RegionId) =>
    wait(weatherConditions.find((item) => item.regionId === regionId) ?? null),
  getDiseaseCases: () => wait(diseaseCases),
  getDashboardStats: (regionId: RegionId) => wait(buildStats(regionId))
};

export * from "./httpClient";
