import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Progress,
  Select,
  Space,
  Table,
  Tag,
  Typography
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  adminApi,
  type DetectionRecord,
  type DeviceRecord,
  type ImageRecord,
  type KnowledgeRecord,
  type PlotRecord,
  type RoleRecord,
  type UserRecord,
  type ZoneRecord
} from "./api";
import "./styles.css";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

type PageKey =
  | "zone"
  | "plot"
  | "image-mobile"
  | "image-camera"
  | "image-drone"
  | "result-mobile"
  | "result-camera"
  | "result-drone"
  | "knowledge"
  | "device"
  | "user-list"
  | "permission";

type SourceType = "mobile" | "camera" | "drone";

interface LoginValues {
  username: string;
  password: string;
  remember?: boolean;
}

interface EditDialogState {
  title: string;
  value: string;
  onSubmit: (payload: { id: number } & Record<string, unknown>) => Promise<void>;
}

interface PageMeta {
  title: string;
}

const pageMeta: Record<PageKey, PageMeta> = {
  zone: { title: "烟区管理" },
  plot: { title: "烟田管理" },
  "image-mobile": { title: "手机图片" },
  "image-camera": { title: "摄像头图片" },
  "image-drone": { title: "无人机图片" },
  "result-mobile": { title: "手机检测结果" },
  "result-camera": { title: "摄像头检测结果" },
  "result-drone": { title: "无人机检测结果" },
  knowledge: { title: "病害知识库" },
  device: { title: "设备管理" },
  "user-list": { title: "用户列表" },
  permission: { title: "用户权限管理" }
};

const sourceName: Record<SourceType, string> = {
  mobile: "手机",
  camera: "摄像头",
  drone: "无人机"
};

