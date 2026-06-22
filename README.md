# 烟草数字化生产平台前端

当前工程采用技术选型文档中的前端方案，先搭建 monorepo 骨架：

- `apps/screen-web`: 可视化大屏前台
- `apps/admin-web`: 管理后台前端占位，暂不实现首页骨架
- `packages/domain`: 业务类型
- `packages/sdk`: 接口封装与 mock 数据
- `packages/ui-tokens`: 主题变量
- `packages/charts`: ECharts 公共配置

## 启动

```bash
pnpm install
pnpm dev:screen
```

管理后台占位应用：

```bash
pnpm dev:admin
```
