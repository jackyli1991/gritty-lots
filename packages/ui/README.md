# @gritty-lots/ui

基于 Vue 3 + TypeScript + Tailwind CSS v4 + Radix Colors 的内部组件库。

- 组件采用 `class-variance-authority` 管理 variants，样式 token 走 Tailwind 主题变量（`--primary`、`--background` 等）
- 颜色系统接入 [Radix Colors](https://www.radix-ui.com/colors)，支持 8 套主题色实时切换
- 内置明暗模式（light / dark / system，跟随系统）+ 防首屏闪烁
- 提供 Vue 插件（`g-` 前缀全局组件）与具名导出两种消费方式

## 安装

```bash
pnpm add @gritty-lots/ui
```

依赖要求：`vue ^3.5.0`、`tailwindcss ^4`、`@tailwindcss/vite`。

## 使用

### 1. 引入样式

在应用入口（如 `main.ts`）引入一次全局样式：

```ts
import '@gritty-lots/ui/style.css';
```

### 2. 注册插件（推荐）

注册后模板内可直接使用 `g-button` 等全局组件：

```ts
import { createApp } from 'vue';
import { GrittyUI } from '@gritty-lots/ui';
import '@gritty-lots/ui/style.css';
import App from './App.vue';

createApp(App).use(GrittyUI).mount('#app');
```

```vue
<template>
  <g-button variant="primary">按钮</g-button>
</template>
```

### 3. 具名导入（按需）

也可显式导入组件与工具，便于 tree-shaking：

```ts
import { GButton, buttonVariants, cn } from '@gritty-lots/ui';
```

## Composables

### useColorMode

明暗模式控制器：light / dark / system（跟随系统），持久化到 `localStorage`（key: `gritty-color-mode`），在 `<html>` 上 toggle `.dark` 类。

```ts
import { useColorMode } from '@gritty-lots/ui';

const { mode, resolved, isDark, setMode, toggle, colorModes } = useColorMode();
// mode.value: 'light' | 'dark' | 'system'
// resolved.value: 'light' | 'dark'（system 会解析为实际值）
// setMode('dark'); toggle();
```

> **防首屏闪烁**：需在 `index.html` 的 `<head>` 内联一段脚本，在首帧前根据 localStorage + `prefers-color-scheme` 设置 `.dark` 类。模板见 [apps/admin/index.html](../../apps/admin/index.html)。

### useThemeColor

主题色控制器：8 套 Radix 色阶（blue / indigo / violet / purple / pink / red / cyan / green），step-10 驱动 `--primary`。持久化到 `localStorage`（key: `gritty-theme-color`），写入 `<html data-theme-color="...">`。

```ts
import { useThemeColor } from '@gritty-lots/ui';

const { themeColor, setThemeColor, themeColors } = useThemeColor();
// themeColor.value: 'blue' | 'indigo' | ...
// themeColors: 可选色列表（含 label / swatch，用于渲染色板切换器）
```

> 默认色由 `<html data-theme-color="blue">` 决定，建议在 `index.html` 静态设置以避免闪烁。

### useRipple

点击波纹效果（Web Animations API + `currentColor`），可挂到任意元素。

```ts
import { useRipple } from '@gritty-lots/ui';

const { trigger } = useRipple({ duration: 550, peakOpacity: 0.35 });
// <button @pointerdown="trigger">...</button>
```

宿主元素需 `position: relative` + `overflow: hidden` 以裁剪波纹；`disabled` / `data-disabled` 状态会自动跳过。

## 工具

- `cn(...inputs)` — `clsx` + `tailwind-merge`，合并类名并解决 Tailwind 冲突
- `buttonVariants({ variant, size, shape, danger, ghost })` — 获取按钮的类名字符串，便于自定义元素复用同一套样式

## 主题定制

样式 token 定义在 [src/style.css](src/style.css)，基于 Tailwind v4 `@theme` + Radix Colors：

- 明暗：`.dark` 选择器覆盖 `--background`、`--foreground` 等 token
- 主题色：`[data-theme-color="..."]` 规则块将 `--primary` 映射到对应 Radix 色阶的 step-10，`--primary-foreground` 映射到 step-1（明暗自动适配）

新增主题色：在 `style.css` 增加 `[data-theme-color="xxx"]` 规则，并在 `THEME_COLORS`（[useThemeColor.ts](src/composables/useThemeColor.ts)）中加入对应条目。

## 开发

```bash
pnpm --filter @gritty-lots/ui dev       # 启动 playground（端口默认 5173）
pnpm --filter @gritty-lots/ui build     # 类型检查 + 构建
```

Playground 入口：[src/App.vue](src/App.vue) → 渲染 [src/components/ui/button/doc.vue](src/components/ui/button/doc.vue)。

## 目录结构

```
src/
├── components/ui/        # 组件（每个组件一个目录，含 index.ts / *.vue / doc.vue）
│   └── button/
│       ├── Button.vue
│       ├── doc.vue       # 组件文档示例（可直接导出渲染）
│       └── index.ts      # cva variants 定义与导出
├── composables/          # useColorMode / useThemeColor / useRipple
├── lib/utils.ts          # cn 工具
├── style.css             # 主题 token + Radix Colors + 明暗/主题色规则
└── index.ts              # 包入口
```

## License

Private / Internal
