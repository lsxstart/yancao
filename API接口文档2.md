# 烟草病害AI预警平台 - API 接口文档

> v1.2 · 2026-06-25 ｜ 基于后端开发文档 v1.21

---

## 约定

- 基础路径：`http://118.24.185.177:8080`
- 版本前缀：`/api/v1`
- 认证方式：Header `Authorization: <token>`
- 响应格式：`{ "code": 200, "message": "操作成功", "data": ... }`
- 分页参数：`pageNum`(默认1) / `pageSize`(默认10)
- 数据权限：非admin角色仅返回所属烟区数据（`ZoneDataScope`自动过滤）

---

## 一、认证接口（无需登录）

### POST /api/v1/auth/login — 登录
```
Request:  { "username":"admin", "password":"admin123" }
Response: { code:200, data:{ token:"xxx", userInfo:{ id, username, realName, roles, permissions } } }
```

### POST /api/v1/auth/logout — 登出
```
Header: Authorization: <token>
Response: { code:200, message:"已退出登录" }
```

### GET /api/v1/auth/userInfo — 当前用户信息
```
Header: Authorization: <token>
Response: { code:200, data:{ id, username, realName, roles, permissions } }
```

---

## 二、用户管理

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/user/list` | 用户列表 | `pageNum, pageSize, username?, phone?, status?` |
| GET | `/api/v1/user/{id}` | 用户详情 | |
| POST | `/api/v1/user` | 新增用户 | Body: `{ username, password, realName, phone, email }` |
| PUT | `/api/v1/user` | 编辑用户 | Body: `{ id, realName, phone, email }` |
| DELETE | `/api/v1/user/{id}` | 删除用户 | |
| PUT | `/api/v1/user/{id}/status` | 启用/禁用 | `?status=1` |
| PUT | `/api/v1/user/{id}/password` | 修改密码 | Body: `{ oldPassword, newPassword }` |

---

## 三、角色管理

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/role/list` | 角色列表 | |
| GET | `/api/v1/role/{id}` | 角色详情 | |
| POST | `/api/v1/role` | 新增角色 | Body: `{ roleName, roleCode, description }` |
| PUT | `/api/v1/role` | 编辑角色 | Body: `{ id, roleName, roleCode, description }` |
| DELETE | `/api/v1/role/{id}` | 删除角色 | |
| PUT | `/api/v1/role/{id}/permissions` | 分配权限 | Body: `[1,2,3,...]` |

---

## 四、权限管理

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/permission/tree` | 权限树 | |
| GET | `/api/v1/permission/role/{roleId}` | 角色已有权限ID | |

---

## 五、烟区管理

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/zone/list` | 烟区列表 | `pageNum, pageSize, zoneName?` |
| GET | `/api/v1/zone/options` | 烟区下拉 | 返回 `[{id, zoneName, zoneCode}]` |
| POST | `/api/v1/zone` | 新增烟区 | Body: `{ zoneName, zoneCode, province, city, description }` |
| PUT | `/api/v1/zone` | 编辑烟区 | Body: `{ id, zoneName, zoneCode, ... }` |
| DELETE | `/api/v1/zone/{id}` | 删除烟区 | |

---

## 六、烟田（地块）管理

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/plot/list` | 烟田列表（关联品种名） | `pageNum, pageSize, plotName?, status?` → records 含 `varietyName` |
| GET | `/api/v1/plot/{id}` | 烟田详情 | |
| GET | `/api/v1/plot/options` | 烟田下拉 | 返回 `[{id, plotName, plotCode}]` |
| POST | `/api/v1/plot` | 新增烟田 | Body: `{ plotName, plotCode, zoneId, district, address, area, status }` |
| PUT | `/api/v1/plot` | 编辑烟田 | Body: `{ id, plotName, ... }` |
| DELETE | `/api/v1/plot/{id}` | 删除烟田 | |
| GET | `/api/v1/plot/export` | 导出Excel | 浏览器下载 `.xlsx` |
| POST | `/api/v1/plot/import` | 导入Excel | multipart `file` |

---

## 七、品种管理

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/variety/list` | 品种列表 | `pageNum, pageSize, keyword?` |
| GET | `/api/v1/variety/options` | 品种下拉 | 返回 `[{id, varietyName, varietyCode}]` |
| POST | `/api/v1/variety` | 新增品种 | Body: `{ varietyName, varietyCode, characteristics, growthPeriod, diseaseResistance, suitableRegion, description }` |
| PUT | `/api/v1/variety` | 编辑品种 | Body: `{ id, varietyName, ... }` |
| DELETE | `/api/v1/variety/{id}` | 删除品种 | |

