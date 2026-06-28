import { useEffect, useState, type Key, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AppstoreOutlined,
  BankOutlined,
  BugOutlined,
  CameraOutlined,
  CloseOutlined,
  ControlOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  DeploymentUnitOutlined,
  EditOutlined,
  ExperimentOutlined,
  FileImageOutlined,
  FolderOpenOutlined,
  HistoryOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MobileOutlined,
  MonitorOutlined,
  PictureOutlined,
  PlusOutlined,
  ProfileOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SettingOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
  VideoCameraOutlined
} from "@ant-design/icons";
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  Divider,
  Form,
  Image,
  Input,
  Layout,
  Menu,
  Modal,
  Progress,
  Segmented,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  Upload
} from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  adminApi,
  type AiModelRecord,
  type DetectionRecord,
  type DeviceRecord,
  type ImageRecord,
  type KnowledgeRecord,
  type PlotRecord,
  type RoleRecord,
  type UserRecord,
  type VarietyRecord,
  type ZoneRecord
} from "./api";
import "./styles.css";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

type PageKey =
  | "home"
  | "zone"
  | "plot"
  | "variety"
  | "image-mobile"
  | "image-camera"
  | "image-drone"
  | "detection-mobile"
  | "detection-camera"
  | "detection-drone"
  | "result-near-ground"
  | "result-drone"
  | "knowledge"
  | "device"
  | "user-list"
  | "permission";

type SourceType = "mobile" | "camera" | "drone";
type MenuItem = Required<MenuProps>["items"][number];

interface LoginValues {
  username: string;
  password: string;
  remember?: boolean;
}

interface EditDialogState {
  title: string;
  value: string;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
}

interface DeleteDialogState {
  title: string;
  content: string;
  onConfirm: () => Promise<void> | void;
}

const editFieldLabels: Record<string, string> = {
  zoneName: "烟区名称",
  zoneCode: "烟区编码",
  plotName: "烟田名称",
  plotCode: "烟田编码",
  varietyName: "品种名称",
  varietyCode: "品种编码",
  characteristics: "品种特征",
  growthPeriod: "生育期（天）",
  diseaseResistance: "抗病性",
  suitableRegion: "适宜区域",
  zoneId: "所属烟区",
  plotId: "所属烟田",
  province: "省份",
  city: "城市",
  district: "区县",
  address: "地址",
  longitude: "东经（°E）",
  latitude: "北纬（°N）",
  area: "面积",
  status: "状态",
  description: "说明",
  deviceCode: "设备编码",
  deviceName: "设备名称",
  deviceType: "设备类型",
  model: "设备型号",
  apiUrl: "接口地址",
  onlineStatus: "在线状态",
  imageUrl: "图片地址",
  thumbnailUrl: "缩略图地址",
  uploadUserId: "上传用户ID",
  deviceId: "设备ID",
  shootTime: "拍摄时间",
  purpose: "用途",
  diseaseName: "病害名称",
  diseaseCode: "病害编码",
  symptoms: "典型症状",
  prevention: "防治建议",
  exampleImages: "示例图片",
  username: "用户名",
  realName: "姓名",
  phone: "手机号",
  email: "邮箱",
  password: "密码",
  roleName: "角色名称",
  roleCode: "角色编码"
};

const hiddenEditFields = new Set([
  "id",
  "createTime",
  "updateTime",
  "deleted",
  "createUserId",
  "lastHeartbeat"
]);

const multilineEditFields = new Set(["description", "address", "symptoms", "prevention", "exampleImages", "characteristics", "diseaseResistance"]);

const pageLabels: Record<PageKey, string> = {
  home: "首页",
  zone: "烟区",
  plot: "烟田",
  variety: "烟草品种",
  "image-mobile": "手机图片",
  "image-camera": "摄像头图片",
  "image-drone": "无人机图片",
  "detection-mobile": "手机检测结果",
  "detection-camera": "摄像头检测结果",
  "detection-drone": "无人机检测结果",
  "result-near-ground": "近地检测",
  "result-drone": "无人机检测",
  knowledge: "病害知识库",
  device: "烟区烟田设备",
  "user-list": "用户列表",
  permission: "用户权限管理"
};

const multimodalPages = new Set<PageKey>([
  "zone",
  "plot",
  "variety",
  "image-mobile",
  "image-camera",
  "image-drone",
  "detection-mobile",
  "detection-camera",
  "detection-drone",
  "knowledge",
  "device",
  "user-list",
  "permission"
]);

function sectionTitle(icon: ReactNode, label: string) {
  return (
    <span className="section-title">
      <span className="section-title-icon">{icon}</span>
      {label}
    </span>
  );
}

const menuItems: MenuItem[] = [
  {
    key: "home",
    icon: <HomeOutlined />,
    label: "首页"
  },
  {
    key: "multimodal-data",
    icon: <DatabaseOutlined />,
    label: "多模态数据管理",
    children: [
      {
        key: "data",
        icon: <AppstoreOutlined />,
        label: "数据管理",
        children: [
          { key: "zone", icon: <BankOutlined />, label: "烟区" },
          { key: "plot", icon: <DeploymentUnitOutlined />, label: "烟田" },
          { key: "variety", icon: <ExperimentOutlined />, label: "烟草品种" },
          {
            key: "images",
            icon: <PictureOutlined />,
            label: "图像管理",
            children: [
              { key: "image-mobile", icon: <MobileOutlined />, label: "手机图片" },
              { key: "image-camera", icon: <CameraOutlined />, label: "摄像头图片" },
              { key: "image-drone", icon: <FileImageOutlined />, label: "无人机图片" }
            ]
          },
          {
            key: "detection-results",
            icon: <ProfileOutlined />,
            label: "结果管理",
            children: [
              { key: "detection-mobile", icon: <MobileOutlined />, label: "手机检测结果" },
              { key: "detection-camera", icon: <CameraOutlined />, label: "摄像头检测结果" },
              { key: "detection-drone", icon: <FileImageOutlined />, label: "无人机检测结果" }
            ]
          },
          { key: "knowledge", icon: <FolderOpenOutlined />, label: "病害知识库" }
        ]
      },
      {
        key: "device-group",
        icon: <ControlOutlined />,
        label: "设备管理",
        children: [{ key: "device", icon: <VideoCameraOutlined />, label: "烟区烟田设备" }]
      },
      {
        key: "user-group",
        icon: <TeamOutlined />,
        label: "用户管理",
        children: [
          { key: "user-list", icon: <UserOutlined />, label: "用户列表" },
          { key: "permission", icon: <SafetyCertificateOutlined />, label: "用户权限管理" }
        ]
      }
    ]
  },
  {
    key: "virus-monitoring",
    icon: <BugOutlined />,
    label: "烟草病毒病诊断",
    children: [
      { key: "result-near-ground", icon: <MonitorOutlined />, label: "近地检测" },
      { key: "result-drone", icon: <DeploymentUnitOutlined />, label: "无人机检测" }
    ]
  }
];

function includesKeyword(values: Array<string | number | undefined | null>, keyword: string) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return values.some((value) => String(value ?? "").toLowerCase().includes(normalized));
}

function getPlotName(plots: PlotRecord[], plotId?: number) {
  if (!plotId) {
    return "-";
  }
  return plots.find((plot) => plot.id === plotId)?.plotName ?? `地块ID ${plotId}`;
}

function renderPlotName(plots: PlotRecord[], plotId?: number) {
  return <Tag className="plot-name-tag">{getPlotName(plots, plotId)}</Tag>;
}

function getSeverityDisplay(value?: string, rate?: number) {
  const normalized = String(value ?? "").trim();
  if (normalized === "1" || normalized === "轻度") {
    return { label: "轻度", tone: "mild" };
  }
  if (normalized === "2" || normalized === "中度") {
    return { label: "中度", tone: "moderate" };
  }
  if (normalized === "3" || normalized === "重度" || normalized === "严重") {
    return { label: "重度", tone: "severe" };
  }
  return getDetectionLevel(rate);
}

function renderSeverity(value?: string, rate?: number) {
  const severity = getSeverityDisplay(value, rate);
  return <Tag className={`severity-tag is-${severity.tone}`}>{severity.label}</Tag>;
}

function getZoneName(zones: ZoneRecord[], zoneId?: number) {
  if (!zoneId) {
    return "-";
  }
  return zones.find((zone) => zone.id === zoneId)?.zoneName ?? `烟区ID ${zoneId}`;
}

function getPlotZoneName(plots: PlotRecord[], zones: ZoneRecord[], plotId?: number) {
  const plot = plots.find((item) => item.id === plotId);
  return getZoneName(zones, plot?.zoneId);
}

function getFileName(url?: string) {
  if (!url) {
    return "-";
  }
  const cleanUrl = url.split("?")[0];
  return decodeURIComponent(cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1) || cleanUrl);
}

function countExampleImages(value?: string) {
  if (!value) {
    return 0;
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return value.split(",").filter(Boolean).length;
  }
}

function showRecordDetail(title: string, record: unknown) {
  Modal.info({
    title,
    width: 720,
    content: <pre className="record-json-preview">{JSON.stringify(record, null, 2)}</pre>
  });
}

function openJsonEdit<T extends { id: number }>({
  title,
  record,
  onSubmit
}: {
  title: string;
  record: T;
  onSubmit: (payload: T) => Promise<void>;
}) {
  window.dispatchEvent(new CustomEvent<EditDialogState>("admin-json-edit", {
    detail: {
      title,
      value: JSON.stringify(record, null, 2),
      onSubmit: onSubmit as unknown as EditDialogState["onSubmit"]
    }
  }));
}

function openCreateForm({
  title,
  initialValues,
  onSubmit
}: {
  title: string;
  initialValues: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
}) {
  window.dispatchEvent(new CustomEvent<EditDialogState>("admin-json-edit", {
    detail: {
      title,
      value: JSON.stringify(initialValues, null, 2),
      onSubmit
    }
  }));
}

