import axios from "axios";

const API_TOKEN_KEY = "YANCAO_ADMIN_TOKEN";
const viteEnv = import.meta as ImportMeta & {
  env?: {
    VITE_API_BASE_URL?: string;
  };
};

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

export interface AuthUser {
  id: number;
  username: string;
  realName: string;
  roles: string[];
  permissions: string[];
}

export interface LoginResult {
  token: string;
  userInfo: AuthUser;
}

export interface ZoneRecord {
  id: number;
  zoneName: string;
  zoneCode: string;
  province: string;
  city: string;
  description?: string;
  status: number;
}

export interface PlotRecord {
  id: number;
  plotName: string;
  plotCode: string;
  zoneId?: number;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  area: number;
  status: number;
}

export interface DeviceRecord {
  id: number;
  plotId: number;
  deviceCode: string;
  deviceName: string;
  deviceType: string;
  model?: string;
  apiUrl?: string;
  onlineStatus?: number;
  status: number;
}

export interface ImageRecord {
  id: number;
  plotId: number;
  deviceId?: number;
  imageUrl: string;
  thumbnailUrl?: string;
  shootTime?: string;
  createTime?: string;
  uploadUserId?: number;
  purpose?: string;
}

export interface DetectionRecord {
  id: number;
  imageId?: number;
  plotId: number;
  modelId?: number;
  diseaseName: string;
  diseaseCode?: string;
  confidence?: number;
  infectionRate?: number;
  diseaseRatio?: number;
  resultImageUrl?: string;
  detectTime?: string;
  createTime?: string;
}

export interface KnowledgeRecord {
  id: number;
  diseaseName: string;
  diseaseCode: string;
  symptoms: string;
  prevention: string;
  exampleImages?: string;
}

export interface UserRecord {
  id: number;
  username: string;
  realName: string;
  phone?: string;
  email?: string;
  status: number;
}

export interface RoleRecord {
  id: number;
  roleName: string;
  roleCode: string;
  description?: string;
  status?: number;
}

export const adminHttp = axios.create({
  baseURL: viteEnv.env?.VITE_API_BASE_URL ?? "http://118.24.185.177:8080/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json;charset=utf-8"
  }
});