## 八、设备管理

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/device/list` | 设备列表 | `pageNum, pageSize, plotId?, deviceType?` |
| POST | `/api/v1/device` | 新增设备 | Body: `{ plotId, deviceCode, deviceName, deviceType, model, apiUrl }` |
| PUT | `/api/v1/device` | 编辑设备 | Body: `{ id, deviceName, ... }` |
| DELETE | `/api/v1/device/{id}` | 删除设备 | |
| PUT | `/api/v1/device/{id}/status` | 启用/停用 | `?status=1` |
| POST | `/api/v1/device/heartbeat` | 设备心跳 | `?deviceCode=xxx` |

---

## 九、图片管理

### 手机图片

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/image/mobile/list` | 手机图片列表 | `pageNum, pageSize, plotId?` |
| POST | `/api/v1/image/mobile` | 上传手机图片（COS） | multipart: `file, plotId, uploadUserId` → 返回 `{id, url}` |
| DELETE | `/api/v1/image/mobile/{id}` | 软删除手机图片 | @TableLogic 标记 deleted=1 |

### 摄像头图片

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/image/camera/list` | 摄像头图片列表 | `pageNum, pageSize, plotId?` |
| POST | `/api/v1/image/camera` | 摄像头抓拍 | Body: `{ plotId, deviceId, imageUrl, thumbnailUrl }` |
| DELETE | `/api/v1/image/camera/{id}` | 删除摄像头图片 | |

### 无人机图片

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/image/drone/list` | 无人机图片列表 | `pageNum, pageSize, plotId?` |
| POST | `/api/v1/image/drone` | 上传无人机图片 | Body: `{ plotId, imageUrl, thumbnailUrl, purpose, uploadUserId }` |
| DELETE | `/api/v1/image/drone/{id}` | 删除无人机图片 | |

---

## 十、AI 模型管理

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/model/list` | 模型列表 | |
| POST | `/api/v1/model` | 新增模型 | Body: `{ modelName, version, isDefault, apiUrl, apiMethod, description }` |
| PUT | `/api/v1/model` | 编辑模型 | Body: `{ id, modelName, ... }` |
| DELETE | `/api/v1/model/{id}` | 删除模型 | |
| PUT | `/api/v1/model/{id}/default` | 设为默认模型 | 自动取消其他默认 |

---

## 十一、病害知识库

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/knowledge/list` | 知识库列表 | `pageNum, pageSize, keyword?`（支持名称/症状搜索） |
| GET | `/api/v1/knowledge/{id}` | 病害详情 | |
| POST | `/api/v1/knowledge` | 新增病害 | Body: `{ diseaseName, diseaseCode, symptoms, prevention, exampleImages }` |
| PUT | `/api/v1/knowledge` | 编辑病害 | Body: `{ id, diseaseName, ... }` |
| DELETE | `/api/v1/knowledge/{id}` | 删除病害 | |

---

## 十二、检测结果

### 手机检测

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/detection/mobile/list` | 手机检测列表 | `pageNum, pageSize, plotId?` |

### 摄像头检测

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/detection/camera/list` | 摄像头检测列表 | `pageNum, pageSize, plotId?` |

### 无人机检测

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/detection/drone/list` | 无人机检测列表 | `pageNum, pageSize, plotId?` |

---

## 十三、预警管理

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/alert/list` | 预警列表 | `pageNum, pageSize, handleStatus?` |
| PUT | `/api/v1/alert/{id}/handle` | 处理预警 | `?handleStatus=1&handleUserId=1&remark=已处理` |

---

## 十四、数据权限说明

| 角色 | 编码 | 数据范围 | 操作权限 |
|------|------|---------|---------|
| 超级管理员 | admin | 全部烟区 | 全功能 |
| 烟区管理员 | zone_admin | `sys_user_zone`关联的烟区 | CRUD |
| 烟区普通用户 | zone_user | `sys_user_zone`关联的烟区 | 只读 |
| 普通用户 | user | 查看+检测 | 无增删改 |

> 烟田/设备/图片/检测/预警接口已全部接入 `ZoneDataScope`，非admin自动按烟区隔离。

## 十五、错误码

| Code | 说明 |
|------|------|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或Token过期 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 10001 | 用户名或密码错误 |
| 10002 | 账号已被禁用 |

---

## 十六、测试账号

| 用户名 | 密码 | 角色 | 权限数 |
|------|------|------|------|
| admin | admin123 | 超级管理员 | 27 |
| user | user123 | 普通用户 | 14 |

---

## 十七、接口汇总

| 模块 | 接口数 | 前缀 |
|------|------|------|
| 认证 | 3 | `/auth` |
| 用户 | 7 | `/user` |
| 角色 | 6 | `/role` |
| 权限 | 2 | `/permission` |
| 烟区 | 5 | `/zone` |
| 烟田 | 8 | `/plot` |
| 品种 | 5 | `/variety` |
| 设备 | 6 | `/device` |
| 图片 | 9 | `/image` |
| AI模型 | 5 | `/model` |
| 知识库 | 5 | `/knowledge` |
| 检测 | 3 | `/detection` |
| 预警 | 2 | `/alert` |
| **合计** | **66** | |