function AdminEditDialog({
  dialog,
  onChange,
  onClose
}: {
  dialog: EditDialogState | null;
  onChange: (value: string) => void;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const values = (() => {
    try {
      return JSON.parse(dialog?.value ?? "{}") as Record<string, unknown>;
    } catch {
      return {};
    }
  })();
  const editableFields = Object.entries(values).filter(([key]) => !hiddenEditFields.has(key));

  const updateField = (key: string, value: unknown) => {
    onChange(JSON.stringify({ ...values, [key]: value }, null, 2));
  };

  return (
    <Modal
      title={dialog?.title}
      open={Boolean(dialog)}
      width={640}
      okText="确定"
      cancelText="取消"
      confirmLoading={submitting}
      onCancel={onClose}
      onOk={async () => {
        if (!dialog) {
          return;
        }
        setSubmitting(true);
        try {
          const payload = JSON.parse(dialog.value) as Record<string, unknown>;
          await dialog.onSubmit(payload);
          onClose();
        } catch (error) {
          Modal.error({
            title: "保存失败",
            content: error instanceof Error ? error.message : "请检查编辑内容或接口返回。"
          });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <Form className="record-edit-form" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
        {editableFields.map(([key, value]) => {
          const label = editFieldLabels[key] ?? key;

          if (key === "status") {
            return (
              <Form.Item key={key} label={label}>
                <Select
                  value={value as number}
                  options={[
                    { label: "启用", value: 1 },
                    { label: "停用", value: 0 }
                  ]}
                  onChange={(nextValue) => updateField(key, nextValue)}
                />
              </Form.Item>
            );
          }

          if (key === "onlineStatus") {
            return (
              <Form.Item key={key} label={label}>
                <Select
                  value={value as number}
                  options={[
                    { label: "在线", value: 1 },
                    { label: "离线", value: 0 }
                  ]}
                  onChange={(nextValue) => updateField(key, nextValue)}
                />
              </Form.Item>
            );
          }

          if (key === "deviceType") {
            return (
              <Form.Item key={key} label={label}>
                <Select
                  value={value as string}
                  options={[
                    { label: "摄像头", value: "camera" },
                    { label: "无人机", value: "drone" }
                  ]}
                  onChange={(nextValue) => updateField(key, nextValue)}
                />
              </Form.Item>
            );
          }

          if (multilineEditFields.has(key)) {
            return (
              <Form.Item key={key} label={label}>
                <TextArea rows={3} value={String(value ?? "")} onChange={(event) => updateField(key, event.target.value)} />
              </Form.Item>
            );
          }

          return (
            <Form.Item key={key} label={label}>
              <Input
                type={key === "password" ? "password" : typeof value === "number" ? "number" : "text"}
                value={value === null || value === undefined ? "" : String(value)}
                onChange={(event) => updateField(key, typeof value === "number" ? Number(event.target.value) : event.target.value)}
              />
            </Form.Item>
          );
        })}
      </Form>
    </Modal>
  );
}

function PageShell({
  activePage: _activePage,
  children
}: {
  activePage: PageKey;
  children: ReactNode;
}) {
  return (
    <Space direction="vertical" size={8} className="full-width">
      {children}
    </Space>
  );
}

function ListFilterPanel({
  children,
  onSearch,
  onReset
}: {
  children: ReactNode;
  onSearch: () => void;
  onReset: () => void;
}) {
  return (
    <div className="list-filter-panel">
      <div className="list-filter-fields">{children}</div>
      <Space>
        <Button icon={<SearchOutlined />} type="primary" onClick={onSearch}>搜索</Button>
        <Button icon={<ReloadOutlined />} onClick={onReset}>重置</Button>
      </Space>
    </div>
  );
}

function ListActionBar({
  selectedCount,
  onAdd,
  onEdit,
  onDelete
}: {
  selectedCount: number;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="list-action-bar">
      <Space>
        <Button icon={<PlusOutlined />} type="primary" onClick={onAdd}>新增</Button>
        <Button disabled={selectedCount !== 1} icon={<EditOutlined />} onClick={onEdit}>修改</Button>
        <Button danger disabled={selectedCount === 0} icon={<DeleteOutlined />} onClick={onDelete}>删除</Button>
      </Space>
      <Text type="secondary">已选择 {selectedCount} 条</Text>
    </div>
  );
}

function confirmBatchDelete<T>(
  records: T[],
  getLabel: (record: T) => string,
  onDelete: (record: T) => void
) {
  if (records.length === 0) {
    return;
  }
  window.dispatchEvent(new CustomEvent<DeleteDialogState>("admin-delete-confirm", {
    detail: {
      title: "批量删除",
      content: `是否确认删除已选择的 ${records.length} 条数据：${records.slice(0, 3).map(getLabel).join("、")}${records.length > 3 ? "等" : ""}？`,
      onConfirm: () => records.forEach(onDelete)
    }
  }));
}

function HomePage({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const modules: Array<{
    key: string;
    title: string;
    description: string;
    icon: ReactNode;
    image: string;
    summary: string;
    tone: "green" | "blue";
    links: Array<{ page: PageKey; label: string }>;
  }> = [
    {
      key: "multimodal",
      title: "多模态数据管理",
      description: "统一管理烟区、烟田、图像、设备及用户权限数据。",
      icon: <DatabaseOutlined />,
      image: "/pic/homepic1.png",
      summary: "烟区 | 烟田 | 烟草品种 | 图像管理 | 结果管理等",
      tone: "green",
      links: [
        { page: "zone", label: "烟区" },
        { page: "plot", label: "烟田" },
        { page: "variety", label: "烟草品种" },
        { page: "image-mobile", label: "手机图片" },
        { page: "image-camera", label: "摄像头图片" },
        { page: "image-drone", label: "无人机图片" },
        { page: "detection-mobile", label: "手机检测结果" },
        { page: "detection-camera", label: "摄像头检测结果" },
        { page: "detection-drone", label: "无人机检测结果" },
        { page: "knowledge", label: "病害知识库" },
        { page: "device", label: "烟区烟田设备" },
        { page: "user-list", label: "用户列表" },
        { page: "permission", label: "用户权限管理" }
      ]
    },
    {
      key: "diagnosis",
      title: "烟草病毒病诊断",
      description: "通过近地图片、摄像头抓帧和无人机影像完成智能诊断。",
      icon: <BugOutlined />,
      image: "/pic/homepic2.png",
      summary: "近地检测 | 无人机检测",
      tone: "blue",
      links: [
        { page: "result-near-ground", label: "近地检测" },
        { page: "result-drone", label: "无人机检测" }
      ]
    }
  ];

  return (
    <div className="admin-home">
      <div className="admin-home-grid">
        {modules.map((module) => (
          <section className={`home-module-card is-${module.tone}`} key={module.key}>
            <div className="home-module-main">
              <span className="home-module-icon">{module.icon}</span>
              <div>
                <h2>{module.title}</h2>
                <p>{module.description}</p>
              </div>
            </div>
            <img className="home-module-image" src={module.image} alt={module.title} />
            <div className="home-module-summary">
              {module.summary}
            </div>
            <div className="home-module-shortcuts">
              <strong>快捷功能</strong>
              <div className="home-shortcut-list">
                {module.links.map((link) => (
                  <button key={link.page} type="button" onClick={() => onNavigate(link.page)}>
                    <span className="home-shortcut-arrow">&gt;</span>
                    <span>{link.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ZonePage({
  zones,
  loading,
  onCreate,
  onUpdate,
  onDelete
}: {
  zones: ZoneRecord[];
  loading: boolean;
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onUpdate: (record: ZoneRecord) => Promise<void>;
  onDelete: (record: ZoneRecord) => void;
}) {
  const [zoneName, setZoneName] = useState("");
  const [zoneCode, setZoneCode] = useState("");
  const [filters, setFilters] = useState({ zoneName: "", zoneCode: "" });
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const filteredZones = zones.filter((zone) =>
    includesKeyword([zone.zoneName], filters.zoneName)
    && includesKeyword([zone.zoneCode], filters.zoneCode)
  );
  const selectedRecords = zones.filter((record) => selectedRowKeys.includes(record.id));

  const columns: ColumnsType<ZoneRecord> = [
    { title: "烟区名称", dataIndex: "zoneName", key: "zoneName" },
    { title: "烟区编码", dataIndex: "zoneCode", key: "zoneCode" },
    { title: "省份", dataIndex: "province", key: "province" },
    { title: "城市", dataIndex: "city", key: "city" },
    { title: "说明", dataIndex: "description", key: "description", ellipsis: true },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: number) => status === 1 ? <Badge status="success" text="启用" /> : <Badge status="default" text="停用" />
    },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Button aria-label="修改烟区" icon={<EditOutlined />} size="small" title="修改" type="text" onClick={() => openJsonEdit({ title: "修改烟区信息", record, onSubmit: onUpdate })} />
          <Button aria-label="删除烟区" danger icon={<DeleteOutlined />} size="small" title="删除" type="text" onClick={() => onDelete(record)} />
        </Space>
      )
    }
  ];

  return (
    <PageShell activePage="zone">
      <ListFilterPanel
        onSearch={() => setFilters({ zoneName, zoneCode })}
        onReset={() => {
          setZoneName("");
          setZoneCode("");
          setFilters({ zoneName: "", zoneCode: "" });
        }}
      >
        <label><span>烟区名称</span><Input allowClear placeholder="请输入烟区名称" value={zoneName} onChange={(event) => setZoneName(event.target.value)} /></label>
        <label><span>烟区编码</span><Input allowClear placeholder="请输入烟区编码" value={zoneCode} onChange={(event) => setZoneCode(event.target.value)} /></label>
      </ListFilterPanel>
      <Card>
        <ListActionBar
          selectedCount={selectedRowKeys.length}
          onAdd={() => openCreateForm({
            title: "新增烟区",
            initialValues: { zoneName: "", zoneCode: "", province: "", city: "", description: "", status: 1 },
            onSubmit: onCreate
          })}
          onEdit={() => selectedRecords[0] && openJsonEdit({ title: "修改烟区信息", record: selectedRecords[0], onSubmit: onUpdate })}
          onDelete={() => confirmBatchDelete(selectedRecords, (record) => record.zoneName, onDelete)}
        />
        <Table
          columns={columns}
          dataSource={filteredZones}
          loading={loading}
          rowKey="id"
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </PageShell>
  );
}

function PlotPage({
  plots,
  zones,
  loading,
  onCreate,
  onUpdate,
  onDelete
}: {
  plots: PlotRecord[];
  zones: ZoneRecord[];
  loading: boolean;
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onUpdate: (record: PlotRecord) => Promise<void>;
  onDelete: (record: PlotRecord) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [status, setStatus] = useState<number | undefined>();
  const [appliedFilters, setAppliedFilters] = useState<{ keyword: string; status?: number }>({ keyword: "" });
  const filteredPlots = plots.filter((plot) =>
    includesKeyword([plot.plotName, plot.plotCode, plot.province, plot.city, plot.district, plot.address, getZoneName(zones, plot.zoneId)], appliedFilters.keyword)
    && (appliedFilters.status === undefined || plot.status === appliedFilters.status)
  );
  const selectedRecords = plots.filter((record) => selectedRowKeys.includes(record.id));

  const columns: ColumnsType<PlotRecord> = [
    { title: "烟田名称", dataIndex: "plotName", key: "plotName", fixed: "left", width: 170, render: (_: string, record) => renderPlotName(plots, record.id) },
    { title: "烟田编码", dataIndex: "plotCode", key: "plotCode", width: 130 },
    { title: "烟草品种", dataIndex: "varietyName", key: "varietyName", width: 140, render: (value?: string) => value || "-" },
    { title: "所属烟区", dataIndex: "zoneId", key: "zoneId", render: (zoneId?: number) => getZoneName(zones, zoneId) },
    { title: "地区", key: "district", render: (_, record) => [record.province, record.city, record.district].filter(Boolean).join(" / ") || "-" },
    { title: "地址", dataIndex: "address", key: "address", ellipsis: true },
    { title: "东经（°E）", dataIndex: "longitude", key: "longitude", width: 120, render: (value?: number) => typeof value === "number" ? value.toFixed(3) : "-" },
    { title: "北纬（°N）", dataIndex: "latitude", key: "latitude", width: 120, render: (value?: number) => typeof value === "number" ? value.toFixed(3) : "-" },
    { title: "面积", dataIndex: "area", key: "area", render: (value: number) => `${value} 亩` },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value: number) => value === 1 ? <Badge status="success" text="启用" /> : <Badge status="default" text="停用" />
    },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Button aria-label="修改烟田" icon={<EditOutlined />} size="small" title="修改" type="text" onClick={() => openJsonEdit({ title: "修改烟田信息", record, onSubmit: onUpdate })} />
          <Button aria-label="删除烟田" danger icon={<DeleteOutlined />} size="small" title="删除" type="text" onClick={() => onDelete(record)} />
        </Space>
      )
    }
  ];

  return (
    <PageShell
      activePage="plot"
    >
      <ListFilterPanel
        onSearch={() => setAppliedFilters({ keyword, status })}
        onReset={() => {
          setKeyword("");
          setStatus(undefined);
          setAppliedFilters({ keyword: "" });
        }}
      >
        <label><span>烟田名称/编码</span><Input allowClear placeholder="请输入烟田名称或编码" value={keyword} onChange={(event) => setKeyword(event.target.value)} /></label>
        <label><span>状态</span><Select allowClear options={[{ label: "启用", value: 1 }, { label: "停用", value: 0 }]} placeholder="请选择状态" value={status} onChange={setStatus} /></label>
      </ListFilterPanel>
      <Card>
        <ListActionBar
          selectedCount={selectedRowKeys.length}
          onAdd={() => openCreateForm({
            title: "新增烟田",
            initialValues: { plotName: "", plotCode: "", zoneId: zones[0]?.id ?? 0, district: "", address: "", longitude: 0, latitude: 0, area: 0, status: 1 },
            onSubmit: onCreate
          })}
          onEdit={() => selectedRecords[0] && openJsonEdit({ title: "修改烟田信息", record: selectedRecords[0], onSubmit: onUpdate })}
          onDelete={() => confirmBatchDelete(selectedRecords, (record) => record.plotName, onDelete)}
        />
        <Table columns={columns} dataSource={filteredPlots} loading={loading} rowKey="id" rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }} scroll={{ x: 980 }} pagination={{ pageSize: 8 }} />
      </Card>
    </PageShell>
  );
}

function ImagePage({
  activePage,
  sourceType,
  rows,
  plots,
  devices,
  loading,
  onCreate,
  onDelete
}: {
  activePage: PageKey;
  sourceType: SourceType;
  rows: ImageRecord[];
  plots: PlotRecord[];
  devices: DeviceRecord[];
  loading: boolean;
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onDelete: (record: ImageRecord, sourceType: SourceType) => void;
}) {
  const [plotId, setPlotId] = useState<number | undefined>();
  const [keyword, setKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<{ keyword: string; plotId?: number }>({ keyword: "" });
  const dataSource = rows.filter((item) =>
    (!appliedFilters.plotId || item.plotId === appliedFilters.plotId)
    && includesKeyword([getFileName(item.imageUrl), getPlotName(plots, item.plotId), item.uploadUserId, item.deviceId], appliedFilters.keyword)
  );
  const selectedRecords = rows.filter((record) => selectedRowKeys.includes(record.id));
  const editImage = (record: ImageRecord) => openJsonEdit({
    title: "修改图片信息",
    record,
    onSubmit: async () => {
      Modal.success({ title: "图片信息已更新" });
    }
  });

  const columns: ColumnsType<ImageRecord> = [
    {
      title: "缩略图",
      key: "thumbnail",
      width: 110,
      render: (_, record) => {
        const displayUrl = sourceType === "drone" ? record.thumbnailUrl : record.thumbnailUrl || record.imageUrl;
        const previewUrl = sourceType === "drone" ? record.thumbnailUrl : record.imageUrl;

        if (!displayUrl || !previewUrl) {
          return <span className="admin-thumb-empty">暂无缩略图</span>;
        }

        return (
          <Image
            className={`admin-thumb ${sourceType === "drone" ? "is-drone" : ""}`}
            rootClassName={`admin-thumb-preview ${sourceType === "drone" ? "is-drone" : ""}`}
            src={displayUrl}
            alt={getFileName(record.imageUrl)}
            preview={{
              src: previewUrl,
              rootClassName: "admin-image-fullscreen-preview",
              mask: false
            }}
          />
        );
      }
    },
    { title: "图片名称", dataIndex: "imageUrl", key: "imageUrl", width: 360, ellipsis: true, render: (url: string) => getFileName(url) },
    { title: "烟田", dataIndex: "plotId", key: "plotId", width: 160, render: (id: number) => renderPlotName(plots, id) },
    ...(sourceType === "camera" ? [{
      title: "设备名称",
      key: "deviceName",
      render: (_: unknown, record: ImageRecord) =>
        devices.find((device) => device.id === record.deviceId)?.deviceName
        ?? (record.deviceId ? `设备ID ${record.deviceId}` : "-")
    }] : []),
    ...(sourceType === "mobile" ? [{
      title: "拍摄时间",
      dataIndex: "shootTime",
      key: "shootTime",
      render: (value?: string) => value || "-"
    }] : []),
    { title: "入库时间", dataIndex: "createTime", key: "createTime", render: (value?: string) => value || "-" },
    { title: "状态", key: "status", render: () => <Tag color="green">已入库</Tag> },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Button aria-label="修改图片" icon={<EditOutlined />} size="small" title="修改" type="text" onClick={() => editImage(record)} />
          <Button aria-label="删除图片" danger icon={<DeleteOutlined />} size="small" title="删除" type="text" onClick={() => onDelete(record, sourceType)} />
        </Space>
      )
    }
  ];

  return (
    <PageShell activePage={activePage}>
      <ListFilterPanel
        onSearch={() => setAppliedFilters({ keyword, plotId })}
        onReset={() => {
          setKeyword("");
          setPlotId(undefined);
          setAppliedFilters({ keyword: "" });
        }}
      >
        <label><span>图片名称</span><Input allowClear placeholder="请输入图片名称" value={keyword} onChange={(event) => setKeyword(event.target.value)} /></label>
        <label><span>所属烟田</span><Select allowClear options={plots.map((plot) => ({ label: plot.plotName, value: plot.id }))} placeholder="请选择烟田" value={plotId} onChange={setPlotId} /></label>
      </ListFilterPanel>
      <Card>
        <ListActionBar
          selectedCount={selectedRowKeys.length}
          onAdd={() => openCreateForm({
            title: sourceType === "camera" ? "新增摄像头图片" : sourceType === "drone" ? "新增无人机图片" : "新增手机图片",
            initialValues: {
              plotId: plots[0]?.id ?? 0,
              ...(sourceType === "camera" ? { deviceId: 0 } : { uploadUserId: 1 }),
              imageUrl: "",
              thumbnailUrl: "",
              ...(sourceType === "drone" ? { purpose: "" } : {})
            },
            onSubmit: onCreate
          })}
          onEdit={() => selectedRecords[0] && editImage(selectedRecords[0])}
          onDelete={() => confirmBatchDelete(selectedRecords, (record) => getFileName(record.imageUrl), (record) => onDelete(record, sourceType))}
        />
        <Table columns={columns} dataSource={dataSource} loading={loading} rowKey="id" rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }} pagination={{ pageSize: 8 }} />
      </Card>
    </PageShell>
  );
}

function VarietyPage({
  rows,
  loading,
  onCreate,
  onUpdate,
  onDelete
}: {
  rows: VarietyRecord[];
  loading: boolean;
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onUpdate: (record: VarietyRecord) => Promise<void>;
  onDelete: (record: VarietyRecord) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const dataSource = rows.filter((record) =>
    includesKeyword(
      [record.varietyName, record.varietyCode, record.characteristics, record.diseaseResistance, record.suitableRegion],
      appliedKeyword
    )
  );
  const selectedRecords = rows.filter((record) => selectedRowKeys.includes(record.id));

  const columns: ColumnsType<VarietyRecord> = [
    { title: "品种名称", dataIndex: "varietyName", key: "varietyName", width: 150 },
    { title: "品种编码", dataIndex: "varietyCode", key: "varietyCode", width: 120 },
    { title: "生育期", dataIndex: "growthPeriod", key: "growthPeriod", width: 100, render: (value?: number) => value ? `${value} 天` : "-" },
    { title: "抗病性", dataIndex: "diseaseResistance", key: "diseaseResistance", ellipsis: true },
    { title: "适宜区域", dataIndex: "suitableRegion", key: "suitableRegion", width: 180, ellipsis: true },
    { title: "品种特征", dataIndex: "characteristics", key: "characteristics", ellipsis: true },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (status: number) => status === 1 ? <Badge status="success" text="启用" /> : <Badge status="default" text="停用" />
    },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Button aria-label="修改烟草品种" icon={<EditOutlined />} size="small" title="修改" type="text" onClick={() => openJsonEdit({ title: "修改烟草品种", record, onSubmit: onUpdate })} />
          <Button aria-label="删除烟草品种" danger icon={<DeleteOutlined />} size="small" title="删除" type="text" onClick={() => onDelete(record)} />
        </Space>
      )
    }
  ];

  return (
    <PageShell activePage="variety">
      <ListFilterPanel
        onSearch={() => setAppliedKeyword(keyword)}
        onReset={() => {
          setKeyword("");
          setAppliedKeyword("");
        }}
      >
        <label>
          <span>品种名称/编码</span>
          <Input allowClear placeholder="请输入品种名称或编码" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </label>
      </ListFilterPanel>
      <Card>
        <ListActionBar
          selectedCount={selectedRowKeys.length}
          onAdd={() => openCreateForm({
            title: "新增烟草品种",
            initialValues: {
              varietyName: "",
              varietyCode: "",
              characteristics: "",
              growthPeriod: 120,
              diseaseResistance: "",
              suitableRegion: "",
              description: "",
              status: 1
            },
            onSubmit: onCreate
          })}
          onEdit={() => selectedRecords[0] && openJsonEdit({ title: "修改烟草品种", record: selectedRecords[0], onSubmit: onUpdate })}
          onDelete={() => confirmBatchDelete(selectedRecords, (record) => record.varietyName, onDelete)}
        />
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="id"
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </PageShell>
  );
}