const menuItems = [
  {
    key: "data",
    label: "数据管理",
    children: [
      { key: "zone", label: "烟区" },
      { key: "plot", label: "烟田" },
      {
        key: "images",
        label: "图像管理",
        children: [
          { key: "image-mobile", label: "手机图片" },
          { key: "image-camera", label: "摄像头图片" },
          { key: "image-drone", label: "无人机图片" }
        ]
      },
      {
        key: "results",
        label: "结果管理",
        children: [
          { key: "result-mobile", label: "手机检测" },
          { key: "result-camera", label: "摄像头检测" },
          { key: "result-drone", label: "无人机检测" }
        ]
      }
    ]
  },
  { key: "knowledge", label: "病害知识库" },
  {
    key: "device-group",
    label: "设备管理",
    children: [{ key: "device", label: "烟区烟田设备" }]
  },
  {
    key: "user-group",
    label: "用户管理",
    children: [
      { key: "user-list", label: "用户列表" },
      { key: "permission", label: "用户权限管理" }
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
      onSubmit: onSubmit as EditDialogState["onSubmit"]
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

  return (
    <Modal
      title={dialog?.title}
      open={Boolean(dialog)}
      width={760}
      okText="提交保存"
      cancelText="取消"
      confirmLoading={submitting}
      onCancel={onClose}
      onOk={async () => {
        if (!dialog) {
          return;
        }
        setSubmitting(true);
        try {
          const payload = JSON.parse(dialog.value) as { id: number } & Record<string, unknown>;
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
      <TextArea
        className="record-json-editor"
        value={dialog?.value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </Modal>
  );
}

function PageShell({
  activePage,
  children,
  extra
}: {
  activePage: PageKey;
  children: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <Space direction="vertical" size={16} className="full-width">
      <div className="page-heading">
        <div className="page-title-row">
          <Title level={3}>{pageMeta[activePage].title}</Title>
          {extra}
        </div>
      </div>
      {children}
    </Space>
  );
}

function ZonePage({
  zones,
  loading,
  onUpdate,
  onDelete
}: {
  zones: ZoneRecord[];
  loading: boolean;
  onUpdate: (record: ZoneRecord) => Promise<void>;
  onDelete: (record: ZoneRecord) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const filteredZones = zones.filter((zone) =>
    includesKeyword([zone.zoneName, zone.zoneCode, zone.province, zone.city, zone.description], keyword)
  );

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
      width: 160,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => openJsonEdit({ title: "编辑烟区", record, onSubmit: onUpdate })}>编辑</Button>
          <Button danger size="small" type="link" onClick={() => onDelete(record)}>删除</Button>
        </Space>
      )
    }
  ];

  return (
    <PageShell activePage="zone" extra={<Button type="primary">新增烟区</Button>}>
      <Card>
        <Space className="filter-bar">
          <Input.Search allowClear onChange={(event) => setKeyword(event.target.value)} placeholder="搜索烟区名称/编码" value={keyword} />
        </Space>
        <Table columns={columns} dataSource={filteredZones} loading={loading} rowKey="id" pagination={{ pageSize: 8 }} />
      </Card>
    </PageShell>
  );
}

function PlotPage({
  plots,
  zones,
  loading,
  onUpdate,
  onDelete
}: {
  plots: PlotRecord[];
  zones: ZoneRecord[];
  loading: boolean;
  onUpdate: (record: PlotRecord) => Promise<void>;
  onDelete: (record: PlotRecord) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<number | undefined>();
  const filteredPlots = plots.filter((plot) =>
    includesKeyword([plot.plotName, plot.plotCode, plot.province, plot.city, plot.district, plot.address, getZoneName(zones, plot.zoneId)], keyword)
    && (status === undefined || plot.status === status)
  );

  const columns: ColumnsType<PlotRecord> = [
    { title: "烟田名称", dataIndex: "plotName", key: "plotName", fixed: "left", width: 170 },
    { title: "烟田编码", dataIndex: "plotCode", key: "plotCode", width: 130 },
    { title: "所属烟区", dataIndex: "zoneId", key: "zoneId", render: (zoneId?: number) => getZoneName(zones, zoneId) },
    { title: "地区", key: "district", render: (_, record) => [record.province, record.city, record.district].filter(Boolean).join(" / ") || "-" },
    { title: "地址", dataIndex: "address", key: "address", ellipsis: true },
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
      width: 170,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => showRecordDetail("烟田详情", record)}>详情</Button>
          <Button size="small" type="link" onClick={() => openJsonEdit({ title: "编辑烟田", record, onSubmit: onUpdate })}>编辑</Button>
          <Button danger size="small" type="link" onClick={() => onDelete(record)}>删除</Button>
        </Space>
      )
    }
  ];

  return (
    <PageShell
      activePage="plot"
      extra={
        <Space>
          <Button>导入Excel</Button>
          <Button>导出Excel</Button>
          <Button type="primary">新增烟田</Button>
        </Space>
      }
    >
      <Card>
        <Space className="filter-bar">
          <Input.Search allowClear onChange={(event) => setKeyword(event.target.value)} placeholder="搜索烟田名称/编码" value={keyword} />
          <Select
            allowClear
            onChange={setStatus}
            options={[{ label: "启用", value: 1 }, { label: "停用", value: 0 }]}
            placeholder="状态"
            value={status}
          />
        </Space>
        <Table columns={columns} dataSource={filteredPlots} loading={loading} rowKey="id" scroll={{ x: 980 }} pagination={{ pageSize: 8 }} />
      </Card>
    </PageShell>
  );
}

function ImagePage({
  activePage,
  sourceType,
  rows,
  plots,
  loading,
  onDelete
}: {
  activePage: PageKey;
  sourceType: SourceType;
  rows: ImageRecord[];
  plots: PlotRecord[];
  loading: boolean;
  onDelete: (record: ImageRecord, sourceType: SourceType) => void;
}) {
  const [plotId, setPlotId] = useState<number | undefined>();
  const [keyword, setKeyword] = useState("");
  const dataSource = rows.filter((item) =>
    (!plotId || item.plotId === plotId)
    && includesKeyword([getFileName(item.imageUrl), getPlotName(plots, item.plotId), item.uploadUserId, item.deviceId], keyword)
  );

  const columns: ColumnsType<ImageRecord> = [
    {
      title: "缩略图",
      key: "thumbnail",
      width: 110,
      render: (_, record) => <img className="admin-thumb" src={record.thumbnailUrl || record.imageUrl} alt="缩略图" />
    },
    { title: "图片名称", dataIndex: "imageUrl", key: "imageUrl", render: (url: string) => getFileName(url) },
    { title: "烟田", dataIndex: "plotId", key: "plotId", render: (id: number) => getPlotName(plots, id) },
    {
      title: sourceType === "camera" ? "来源设备" : "上传来源",
      key: "source",
      render: (_, record) => record.deviceId ? `设备ID ${record.deviceId}` : record.uploadUserId ? `用户ID ${record.uploadUserId}` : sourceName[sourceType]
    },
    { title: "拍摄时间", dataIndex: "shootTime", key: "shootTime", render: (value?: string) => value || "-" },
    { title: "入库时间", dataIndex: "createTime", key: "createTime", render: (value?: string) => value || "-" },
    { title: "状态", key: "status", render: () => <Tag color="green">已入库</Tag> },
    {
      title: "操作",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => showRecordDetail("图片详情", record)}>查看</Button>
          <Button danger size="small" type="link" onClick={() => onDelete(record, sourceType)}>删除</Button>
        </Space>
      )
    }
  ];

  return (
    <PageShell activePage={activePage} extra={<Button type="primary">{sourceType === "camera" ? "抓拍入库" : "上传图片"}</Button>}>
      <Card>
        <Space className="filter-bar">
          <Input.Search allowClear onChange={(event) => setKeyword(event.target.value)} placeholder="搜索图片/烟田" value={keyword} />
          <Select
            allowClear
            onChange={setPlotId}
            options={plots.map((plot) => ({ label: plot.plotName, value: plot.id }))}
            placeholder="选择烟田"
            value={plotId}
          />
        </Space>
        <Table columns={columns} dataSource={dataSource} loading={loading} rowKey="id" pagination={{ pageSize: 8 }} />
      </Card>
    </PageShell>
  );
}

