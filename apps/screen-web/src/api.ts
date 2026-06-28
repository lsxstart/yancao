import axios from "axios";

const SCREEN_TOKEN_KEY = "YANCAO_SCREEN_TOKEN";
const viteEnv = import.meta as ImportMeta & {
  env?: {
    VITE_API_BASE_URL?: string;
    VITE_API_TIMEOUT_MS?: string;
  };
};

const API_BASE_URL = viteEnv.env?.VITE_API_BASE_URL ?? "http://118.24.185.177:8080/api/v1";
const API_TIMEOUT_MS = Number(viteEnv.env?.VITE_API_TIMEOUT_MS ?? 30000);

export interface ApiResponse<T> {
  code: number;
  message?: string;
  msg?: string;
  data: T;
}

export interface PageResult<T> {
  total: number;
  pageNum?: number;
  pageSize?: number;
  records: T[];
}

export interface ScreenZone {
  id: number;
  zoneName: string;
  zoneCode?: string;
}

export interface ScreenPlot {
  id: number;
  plotName: string;
  plotCode?: string;
  zoneId?: number;
  longitude?: number;
  latitude?: number;
  area?: number;
  status?: number;
}

export interface DroneDetectionRecord {
  id: number;
  imageId?: number;
  plotId: number;
  modelId?: number;
  diseaseName?: string;
  diseaseCode?: string;
  infectedPlants?: number;
  healthyPlants?: number;
  totalPlants?: number;
  infectionRate?: number;
  diseaseLevel?: string;
  oriImageUrl?: string;
  resultImageUrl?: string;
  detectTime?: string;
  createTime?: string;
}

const screenHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number.isFinite(API_TIMEOUT_MS) && API_TIMEOUT_MS > 0 ? API_TIMEOUT_MS : 30000,
  headers: {
    "Content-Type": "application/json;charset=utf-8"
  }
});

screenHttp.interceptors.request.use((config) => {
  const token = localStorage.getItem(SCREEN_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>) {
  const response = await request;
  const payload = response.data;
  if (typeof payload?.code === "number" && payload.code !== 200) {
    throw new Error(payload.message ?? payload.msg ?? "接口请求失败");
  }
  return payload.data;
}

function normalizePageData<T>(data: PageResult<T> | T[]): PageResult<T> {
  if (Array.isArray(data)) {
    return {
      total: data.length,
      pageNum: 1,
      pageSize: data.length,
      records: data
    };
  }
  return data;
}

export const screenApi = {
  login: (payload: { username: string; password: string }) =>
    unwrap<{ token: string }>(screenHttp.post("/auth/login", payload)),
  getZones: async () => normalizePageData(await unwrap<PageResult<ScreenZone> | ScreenZone[]>(screenHttp.get("/zone/list", { params: { pageNum: 1, pageSize: 100 } }))),
  getPlots: async () => normalizePageData(await unwrap<PageResult<ScreenPlot> | ScreenPlot[]>(screenHttp.get("/plot/list", { params: { pageNum: 1, pageSize: 500 } }))),
  getDroneDetections: async () =>
    normalizePageData(await unwrap<PageResult<DroneDetectionRecord> | DroneDetectionRecord[]>(screenHttp.get("/detection/drone/list", { params: { pageNum: 1, pageSize: 500 } })))
};