function DetectionPage({
  activePage,
  sourceType,
  rows,
  plots,
  loading
}: {
  activePage: PageKey;
  sourceType: SourceType;
  rows: DetectionRecord[];
  plots: PlotRecord[];
  loading: boolean;
}) {
  const [plotId, setPlotId] = useState<number | undefined>();
  const [keyword, setKeyword] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<{ keyword: string; plotId?: number }>({ keyword: "" });
  const dataSource = rows.filter((item) =>
    (!appliedFilters.plotId || item.plotId === appliedFilters.plotId)
    && includesKeyword([getPlotName(plots, item.plotId), item.diseaseName, item.diseaseCode], appliedFilters.keyword)
  );

  const columns: ColumnsType<DetectionRecord> = [
    ...(sourceType === "drone" ? [{
      title: "烟田原图",
      dataIndex: "oriImageUrl",
      key: "oriImageUrl",
      width: 100,
      render: (url?: string) => url ? (
        <Image
          className="admin-thumb"
          rootClassName="admin-thumb-preview"
          src={url}
          alt="烟田原图"
          preview={{ src: url, rootClassName: "admin-image-fullscreen-preview", mask: false }}
        />
      ) : "-"
    }] : []),
    { title: "结果图", dataIndex: "resultImageUrl", key: "resultImageUrl", width: 100, render: (url?: string) => url ? (
      <Image
        className="admin-thumb"
        rootClassName="admin-thumb-preview"
        src={url}
        alt="检测结果图"
        preview={{ src: url, rootClassName: "admin-image-fullscreen-preview", mask: false }}
      />
    ) : "-" },
    { title: "烟田", dataIndex: "plotId", key: "plotId", width: 150, render: (id: number) => renderPlotName(plots, id) },
    { title: "识别病害", dataIndex: "diseaseName", key: "diseaseName", width: 190 },
    { title: "病害编码", dataIndex: "diseaseCode", key: "diseaseCode", width: 100, render: (value?: string) => value ? <Tag color="blue">{value}</Tag> : "-" },
    ...(sourceType === "drone" ? [{
      title: "病害等级",
      dataIndex: "diseaseLevel",
      key: "diseaseLevel",
      width: 100,
      render: (value: string | undefined, record: DetectionRecord) => renderSeverity(value, record.infectionRate)
    }] : [{
      title: "严重程度",
      dataIndex: "severity",
      key: "severity",
      width: 100,
      render: (value: string | undefined, record: DetectionRecord) => renderSeverity(value, record.infectionRate)
    }]),
    ...(sourceType !== "camera" ? [
      { title: "总株数", dataIndex: "totalPlants", key: "totalPlants", width: 90, render: (value?: number) => value ?? "-" },
      { title: "病株数", dataIndex: "infectedPlants", key: "infectedPlants", width: 90, render: (value?: number) => value ?? "-" }
    ] : []),
    ...(sourceType === "drone" ? [{
      title: "健康株数",
      dataIndex: "healthyPlants",
      key: "healthyPlants",
      width: 100,
      render: (value?: number) => value ?? "-"
    }] : []),
    ...(sourceType !== "camera" ? [{
      title: "发病率（%）",
      key: "infectionRate",
      width: 110,
      render: (_: unknown, record: DetectionRecord) => {
        const value = record.infectionRate ?? record.diseaseRatio;
        return typeof value === "number" ? value.toFixed(2) : "-";
      }
    }] : []),
    { title: "检测时间", dataIndex: "detectTime", key: "detectTime", width: 180, render: (value?: string) => value || "-" }
  ];

  return (
    <PageShell activePage={activePage}>
      <ListFilterPanel
        onSearch={() => setAppliedFilters({ keyword, plotId })}
        onReset={() => {
          setKeyword("");
          setPlotId(undefined);
          setAppliedFilters({ keyword: "" });
        }}
      >
        <label>
          <span>烟田/病害</span>
          <Input allowClear placeholder="请输入烟田或病害名称" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </label>
        <label>
          <span>所属烟田</span>
          <Select
            allowClear
            options={plots.map((plot) => ({ label: plot.plotName, value: plot.id }))}
            placeholder="请选择烟田"
            value={plotId}
            onChange={setPlotId}
          />
        </label>
      </ListFilterPanel>
      <Card className="detection-result-card">
        <Table columns={columns} dataSource={dataSource} loading={loading} rowKey="id" scroll={{ x: sourceType === "drone" ? 1320 : 1150 }} pagination={{ pageSize: 8 }} />
      </Card>
    </PageShell>
  );
}