function DetectionPage({
  activePage,
  rows,
  plots,
  loading
}: {
  activePage: PageKey;
  rows: DetectionRecord[];
  plots: PlotRecord[];
  loading: boolean;
}) {
  const [plotId, setPlotId] = useState<number | undefined>();
  const [keyword, setKeyword] = useState("");
  const dataSource = rows.filter((item) =>
    (!plotId || item.plotId === plotId)
    && includesKeyword([getPlotName(plots, item.plotId), item.diseaseName, item.diseaseCode], keyword)
  );

  const columns: ColumnsType<DetectionRecord> = [
    { title: "烟田", dataIndex: "plotId", key: "plotId", render: (id: number) => getPlotName(plots, id) },
    { title: "识别病害", dataIndex: "diseaseName", key: "diseaseName" },
    { title: "病害编码", dataIndex: "diseaseCode", key: "diseaseCode", render: (value?: string) => value ? <Tag color="blue">{value}</Tag> : "-" },
    {
      title: "置信度",
      dataIndex: "confidence",
      key: "confidence",
      render: (value?: number) => typeof value === "number" ? <Progress percent={value} size="small" /> : "-"
    },
    {
      title: "发病比例",
      key: "infectionRate",
      render: (_, record) => `${record.infectionRate ?? record.diseaseRatio ?? 0}%`
    },
    { title: "检测时间", key: "detectTime", render: (_, record) => record.detectTime || record.createTime || "-" },
    { title: "状态", key: "status", render: () => <Tag color="orange">待复核</Tag> },
    {
      title: "操作",
      key: "actions",
      width: 130,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => showRecordDetail("检测结果详情", record)}>详情</Button>
          <Button size="small" type="link" onClick={() => Modal.info({ title: "复核提示", content: "接口文档中检测结果模块目前只提供列表接口，暂未提供复核提交接口。" })}>复核</Button>
        </Space>
      )
    }
  ];

  return (
    <PageShell activePage={activePage}>
      <Card>
        <Space className="filter-bar">
          <Input.Search allowClear onChange={(event) => setKeyword(event.target.value)} placeholder="搜索烟田/病害" value={keyword} />
          <Select
            allowClear
            onChange={setPlotId}
            options={plots.map((plot) => ({ label: plot.plotName, value: plot.id }))}
            placeholder="选择烟田"
            value={plotId}
          />
        </Space>
        <Table columns={columns} dataSource={dataSource} loading={loading} rowKey="id" pagination={{ pageSize: 8 }} />
      </Card>
    </PageShell>
  );
}

