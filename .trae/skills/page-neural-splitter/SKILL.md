---
name: page-neural-splitter
description: PrimeVue 5 Splitter patterns for page-neural layout editor. Use when editing renderLayout.vue or debugging nested Splitter hover, gutter, context menu, or resize sizeValue sync.
---

# page-neural Splitter 布局开发规范

适用于 `packages/page-neural/src/core/layout/`（递归 Splitter 布局编辑器，核心文件 `renderLayout.vue`、`utils.ts`）。改动前先读当前文件，以下结论均已对 PrimeVue 5.0.1 源码与浏览器实测确认，不要凭直觉推翻。

## PrimeVue Splitter 内部机制（已验证事实）

源码：`node_modules/.pnpm/primevue@5.0.1_*/node_modules/primevue/splitter/index.mjs`（Glob 匹配不到 `.pnpm` 点目录，用 Grep 传显式绝对路径读取）。

1. **gutter 与面板平级**：render 输出为 `panels.map(panel => [panel, gutter])`，`.p-splitter-gutter` 是 `.p-splitter` 根的直接子元素，**不在任何 `[data-pc-name="splitterpanel"]` 内部**。
   - 冒泡的 `mouseover` 落在 gutter 上时 `event.target.closest('[data-pc-name="splitterpanel"]')` 为 null。
   - 判定悬停面板归属时必须先对 gutter 早退，否则滑过分割线会清空高亮（闪断）；嵌套场景下还会误点亮外层包含面板：
     ```ts
     if (target?.closest?.('.p-splitter-gutter')) return;
     ```
2. **插槽只渲染面板**：render 的根 children 仅由 `renderList(panels)` 构成。放进 `<Splitter>` 默认插槽的非 `SplitterPanel` 元素会被丢弃，不能用插槽注入 overlay/覆盖层。
3. **`.p-splitter` 根自带不透明主题背景**（实测白色），`.p-splitter-gutter` 不透明且 `z-index: 1`，面板背景透明。元素自身 outline 先于后代绘制，嵌套分隔器的不透明背景会遮住祖先的高亮 outline。
4. **属性透传**：组件多根节点时设 `inheritAttrs: false` 并 `v-bind="attrs"` 到 Splitter；`ptmi('root')` 会把非 `pt:` 的事件/属性（`@contextmenu`、`@mouseover` 等）合并到根 div。
5. **`resizeend` 只回传百分比**（sizes）。像素值必须事后从 DOM 测量（`getBoundingClientRect`），horizontal 取 width、vertical 取 height。
6. **根节点原地替换后样式丢失**：对根执行 `Object.assign(node, wrapper)` 会重建面板 DOM，但 PrimeVue 内部 `panelSizeConfig` 未变、不再 apply flex 样式。必须给 `<Splitter :key="node.id">` 强制重挂载。

## 必须遵守的实现规则

- **悬停归属**：每层递归实例只认领自己的直接子面板，判定条件 `panelEl.parentElement === root`；`mouseleave` 清空本层状态。嵌套时只有直接父 Splitter 高亮。
- **嵌套分隔器透明背景**：仅嵌套实例（存在 `parent` prop）加 `bg-transparent!`，根保留主题背景。
- **高亮边框用内嵌 outline**，不占布局、不被父面板 `overflow: hidden` 裁剪：
  ```ts
  const HIGHLIGHT_CLASS = '[outline:2px_solid_var(--p-primary-500)] [outline-offset:-2px]';
  ```
- **ContextMenu 单例**：最外层实例 `provide('layout-context-menu', openMenu)`，嵌套层 `inject` 复用；面板/分隔器右键各自 `event.stopPropagation()`，避免多层菜单叠加。
- **尺寸标注 overlay**：显隐由单一状态 `hoveredPanelId` 驱动，两种模式互斥（`v-if="!hoveredPanelId"` 角标 / `v-else` 中央标注），不要另建显隐状态：
  - 非悬停：每个面板左上角浅色小标签（`absolute top-0 left-0 text-xs text-gray-300 dark:text-gray-600`），显示 `sizeValue` + 可点击切换的 `useUnit`；
  - 悬停：中央标注，容器 `pointer-events-none`，仅数值/单位标签 `pointer-events-auto`，避免红线挡住嵌套层的悬停与拖拽。指示线方向 = 分隔器轴向：horizontal 用水平红线（`h-px flex-1`，flex-row），vertical 用竖直红线（`w-px flex-1`，flex-col）。两端必须有外指箭头（零尺寸 border 三角形），子结构固定为 5 个 `[起点箭头, 线, 标签, 线, 终点箭头]`：horizontal 起点 `border-r` 朝左、终点 `border-l` 朝右（7×10）；vertical 起点 `border-b` 朝上、终点 `border-t` 朝下（10×7）。
- **数据操作**：新增面板后 `sizes` 必须 `normalizeSizes` 归一到合计 100（空数组返回 `[]`，不会产生 NaN）；面板删除不限制剩余数量，`children` 与 `sizes` 同步 splice，删空后若存在父分隔器则同时删除该分隔器（`props.parent.children = []`），根 Splitter 无父级、删空后为空壳且不可删除；单位循环固定为 `px → % → vw → vh`（`utils.ts` 的 `UNIT_CYCLE`）。
- **Tailwind v4 任意属性写法**：`[outline:2px_solid_...]`，important 用 `!` 后缀（`bg-transparent!`、`text-red-500!`），不是 `!` 前缀，也不要传布尔字符串。

## 验证流程

1. 静态检查（在仓库根，PowerShell 5 不支持 `&&`，逐条执行）：
   - `npx oxfmt packages/page-neural/src/core/layout/renderLayout.vue`
   - `npx oxlint packages/page-neural/src/core/layout/renderLayout.vue`（目标 0 warning 0 error；注意 no-shadow，computed 不要与函数内局部变量同名）
   - cwd `packages/page-neural`：`npx vue-tsc --noEmit -p tsconfig.json --ignoreDeprecations 6.0`
   - 注意 `tsconfig.app.json` 下 `layoutModel.vue` 有既存的未用导入报错，与 layout 改动无关；以 `tsconfig.json` 结果为准。
2. 运行时：cwd `apps/admin` 执行 `npx vite --port 5187 --strictPort`；浏览器开 `http://localhost:5187/#/packages/neural`（hash 路由，从左侧 Packages → Neural 进入），点主区域顶部工具栏第 4 个「布局」图标按钮；更新弹窗点「稍后」。验证完用 StopCommand 关服务。
3. DOM 断言要点：
   - 用 `browser_evaluate` 派发冒泡 `mouseover`/`mouseleave`/`contextmenu` 合成事件做状态断言。
   - Tailwind v4 下 `getComputedStyle().backgroundColor` 返回 **oklch**（如 `oklch(0.637 0.237 25.331)` = red-500），不要断言 rgb 字面值。
   - 面板元素用 `[data-pc-name="splitterpanel"]`，分割线用 `.p-splitter-gutter`。
   - 浏览器自动化连续 3 次未能完成点击流程时，改让 agent 直接用 evaluate 完成断言，不要重复空转。