function getDiseaseKnowledge(knowledge: KnowledgeRecord[], diseaseCode?: string, diseaseName?: string) {
  return knowledge.find((item) => item.diseaseCode === diseaseCode || item.diseaseName === diseaseName) ?? knowledge[0];
}

function isDefaultModel(model: AiModelRecord) {
  return model.isDefault === true || model.isDefault === 1;
}

function getModelLabel(model: AiModelRecord) {
  return [model.modelName, model.version].filter(Boolean).join(" ");
}

function getInitialModelId(models: AiModelRecord[]) {
  return models.find(isDefaultModel)?.id ?? models[0]?.id;
}

function getDetectionLevel(rate?: number) {
  const value = rate ?? 0;
  if (value > 15) {
    return { label: "重度", tone: "severe" };
  }
  if (value >= 5) {
    return { label: "中度", tone: "moderate" };
  }
  return { label: "轻度", tone: "mild" };
}

function getDroneTreatmentAdvice(rate: number) {
  if (rate > 15) {
    return [
      { title: "轮作倒茬", content: "实行3年以上的非茄科作物轮作，轮作期间禁止种植番茄、辣椒等易感作物。" },
      { title: "抗病品种", content: "划设高风险区域，推广使用病毒病抗病品种。每3年对推广品种抗性进行复测，及时调整推广品种。" },
      { title: "封锁隔离", content: "对发病地块进行封锁隔离，发病区域禁止进入进行农事操作。可采用植保无人机进行抗病毒药剂喷施。" },
      { title: "种子处理", content: "种子包衣前进行病毒检测，确保种子健康。按照GB/T 8321进行种子包衣处理。" },
      { title: "应急处理", content: "全田进行抗病毒药剂喷施，每5天1次，连续喷施5次。选取不同药剂进行间隔喷施，避免单一药剂连续喷施。" }
    ];
  }

  if (rate >= 5) {
    return [
      { title: "农事操作", content: "尽量减少农事操作。必须进行农事操作时，应先进行健康区域操作，再进行发病区域操作。对发病株进行操作后，应用肥皂水清洗手部及农具，再进行后续操作。" },
      { title: "生物防治", content: "全田灌施芽孢杆菌等抗病毒生物菌剂，每5天1次，连续施用3次。" },
      { title: "诱抗处理", content: "全田喷施氨基酸及叶面肥，诱导健康烟株抗病性。每5天1次，连续喷施3次。" },
      { title: "应急处理", content: "全田进行抗病毒药剂喷施，每5天1次，连续喷施5次。选取不同药剂进行间隔喷施，避免单一药剂连续喷施。" }
    ];
  }

  return [
    { title: "病株处理", content: "拔除病株，密封带出田间并进行焚毁或深埋，不得用于堆肥或随意丢弃。石灰粉消毒病穴土壤。" },
    { title: "生物防治", content: "病株及周围3株烟草灌施芽孢杆菌等抗病毒生物菌剂，每5天1次，连续施用3次。" },
    { title: "应急处理", content: "病株及周围3株烟草进行抗病毒药剂喷施，每5天1次，连续喷施3次。" }
  ];
}

function formatNow() {
  return new Date().toLocaleString("zh-CN", { hour12: false });
}

function NearGroundDetectionPage({
  rows,
  plots,
  devices,
  knowledge,
  models
}: {
  rows: DetectionRecord[];
  plots: PlotRecord[];
  devices: DeviceRecord[];
  knowledge: KnowledgeRecord[];
  models: AiModelRecord[];
}) {
  const [sourceMode, setSourceMode] = useState<"upload" | "camera">("upload");
  const [plotId, setPlotId] = useState<number | undefined>(plots[0]?.id);
  const [deviceId, setDeviceId] = useState<number | undefined>();
  const [modelId, setModelId] = useState<number | undefined>(() => getInitialModelId(models));
  const [previewUrl, setPreviewUrl] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<DetectionRecord | null>(null);
  const cameraDevices = devices.filter((device) => device.deviceType === "camera");
  const selectedCamera = cameraDevices.find((device) => device.id === deviceId);
  const currentResult = result ?? rows[0];
  const nearGroundModels = models[0] ? [models[0]] : [];
  const modelOptions = nearGroundModels.map((model) => ({ label: getModelLabel(model), value: model.id }));

  useEffect(() => {
    const nextModelId = getInitialModelId(nearGroundModels);
    if (nextModelId && modelId !== nextModelId) {
      setModelId(nextModelId);
    }
  }, [modelId, nearGroundModels]);

  const handleRunDetection = () => {
    const selectedDisease = knowledge[sourceMode === "upload" ? 0 : 1] ?? knowledge[0];
    setRunning(true);
    window.setTimeout(() => {
      setResult({
        id: Date.now(),
        plotId: sourceMode === "camera" ? selectedCamera?.plotId ?? plots[0]?.id ?? 1 : plotId ?? plots[0]?.id ?? 1,
        diseaseName: selectedDisease?.diseaseName ?? "烟草花叶病毒病",
        diseaseCode: selectedDisease?.diseaseCode ?? "TMV",
        modelId,
        confidence: sourceMode === "upload" ? 88 : 82,
        infectionRate: sourceMode === "upload" ? 11 : 7,
        detectTime: formatNow()
      });
      setRunning(false);
    }, 900);
  };

  return (
    <PageShell activePage="result-near-ground">
      <div className="diagnosis-workspace">
        <Card title={sectionTitle(<MonitorOutlined />, "近地检测任务")} className="diagnosis-input-card">
          <Space direction="vertical" size={18} className="full-width">
            <Segmented
              block
              options={[
                { label: "图片上传检测", value: "upload" },
                { label: "摄像头抓帧检测", value: "camera" }
              ]}
              value={sourceMode}
              onChange={(value) => setSourceMode(value as "upload" | "camera")}
            />
            {sourceMode === "upload" ? (
              <div className="diagnosis-form-grid">
                <Form.Item label="烟田" required>
                  <Select
                    options={plots.map((plot) => ({ label: plot.plotName, value: plot.id }))}
                    placeholder="选择烟田"
                    value={plotId}
                    onChange={setPlotId}
                  />
                </Form.Item>
                <Form.Item label="检测模型" required>
                  <Select
                    value={modelId}
                    options={modelOptions}
                    placeholder="请选择检测模型"
                    onChange={setModelId}
                  />
                </Form.Item>
              </div>
            ) : (
              <div className="diagnosis-form-grid">
              <Form.Item label="检测模型" required>
                <Select
                  value={modelId}
                  options={modelOptions}
                  placeholder="请选择检测模型"
                  onChange={setModelId}
                />
              </Form.Item>
                <Form.Item label="摄像头" required>
                  <Select
                    options={cameraDevices.map((device) => ({ label: device.deviceName, value: device.id }))}
                    placeholder="选择摄像头"
                    value={deviceId}
                    onChange={setDeviceId}
                  />
                </Form.Item>
              </div>
            )}
            {sourceMode === "upload" ? (
              <Upload.Dragger
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                beforeUpload={(file) => {
                  setPreviewUrl(URL.createObjectURL(file));
                  return false;
                }}
              >
                <div className="upload-dropzone">
                  <strong>上传近地图片</strong>
                  <span>支持手机巡田图片、叶片近景图，上传后点击开始检测</span>
                </div>
              </Upload.Dragger>
            ) : (
              <div className="camera-capture-panel">
                <div className="camera-preview">
                  <span>{deviceId ? "摄像头视频预览区域" : "请选择摄像头"}</span>
                  <Button onClick={() => setPreviewUrl("")}>抓取当前帧</Button>
                </div>
              </div>
            )}
            <Button block type="primary" size="large" loading={running} onClick={handleRunDetection}>
              开始近地诊断
            </Button>
          </Space>
        </Card>

        <Card
          title={sectionTitle(<SolutionOutlined />, "当前诊断结果")}
          className="diagnosis-result-card"
          extra={currentResult ? <Button type="primary">保存检测记录</Button> : null}
        >
          {currentResult ? (
            <Space direction="vertical" size={14} className="full-width">
              <div className="near-ground-result-images">
                <div className="near-ground-result-image">
                  <strong>原始图片</strong>
                  {previewUrl ? (
                    <img src={previewUrl} alt="近地检测原始图片" />
                  ) : (
                    <div className="near-ground-image-empty">暂无原始图片</div>
                  )}
                </div>
                <div className="near-ground-result-image">
                  <strong>检测后图片</strong>
                  {currentResult.resultImageUrl ? (
                    <img src={currentResult.resultImageUrl} alt="近地检测结果图片" />
                  ) : (
                    <div className="near-ground-image-empty">暂无检测结果图片</div>
                  )}
                </div>
              </div>
              <div className="near-ground-diagnosis-info">
                <section className="near-ground-disease-summary">
                  <span>识别病害</span>
                  <strong>烟草病毒病</strong>
                </section>
                <div className="near-ground-detail-grid">
                  <section className="near-ground-detail-panel">
                    <div className="near-ground-detail-heading">
                      <ProfileOutlined />
                      <strong>典型症状</strong>
                    </div>
                    <p>接口调通后展示模型返回的典型症状。</p>
                  </section>
                  <section className="near-ground-detail-panel">
                    <div className="near-ground-detail-heading">
                      <SafetyCertificateOutlined />
                      <strong>防治建议</strong>
                    </div>
                    <p>建议及时隔离疑似病株，清理病残体，并加强田间巡查。</p>
                  </section>
                </div>
              </div>
            </Space>
          ) : (
            <Alert message="暂无诊断结果" description="请先上传图片或选择摄像头抓帧后开始检测。" type="info" showIcon />
          )}
        </Card>
      </div>
    </PageShell>
  );
}