function DevicePage({
  rows,
  plots,
  zones,
  loading,
  onUpdate,
  onDelete,
  onToggleStatus
}: {
  rows: DeviceRecord[];
  plots: PlotRecord[];
  zones: ZoneRecord[];
  loading: boolean;
  onUpdate: (record: DeviceRecord) => Promise<void>;
  onDelete: (record: DeviceRecord) => void;
  onToggleStatus: (record: DeviceRecord) => void;
}) {
  const [zoneId, setZoneId] = useState<number | undefined>();
  const [plotId, setPlotId] = useState<number | undefined>();
  const [deviceType, setDeviceType] = useState<string | undefined>();
  const visiblePlots = plots.filter((plot) => !zoneId || plot.zoneId === zoneId);
  const dataSource = rows.filter((item) => {
    const plot = plots.find((record) => record.id === item.plotId);
    return (!zoneId || plot?.zoneId === zoneId)
      && (!plotId || item.plotId === plotId)
      && (!deviceType || item.deviceType === deviceType);
  });

  const columns: ColumnsType<DeviceRecord> = [
    { title: "烟区", dataIndex: "plotId", key: "zone", render: (id: number) => getPlotZoneName(plots, zones, id) },
    { title: "烟田", dataIndex: "plotId", key: "plot", render: (id: number) => getPlotName(plots, id) },
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
      width: 170,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => openJsonEdit({ title: "编辑设备", record, onSubmit: onUpdate })}>编辑</Button>
          <Button size="small" type="link" onClick={() => onToggleStatus(record)}>{record.status === 1 ? "停用" : "启用"}</Button>
          <Button danger size="small" type="link" onClick={() => onDelete(record)}>删除</Button>
        </Space>
      )
    }
  ];

  return (
    <PageShell activePage="device" extra={<Button type="primary">新增设备</Button>}>
      <Card>
        <Space className="filter-bar">
          <Select
            allowClear
            onChange={(value) => {
              setZoneId(value);
              setPlotId(undefined);
            }}
            options={zones.map((zone) => ({ label: zone.zoneName, value: zone.id }))}
            placeholder="选择烟区"
            value={zoneId}
          />
          <Select
            allowClear
            onChange={setPlotId}
            options={visiblePlots.map((plot) => ({ label: plot.plotName, value: plot.id }))}
            placeholder="选择烟田"
            value={plotId}
          />
          <Select
            allowClear
            onChange={setDeviceType}
            options={[{ label: "摄像头", value: "camera" }, { label: "无人机", value: "drone" }]}
            placeholder="设备类型"
            value={deviceType}
          />
        </Space>
        <Table columns={columns} dataSource={dataSource} loading={loading} rowKey="id" scroll={{ x: 1180 }} pagination={{ pageSize: 8 }} />
      </Card>
    </PageShell>
  );
}

function KnowledgePage({
  rows,
  loading,
  onUpdate,
  onDelete
}: {
  rows: KnowledgeRecord[];
  loading: boolean;
  onUpdate: (record: KnowledgeRecord) => Promise<void>;
  onDelete: (record: KnowledgeRecord) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const dataSource = rows.filter((item) =>
    includesKeyword([item.diseaseName, item.diseaseCode, item.symptoms, item.prevention], keyword)
  );

  const columns: ColumnsType<KnowledgeRecord> = [
    { title: "病害名称", dataIndex: "diseaseName", key: "diseaseName", width: 240 },
    { title: "病害编码", dataIndex: "diseaseCode", key: "diseaseCode", width: 110, render: (value: string) => <Tag color="blue">{value}</Tag> },
    { title: "典型症状", dataIndex: "symptoms", key: "symptoms", ellipsis: true },
    { title: "防治建议", dataIndex: "prevention", key: "prevention", ellipsis: true },
    { title: "示例图片", dataIndex: "exampleImages", key: "exampleImages", width: 100, render: (value?: string) => `${countExampleImages(value)} 张` },
    {
      title: "操作",
      key: "actions",
      width: 170,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => showRecordDetail("病害详情", record)}>详情</Button>
          <Button size="small" type="link" onClick={() => openJsonEdit({ title: "编辑病害", record, onSubmit: onUpdate })}>编辑</Button>
          <Button danger size="small" type="link" onClick={() => onDelete(record)}>删除</Button>
        </Space>
      )
    }
  ];

  return (
    <PageShell activePage="knowledge" extra={<Button type="primary">新增病害</Button>}>
      <Card>
        <Space className="filter-bar">
          <Input.Search allowClear onChange={(event) => setKeyword(event.target.value)} placeholder="搜索病害名称/症状" value={keyword} />
        </Space>
        <Table columns={columns} dataSource={dataSource} loading={loading} rowKey="id" pagination={{ pageSize: 8 }} />
      </Card>
    </PageShell>
  );
}

