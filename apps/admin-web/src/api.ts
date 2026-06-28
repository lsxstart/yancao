import axios from "axios";

const API_TOKEN_KEY = "YANCAO_ADMIN_TOKEN";
const MOCK_ACCOUNT_KEY = "YANCAO_ADMIN_MOCK_ACCOUNT";
const viteEnv = import.meta as ImportMeta & {
  env?: {
    VITE_API_BASE_URL?: string;
    VITE_API_TIMEOUT_MS?: string;
    VITE_ADMIN_MOCK?: string;
  };
};

const API_BASE_URL = viteEnv.env?.VITE_API_BASE_URL ?? "http://118.24.185.177:8080/api/v1";
const API_TIMEOUT_MS = Number(viteEnv.env?.VITE_API_TIMEOUT_MS ?? 10000);
const USE_ADMIN_MOCK = viteEnv.env?.VITE_ADMIN_MOCK === "true";

function clearExpiredAuth() {
  localStorage.removeItem(API_TOKEN_KEY);
  window.dispatchEvent(new Event("admin-auth-expired"));
}

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
  varietyId?: number;
  varietyName?: string;
  zoneId?: number;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  area: number;
  status: number;
}

export interface VarietyRecord {
  id: number;
  varietyName: string;
  varietyCode: string;
  characteristics?: string;
  growthPeriod?: number;
  diseaseResistance?: string;
  suitableRegion?: string;
  description?: string;
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

export interface AiModelRecord {
  id: number;
  modelName: string;
  version?: string;
  isDefault?: number | boolean;
  apiUrl?: string;
  apiMethod?: string;
  description?: string;
  status?: number;
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
  severity?: string;
  totalPlants?: number;
  infectedPlants?: number;
  healthyPlants?: number;
  confidence?: number;
  infectionRate?: number;
  diseaseRatio?: number;
  diseaseLevel?: string;
  oriImageUrl?: string;
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
  baseURL: API_BASE_URL,
  timeout: Number.isFinite(API_TIMEOUT_MS) && API_TIMEOUT_MS > 0 ? API_TIMEOUT_MS : 10000,
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

adminHttp.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse<unknown>;
    if (typeof payload?.code === "number" && payload.code !== 200) {
      if (payload.code === 401) {
        clearExpiredAuth();
      }
      return Promise.reject(new Error(payload.message ?? payload.msg ?? "接口请求失败"));
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        clearExpiredAuth();
      }

      if (error.code === "ECONNABORTED") {
        return Promise.reject(new Error(`后端接口响应超时：${API_BASE_URL}。请确认后端服务正常、登录接口未阻塞，或通过 VITE_API_TIMEOUT_MS 调整超时时间。`));
      }

      if (!error.response) {
        return Promise.reject(new Error(`无法连接后端接口：${API_BASE_URL}。请检查网络、服务地址或浏览器 CORS 配置。`));
      }
    }