function DroneDetectionWorkspacePage({
  rows,
  plots,
  images,
  knowledge,
  models,
  loading,
  onViewHistory
}: {
  rows: DetectionRecord[];
  plots: PlotRecord[];
  images: ImageRecord[];
  knowledge: KnowledgeRecord[];
  models: AiModelRecord[];
  loading: boolean;
  onViewHistory: () => void;
}) {
  const [plotId, setPlotId] = useState<number | undefined>(plots[0]?.id);
  const [imageId, setImageId] = useState<number | undefined>(images[0]?.id);
  const [modelId, setModelId] = useState<number | undefined>(() => getInitialModelId(models));
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [taskSubmitted, setTaskSubmitted] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskMessage, setTaskMessage] = useState("");
  const [taskId, setTaskId] = useState("");
  const [result, setResult] = useState<DetectionRecord | null>(null);
  const [showAllResult, setShowAllResult] = useState(false);
  const visibleImages = images.filter((image) => !plotId || image.plotId === plotId);
  const selectedImage = visibleImages.find((image) => image.id === imageId);
  const currentResult = result;
  const diseaseRatio = currentResult?.diseaseRatio ?? currentResult?.infectionRate ?? 0;
  const level = getDetectionLevel(diseaseRatio);
  const treatmentAdvice = getDroneTreatmentAdvice(diseaseRatio);
  const droneModels = models[1] ? [models[1]] : [];
  const modelOptions = droneModels.map((model) => ({ label: getModelLabel(model), value: model.id }));
  const selectedModel = droneModels.find((model) => model.id === modelId);

  useEffect(() => {
    const nextModelId = getInitialModelId(droneModels);
    if (nextModelId && modelId !== nextModelId) {
      setModelId(nextModelId);
    }
  }, [droneModels, modelId]);

  const handleRunDetection = () => {
    if (!selectedImage) {
      Modal.warning({ title: "请选择无人机图片", content: "请先点击“选择已有图片”，选择已上传并完成拼接的烟田图片。" });
      return;
    }
    const selectedDisease = knowledge[1] ?? knowledge[0];
    const nextTaskId = crypto.randomUUID();
    setTaskId(nextTaskId);
    setTaskSubmitted(true);
    setTaskProgress(5);
    setTaskMessage("任务已提交，正在下载 RGB 图像...");
    setResult(null);
    setShowAllResult(false);
    setRunning(true);
    const steps = [
      { progress: 18, message: "正在校验烟田与图像匹配关系..." },
      { progress: 36, message: "正在切分大幅面图像..." },
      { progress: 58, message: "正在调用病虫害区域检测模型..." },
      { progress: 82, message: "正在合并区域诊断结果..." }
    ];
    steps.forEach((step, index) => {
      window.setTimeout(() => {
        setTaskProgress(step.progress);
        setTaskMessage(step.message);
      }, (index + 1) * 900);
    });
    window.setTimeout(() => {
      setResult({
        id: Date.now(),
        imageId: selectedImage?.id,
        plotId: plotId ?? selectedImage?.plotId ?? plots[0]?.id ?? 1,
        modelId,
        diseaseName: selectedDisease?.diseaseName ?? "黄瓜花叶病毒病",
        diseaseCode: selectedDisease?.diseaseCode ?? "CMV",
        confidence: 84,
        diseaseRatio: 18,
        detectTime: formatNow()
      });
      setTaskProgress(100);
      setTaskMessage("检测完成，已生成区域诊断结果。");
      setRunning(false);
    }, 4600);
  };

  return (
    <PageShell activePage="result-drone">
      <div className="drone-workspace drone-top-workspace">
        <Card title={sectionTitle(<SettingOutlined />, "模型配置")}>
          <Space direction="vertical" size={10} className="full-width">
            <Form.Item label="选择模型" required>
              <Select
                value={modelId}
                options={modelOptions}
                placeholder="请选择检测模型"
                onChange={setModelId}
              />
            </Form.Item>
            <Alert
              type="success"
              showIcon
              message={selectedModel ? getModelLabel(selectedModel) : "未选择模型"}
              description={selectedModel?.description ?? "基于无人机大幅面图像识别疑似病害区域，输出发病比例、风险等级和区域防控建议。大图请先在数据管理中完成入库。"}
            />
          </Space>
        </Card>

        <Card title={sectionTitle(<HistoryOutlined />, "历史检测记录")} className="drone-history-card">
          <div className="history-stat-row">
            <Statistic title="总数" value={rows.length || 285} valueStyle={{ color: "#13a66b" }} />
            <Statistic title="本周" value={rows.length ? Math.min(rows.length, 6) : 0} valueStyle={{ color: "#1677ff" }} />
            <Statistic title="今日" value={result ? 1 : 0} valueStyle={{ color: "#722ed1" }} />
          </div>
          <Button block type="primary" onClick={onViewHistory}>查看全部历史记录</Button>
        </Card>
      </div>

      {!currentResult ? (
      <div className="drone-workspace">
        <Card title={sectionTitle(<DeploymentUnitOutlined />, "检测目标")} className="drone-target-card">
          <Space direction="vertical" size={10} className="full-width">
            <Alert
              message="操作提示"
              description="请先在“多模态数据管理 -> 数据管理 -> 图像管理 -> 无人机图片”中上传大幅面图像，再在此选择已有图片进行区域检测。"
              type="info"
              showIcon
            />
            <div className="diagnosis-form-grid">
              <Form.Item label="烟田" required>
                <Select
                  options={plots.map((plot) => ({ label: plot.plotName, value: plot.id }))}
                  value={plotId}
                  onChange={(value) => {
                    setPlotId(value);
                    setImageId(undefined);
                    setResult(null);
                    setTaskSubmitted(false);
                    setTaskProgress(0);
                  }}
                  placeholder="选择烟田"
                />
              </Form.Item>
              <Form.Item label="已上传图片" required>
                <Button block type="primary" onClick={() => setImagePickerOpen(true)}>
                  选择已有图片
                </Button>
              </Form.Item>
            </div>
          </Space>
        </Card>

        <Card title={sectionTitle(<FileImageOutlined />, selectedImage ? `已选择图片：${getPlotName(plots, selectedImage.plotId)}` : "已上传图片")} className="drone-image-select-card">
          {selectedImage ? (
            <Space direction="vertical" size={10} className="full-width">
              <img className="drone-preview-image" src={selectedImage.thumbnailUrl || selectedImage.imageUrl} alt="无人机检测目标" />
              <div className="drone-image-actions">
                <Text type="secondary">{selectedImage.shootTime ?? selectedImage.createTime ?? "-"}</Text>
                <Space>
                  <Button type="primary" loading={running} onClick={handleRunDetection}>检测</Button>
                  <Button onClick={() => {
                    setImageId(undefined);
                    setResult(null);
                    setTaskSubmitted(false);
                  }}>取消选择</Button>
                </Space>
              </div>
            </Space>
          ) : (
            <div className="drone-result-placeholder">
              <Text type="secondary">请在左侧检测目标中选择已上传图片</Text>
            </div>
          )}
        </Card>
      </div>
      ) : (
        <div className="drone-final-result">
          <Card
            title={sectionTitle(<SolutionOutlined />, "检测结果")}
            extra={<Button onClick={() => {
              setResult(null);
              setTaskSubmitted(false);
              setTaskProgress(0);
              setShowAllResult(false);
            }}>返回选择</Button>}
          >
            <div className="drone-result-primary">
              <div className="drone-result-image-grid">
                <figure>
                  <figcaption>原始图片</figcaption>
                  <img src={selectedImage?.thumbnailUrl || selectedImage?.imageUrl} alt="原始无人机图像" />
                </figure>
                <figure>
                  <figcaption>检测后图片</figcaption>
                  <div className="drone-analysis-overlay">
                    <img src={currentResult.resultImageUrl || selectedImage?.thumbnailUrl || selectedImage?.imageUrl} alt="无人机检测结果" />
                    {!currentResult.resultImageUrl ? <div className="analysis-mask" /> : null}
                  </div>
                </figure>
              </div>
              <div className="drone-result-toggle">
                <Button type="primary" onClick={() => setShowAllResult((value) => !value)}>
                  {showAllResult ? "收起信息" : "展示全部"}
                </Button>
              </div>
            </div>

            {showAllResult ? (
              <div className="drone-result-details">
                <div className="drone-result-detail-grid">
                  <div>
                    <span>地块信息</span>
                    <strong>{getPlotName(plots, currentResult.plotId)}</strong>
                  </div>
                  <div>
                    <span>检测时间</span>
                    <strong>{currentResult.detectTime ?? "-"}</strong>
                  </div>
                  <div>
                    <span>发病率</span>
                    <strong className={`severity-value is-${level.tone}`}>{diseaseRatio}%</strong>
                  </div>
                  <div>
                    <span>病害等级</span>
                    {renderSeverity(currentResult.diseaseLevel, diseaseRatio)}
                  </div>
                </div>
                <div className="drone-final-advice">
                  <div className="drone-final-advice-title">
                    <SafetyCertificateOutlined />
                    <strong>防治措施</strong>
                  </div>
                  <div className="drone-advice-list">
                    {treatmentAdvice.map((advice, index) => (
                      <div className="drone-advice-item" key={advice.title}>
                        <span className="drone-advice-index">{index + 1}</span>
                        <div>
                          <strong>{advice.title}</strong>
                          <p>{advice.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      )}

      {taskSubmitted && running ? (
        <Card title={sectionTitle(<HistoryOutlined />, running ? "任务处理中" : "任务处理完成")} className="task-process-card">
          <Space direction="vertical" size={10} className="full-width">
            <div className="task-meta-row">
              <Text>任务 ID：</Text>
              <Text code>{taskId}</Text>
              <Tag color={running ? "orange" : "green"}>{running ? "处理中" : "已完成"}</Tag>
            </div>
            <div className="task-meta-row">
              <Text>处理进度：</Text>
              <Text strong>{taskProgress}%</Text>
            </div>
            <Progress percent={taskProgress} status={running ? "active" : "success"} />
            <Text type="secondary">{taskMessage}</Text>
          </Space>
        </Card>
      ) : null}

      <Modal
        title="选择已有图片集（点击卡片选择）"
        open={imagePickerOpen}
        width={900}
        okText="添加"
        cancelText="取消"
        onCancel={() => setImagePickerOpen(false)}
        onOk={() => setImagePickerOpen(false)}
      >
        <div className="drone-image-picker-grid">
          {visibleImages.map((image) => (
            <button
              className={`drone-image-picker-card ${image.id === selectedImage?.id ? "is-selected" : ""}`}
              key={image.id}
              type="button"
              onClick={() => setImageId(image.id)}
            >
              <img src={image.thumbnailUrl || image.imageUrl} alt={getPlotName(plots, image.plotId)} />
              <strong>{getPlotName(plots, image.plotId)}</strong>
              <span>{image.shootTime ?? image.createTime ?? "-"}</span>
              {image.id === selectedImage?.id ? <Tag color="blue">已选</Tag> : null}
            </button>
          ))}
        </div>
      </Modal>
    </PageShell>
  );
}

function DevicePage({
  rows,
  plots,
  zones,
  loading,
  onCreate,
  onUpdate,
  onDelete
}: {
  rows: DeviceRecord[];
  plots: PlotRecord[];
  zones: ZoneRecord[];
  loading: boolean;
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onUpdate: (record: DeviceRecord) => Promise<void>;
  onDelete: (record: DeviceRecord) => void;
}) {
  const [zoneId, setZoneId] = useState<number | undefined>();
  const [plotId, setPlotId] = useState<number | undefined>();
  const [deviceType, setDeviceType] = useState<string | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<{ zoneId?: number; plotId?: number; deviceType?: string }>({});
  const visiblePlots = plots.filter((plot) => !zoneId || plot.zoneId === zoneId);
  const dataSource = rows.filter((item) => {
    const plot = plots.find((record) => record.id === item.plotId);
    return (!appliedFilters.zoneId || plot?.zoneId === appliedFilters.zoneId)
      && (!appliedFilters.plotId || item.plotId === appliedFilters.plotId)
      && (!appliedFilters.deviceType || item.deviceType === appliedFilters.deviceType);
  });
  const selectedRecords = rows.filter((record) => selectedRowKeys.includes(record.id));

  const columns: ColumnsType<DeviceRecord> = [
    { title: "烟区", dataIndex: "plotId", key: "zone", render: (id: number) => getPlotZoneName(plots, zones, id) },
    { title: "烟田", dataIndex: "plotId", key: "plot", render: (id: number) => renderPlotName(plots, id) },
    { title: "设备编码", dataIndex: "deviceCode", key: "deviceCode" },
    { title: "设备名称", dataIndex: "deviceName", key: "deviceName" },
    { title: "类型", dataIndex: "deviceType", key: "deviceType", render: (value: string) => <Tag>{value}</Tag> },
    { title: "型号", dataIndex: "model", key: "model", render: (value?: string) => value || "-" },
    { title: "接口地址", dataIndex: "apiUrl", key: "apiUrl", ellipsis: true, render: (value?: string) => value || "-" },
    {
      title: "在线状态",
      dataIndex: "onlineStatus",
      key: "onlineStatus",
      render: (value?: number) => value === 1 ? <Badge status="success" text="在线" /> : <Badge status="default" text="离线" />
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: number) => status === 1 ? <Badge status="success" text="启用" /> : <Badge status="default" text="停用" />
    },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Button aria-label="修改设备" icon={<EditOutlined />} size="small" title="修改" type="text" onClick={() => openJsonEdit({ title: "修改设备信息", record, onSubmit: onUpdate })} />
          <Button aria-label="删除设备" danger icon={<DeleteOutlined />} size="small" title="删除" type="text" onClick={() => onDelete(record)} />
        </Space>
      )
    }
  ];

  return (
    <PageShell activePage="device">
      <ListFilterPanel
        onSearch={() => setAppliedFilters({ zoneId, plotId, deviceType })}
        onReset={() => {
          setZoneId(undefined);
          setPlotId(undefined);
          setDeviceType(undefined);
          setAppliedFilters({});
        }}
      >
        <label><span>所属烟区</span><Select allowClear options={zones.map((zone) => ({ label: zone.zoneName, value: zone.id }))} placeholder="请选择烟区" value={zoneId} onChange={(value) => { setZoneId(value); setPlotId(undefined); }} /></label>
        <label><span>所属烟田</span><Select allowClear options={visiblePlots.map((plot) => ({ label: plot.plotName, value: plot.id }))} placeholder="请选择烟田" value={plotId} onChange={setPlotId} /></label>
        <label><span>设备类型</span><Select allowClear options={[{ label: "摄像头", value: "camera" }, { label: "无人机", value: "drone" }]} placeholder="请选择类型" value={deviceType} onChange={setDeviceType} /></label>
      </ListFilterPanel>
      <Card>
        <ListActionBar
          selectedCount={selectedRowKeys.length}
          onAdd={() => openCreateForm({
            title: "新增设备",
            initialValues: { plotId: plots[0]?.id ?? 0, deviceCode: "", deviceName: "", deviceType: "camera", model: "", apiUrl: "", status: 1 },
            onSubmit: onCreate
          })}
          onEdit={() => selectedRecords[0] && openJsonEdit({ title: "修改设备信息", record: selectedRecords[0], onSubmit: onUpdate })}
          onDelete={() => confirmBatchDelete(selectedRecords, (record) => record.deviceName, onDelete)}
        />
        <Table columns={columns} dataSource={dataSource} loading={loading} rowKey="id" rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }} scroll={{ x: 1180 }} pagination={{ pageSize: 8 }} />
      </Card>
    </PageShell>
  );
}

