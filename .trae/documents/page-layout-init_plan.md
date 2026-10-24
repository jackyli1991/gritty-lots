# 页面与布局初始化 + 页面切换 实现计划

## 仓库调研

**当前状态：**

- `store/index.ts` 中 `pages`（L34-43）与 `layouts`（L30-32）均为注释掉的空数组，未实际初始化。
- `activePageId`（L15）默认 `''`，`activePage` / `activeLayout`（L52、L54）getter 已存在，但因无数据始终为 `undefined`。
- `layouts` 在 3 处被当作「单个根分隔器」直接使用，但实际类型是数组 `LayoutSplitterNode[]`，属于类型/运行时隐患：
  - `core/layout/index.vue` L14、L19：`:node="pageNeuralStore.layouts"`（把数组当 node 传）
  - `core/mini-maps.vue` L25、L31：`currentNode = props.node ?? layouts.value`
  - `render/layout/index.vue` L16、L18：同上
- `core/init.ts` 为空文件。
- `core/pages/switch.vue` 目前是写死的占位 Select（显示/隐藏），未接入 store。
- 无 `Page` 类型定义（types/index.ts 仅有 Container、LayoutPanelNode、LayoutSplitterNode）。

**关键约束（来自项目记忆）：**

- Pinia options store；路径别名 `@neural/*` → `packages/page-neural/src/*`。
- `generateId(prefix)` 在 `@neural/utils/uuid`；`generateSplitterNode` 在 `@neural/core/layout/utils`。
- `activeLayout` getter：`state.layouts.find(item => item.id === state.activePage?.layoutId)`。

## 涉及文件与改动

1. **`types/index.ts`**：新增 `Page` 接口（id / name / description / layoutLock / deletable / layoutId）。
2. **`store/index.ts`**：
   - `pages` 标注为 `Page[]`。
   - 新增 action `setActivePageId(id)`。
   - 新增 action `addPage()`：生成新的根分隔器 + 关联页面，推入 store 并切到该页面。
3. **`core/init.ts`**：导出 `initPageNeural(store)`，当 `store.pages` 为空时：生成默认根布局 → 生成默认页面（layoutId 指向该布局）→ 推入 `layouts` / `pages` → 设置 `activePageId`。
4. **`core/index.vue`**：setup 中同步调用 `initPageNeural(pageNeuralStore)`（在 Layout 渲染前完成初始化；init 内部幂等）。
5. **`core/pages/switch.vue`**：Select `:options="pages"` `v-model="activePageId"`；Plus 按钮触发 `addPage`。
6. **`core/layout/index.vue`**：`pageNeuralStore.layouts` → `pageNeuralStore.activeLayout`（非空断言，因 init 保证存在）。
7. **`core/mini-maps.vue`**：`layouts`（storeToRefs）→ `activeLayout`。
8. **`render/layout/index.vue`**：`layouts` → `activeLayout`。

## 实现步骤（依赖顺序）

1. 在 `types/index.ts` 末尾追加 `Page` 接口。
2. 修改 `store/index.ts`：引入 `Page` 类型；`pages: [] as Page[]`；新增 `setActivePageId`、`addPage` actions（`addPage` 内调 `generateSplitterNode` + `generateId('p')`）。
3. 编写 `core/init.ts` 的 `initPageNeural`。
4. `core/index.vue` 调用 init。
5. 改造 `switch.vue` 接入 store。
6. 替换 3 处 `layouts` 为 `activeLayout`。

## 依赖与注意事项

- `initPageNeural` 必须在 Layout 组件渲染前执行，故放在 `core/index.vue` setup 顶层同步调用（而非 onMounted）。
- init 幂等：`if (store.pages.length) return`，避免重复初始化。
- `activeLayout` 类型为 `LayoutSplitterNode | undefined`；在 `layout/index.vue` 中因 init 保证存在，使用 `!` 非空断言；`mini-maps` / `render/layout` 中 `currentNode` 已是 `computed`，`??` 兜底即可。
- `storeToRefs` 对 getter 同样返回 ref，因此 `const { activeLayout } = storeToRefs(pageNeuralStore)` 合法。
- `addPage` 新页面的默认名称可简单用「页面 N」。

## 验证

- `npx oxfmt` / `npx oxlint` / `vue-tsc --noEmit` 无错误。
- 浏览器进入 `#/packages/neural`，布局画布正常渲染 2 面板（说明 init + activeLayout 链路通）。
- 页面切换 Select 显示「主页面」；点 Plus 新增页面并自动切换；切换页面时画布布局随之切换。

## 风险

- **init 重复执行**：通过 `pages.length` 守卫解决；若 store 被多次实例化（SSR 场景）需另行处理，本项目为纯客户端 Vite 应用，无此风险。
- **`activeLayout` 为空**：仅在无页面时发生，init 保证至少一个页面，正常流程不会空；若被外部清空，`!` 断言会在渲染时抛错——可接受，因为空状态属于异常。