function UserListPage({
  rows,
  loading,
  onUpdate,
  onDelete
}: {
  rows: UserRecord[];
  loading: boolean;
  onUpdate: (record: UserRecord) => Promise<void>;
  onDelete: (record: UserRecord) => void;
}) {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<number | undefined>();
  const dataSource = rows.filter((item) =>
    includesKeyword([item.username, item.realName], username)
    && String(item.phone ?? "").includes(phone.trim())
    && (status === undefined || item.status === status)
  );

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
      width: 170,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => openJsonEdit({ title: "编辑用户", record, onSubmit: onUpdate })}>编辑</Button>
          <Button size="small" type="link" onClick={() => Modal.info({ title: "改密提示", content: "改密接口需要 oldPassword 和 newPassword，建议单独做改密表单，避免在列表中误操作。" })}>改密</Button>
          <Button danger size="small" type="link" onClick={() => onDelete(record)}>删除</Button>
        </Space>
      )
    }
  ];

  return (
    <PageShell activePage="user-list" extra={<Button type="primary">新增用户</Button>}>
      <Card>
        <Space className="filter-bar">
          <Input.Search allowClear onChange={(event) => setUsername(event.target.value)} placeholder="用户名/姓名" value={username} />
          <Input allowClear onChange={(event) => setPhone(event.target.value)} placeholder="手机号" value={phone} />
          <Select
            allowClear
            onChange={setStatus}
            options={[{ label: "启用", value: 1 }, { label: "禁用", value: 0 }]}
            placeholder="状态"
            value={status}
          />
        </Space>
        <Table columns={columns} dataSource={dataSource} loading={loading} rowKey="id" pagination={{ pageSize: 8 }} />
      </Card>
    </PageShell>
  );
}

