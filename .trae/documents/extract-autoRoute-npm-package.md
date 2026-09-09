# 提取 autoRoute 为独立 npm 包

## Summary

将 `apps/admin/src/autoRoute/` 下的 4 个源文件提取为 `packages/auto-route` 独立 workspace 包（`@gritty-lots/auto-route`），然后将 apps/admin 中所有对 autoRoute 的引用改为从新包导入，最后删除原始 autoRoute 目录。

## Current State Analysis

### autoRoute 模块结构（4 文件）

- `apps/admin/src/autoRoute/index.ts` — 对外入口：导出 `createAutoRoutes` 函数 + Vue 插件 default export（含 `v-permission` 指令）
- `apps/admin/src/autoRoute/core.ts` — `createRoutes` 递归路由生成
- `apps/admin/src/autoRoute/types.ts` — 类型定义：`AutoRouteOptions`、`RouteJsonConfig`、`VuePages`、`JsonPages`、`BreadcrumbRoute` 等
- `apps/admin/src/autoRoute/utils.ts` — 工具函数：`dealPermissionRoutes`、`dealRoutesRedirect`、`flattenTree`、`getKey` 等

### 依赖关系

autoRoute 仅依赖 `vue`（`App`、`Component`、`markRaw`）和 `vue-router`（`Router`、`RouteRecordRaw`），无其他第三方依赖。

### apps/admin 中引用 autoRoute 的文件（实际 import，非代码示例字符串）

1. **`apps/admin/src/main.ts`** L8: `import autoRoute from './autoRoute'` — default import（Vue 插件）
2. **`apps/admin/src/stores/route.ts`** L8-9: `import type { VuePages, JsonPages } from '@/autoRoute'` + `import { createAutoRoutes } from '@/autoRoute'`

> `introduce.vue` 和 `permission.vue` 中的 `autoRoute` 仅为代码示例字符串，非实际 import，无需修改。

### 现有包结构参考（`packages/ui/package.json`）

- `name`: `@gritty-lots/ui`，`private: true`，`type: module`
- `main/module/types` 均指向 `./src/index.ts`（源码直接导出，无构建步骤）
- `exports` 字段配置子路径导出
- `peerDependencies` 声明 vue

### 根 tsconfig 路径别名

`@gritty-lots/*` → `packages/*/src`，因此新包 `@gritty-lots/auto-route` 会自动映射到 `packages/auto-route/src`。

## Proposed Changes

### 1. 创建 `packages/auto-route/package.json`

```json
{
  "name": "@gritty-lots/auto-route",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "module": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "peerDependencies": {
    "vue": "^3.5.0",
    "vue-router": "^5.3.0"
  }
}
```

- 遵循 `@gritty-lots/ui` 的模式：源码直接导出，无构建步骤
- vue 和 vue-router 声明为 peerDependencies（由消费方 apps/admin 提供）

### 2. 迁移源文件

将以下 4 个文件从 `apps/admin/src/autoRoute/` 原样移动到 `packages/auto-route/src/`：

- `index.ts`
- `core.ts`
- `types.ts`
- `utils.ts`

文件内容无需修改——内部相对引用（`./core`、`./types`、`./utils`）在移动后仍然有效。

### 3. 创建 `packages/auto-route/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json"
}
```

继承根 tsconfig 的 `@gritty-lots/*` 路径别名。

### 4. 在 `apps/admin/package.json` 中添加依赖

在 `dependencies` 中新增：

```json
"@gritty-lots/auto-route": "workspace:*",
```

### 5. 替换 apps/admin 中的 import

**`apps/admin/src/main.ts`** L8:

```
- import autoRoute from './autoRoute';
+ import autoRoute from '@gritty-lots/auto-route';
```

**`apps/admin/src/stores/route.ts`** L8-9:

```
- import type { VuePages, JsonPages } from '@/autoRoute';
- import { createAutoRoutes } from '@/autoRoute';
+ import type { VuePages, JsonPages } from '@gritty-lots/auto-route';
+ import { createAutoRoutes } from '@gritty-lots/auto-route';
```

### 6. 删除 `apps/admin/src/autoRoute/` 目录

移动后删除原目录下的 4 个文件。

### 7. 添加根 tsconfig reference（可选）

在根 `tsconfig.json` 的 `references` 中添加 `packages/auto-route` 的引用（如果该包有独立 tsconfig）：

```json
{
  "path": "./packages/auto-route/tsconfig.json"
}
```

> 这一步是可选的——当前 `packages/ui` 也未在 references 中，因为路径别名已足够解析。如不需类型项目引用检查则可跳过。

## Assumptions & Decisions

1. **无构建步骤**：遵循 `@gritty-lots/ui` 模式，直接从 `src/index.ts` 导出源码，由消费方的 Vite 负责构建。不需要 vite/tsc 构建。
2. **vue/vue-router 为 peerDependencies**：autoRoute 不自带 vue/vue-router，由 apps/admin 提供。
3. **`@/types/routeJson.ts` 不迁移**：该文件有 `BreadcrumbRoute` 类型（与 autoRoute/types.ts 重复）和一个略旧的 `RouteJsonConfig`。它被 `stores/route.ts` 通过 `@/types/routeJson` 引用。不在本次任务范围内处理，保持现状。
4. **文档页面中的代码示例字符串不改**：`introduce.vue` 和 `permission.vue` 中出现的 `@/autoRoute` 是代码示例文本，不是实际 import，无需修改。

## Verification Steps

1. **安装依赖**：在项目根目录执行 `pnpm install`，确认 `@gritty-lots/auto-route` workspace 链接成功
2. **类型检查**：执行 `npx vue-tsc --noEmit -p apps/admin/tsconfig.app.json`，确认无类型错误
3. **开发服务器**：执行 `pnpm --filter @gritty-lots/admin dev`，确认页面正常加载、路由功能正常
4. **路由权限**：测试菜单显示、按钮权限指令（v-permission）是否正常工作