function KnowledgePage({
  rows,
  loading,
  onCreate,
  onUpdate,
  onDelete
}: {
  rows: KnowledgeRecord[];
  loading: boolean;
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onUpdate: (record: KnowledgeRecord) => Promise<void>;
  onDelete: (record: KnowledgeRecord) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const dataSource = rows.filter((item) =>
    includesKeyword([item.diseaseName, item.diseaseCode, item.symptoms, item.prevention], appliedKeyword)
  );
  const selectedRecords = rows.filter((record) => selectedRowKeys.includes(record.id));

  const columns: ColumnsType<KnowledgeRecord> = [
    { title: "病害名称", dataIndex: "diseaseName", key: "diseaseName", width: 240 },
    { title: "病害编码", dataIndex: "diseaseCode", key: "diseaseCode", width: 110, render: (value: string) => <Tag color="blue">{value}</Tag> },
    { title: "典型症状", dataIndex: "symptoms", key: "symptoms", ellipsis: true },
    { title: "防治建议", dataIndex: "prevention", key: "prevention", ellipsis: true },
    { title: "示例图片", dataIndex: "exampleImages", key: "exampleImages", width: 100, render: (value?: string) => `${countExampleImages(value)} 张` },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Button aria-label="修改病害" icon={<EditOutlined />} size="small" title="修改" type="text" onClick={() => openJsonEdit({ title: "修改病害信息", record, onSubmit: onUpdate })} />
          <Button aria-label="删除病害" danger icon={<DeleteOutlined />} size="small" title="删除" type="text" onClick={() => onDelete(record)} />
        </Space>
      )
    }
  ];

  return (
    <PageShell activePage="knowledge">
      <ListFilterPanel
        onSearch={() => setAppliedKeyword(keyword)}
        onReset={() => {
          setKeyword("");
          setAppliedKeyword("");
        }}
      >
        <label><span>病害名称/编码</span><Input allowClear placeholder="请输入病害名称或编码" value={keyword} onChange={(event) => setKeyword(event.target.value)} /></label>
      </ListFilterPanel>
      <Card>
        <ListActionBar
          selectedCount={selectedRowKeys.length}
          onAdd={() => openCreateForm({
            title: "新增病害",
            initialValues: { diseaseName: "", diseaseCode: "", symptoms: "", prevention: "", exampleImages: "[]" },
            onSubmit: onCreate
          })}
          onEdit={() => selectedRecords[0] && openJsonEdit({ title: "修改病害信息", record: selectedRecords[0], onSubmit: onUpdate })}
          onDelete={() => confirmBatchDelete(selectedRecords, (record) => record.diseaseName, onDelete)}
        />
        <Table columns={columns} dataSource={dataSource} loading={loading} rowKey="id" rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }} pagination={{ pageSize: 8 }} />
      </Card>
    </PageShell>
  );
}

function UserListPage({
  rows,
  loading,
  onCreate,
  onUpdate,
  onDelete
}: {
  rows: UserRecord[];
  loading: boolean;
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onUpdate: (record: UserRecord) => Promise<void>;
  onDelete: (record: UserRecord) => void;
}) {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<number | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<{ username: string; phone: string; status?: number }>({ username: "", phone: "" });
  const dataSource = rows.filter((item) =>
    includesKeyword([item.username, item.realName], appliedFilters.username)
    && String(item.phone ?? "").includes(appliedFilters.phone.trim())
    && (appliedFilters.status === undefined || item.status === appliedFilters.status)
  );
  const selectedRecords = rows.filter((record) => selectedRowKeys.includes(record.id));

  const columns: ColumnsType<UserRecord> = [
    { title: "用户名", dataIndex: "username", key: "username" },
    { title: "姓名", dataIndex: "realName", key: "realName", render: (value?: string) => value || "-" },
    { title: "手机", dataIndex: "phone", key: "phone", render: (value?: string) => value || "-" },
    { title: "邮箱", dataIndex: "email", key: "email", render: (value?: string) => value || "-" },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: number) => status === 1 ? <Badge status="success" text="启用" /> : <Badge status="default" text="禁用" />
    },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Button aria-label="修改用户" icon={<EditOutlined />} size="small" title="修改" type="text" onClick={() => openJsonEdit({ title: "修改用户信息", record, onSubmit: onUpdate })} />
          <Button aria-label="删除用户" danger icon={<DeleteOutlined />} size="small" title="删除" type="text" onClick={() => onDelete(record)} />
        </Space>
      )
    }
  ];

  return (
    <PageShell activePage="user-list">
      <ListFilterPanel
        onSearch={() => setAppliedFilters({ username, phone, status })}
        onReset={() => {
          setUsername("");
          setPhone("");
          setStatus(undefined);
          setAppliedFilters({ username: "", phone: "" });
        }}
      >
        <label><span>用户名/姓名</span><Input allowClear placeholder="请输入用户名或姓名" value={username} onChange={(event) => setUsername(event.target.value)} /></label>
        <label><span>手机号</span><Input allowClear placeholder="请输入手机号" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
        <label><span>状态</span><Select allowClear options={[{ label: "启用", value: 1 }, { label: "禁用", value: 0 }]} placeholder="请选择状态" value={status} onChange={setStatus} /></label>
      </ListFilterPanel>
      <Card>
        <ListActionBar
          selectedCount={selectedRowKeys.length}
          onAdd={() => openCreateForm({
            title: "新增用户",
            initialValues: { username: "", password: "", realName: "", phone: "", email: "", status: 1 },
            onSubmit: onCreate
          })}
          onEdit={() => selectedRecords[0] && openJsonEdit({ title: "修改用户信息", record: selectedRecords[0], onSubmit: onUpdate })}
          onDelete={() => confirmBatchDelete(selectedRecords, (record) => record.username, onDelete)}
        />
        <Table columns={columns} dataSource={dataSource} loading={loading} rowKey="id" rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }} pagination={{ pageSize: 8 }} />
      </Card>
    </PageShell>
  );
}

