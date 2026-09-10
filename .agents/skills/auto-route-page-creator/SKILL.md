---
name: auto-route-page-creator
version: 1.0.0
description: 基于auto-route包约定创建目录或页面，自动生成routes.json配置和.vue文件。当用户需要新建页面、新建目录、添加路由、创建菜单项时触发。
---

# Skill: Auto-Route 页面/目录创建

## 能力描述

基于 `@gritty-lots/auto-route` 包的约定，在项目中创建目录或页面，自动生成 `routes.json` 配置和 `.vue` 组件文件。

## 触发条件

当需求包含：新建页面、新建目录、创建路由、添加菜单项、新增 view、创建功能模块等关键词时触发。

## 核心约定

### 路由类型（type）

| type    | 说明 | 是否有组件        | 是否有 routes.json             | 典型用途             |
| ------- | ---- | ----------------- | ------------------------------ | -------------------- |
| `dir`   | 目录 | 无（组件为 null） | 是，目录下必须有 `routes.json` | 一级菜单分组         |
| `group` | 分组 | 无（组件为 null） | 是，目录下必须有 `routes.json` | 二级及以下的菜单分组 |
| `page`  | 页面 | 有（`.vue` 文件） | 否                             | 实际页面             |

### 文件结构约定

```
src/views/
├── routes.json                    # 顶层路由配置（一级菜单）
├── autoroutes/                    # dir 类型，目录名 = name
│   ├── routes.json                # 该目录下的子路由配置
│   └── router/                    # page 类型
│       └── index.vue              # 页面组件（name.vue 或 name/index.vue）
```

### 组件文件路径解析规则

auto-route 的 `core.ts` 按以下规则查找组件：

- 页面（page）：`${pagesDir}${parentPath}${name}.vue` 或 `${pagesDir}${parentPath}${name}/index.vue`
- 目录（dir/group）：不需要组件文件，但目录下必须存在 `routes.json`
- 根`pagesDir` 默认为 `/src/views/`

### ID 层级约定

如果指定 `id`，则直接使用 `id` 作为路由 ID（全局唯一）。否则按以下规则生成：
ID 采用层级编码，格式为父 ID × 100 + 子级序号：

| 层级 | ID 示例          | 说明          |
| ---- | ---------------- | ------------- |
| 一级 | 1, 2, 3          | 顶层 dir      |
| 二级 | 101, 102, 201    | 父ID×100+序号 |
| 三级 | 10101, 10102     | 同上规则      |
| 四级 | 1010401, 1010402 | 同上规则      |

### 路由 name 生成规则

- 默认：父级 name 用 `separator`（默认 `_`）拼接 + 当前 name
  - 例：`autoroutes` + `router` + `introduce` → `autoroutes_router_introduce`
- 如果配置了 `routeName`，则直接使用 `routeName` 作为路由 name（全局唯一）

### 动态路由参数

在 routes.json 中配置 `params: ["id*", "name+"]` → 路径追加 `/:id*` 和 `/:name+`

- `*` 后缀 = 零个或多个
- `+` 后缀 = 一个或多个

### routes.json 字段说明

参考`@gritty-lots/auto-route` 包下types.ts 中`RouteJsonConfig`类型定义。

## 执行步骤

### 创建页面（page）

1. **确定位置**：确认目标父目录路径（例如 `src/views/autoroutes/router/`）
2. **确定 ID**：读取父目录的 `routes.json`，找到当前最大子级 ID，计算新 ID = `floor(最大ID / 100) * 100 + 已有序号 + 1`；若父级没有子路由则用 `父ID * 100 + 1`
3. **创建 .vue 文件**：在目标目录下创建 `{name}.vue`（简单页面）或 `{name}/index.vue`（含子资源的页面），优先使用后者创建，如果包含简单页面等提示词则创建前者
4. **更新 routes.json**：在父目录的 `routes.json` 数组中追加新路由配置
5. **检查 ID 唯一性**：全局搜索新 ID，确认不重复

### 创建目录（dir/group）

1. **确定位置**：确认目标父目录路径
2. **确定 ID**：同上规则
3. **创建目录**：在目标路径下创建 `{name}/` 文件夹
4. **创建 routes.json**：在新目录下创建 `routes.json`（初始为空数组 `[]` 或包含预设子路由）
5. **更新父 routes.json**：在父目录的 `routes.json` 中追加新 dir/group 配置

### 创建嵌套路由（nestedRoute）

1. **确认父页面**：确认要添加嵌套子路由的 page 类型路由
2. **确定 ID**：同上规则
3. **创建子页面文件**：在父页面同级或子目录下创建子路由页面
4. **更新 routes.json**：在父路由配置的 `nestedRoute` 数组中追加子路由配置

## 页面模板

请使用以下模板创建页面组件文件：

### 简单页面

```vue
<template>
  <div>{{ pageTitle }}</div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'PageName',
  });
</script>
```

### 带动态路由参数的页面

```vue
<template>
  <div>参数：id = {{ $route.params.id }}</div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'asyncPageName',
  });
</script>
```

## 限制

- `name` 字段必须与文件名或目录名一致（不含扩展名）
- `id` 必须全局唯一，优先使用指定的 `id`，否则遵循层级编码规则生成
- `dir` 和 `group` 类型的目录下必须创建 `routes.json` 文件
- `page` 类型如果配置了 `nestedRoute`，子路由的文件路径基于父页面路径解析
- `icon` 优先使用指定的 `icon`，否则默认设置为空字符串 `''`