adminHttp.interceptors.request.use((config) => {
  const token = localStorage.getItem(API_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

adminHttp.interceptors.response.use((response) => {
  const payload = response.data as ApiResponse<unknown>;
  if (typeof payload?.code === "number" && payload.code !== 200) {
    return Promise.reject(new Error(payload.message ?? payload.msg ?? "接口请求失败"));
  }
  return response;
});

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>) {
  const response = await request;
  return response.data.data;
}

export const adminApi = {
  login: (payload: { username: string; password: string }) =>
    unwrap<LoginResult>(adminHttp.post("/auth/login", payload)),
  getUserInfo: () => unwrap<AuthUser>(adminHttp.get("/auth/userInfo")),
  logout: () => unwrap<null>(adminHttp.post("/auth/logout")),
  getZones: () => unwrap<PageResult<ZoneRecord>>(adminHttp.get("/zone/list", { params: { pageNum: 1, pageSize: 100 } })),
  createZone: (payload: Omit<ZoneRecord, "id" | "status"> & { status?: number }) => unwrap<ZoneRecord>(adminHttp.post("/zone", payload)),
  updateZone: (payload: Partial<ZoneRecord> & { id: number }) => unwrap<ZoneRecord>(adminHttp.put("/zone", payload)),
  deleteZone: (id: number) => unwrap<null>(adminHttp.delete(`/zone/${id}`)),
  getPlots: () => unwrap<PageResult<PlotRecord>>(adminHttp.get("/plot/list", { params: { pageNum: 1, pageSize: 100 } })),
  getPlot: (id: number) => unwrap<PlotRecord>(adminHttp.get(`/plot/${id}`)),
  createPlot: (payload: Omit<PlotRecord, "id">) => unwrap<PlotRecord>(adminHttp.post("/plot", payload)),
  updatePlot: (payload: Partial<PlotRecord> & { id: number }) => unwrap<PlotRecord>(adminHttp.put("/plot", payload)),
  deletePlot: (id: number) => unwrap<null>(adminHttp.delete(`/plot/${id}`)),
  getDevices: () => unwrap<PageResult<DeviceRecord>>(adminHttp.get("/device/list", { params: { pageNum: 1, pageSize: 100 } })),
  createDevice: (payload: Omit<DeviceRecord, "id" | "onlineStatus" | "status"> & { status?: number }) =>
    unwrap<DeviceRecord>(adminHttp.post("/device", payload)),
  updateDevice: (payload: Partial<DeviceRecord> & { id: number }) => unwrap<DeviceRecord>(adminHttp.put("/device", payload)),
  deleteDevice: (id: number) => unwrap<null>(adminHttp.delete(`/device/${id}`)),
  updateDeviceStatus: (id: number, status: number) =>
    unwrap<null>(adminHttp.put(`/device/${id}/status`, null, { params: { status } })),
  getImages: (type: "mobile" | "camera" | "drone") =>
    unwrap<PageResult<ImageRecord>>(adminHttp.get(`/image/${type}/list`, { params: { pageNum: 1, pageSize: 100 } })),
  deleteImage: (type: "mobile" | "camera" | "drone", id: number) => unwrap<null>(adminHttp.delete(`/image/${type}/${id}`)),
  getDetections: (type: "mobile" | "camera" | "drone") =>
    unwrap<PageResult<DetectionRecord>>(adminHttp.get(`/detection/${type}/list`, { params: { pageNum: 1, pageSize: 100 } })),
  getKnowledge: () => unwrap<PageResult<KnowledgeRecord>>(adminHttp.get("/knowledge/list", { params: { pageNum: 1, pageSize: 100 } })),
  getKnowledgeDetail: (id: number) => unwrap<KnowledgeRecord>(adminHttp.get(`/knowledge/${id}`)),
  createKnowledge: (payload: Omit<KnowledgeRecord, "id">) => unwrap<KnowledgeRecord>(adminHttp.post("/knowledge", payload)),
  updateKnowledge: (payload: Partial<KnowledgeRecord> & { id: number }) => unwrap<KnowledgeRecord>(adminHttp.put("/knowledge", payload)),
  deleteKnowledge: (id: number) => unwrap<null>(adminHttp.delete(`/knowledge/${id}`)),
  getUsers: () => unwrap<PageResult<UserRecord>>(adminHttp.get("/user/list", { params: { pageNum: 1, pageSize: 100 } })),
  getUser: (id: number) => unwrap<UserRecord>(adminHttp.get(`/user/${id}`)),
  createUser: (payload: Omit<UserRecord, "id" | "status"> & { password: string; status?: number }) =>
    unwrap<UserRecord>(adminHttp.post("/user", payload)),
  updateUser: (payload: Partial<UserRecord> & { id: number }) => unwrap<UserRecord>(adminHttp.put("/user", payload)),
  deleteUser: (id: number) => unwrap<null>(adminHttp.delete(`/user/${id}`)),
  updateUserStatus: (id: number, status: number) => unwrap<null>(adminHttp.put(`/user/${id}/status`, null, { params: { status } })),
  getRoles: () => unwrap<RoleRecord[]>(adminHttp.get("/role/list")),
  getRole: (id: number) => unwrap<RoleRecord>(adminHttp.get(`/role/${id}`)),
  createRole: (payload: Omit<RoleRecord, "id" | "status"> & { status?: number }) => unwrap<RoleRecord>(adminHttp.post("/role", payload)),
  updateRole: (payload: Partial<RoleRecord> & { id: number }) => unwrap<RoleRecord>(adminHttp.put("/role", payload)),
  deleteRole: (id: number) => unwrap<null>(adminHttp.delete(`/role/${id}`))
};