function PermissionPage({
  rows,
  loading,
  onCreate,
  onUpdate,
  onDelete
}: {
  rows: RoleRecord[];
  loading: boolean;
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onUpdate: (record: RoleRecord) => Promise<void>;
  onDelete: (record: RoleRecord) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const dataSource = rows.filter((item) => includesKeyword([item.roleName, item.roleCode, item.description], appliedKeyword));
  const selectedRecords = rows.filter((record) => selectedRowKeys.includes(record.id));

  const columns: ColumnsType<RoleRecord> = [
    { title: "角色名称", dataIndex: "roleName", key: "roleName" },
    { title: "角色编码", dataIndex: "roleCode", key: "roleCode" },
    { title: "说明", dataIndex: "description", key: "description", ellipsis: true, render: (value?: string) => value || "-" },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status?: number) => status === 0 ? <Badge status="default" text="停用" /> : <Badge status="success" text="启用" />
    },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Button aria-label="修改角色" icon={<EditOutlined />} size="small" title="修改" type="text" onClick={() => openJsonEdit({ title: "修改角色信息", record, onSubmit: onUpdate })} />
          <Button aria-label="删除角色" danger icon={<DeleteOutlined />} size="small" title="删除" type="text" onClick={() => onDelete(record)} />
        </Space>
      )
    }
  ];

  return (
    <PageShell activePage="permission">
      <ListFilterPanel
        onSearch={() => setAppliedKeyword(keyword)}
        onReset={() => {
          setKeyword("");
          setAppliedKeyword("");
        }}
      >
        <label><span>角色名称/编码</span><Input allowClear placeholder="请输入角色名称或编码" value={keyword} onChange={(event) => setKeyword(event.target.value)} /></label>
      </ListFilterPanel>
      <Card>
        <ListActionBar
          selectedCount={selectedRowKeys.length}
          onAdd={() => openCreateForm({
            title: "新增角色",
            initialValues: { roleName: "", roleCode: "", description: "", status: 1 },
            onSubmit: onCreate
          })}
          onEdit={() => selectedRecords[0] && openJsonEdit({ title: "修改角色信息", record: selectedRecords[0], onSubmit: onUpdate })}
          onDelete={() => confirmBatchDelete(selectedRecords, (record) => record.roleName, onDelete)}
        />
        <Table columns={columns} dataSource={dataSource} loading={loading} rowKey="id" rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }} pagination={false} />
      </Card>
    </PageShell>
  );
}