    return Promise.reject(error);
  }
);

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>) {
  const response = await request;
  return response.data.data;
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

const httpAdminApi = {
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
  getVarieties: () => unwrap<PageResult<VarietyRecord>>(adminHttp.get("/variety/list", { params: { pageNum: 1, pageSize: 100 } })),
  createVariety: (payload: Omit<VarietyRecord, "id" | "status"> & { status?: number }) =>
    unwrap<VarietyRecord>(adminHttp.post("/variety", payload)),
  updateVariety: (payload: Partial<VarietyRecord> & { id: number }) => unwrap<VarietyRecord>(adminHttp.put("/variety", payload)),
  deleteVariety: (id: number) => unwrap<null>(adminHttp.delete(`/variety/${id}`)),
  getDevices: () => unwrap<PageResult<DeviceRecord>>(adminHttp.get("/device/list", { params: { pageNum: 1, pageSize: 100 } })),
  createDevice: (payload: Omit<DeviceRecord, "id" | "onlineStatus" | "status"> & { status?: number }) =>
    unwrap<DeviceRecord>(adminHttp.post("/device", payload)),
  updateDevice: (payload: Partial<DeviceRecord> & { id: number }) => unwrap<DeviceRecord>(adminHttp.put("/device", payload)),
  deleteDevice: (id: number) => unwrap<null>(adminHttp.delete(`/device/${id}`)),
  updateDeviceStatus: (id: number, status: number) =>
    unwrap<null>(adminHttp.put(`/device/${id}/status`, null, { params: { status } })),
  getModels: async () => normalizePageData(await unwrap<PageResult<AiModelRecord> | AiModelRecord[]>(adminHttp.get("/model/list", { params: { pageNum: 1, pageSize: 100 } }))),
  getImages: (type: "mobile" | "camera" | "drone") =>
    unwrap<PageResult<ImageRecord>>(adminHttp.get(`/image/${type}/list`, { params: { pageNum: 1, pageSize: 100 } })),
  createImage: (type: "mobile" | "camera" | "drone", payload: Omit<ImageRecord, "id" | "createTime">) =>
    unwrap<ImageRecord>(adminHttp.post(`/image/${type}`, payload)),
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

function toPage<T>(records: T[]): PageResult<T> {
  return {
    total: records.length,
    pageNum: 1,
    pageSize: 100,
    records: records.map((record) => ({ ...record }))
  };
}

function nextId(records: Array<{ id: number }>) {
  return records.reduce((max, record) => Math.max(max, record.id), 0) + 1;
}

function findRecord<T extends { id: number }>(records: T[], id: number, label: string) {
  const record = records.find((item) => item.id === id);
  if (!record) {
    throw new Error(`${label}不存在`);
  }
  return record;
}

function removeRecord<T extends { id: number }>(records: T[], id: number) {
  return records.filter((record) => record.id !== id);
}

async function mockResolve<T>(value: T) {
  await new Promise((resolve) => window.setTimeout(resolve, 120));
  return value;
}

function mockImage(label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="220"><rect width="360" height="220" fill="#e8f2ff"/><rect x="18" y="18" width="324" height="184" rx="12" fill="#ffffff"/><text x="180" y="116" text-anchor="middle" font-size="24" fill="#1677ff" font-family="Arial">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const mockUser: AuthUser = {
  id: 1,
  username: "admin",
  realName: "系统管理员",
  roles: ["admin"],
  permissions: ["*"]
};

const mockAccounts: Record<string, { password: string; user: AuthUser; zoneIds?: number[] }> = {
  admin: { password: "admin123", user: mockUser },
  baoji: {
    password: "baoji123",
    user: { id: 2, username: "baoji", realName: "宝鸡烟区账号", roles: ["zone_user"], permissions: ["zone:baoji"] },
    zoneIds: [1]
  },
  xunyi: {
    password: "xunyi123",
    user: { id: 3, username: "xunyi", realName: "旬邑烟区账号", roles: ["zone_user"], permissions: ["zone:xunyi"] },
    zoneIds: [2]
  },
  fuxian: {
    password: "fuxian123",
    user: { id: 4, username: "fuxian", realName: "富县烟区账号", roles: ["zone_user"], permissions: ["zone:fuxian"] },
    zoneIds: [3]
  }
};

let currentMockAccount = mockAccounts[localStorage.getItem(MOCK_ACCOUNT_KEY) ?? "admin"] ?? mockAccounts.admin;

let mockZones: ZoneRecord[] = [
  { id: 1, zoneName: "宝鸡烟区", zoneCode: "BAOJI", province: "陕西省", city: "宝鸡市", description: "宝鸡烟草病毒病监测烟区", status: 1 },
  { id: 2, zoneName: "旬邑烟区", zoneCode: "XUNYI", province: "陕西省", city: "咸阳市", description: "旬邑烟草病毒病监测烟区", status: 1 },
  { id: 3, zoneName: "富县烟区", zoneCode: "FUXIAN", province: "陕西省", city: "延安市", description: "富县烟草病毒病监测烟区", status: 1 }
];

let mockPlots: PlotRecord[] = [
  { id: 1, plotName: "宝鸡示范田001", plotCode: "BJ-001", zoneId: 1, province: "陕西省", city: "宝鸡市", district: "凤翔区", address: "宝鸡示范基地东区", area: 32.5, status: 1 },
  { id: 2, plotName: "旬邑侯家沟003", plotCode: "XY-003", zoneId: 2, province: "陕西省", city: "咸阳市", district: "旬邑县", address: "侯家沟片区", area: 45.2, status: 1 },
  { id: 3, plotName: "旬邑侯家沟030", plotCode: "XY-030", zoneId: 2, province: "陕西省", city: "咸阳市", district: "旬邑县", address: "侯家沟连片区", area: 28.8, status: 1 },
  { id: 4, plotName: "富县示范田005", plotCode: "FX-005", zoneId: 3, province: "陕西省", city: "延安市", district: "富县", address: "富县示范基地", area: 36.1, status: 1 }
];

let mockVarieties: VarietyRecord[] = [
  { id: 1, varietyName: "秦烟99", varietyCode: "QY99", characteristics: "叶片宽大，烤后色泽金黄", growthPeriod: 120, diseaseResistance: "中抗黑胫病", suitableRegion: "陕西", description: "陕西主栽品种", status: 1 },
  { id: 2, varietyName: "云烟97", varietyCode: "YY97", characteristics: "株型紧凑，耐肥性强", growthPeriod: 130, diseaseResistance: "抗黑胫病", suitableRegion: "云南", description: "高产品种", status: 1 }
];

let mockDevices: DeviceRecord[] = [
  { id: 1, plotId: 1, deviceCode: "BJ-CAM-001", deviceName: "宝鸡固定摄像头", deviceType: "camera", model: "IPC-4M", apiUrl: "http://mock.local/camera/1", onlineStatus: 1, status: 1 },
  { id: 2, plotId: 2, deviceCode: "XY-CAM-001", deviceName: "旬邑侯家沟摄像头", deviceType: "camera", model: "IPC-4M", apiUrl: "http://mock.local/camera/2", onlineStatus: 1, status: 1 },
  { id: 3, plotId: 4, deviceCode: "FX-CAM-001", deviceName: "富县固定摄像头", deviceType: "camera", model: "IPC-4M", apiUrl: "http://mock.local/camera/3", onlineStatus: 0, status: 1 },
  { id: 4, plotId: 2, deviceCode: "UAV-001", deviceName: "旬邑巡检无人机", deviceType: "drone", model: "UAV-X1", apiUrl: "http://mock.local/drone/1", onlineStatus: 1, status: 1 }
];

let mockModels: AiModelRecord[] = [
  {
    id: 1,
    modelName: "近地烟草病毒病识别模型",
    version: "v1.0",
    isDefault: 1,
    apiUrl: "http://mock.local/model/near-ground",
    apiMethod: "POST",
    description: "用于手机图片和摄像头抓帧的烟草病毒病识别。"
  },
  {
    id: 2,
    modelName: "病虫害区域检测模型",
    version: "v1.0",
    isDefault: 0,
    apiUrl: "http://mock.local/model/drone-region",
    apiMethod: "POST",
    description: "用于无人机大幅面图像的病害区域检测。"
  }
];

let mockMobileImages: ImageRecord[] = [
  { id: 1, plotId: 1, imageUrl: mockImage("手机图片"), thumbnailUrl: mockImage("手机缩略图"), shootTime: "2026-06-22 09:30:00", createTime: "2026-06-22 09:35:00", uploadUserId: 1 }
];

let mockCameraImages: ImageRecord[] = [
  { id: 1, plotId: 1, deviceId: 1, imageUrl: mockImage("摄像头图片"), thumbnailUrl: mockImage("摄像头缩略图"), shootTime: "2026-06-22 10:00:00", createTime: "2026-06-22 10:01:00" }
];

let mockDroneImages: ImageRecord[] = [
  { id: 1, plotId: 2, imageUrl: mockImage("侯家沟003"), thumbnailUrl: mockImage("侯家沟003"), shootTime: "2026-05-29 00:00:00", createTime: "2026-05-29 09:30:00", uploadUserId: 1, purpose: "巡田" },
  { id: 2, plotId: 3, imageUrl: mockImage("侯家沟030"), thumbnailUrl: mockImage("侯家沟030"), shootTime: "2026-07-21 00:00:00", createTime: "2026-07-21 09:30:00", uploadUserId: 1, purpose: "巡田" },
  { id: 3, plotId: 4, imageUrl: mockImage("富县005"), thumbnailUrl: mockImage("富县005"), shootTime: "2026-07-21 00:00:00", createTime: "2026-07-21 09:30:00", uploadUserId: 1, purpose: "巡田" },
  { id: 4, plotId: 1, imageUrl: mockImage("宝鸡001"), thumbnailUrl: mockImage("宝鸡001"), shootTime: "2026-07-22 00:00:00", createTime: "2026-07-22 09:30:00", uploadUserId: 1, purpose: "巡田" }
];

const mockDetections: Record<"mobile" | "camera" | "drone", DetectionRecord[]> = {
  mobile: [
    { id: 1, imageId: 1, plotId: 1, modelId: 1, diseaseName: "烟草花叶病毒病", diseaseCode: "TMV", confidence: 86, infectionRate: 12, detectTime: "2026-06-22 09:40:00" }
  ],
  camera: [
    { id: 1, imageId: 1, plotId: 1, modelId: 1, diseaseName: "黄瓜花叶病毒病", diseaseCode: "CMV", confidence: 78, infectionRate: 8, detectTime: "2026-06-22 10:05:00" }
  ],
  drone: [
    { id: 1, imageId: 1, plotId: 2, modelId: 1, diseaseName: "马铃薯Y病毒病", diseaseCode: "PVY", confidence: 82, diseaseRatio: 15, detectTime: "2026-06-22 11:45:00" }
  ]
};

let mockKnowledge: KnowledgeRecord[] = [
  { id: 1, diseaseName: "烟草花叶病毒病", diseaseCode: "TMV", symptoms: "叶片出现花叶、皱缩、畸形等症状。", prevention: "加强苗期管理，及时清除病株，工具消毒。", exampleImages: JSON.stringify([mockImage("TMV")]) },
  { id: 2, diseaseName: "黄瓜花叶病毒病", diseaseCode: "CMV", symptoms: "叶片斑驳褪绿，植株矮化。", prevention: "防治蚜虫传播，选用健康种苗。", exampleImages: JSON.stringify([mockImage("CMV")]) }
];

let mockUsers: UserRecord[] = [
  { id: 1, username: "admin", realName: "系统管理员", phone: "13800000000", email: "admin@example.com", status: 1 },
  { id: 2, username: "baoji", realName: "宝鸡烟区账号", phone: "13900000001", email: "baoji@example.com", status: 1 },
  { id: 3, username: "xunyi", realName: "旬邑烟区账号", phone: "13900000002", email: "xunyi@example.com", status: 1 },
  { id: 4, username: "fuxian", realName: "富县烟区账号", phone: "13900000003", email: "fuxian@example.com", status: 1 }
];

let mockRoles: RoleRecord[] = [
  { id: 1, roleName: "管理员", roleCode: "admin", description: "拥有全部管理权限", status: 1 },
  { id: 2, roleName: "普通用户", roleCode: "user", description: "查看和基础操作权限", status: 1 }
];

function scopedZones() {
  return currentMockAccount.zoneIds ? mockZones.filter((zone) => currentMockAccount.zoneIds?.includes(zone.id)) : mockZones;
}

function scopedPlots() {
  return currentMockAccount.zoneIds ? mockPlots.filter((plot) => currentMockAccount.zoneIds?.includes(plot.zoneId ?? 0)) : mockPlots;
}

function scopedPlotIds() {
  return new Set(scopedPlots().map((plot) => plot.id));
}

function scopedByPlot<T extends { plotId: number }>(records: T[]) {
  const ids = scopedPlotIds();
  return records.filter((record) => ids.has(record.plotId));
}

const mockAdminApi: typeof httpAdminApi = {
  login: (payload) => {
    const account = mockAccounts[payload.username];
    if (!account || account.password !== payload.password) {
      return Promise.reject(new Error("账号或密码错误"));
    }
    currentMockAccount = account;
    localStorage.setItem(MOCK_ACCOUNT_KEY, payload.username);
    return mockResolve({
      token: "mock-admin-token",
      userInfo: account.user
    });
  },
  getUserInfo: () => mockResolve(currentMockAccount.user),
  logout: () => {
    localStorage.removeItem(MOCK_ACCOUNT_KEY);
    currentMockAccount = mockAccounts.admin;
    return mockResolve(null);
  },
  getZones: () => mockResolve(toPage(scopedZones())),
  createZone: (payload) => {
    const record: ZoneRecord = { ...payload, id: nextId(mockZones), status: payload.status ?? 1 };
    mockZones = [record, ...mockZones];
    return mockResolve(record);
  },
  updateZone: (payload) => {
    const record = findRecord(mockZones, payload.id, "烟区");
    Object.assign(record, payload);
    return mockResolve({ ...record });
  },
  deleteZone: (id) => {
    mockZones = removeRecord(mockZones, id);
    return mockResolve(null);
  },
  getPlots: () => mockResolve(toPage(scopedPlots())),
  getPlot: (id) => mockResolve({ ...findRecord(mockPlots, id, "烟田") }),
  createPlot: (payload) => {
    const record: PlotRecord = { ...payload, id: nextId(mockPlots) };
    mockPlots = [record, ...mockPlots];
    return mockResolve(record);
  },
  updatePlot: (payload) => {
    const record = findRecord(mockPlots, payload.id, "烟田");
    Object.assign(record, payload);
    return mockResolve({ ...record });
  },
  deletePlot: (id) => {
    mockPlots = removeRecord(mockPlots, id);
    return mockResolve(null);
  },
  getVarieties: () => mockResolve(toPage(mockVarieties)),
  createVariety: (payload) => {
    const record: VarietyRecord = { ...payload, id: nextId(mockVarieties), status: payload.status ?? 1 };
    mockVarieties = [record, ...mockVarieties];
    return mockResolve(record);
  },
  updateVariety: (payload) => {
    const record = findRecord(mockVarieties, payload.id, "烟草品种");
    Object.assign(record, payload);
    return mockResolve({ ...record });
  },
  deleteVariety: (id) => {
    mockVarieties = removeRecord(mockVarieties, id);
    return mockResolve(null);
  },
  getDevices: () => mockResolve(toPage(scopedByPlot(mockDevices))),
  createDevice: (payload) => {
    const record: DeviceRecord = { ...payload, id: nextId(mockDevices), onlineStatus: 0, status: payload.status ?? 1 };
    mockDevices = [record, ...mockDevices];
    return mockResolve(record);
  },
  updateDevice: (payload) => {
    const record = findRecord(mockDevices, payload.id, "设备");
    Object.assign(record, payload);
    return mockResolve({ ...record });
  },
  deleteDevice: (id) => {
    mockDevices = removeRecord(mockDevices, id);
    return mockResolve(null);
  },
  updateDeviceStatus: (id, status) => {
    findRecord(mockDevices, id, "设备").status = status;
    return mockResolve(null);
  },
  getModels: () => mockResolve(toPage(mockModels)),
  getImages: (type) => {
    const source = type === "mobile" ? mockMobileImages : type === "camera" ? mockCameraImages : mockDroneImages;
    return mockResolve(toPage(scopedByPlot(source)));
  },
  createImage: (type, payload) => {
    const source = type === "mobile" ? mockMobileImages : type === "camera" ? mockCameraImages : mockDroneImages;
    const record: ImageRecord = { ...payload, id: nextId(source), createTime: new Date().toISOString() };
    if (type === "mobile") {
      mockMobileImages = [record, ...mockMobileImages];
    } else if (type === "camera") {
      mockCameraImages = [record, ...mockCameraImages];
    } else {
      mockDroneImages = [record, ...mockDroneImages];
    }
    return mockResolve(record);
  },
  deleteImage: (type, id) => {
    if (type === "mobile") {
      mockMobileImages = removeRecord(mockMobileImages, id);
    } else if (type === "camera") {
      mockCameraImages = removeRecord(mockCameraImages, id);
    } else {
      mockDroneImages = removeRecord(mockDroneImages, id);
    }
    return mockResolve(null);
  },
  getDetections: (type) => mockResolve(toPage(scopedByPlot(mockDetections[type]))),
  getKnowledge: () => mockResolve(toPage(mockKnowledge)),
  getKnowledgeDetail: (id) => mockResolve({ ...findRecord(mockKnowledge, id, "病害") }),
  createKnowledge: (payload) => {
    const record: KnowledgeRecord = { ...payload, id: nextId(mockKnowledge) };
    mockKnowledge = [record, ...mockKnowledge];
    return mockResolve(record);
  },
  updateKnowledge: (payload) => {
    const record = findRecord(mockKnowledge, payload.id, "病害");
    Object.assign(record, payload);
    return mockResolve({ ...record });
  },
  deleteKnowledge: (id) => {
    mockKnowledge = removeRecord(mockKnowledge, id);
    return mockResolve(null);
  },
  getUsers: () => mockResolve(toPage(mockUsers)),
  getUser: (id) => mockResolve({ ...findRecord(mockUsers, id, "用户") }),
  createUser: (payload) => {
    const record: UserRecord = { id: nextId(mockUsers), username: payload.username, realName: payload.realName, phone: payload.phone, email: payload.email, status: payload.status ?? 1 };
    mockUsers = [record, ...mockUsers];
    return mockResolve(record);
  },
  updateUser: (payload) => {
    const record = findRecord(mockUsers, payload.id, "用户");
    Object.assign(record, payload);
    return mockResolve({ ...record });
  },
  deleteUser: (id) => {
    mockUsers = removeRecord(mockUsers, id);
    return mockResolve(null);
  },
  updateUserStatus: (id, status) => {
    findRecord(mockUsers, id, "用户").status = status;
    return mockResolve(null);
  },
  getRoles: () => mockResolve(mockRoles.map((role) => ({ ...role }))),
  getRole: (id) => mockResolve({ ...findRecord(mockRoles, id, "角色") }),
  createRole: (payload) => {
    const record: RoleRecord = { ...payload, id: nextId(mockRoles), status: payload.status ?? 1 };
    mockRoles = [record, ...mockRoles];
    return mockResolve(record);
  },
  updateRole: (payload) => {
    const record = findRecord(mockRoles, payload.id, "角色");
    Object.assign(record, payload);
    return mockResolve({ ...record });
  },
  deleteRole: (id) => {
    mockRoles = removeRecord(mockRoles, id);
    return mockResolve(null);
  }
};

export const adminApi = USE_ADMIN_MOCK ? mockAdminApi : httpAdminApi;