function PermissionPage({
  rows,
  loading,
  onUpdate,
  onDelete
}: {
  rows: RoleRecord[];
  loading: boolean;
  onUpdate: (record: RoleRecord) => Promise<void>;
  onDelete: (record: RoleRecord) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const dataSource = rows.filter((item) => includesKeyword([item.roleName, item.roleCode, item.description], keyword));

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
      width: 180,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => openJsonEdit({ title: "编辑角色", record, onSubmit: onUpdate })}>编辑角色</Button>
          <Button size="small" type="primary" onClick={() => Modal.info({ title: "分配权限", content: "接口文档提供了角色权限分配接口，当前页面还没有权限树勾选表单。" })}>分配权限</Button>
          <Button danger size="small" type="link" onClick={() => onDelete(record)}>删除</Button>
        </Space>
      )
    }
  ];

  return (
    <PageShell activePage="permission" extra={<Button type="primary">新增角色</Button>}>
      <div className="permission-layout">
        <Card title="角色列表">
          <Space className="filter-bar">
            <Input.Search allowClear onChange={(event) => setKeyword(event.target.value)} placeholder="搜索角色名称/编码" value={keyword} />
          </Space>
          <Table columns={columns} dataSource={dataSource} loading={loading} rowKey="id" pagination={false} />
        </Card>
        <Card title="权限树预览">
          <div className="permission-tree-preview">
            <p>数据管理：烟区、烟田、图像管理、结果管理、病害知识库</p>
            <p>设备管理：设备列表、启停、接口维护</p>
            <p>用户管理：用户列表、角色管理、权限分配</p>
            <Text type="secondary">用于控制菜单访问、数据查看和业务操作范围。</Text>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

export function App() {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem("YANCAO_ADMIN_TOKEN")));
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activePage, setActivePage] = useState<PageKey>("zone");
  const [menuOpenKeys, setMenuOpenKeys] = useState(["data", "images", "results", "device-group", "user-group"]);
  const [editDialog, setEditDialog] = useState<EditDialogState | null>(null);

  useEffect(() => {
    const handleOpenEdit = (event: Event) => {
      const detail = (event as CustomEvent<EditDialogState>).detail;
      setEditDialog(detail);
    };

    window.addEventListener("admin-json-edit", handleOpenEdit);
    return () => window.removeEventListener("admin-json-edit", handleOpenEdit);
  }, []);

  const userInfoQuery = useQuery({ queryKey: ["admin-user-info"], queryFn: adminApi.getUserInfo, enabled: isAuthenticated, retry: false });
  const zonesQuery = useQuery({ queryKey: ["admin-zones"], queryFn: adminApi.getZones, enabled: isAuthenticated });
  const plotsQuery = useQuery({ queryKey: ["admin-plots"], queryFn: adminApi.getPlots, enabled: isAuthenticated });
  const devicesQuery = useQuery({ queryKey: ["admin-devices"], queryFn: adminApi.getDevices, enabled: isAuthenticated });
  const mobileImagesQuery = useQuery({ queryKey: ["admin-images", "mobile"], queryFn: () => adminApi.getImages("mobile"), enabled: isAuthenticated });
  const cameraImagesQuery = useQuery({ queryKey: ["admin-images", "camera"], queryFn: () => adminApi.getImages("camera"), enabled: isAuthenticated });
  const droneImagesQuery = useQuery({ queryKey: ["admin-images", "drone"], queryFn: () => adminApi.getImages("drone"), enabled: isAuthenticated });
  const mobileDetectionsQuery = useQuery({ queryKey: ["admin-detections", "mobile"], queryFn: () => adminApi.getDetections("mobile"), enabled: isAuthenticated });
  const cameraDetectionsQuery = useQuery({ queryKey: ["admin-detections", "camera"], queryFn: () => adminApi.getDetections("camera"), enabled: isAuthenticated });
  const droneDetectionsQuery = useQuery({ queryKey: ["admin-detections", "drone"], queryFn: () => adminApi.getDetections("drone"), enabled: isAuthenticated });
  const knowledgeQuery = useQuery({ queryKey: ["admin-knowledge"], queryFn: adminApi.getKnowledge, enabled: isAuthenticated });
  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: adminApi.getUsers, enabled: isAuthenticated });
  const rolesQuery = useQuery({ queryKey: ["admin-roles"], queryFn: adminApi.getRoles, enabled: isAuthenticated });

  const zones = zonesQuery.data?.records ?? [];
  const plots = plotsQuery.data?.records ?? [];
  const devices = devicesQuery.data?.records ?? [];
  const knowledge = knowledgeQuery.data?.records ?? [];
  const users = usersQuery.data?.records ?? [];
  const roles = rolesQuery.data ?? [];
  const mobileImages = mobileImagesQuery.data?.records ?? [];
  const cameraImages = cameraImagesQuery.data?.records ?? [];
  const droneImages = droneImagesQuery.data?.records ?? [];
  const mobileDetections = mobileDetectionsQuery.data?.records ?? [];
  const cameraDetections = cameraDetectionsQuery.data?.records ?? [];
  const droneDetections = droneDetectionsQuery.data?.records ?? [];

  const hasApiError = useMemo(
    () => [
      userInfoQuery,
      zonesQuery,
      plotsQuery,
      devicesQuery,
      mobileImagesQuery,
      cameraImagesQuery,
      droneImagesQuery,
      mobileDetectionsQuery,
      cameraDetectionsQuery,
      droneDetectionsQuery,
      knowledgeQuery,
      usersQuery,
      rolesQuery
    ].some((query) => query.isError),
    [
      userInfoQuery,
      zonesQuery,
      plotsQuery,
      devicesQuery,
      mobileImagesQuery,
      cameraImagesQuery,
      droneImagesQuery,
      mobileDetectionsQuery,
      cameraDetectionsQuery,
      droneDetectionsQuery,
      knowledgeQuery,
      usersQuery,
      rolesQuery
    ]
  );

  const handleLogin = async (values: LoginValues) => {
    setLoginLoading(true);
    setLoginError("");

    try {
      const result = await adminApi.login({
        username: values.username,
        password: values.password
      });
      localStorage.setItem("YANCAO_ADMIN_TOKEN", result.token);
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
      setActivePage("zone");
    });
  };

  const refreshQuery = async (queryKey: unknown[]) => {
    await queryClient.invalidateQueries({ queryKey });
  };

  const runUpdate = async <T extends { id: number }>(action: () => Promise<unknown>, queryKey: unknown[]) => {
    await action();
    await refreshQuery(queryKey);
    Modal.success({ title: "保存成功" });
  };

  const confirmDelete = (title: string, content: string, action: () => Promise<unknown>, queryKey: unknown[]) => {
    Modal.confirm({
      title,
      content,
      okText: "确认删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        await action();
        await refreshQuery(queryKey);
        Modal.success({ title: "删除成功" });
      }
    });
  };

  const renderPage = () => {
    switch (activePage) {
      case "zone":
        return (
          <ZonePage
            zones={zones}
            loading={zonesQuery.isLoading}
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
            onUpdate={(record) => runUpdate(() => adminApi.updatePlot(record), ["admin-plots"])}
            onDelete={(record) => confirmDelete("删除烟田", `确认删除“${record.plotName}”？`, () => adminApi.deletePlot(record.id), ["admin-plots"])}
          />
        );
      case "image-mobile":
        return (
          <ImagePage
            activePage={activePage}
            sourceType="mobile"
            rows={mobileImages}
            plots={plots}
            loading={mobileImagesQuery.isLoading}
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
            loading={cameraImagesQuery.isLoading}
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
            loading={droneImagesQuery.isLoading}
            onDelete={(record, type) => confirmDelete("删除图片", `确认删除“${getFileName(record.imageUrl)}”？`, () => adminApi.deleteImage(type, record.id), ["admin-images", type])}
          />
        );
      case "result-mobile":
        return <DetectionPage activePage={activePage} rows={mobileDetections} plots={plots} loading={mobileDetectionsQuery.isLoading} />;
      case "result-camera":
        return <DetectionPage activePage={activePage} rows={cameraDetections} plots={plots} loading={cameraDetectionsQuery.isLoading} />;
      case "result-drone":
        return <DetectionPage activePage={activePage} rows={droneDetections} plots={plots} loading={droneDetectionsQuery.isLoading} />;
      case "knowledge":
        return (
          <KnowledgePage
            rows={knowledge}
            loading={knowledgeQuery.isLoading}
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
            onUpdate={(record) => runUpdate(() => adminApi.updateDevice(record), ["admin-devices"])}
            onDelete={(record) => confirmDelete("删除设备", `确认删除“${record.deviceName}”？`, () => adminApi.deleteDevice(record.id), ["admin-devices"])}
            onToggleStatus={(record) => {
              const nextStatus = record.status === 1 ? 0 : 1;
              Modal.confirm({
                title: nextStatus === 1 ? "启用设备" : "停用设备",
                content: `确认${nextStatus === 1 ? "启用" : "停用"}“${record.deviceName}”？`,
                okText: "确认",
                cancelText: "取消",
                onOk: async () => {
                  await adminApi.updateDeviceStatus(record.id, nextStatus);
                  await refreshQuery(["admin-devices"]);
                  Modal.success({ title: "状态已更新" });
                }
              });
            }}
          />
        );
      case "user-list":
        return (
          <UserListPage
            rows={users}
            loading={usersQuery.isLoading}
            onUpdate={(record) => runUpdate(() => adminApi.updateUser(record), ["admin-users"])}
            onDelete={(record) => confirmDelete("删除用户", `确认删除“${record.username}”？`, () => adminApi.deleteUser(record.id), ["admin-users"])}
          />
        );
      case "permission":
        return (
          <PermissionPage
            rows={roles}
            loading={rolesQuery.isLoading}
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
              <span>TOBACCO DIGITAL PRODUCTION PLATFORM</span>
              <h1>烟草数字化生产管理平台</h1>
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
          <Sider width={246} className="admin-sider">
            <div className="admin-brand">
              <strong>烟草数字化</strong>
              <span>管理后台</span>
            </div>
            <Menu
              mode="inline"
              openKeys={menuOpenKeys}
              selectedKeys={[activePage]}
              items={menuItems}
              onClick={(item) => setActivePage(item.key as PageKey)}
              onOpenChange={(keys) => setMenuOpenKeys(keys)}
            />
          </Sider>
          <Layout>
            <Header className="admin-header">
              <div>
                <div className="admin-header-title">烟草数字化生产管理平台</div>
                <Text type="secondary">
                  {hasApiError
                    ? "部分后端接口请求失败，请检查服务、登录状态或接口权限"
                    : userInfoQuery.data?.realName
                      ? `当前用户：${userInfoQuery.data.realName} · 后端接口已连通`
                      : "正在连接后端服务"}
                </Text>
              </div>
              <Space className="admin-header-actions">
                <Button onClick={handleLogout} type="primary">退出登录</Button>
              </Space>
            </Header>
            <Content className="admin-content">{renderPage()}</Content>
          </Layout>
        </Layout>
      )}
      <AdminEditDialog
        dialog={editDialog}
        onChange={(value) => setEditDialog((current) => current ? { ...current, value } : current)}
        onClose={() => setEditDialog(null)}
      />
    </ConfigProvider>
  );
}