export function App() {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem("YANCAO_ADMIN_TOKEN")));
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activePage, setActivePage] = useState<PageKey>("home");
  const [openPages, setOpenPages] = useState<PageKey[]>(["home"]);
  const [tabContextMenu, setTabContextMenu] = useState<{ page: PageKey; x: number; y: number } | null>(null);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [menuOpenKeys, setMenuOpenKeys] = useState([
    "multimodal-data",
    "data",
    "images",
    "device-group",
    "user-group",
    "virus-monitoring"
  ]);
  const [editDialog, setEditDialog] = useState<EditDialogState | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    const handleOpenEdit = (event: Event) => {
      const detail = (event as CustomEvent<EditDialogState>).detail;
      setEditDialog(detail);
    };
    const handleDeleteConfirm = (event: Event) => {
      const detail = (event as CustomEvent<DeleteDialogState>).detail;
      setDeleteDialog(detail);
    };
    const handleAuthExpired = () => {
      queryClient.clear();
      setIsAuthenticated(false);
      setActivePage("home");
      setOpenPages(["home"]);
      setLoginError("登录状态已失效，请重新登录。");
    };

    window.addEventListener("admin-json-edit", handleOpenEdit);
    window.addEventListener("admin-delete-confirm", handleDeleteConfirm);
    window.addEventListener("admin-auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("admin-json-edit", handleOpenEdit);
      window.removeEventListener("admin-delete-confirm", handleDeleteConfirm);
      window.removeEventListener("admin-auth-expired", handleAuthExpired);
    };
  }, [queryClient]);

  const zonesQuery = useQuery({ queryKey: ["admin-zones"], queryFn: adminApi.getZones, enabled: isAuthenticated });
  const plotsQuery = useQuery({ queryKey: ["admin-plots"], queryFn: adminApi.getPlots, enabled: isAuthenticated });
  const varietiesQuery = useQuery({ queryKey: ["admin-varieties"], queryFn: adminApi.getVarieties, enabled: isAuthenticated });
  const devicesQuery = useQuery({ queryKey: ["admin-devices"], queryFn: adminApi.getDevices, enabled: isAuthenticated });
  const mobileImagesQuery = useQuery({ queryKey: ["admin-images", "mobile"], queryFn: () => adminApi.getImages("mobile"), enabled: isAuthenticated });
  const cameraImagesQuery = useQuery({ queryKey: ["admin-images", "camera"], queryFn: () => adminApi.getImages("camera"), enabled: isAuthenticated });
  const droneImagesQuery = useQuery({ queryKey: ["admin-images", "drone"], queryFn: () => adminApi.getImages("drone"), enabled: isAuthenticated });
  const mobileDetectionsQuery = useQuery({ queryKey: ["admin-detections", "mobile"], queryFn: () => adminApi.getDetections("mobile"), enabled: isAuthenticated });
  const cameraDetectionsQuery = useQuery({ queryKey: ["admin-detections", "camera"], queryFn: () => adminApi.getDetections("camera"), enabled: isAuthenticated });
  const droneDetectionsQuery = useQuery({ queryKey: ["admin-detections", "drone"], queryFn: () => adminApi.getDetections("drone"), enabled: isAuthenticated });
  const knowledgeQuery = useQuery({ queryKey: ["admin-knowledge"], queryFn: adminApi.getKnowledge, enabled: isAuthenticated });
  const modelsQuery = useQuery({ queryKey: ["admin-models"], queryFn: adminApi.getModels, enabled: isAuthenticated });
  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: adminApi.getUsers, enabled: isAuthenticated });
  const rolesQuery = useQuery({ queryKey: ["admin-roles"], queryFn: adminApi.getRoles, enabled: isAuthenticated });

  const zones = zonesQuery.data?.records ?? [];
  const plots = plotsQuery.data?.records ?? [];
  const varieties = varietiesQuery.data?.records ?? [];
  const devices = devicesQuery.data?.records ?? [];
  const knowledge = knowledgeQuery.data?.records ?? [];
  const models = modelsQuery.data?.records ?? [];
  const users = usersQuery.data?.records ?? [];
  const roles = rolesQuery.data ?? [];
  const mobileImages = mobileImagesQuery.data?.records ?? [];
  const cameraImages = cameraImagesQuery.data?.records ?? [];
  const droneImages = droneImagesQuery.data?.records ?? [];
  const mobileDetections = mobileDetectionsQuery.data?.records ?? [];
  const cameraDetections = cameraDetectionsQuery.data?.records ?? [];
  const droneDetections = droneDetectionsQuery.data?.records ?? [];

  const handleLogin = async (values: LoginValues) => {
    setLoginLoading(true);
    setLoginError("");

    try {
      const result = await adminApi.login({
        username: values.username,
        password: values.password
      });
      localStorage.setItem("YANCAO_ADMIN_TOKEN", result.token);
      queryClient.clear();
      setIsAuthenticated(true);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "登录失败，请检查账号密码或后端服务。");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    adminApi.logout().catch(() => undefined).finally(() => {
      localStorage.removeItem("YANCAO_ADMIN_TOKEN");
      setIsAuthenticated(false);
      setActivePage("home");
      setOpenPages(["home"]);
    });
  };

  const openPage = (page: PageKey) => {
    setOpenPages((pages) => pages.includes(page) ? pages : [...pages, page]);
    setActivePage(page);
  };

  const closePage = (page: PageKey) => {
    if (page === "home") {
      return;
    }

    setOpenPages((pages) => {
      const pageIndex = pages.indexOf(page);
      const nextPages = pages.filter((item) => item !== page);

      if (page === activePage) {
        const nextActivePage = nextPages[Math.min(pageIndex, nextPages.length - 1)] ?? "home";
        setActivePage(nextActivePage);
      }

      return nextPages;
    });
  };

  const closePages = (mode: "current" | "others" | "left" | "right" | "all", targetPage: PageKey) => {
    setOpenPages((pages) => {
      const targetIndex = pages.indexOf(targetPage);
      let nextPages: PageKey[];

      if (mode === "current") {
        nextPages = targetPage === "home" ? pages : pages.filter((page) => page !== targetPage);
      } else if (mode === "others") {
        nextPages = targetPage === "home" ? ["home"] : ["home", targetPage];
      } else if (mode === "left") {
        nextPages = pages.filter((page, index) => page === "home" || index >= targetIndex);
      } else if (mode === "right") {
        nextPages = pages.filter((page, index) => page === "home" || index <= targetIndex);
      } else {
        nextPages = ["home"];
      }

      if (!nextPages.includes(activePage)) {
        setActivePage(nextPages.includes(targetPage) ? targetPage : "home");
      }
      return nextPages;
    });
    setTabContextMenu(null);
  };

  const refreshActivePage = async (page: PageKey) => {
    const queryKeys: Partial<Record<PageKey, unknown[]>> = {
      zone: ["admin-zones"],
      plot: ["admin-plots"],
      variety: ["admin-varieties"],
      "image-mobile": ["admin-images", "mobile"],
      "image-camera": ["admin-images", "camera"],
      "image-drone": ["admin-images", "drone"],
      "detection-mobile": ["admin-detections", "mobile"],
      "detection-camera": ["admin-detections", "camera"],
      "detection-drone": ["admin-detections", "drone"],
      knowledge: ["admin-knowledge"],
      device: ["admin-devices"],
      "user-list": ["admin-users"],
      permission: ["admin-roles"]
    };
    const queryKey = queryKeys[page];
    if (queryKey) {
      await queryClient.invalidateQueries({ queryKey });
    }
    setActivePage(page);
    setTabContextMenu(null);
  };

  const refreshQuery = async (queryKey: unknown[]) => {
    await queryClient.invalidateQueries({ queryKey });
  };

  const runUpdate = async <T extends { id: number }>(action: () => Promise<unknown>, queryKey: unknown[]) => {
    await action();
    await refreshQuery(queryKey);
    Modal.success({ title: "保存成功" });
  };

  const runCreate = async (action: () => Promise<unknown>, queryKey: unknown[]) => {
    await action();
    await refreshQuery(queryKey);
    Modal.success({ title: "新增成功" });
  };

  const confirmDelete = (title: string, content: string, action: () => Promise<unknown>, queryKey: unknown[]) => {
    setDeleteDialog({
      title,
      content: `是否${content}`,
      onConfirm: async () => {
        await action();
        await refreshQuery(queryKey);
        Modal.success({ title: "删除成功" });
      }
    });
  };

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return <HomePage onNavigate={openPage} />;
      case "zone":
        return (
          <ZonePage
            zones={zones}
            loading={zonesQuery.isLoading}
            onCreate={(payload) => runCreate(() => adminApi.createZone(payload as Parameters<typeof adminApi.createZone>[0]), ["admin-zones"])}
            onUpdate={(record) => runUpdate(() => adminApi.updateZone(record), ["admin-zones"])}
            onDelete={(record) => confirmDelete("删除烟区", `确认删除“${record.zoneName}”？`, () => adminApi.deleteZone(record.id), ["admin-zones"])}
          />
        );
      case "plot":
        return (
          <PlotPage
            plots={plots}
            zones={zones}
            loading={plotsQuery.isLoading}
            onCreate={(payload) => runCreate(() => adminApi.createPlot(payload as Parameters<typeof adminApi.createPlot>[0]), ["admin-plots"])}
            onUpdate={(record) => runUpdate(() => adminApi.updatePlot(record), ["admin-plots"])}
            onDelete={(record) => confirmDelete("删除烟田", `确认删除“${record.plotName}”？`, () => adminApi.deletePlot(record.id), ["admin-plots"])}
          />
        );
      case "variety":
        return (
          <VarietyPage
            rows={varieties}
            loading={varietiesQuery.isLoading}
            onCreate={(payload) => runCreate(() => adminApi.createVariety(payload as Parameters<typeof adminApi.createVariety>[0]), ["admin-varieties"])}
            onUpdate={(record) => runUpdate(() => adminApi.updateVariety(record), ["admin-varieties"])}
            onDelete={(record) => confirmDelete("删除烟草品种", `确认删除“${record.varietyName}”？`, () => adminApi.deleteVariety(record.id), ["admin-varieties"])}
          />
        );
      case "image-mobile":
        return (
          <ImagePage
            activePage={activePage}
            sourceType="mobile"
            rows={mobileImages}
            plots={plots}
            devices={devices}
            loading={mobileImagesQuery.isLoading}
            onCreate={(payload) => runCreate(() => adminApi.createImage("mobile", payload as Parameters<typeof adminApi.createImage>[1]), ["admin-images", "mobile"])}
            onDelete={(record, type) => confirmDelete("删除图片", `确认删除“${getFileName(record.imageUrl)}”？`, () => adminApi.deleteImage(type, record.id), ["admin-images", type])}
          />
        );
      case "image-camera":
        return (
          <ImagePage
            activePage={activePage}
            sourceType="camera"
            rows={cameraImages}
            plots={plots}
            devices={devices}
            loading={cameraImagesQuery.isLoading}
            onCreate={(payload) => runCreate(() => adminApi.createImage("camera", payload as Parameters<typeof adminApi.createImage>[1]), ["admin-images", "camera"])}
            onDelete={(record, type) => confirmDelete("删除图片", `确认删除“${getFileName(record.imageUrl)}”？`, () => adminApi.deleteImage(type, record.id), ["admin-images", type])}
          />
        );
      case "image-drone":
        return (
          <ImagePage
            activePage={activePage}
            sourceType="drone"
            rows={droneImages}
            plots={plots}
            devices={devices}
            loading={droneImagesQuery.isLoading}
            onCreate={(payload) => runCreate(() => adminApi.createImage("drone", payload as Parameters<typeof adminApi.createImage>[1]), ["admin-images", "drone"])}
            onDelete={(record, type) => confirmDelete("删除图片", `确认删除“${getFileName(record.imageUrl)}”？`, () => adminApi.deleteImage(type, record.id), ["admin-images", type])}
          />
        );
      case "detection-mobile":
        return <DetectionPage activePage={activePage} sourceType="mobile" rows={mobileDetections} plots={plots} loading={mobileDetectionsQuery.isLoading} />;
      case "detection-camera":
        return <DetectionPage activePage={activePage} sourceType="camera" rows={cameraDetections} plots={plots} loading={cameraDetectionsQuery.isLoading} />;
      case "detection-drone":
        return <DetectionPage activePage={activePage} sourceType="drone" rows={droneDetections} plots={plots} loading={droneDetectionsQuery.isLoading} />;
      case "result-near-ground":
        return (
          <NearGroundDetectionPage
            rows={[...mobileDetections, ...cameraDetections]}
            plots={plots}
            devices={devices}
            knowledge={knowledge}
            models={models}
          />
        );
      case "result-drone":
        return (
          <DroneDetectionWorkspacePage
            rows={droneDetections}
            plots={plots}
            images={droneImages}
            knowledge={knowledge}
            models={models}
            loading={droneDetectionsQuery.isLoading}
            onViewHistory={() => openPage("image-drone")}
          />
        );
      case "knowledge":
        return (
          <KnowledgePage
            rows={knowledge}
            loading={knowledgeQuery.isLoading}
            onCreate={(payload) => runCreate(() => adminApi.createKnowledge(payload as Parameters<typeof adminApi.createKnowledge>[0]), ["admin-knowledge"])}
            onUpdate={(record) => runUpdate(() => adminApi.updateKnowledge(record), ["admin-knowledge"])}
            onDelete={(record) => confirmDelete("删除病害", `确认删除“${record.diseaseName}”？`, () => adminApi.deleteKnowledge(record.id), ["admin-knowledge"])}
          />
        );
      case "device":
        return (
          <DevicePage
            rows={devices}
            plots={plots}
            zones={zones}
            loading={devicesQuery.isLoading}
            onCreate={(payload) => runCreate(() => adminApi.createDevice(payload as Parameters<typeof adminApi.createDevice>[0]), ["admin-devices"])}
            onUpdate={(record) => runUpdate(() => adminApi.updateDevice(record), ["admin-devices"])}
            onDelete={(record) => confirmDelete("删除设备", `确认删除“${record.deviceName}”？`, () => adminApi.deleteDevice(record.id), ["admin-devices"])}
          />
        );
      case "user-list":
        return (
          <UserListPage
            rows={users}
            loading={usersQuery.isLoading}
            onCreate={(payload) => runCreate(() => adminApi.createUser(payload as Parameters<typeof adminApi.createUser>[0]), ["admin-users"])}
            onUpdate={(record) => runUpdate(() => adminApi.updateUser(record), ["admin-users"])}
            onDelete={(record) => confirmDelete("删除用户", `确认删除“${record.username}”？`, () => adminApi.deleteUser(record.id), ["admin-users"])}
          />
        );
      case "permission":
        return (
          <PermissionPage
            rows={roles}
            loading={rolesQuery.isLoading}
            onCreate={(payload) => runCreate(() => adminApi.createRole(payload as Parameters<typeof adminApi.createRole>[0]), ["admin-roles"])}
            onUpdate={(record) => runUpdate(() => adminApi.updateRole(record), ["admin-roles"])}
            onDelete={(record) => confirmDelete("删除角色", `确认删除“${record.roleName}”？`, () => adminApi.deleteRole(record.id), ["admin-roles"])}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 6,
          fontFamily: "Microsoft YaHei, Segoe UI, sans-serif"
        }
      }}
    >
      {!isAuthenticated ? (
        <main className="login-page">
          <section className="login-visual">
            <div className="login-brand-panel">
              <h1>烟草病毒病人工智能监测预警系统</h1>
              <p>统一管理烟区、烟田、图像、检测结果、设备和用户权限，支撑烟草病毒病识别与防控业务闭环。</p>
            </div>
          </section>
          <section className="login-card-wrap">
            <Card className="login-card">
              <div className="login-card-title">
                <Text type="secondary">欢迎登录</Text>
                <Title level={3}>管理后台</Title>
              </div>
              <Form initialValues={{ username: "admin", remember: true }} layout="vertical" onFinish={handleLogin} requiredMark={false}>
                <Form.Item label="账号" name="username" rules={[{ required: true, message: "请输入账号" }]}>
                  <Input placeholder="请输入账号" size="large" />
                </Form.Item>
                <Form.Item label="密码" name="password" rules={[{ required: true, message: "请输入密码" }]}>
                  <Input.Password placeholder="请输入密码" size="large" />
                </Form.Item>
                <div className="login-options">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>记住登录状态</Checkbox>
                  </Form.Item>
                  <Button type="link">忘记密码</Button>
                </div>
                {loginError && <div className="login-error">{loginError}</div>}
                <Button block htmlType="submit" loading={loginLoading} size="large" type="primary">登录</Button>
              </Form>
              <div className="login-demo-tip">演示账号：admin / admin123</div>
            </Card>
          </section>
        </main>
      ) : (
        <Layout className="admin-shell">
          <Sider
            width={246}
            collapsedWidth={72}
            collapsed={siderCollapsed}
            trigger={null}
            className="admin-sider"
          >
            <div className="admin-brand">
              <img src="/logo/9547aa6d08d7a72e9a040a7918a7cfe6.png" alt="平台标识" />
            </div>
            {siderCollapsed ? (
              <div className="collapsed-sider-menu">
                <button
                  aria-label="打开首页"
                  className="collapsed-sider-menu-item"
                  title="首页"
                  type="button"
                  onClick={() => openPage("home")}
                >
                  <HomeOutlined />
                </button>
                <button
                  aria-label="展开多模态数据管理"
                  className="collapsed-sider-menu-item"
                  title="多模态数据管理"
                  type="button"
                  onClick={() => {
                    setMenuOpenKeys(["multimodal-data"]);
                    setSiderCollapsed(false);
                  }}
                >
                  <DatabaseOutlined />
                </button>
                <button
                  aria-label="展开烟草病毒病诊断"
                  className="collapsed-sider-menu-item"
                  title="烟草病毒病诊断"
                  type="button"
                  onClick={() => {
                    setMenuOpenKeys(["virus-monitoring"]);
                    setSiderCollapsed(false);
                  }}
                >
                  <BugOutlined />
                </button>
              </div>
            ) : (
              <Menu
                mode="inline"
                inlineIndent={18}
                openKeys={menuOpenKeys}
                selectedKeys={[activePage]}
                items={menuItems}
                onClick={(item) => openPage(item.key as PageKey)}
                onOpenChange={(keys) => setMenuOpenKeys(keys)}
              />
            )}
          </Sider>
          <Layout>
            <Header className="admin-header">
              <Button
                className="sider-collapse-button"
                type="text"
                onClick={() => setSiderCollapsed((value) => !value)}
              >
                {siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </Button>
              <div className="admin-header-title">烟草病毒病人工智能监测预警系统</div>
              <Space className="admin-header-actions">
                <Button onClick={handleLogout} type="primary">退出登录</Button>
              </Space>
            </Header>
            <nav className="admin-page-tabs" aria-label="已打开页面">
              {openPages.map((page) => (
                <button
                  className={`admin-page-tab ${page === activePage ? "is-active" : ""}`}
                  key={page}
                  type="button"
                  onClick={() => setActivePage(page)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    setTabContextMenu({ page, x: event.clientX, y: event.clientY });
                  }}
                >
                  {page === activePage ? <span className="admin-page-tab-dot" aria-hidden="true" /> : null}
                  <span>{pageLabels[page]}</span>
                  {page !== "home" ? (
                    <CloseOutlined
                      className="admin-page-tab-close"
                      onClick={(event) => {
                        event.stopPropagation();
                        closePage(page);
                      }}
                    />
                  ) : null}
                </button>
              ))}
            </nav>
            {tabContextMenu ? (
              <>
                <button className="tab-context-backdrop" aria-label="关闭标签菜单" type="button" onClick={() => setTabContextMenu(null)} />
                <div className="tab-context-menu" style={{ left: tabContextMenu.x, top: tabContextMenu.y }}>
                  <button type="button" onClick={() => refreshActivePage(tabContextMenu.page)}><ReloadOutlined />刷新页面</button>
                  <button disabled={tabContextMenu.page === "home"} type="button" onClick={() => closePages("current", tabContextMenu.page)}><CloseOutlined />关闭当前</button>
                  <button type="button" onClick={() => closePages("others", tabContextMenu.page)}>⊗ 关闭其他</button>
                  <button type="button" onClick={() => closePages("left", tabContextMenu.page)}>← 关闭左侧</button>
                  <button type="button" onClick={() => closePages("right", tabContextMenu.page)}>→ 关闭右侧</button>
                  <button type="button" onClick={() => closePages("all", tabContextMenu.page)}>⊗ 全部关闭</button>
                </div>
              </>
            ) : null}
            <Content className={`admin-content ${multimodalPages.has(activePage) ? "multimodal-content" : ""}`}>
              {renderPage()}
            </Content>
          </Layout>
        </Layout>
      )}
      <AdminEditDialog
        dialog={editDialog}
        onChange={(value) => setEditDialog((current) => current ? { ...current, value } : current)}
        onClose={() => setEditDialog(null)}
      />
      <Modal
        title={deleteDialog?.title ?? "删除确认"}
        open={Boolean(deleteDialog)}
        okText="确定"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        confirmLoading={deleteSubmitting}
        onCancel={() => setDeleteDialog(null)}
        onOk={async () => {
          if (!deleteDialog) {
            return;
          }
          setDeleteSubmitting(true);
          try {
            await deleteDialog.onConfirm();
            setDeleteDialog(null);
          } finally {
            setDeleteSubmitting(false);
          }
        }}
      >
        <p className="delete-confirm-content">{deleteDialog?.content}</p>
      </Modal>
    </ConfigProvider>
  );
}
