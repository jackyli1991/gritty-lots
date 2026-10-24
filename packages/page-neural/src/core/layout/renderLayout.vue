<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import { generateId } from '@neural/core/crud/utils';
  import { useLayoutStore } from '@neural/store/layout';
  import type { LayoutPanelNode, LayoutSplitterNode } from '@neural/types';
  import { storeToRefs } from 'pinia';
  import ContextMenu from 'primevue/contextmenu';
  import type { MenuItem } from 'primevue/menuitem';
  import {
    computed,
    inject,
    nextTick,
    onBeforeUnmount,
    onMounted,
    provide,
    ref,
    useAttrs,
  } from 'vue';

  import IndicatorLine from './indicatorLine.vue';
  import {
    applySizeValue,
    generatePanelNode,
    generateSplitterNode,
    getPanelSplitter,
    panelFlexStyle,
    toPercentage,
  } from './utils';

  // 模板存在多个根节点，需手动把 class 等属性透传给 flex 容器
  defineOptions({ name: 'RenderLayout', inheritAttrs: false });

  const props = withDefaults(
    defineProps<{
      border?: boolean; // 是否绘制边框（缺省 true）
      node: LayoutSplitterNode; // 当前渲染的分隔器节点
      parent?: LayoutPanelNode; // 父面板，缺省表示当前为根分隔器
    }>(),
    {
      border: true,
    }
  );

  const attrs = useAttrs();

  // 根分隔器不可删除
  const isRoot = !props.parent;

  // 指示线方向跟随分隔器轴向：水平分隔器为水平线，垂直分隔器为竖直线
  const isHorizontal = computed(() => props.node.layout === 'horizontal');

  // 删除项统一样式
  const DELETE_CLASS =
    '[&>.p-contextmenu-item-content]:text-red-500! dark:[&>.p-contextmenu-item-content]:text-red-400!';

  // 悬停面板所属分隔器的高亮边框：outline 内嵌 2px，不占布局空间也不会被父面板裁剪
  const HIGHLIGHT_CLASS = '[outline:2px_solid_var(--p-primary-500)] [outline-offset:-2px]';

  // 悬停高亮状态由布局 store 统一维护，嵌套分隔器共享同一份
  const layoutStore = useLayoutStore();
  const { hoveredPanelId, treeHoveredPanelId, treeHoveredSplitterId } = storeToRefs(layoutStore);

  // 本分隔器是否为悬停面板的直接父级：仅直接父分隔器绘制高亮边框、仅其面板显示指示线
  const isHoveredSplitter = computed(() =>
    props.node.children.some((panel) => panel.id === hoveredPanelId.value)
  );

  // 描边高亮条件：画布悬停其直接子面板，或图层树中悬停本分隔器
  const isHighlighted = computed(
    () => isHoveredSplitter.value || treeHoveredSplitterId.value === props.node.id
  );

  // flex 容器根元素，用于测量容器轴向像素及面板真实像素（gutter 拖拽边界保护）
  const containerRef = ref<HTMLElement | null>(null);

  /** 打开菜单的方法签名 */
  type OpenMenu = (event: Event, items: MenuItem[]) => void;

  // 由最外层实例提供打开菜单方法，嵌套实例复用，避免多个菜单同时弹出
  const injectedOpen = inject<OpenMenu | null>('layout-context-menu', null);

  // 右键菜单实例与菜单项
  const menuRef = ref<InstanceType<typeof ContextMenu> | null>(null);
  const menuItems = ref<MenuItem[]>([]);

  function openMenu(event: Event, items: MenuItem[]) {
    menuItems.value = items;
    menuRef.value?.show(event);
  }

  if (!injectedOpen) {
    provide('layout-context-menu', openMenu);
  }

  const open: OpenMenu = injectedOpen ?? openMenu;

  /** 容器沿分隔器轴向的像素尺寸 */
  function containerAxisSize(): number {
    const rect = containerRef.value?.getBoundingClientRect();
    if (!rect) return 0;

    return props.node.layout === 'horizontal' ? rect.width : rect.height;
  }

  /** 单个面板沿分隔器轴向的像素尺寸（直接从 DOM 取） */
  function panelAxisSize(panelIndex: number): number {
    const panelEl = containerRef.value?.children?.[panelIndex * 2] as HTMLElement | undefined;
    if (!panelEl) return 0;

    const rect = panelEl.getBoundingClientRect();
    return props.node.layout === 'horizontal' ? rect.width : rect.height;
  }

  /** 把每个面板相对容器的当前渲染占比写回 percentage，并据此重算 sizeValue */
  function syncPanelMetrics() {
    const containerPx = containerAxisSize();
    if (!containerPx) return;

    props.node.children.forEach((panel, index) => {
      const panelPx = panelAxisSize(index);
      panel.percentage = toPercentage(panelPx, containerPx);
      applySizeValue(panel, panelPx);
    });
  }

  // DOM 更新后再同步占比与尺寸，保证缩略图与实际渲染比例一致
  function syncMetricsAfterUpdate() {
    nextTick(syncPanelMetrics);
  }

  // 初次挂载时按真实渲染尺寸初始化各面板占比与尺寸
  onMounted(syncPanelMetrics);

  // ---------- Gutter 拖拽 ----------

  /** 单次 gutter 拖拽的状态，用于 mousemove / mouseup 回调 */
  interface GutterDrag {
    prevPanel: LayoutPanelNode;
    nextPanel: LayoutPanelNode;
    prevIndex: number;
    nextIndex: number;
    startPos: number; // mouse 起始轴向坐标（clientX 或 clientY）
    isHorizontal: boolean;
  }

  const gutterDrag = ref<GutterDrag | null>(null);

  function onGutterMouseDown(index: number, event: MouseEvent) {
    // gutter at visual position i 分隔 children[i-1] 和 children[i]
    if (index <= 0 || index >= props.node.children.length) return;

    event.preventDefault();

    const isH = props.node.layout === 'horizontal';
    gutterDrag.value = {
      prevPanel: props.node.children[index - 1],
      nextPanel: props.node.children[index],
      prevIndex: index - 1,
      nextIndex: index,
      startPos: isH ? event.clientX : event.clientY,
      isHorizontal: isH,
    };

    window.addEventListener('mousemove', onGutterMouseMove);
    window.addEventListener('mouseup', onGutterMouseUp);
  }

  function onGutterMouseMove(event: MouseEvent) {
    const drag = gutterDrag.value;
    if (!drag) return;

    const currentPos = drag.isHorizontal ? event.clientX : event.clientY;
    const deltaPx = currentPos - drag.startPos;
    if (!deltaPx) return;

    const containerPx = containerAxisSize();
    const sign = Math.sign(deltaPx); // >0 说明 prev 增大、next 减小

    // 最小像素保护（每面板 4px）：先取当前真实渲染像素再决定最大可移动距离
    const prevPx = panelAxisSize(drag.prevIndex);
    const nextPx = panelAxisSize(drag.nextIndex);
    const MIN_PX = 4;

    let effectiveDeltaPx = deltaPx;

    if (sign > 0 && nextPx - deltaPx < MIN_PX) {
      // 想让 next 缩小到 < MIN_PX → 限制 deltaPx
      effectiveDeltaPx = nextPx - MIN_PX;
      if (effectiveDeltaPx < 0) effectiveDeltaPx = 0;
    } else if (sign < 0 && prevPx + deltaPx < MIN_PX) {
      // 想让 prev 缩小到 < MIN_PX
      effectiveDeltaPx = -(prevPx - MIN_PX);
      if (effectiveDeltaPx > 0) effectiveDeltaPx = 0;
    }

    if (!effectiveDeltaPx) return;

    // 拖拽直接改写 percentage（面板占比），再按占比与实际像素推导 sizeValue
    const prevPxAfter = prevPx + effectiveDeltaPx;
    const nextPxAfter = nextPx - effectiveDeltaPx;

    drag.prevPanel.percentage = toPercentage(prevPxAfter, containerPx);
    drag.nextPanel.percentage = toPercentage(nextPxAfter, containerPx);
    applySizeValue(drag.prevPanel, prevPxAfter);
    applySizeValue(drag.nextPanel, nextPxAfter);

    // 同步起点位置，让后续增量以当前指针位置为基准
    drag.startPos = currentPos;
  }

  function onGutterMouseUp() {
    gutterDrag.value = null;
    window.removeEventListener('mousemove', onGutterMouseMove);
    window.removeEventListener('mouseup', onGutterMouseUp);
  }

  // 组件卸载时确保全局监听被清理
  onBeforeUnmount(() => {
    if (gutterDrag.value) {
      window.removeEventListener('mousemove', onGutterMouseMove);
      window.removeEventListener('mouseup', onGutterMouseUp);
    }
  });

  // ---------- 悬停 / 右键 ----------

  // 悬停：mouseover 带 .stop，仅 target 祖先链中最近的分隔器处理；
  // 各自只在面板为自己的直接子面板时写入全局悬停态，从而只高亮直接父分隔器
  function onSplitterMouseOver(event: MouseEvent) {
    const target = event.target as HTMLElement | null;

    // gutter 是分隔器的直接子元素、并不属于任何面板，若继续按面板归属计算会误判为
    // 已离开面板，导致滑过 gutter 时高亮闪断、或在嵌套 gutter 处误点亮外层包含面板
    if (target?.closest?.('[data-gutter]')) return;

    const root = containerRef.value;
    // 面板在 flex 容器 children 里间隔排列（panel, gutter, panel, gutter, ...）
    // 所以 visual index = childIndex / 2，面板判断：childIndex 为偶数
    let visualIndex = -1;
    let el: HTMLElement | null = target;
    while (el && el !== root) {
      if (el.dataset?.panel !== undefined) {
        visualIndex = Number(el.dataset.panel);
        break;
      }
      el = el.parentElement;
    }

    layoutStore.setHoveredPanelId(
      visualIndex >= 0 ? (props.node.children[visualIndex]?.id ?? null) : null
    );
  }

  // 离开分隔器：若鼠标移入的仍是某个分隔器内部（如从子分隔器回到父面板/分割线），
  // 交给该分隔器的 mouseover 处理，此处不清空，避免高亮闪断
  function onSplitterMouseLeave(event: MouseEvent) {
    const related = event.relatedTarget as HTMLElement | null;
    if (related?.closest?.('.page-layout-splitter')) return;

    layoutStore.setHoveredPanelId(null);
  }

  // 点击标签单位：循环切换后按新单位重算 sizeValue（占比 percentage 不变）
  function toggleUnit(panel: LayoutPanelNode) {
    layoutStore.toggleUnit(props.node, panel);
  }

  // ---------- 数据操作 ----------

  /** 包一层父分隔器并保留原有内容 */
  function wrapSplitter(target: LayoutSplitterNode, layout: LayoutSplitterNode['layout']) {
    const preserved: LayoutSplitterNode = {
      ...target,
      id: generateId(),
      children: [...target.children],
    };

    return generateSplitterNode({
      layout,
      children: [generatePanelNode({ children: [preserved] }), generatePanelNode()],
    });
  }

  // Splitter 拆分：直接在当前分隔器下追加两个子面板，方向沿用该分隔器自身
  function splitSplitter(layout: LayoutSplitterNode['layout']) {
    props.node.layout = layout;
    props.node.children.push(generatePanelNode(), generatePanelNode());

    syncMetricsAfterUpdate();
  }

  // SplitterPanel 拆分：在面板下新建分隔器，已有嵌套分隔器则再包一层
  function splitPanel(panel: LayoutPanelNode, layout: LayoutSplitterNode['layout']) {
    const existing = getPanelSplitter(panel);
    panel.children = existing
      ? [wrapSplitter(existing, layout)]
      : [generateSplitterNode({ layout, children: [generatePanelNode(), generatePanelNode()] })];

    syncMetricsAfterUpdate();
  }

  // 在指定位置新增同级面板
  function addPanel(index: number) {
    layoutStore.addPanel(props.node, index);

    syncMetricsAfterUpdate();
  }

  // 删除当前面板：删空后嵌套分隔器随之清除（由 store 处理）
  function deletePanel(index: number) {
    layoutStore.deletePanel(props.node, props.parent, index);

    // 分隔器已被清除，无需再同步本层尺寸
    if (!props.node.children.length && props.parent) return;

    syncMetricsAfterUpdate();
  }

  // 删除当前分隔器：清空其所在父面板内容
  function deleteSplitter() {
    layoutStore.deleteSplitter(props.parent);
  }

  /** 构建分隔器右键菜单 */
  function buildSplitterMenu(): MenuItem[] {
    return [
      { label: '水平拆分', icon: 'Columns2', command: () => splitSplitter('horizontal') },
      { label: '垂直拆分', icon: 'Rows2', command: () => splitSplitter('vertical') },
      { separator: true },
      {
        label: '删除',
        icon: 'Trash2',
        disabled: isRoot,
        class: DELETE_CLASS,
        command: deleteSplitter,
      },
    ];
  }

  /** 构建面板右键菜单，前后添加图标随父分隔器方向变化 */
  function buildPanelMenu(index: number): MenuItem[] {
    return [
      {
        label: '水平拆分',
        icon: 'Columns2',
        command: () => splitPanel(props.node.children[index], 'horizontal'),
      },
      {
        label: '垂直拆分',
        icon: 'Rows2',
        command: () => splitPanel(props.node.children[index], 'vertical'),
      },
      { separator: true },
      {
        label: '在前面添加',
        icon: isHorizontal.value ? 'ArrowLeftToLine' : 'ArrowUpToLine',
        command: () => addPanel(index),
      },
      {
        label: '在后面添加',
        icon: isHorizontal.value ? 'ArrowRightToLine' : 'ArrowDownToLine',
        command: () => addPanel(index + 1),
      },
      { separator: true },
      {
        label: '删除',
        icon: 'Trash2',
        class: DELETE_CLASS,
        command: () => deletePanel(index),
      },
    ];
  }

  // 分隔器右键：阻止冒泡避免影响上层
  function onSplitterContextMenu(event: Event) {
    event.stopPropagation();
    open(event, buildSplitterMenu());
  }

  // 面板右键：阻止冒泡，避免嵌套面板右键时上层菜单重复触发
  function onPanelContextMenu(event: Event, index: number) {
    event.stopPropagation();
    open(event, buildPanelMenu(index));
  }
</script>

<template>
  <!-- flex 容器替代 PrimeVue Splitter -->
  <div
    ref="containerRef"
    v-bind="attrs"
    class="page-layout-splitter flex h-full w-full"
    :class="[
      border ? 'border border-gray-200 dark:border-gray-700' : '',
      isHorizontal ? '' : 'flex-col',
      isHighlighted ? HIGHLIGHT_CLASS : '',
      gutterDrag ? 'select-none' : '',
    ]"
    @contextmenu="onSplitterContextMenu"
    @mouseover.stop="onSplitterMouseOver"
    @mouseleave.stop="onSplitterMouseLeave"
  >
    <template v-for="(panel, index) in node.children" :key="panel.id">
      <!-- 面板 flex item -->
      <div
        :data-panel="index"
        :data-panel-id="panel.id"
        class="page-layout-splitter-panel relative overflow-hidden transition-colors"
        :class="{
          'bg-black/5 dark:bg-white/10':
            hoveredPanelId === panel.id || treeHoveredPanelId === panel.id,
        }"
        :style="panelFlexStyle(panel)"
        @contextmenu="(event: Event) => onPanelContextMenu(event, index)"
      >
        <!-- 悬停时：红色指示线沿分隔方向贯穿面板（仅悬停面板的直接父分隔器内显示） -->
        <IndicatorLine
          v-if="isHoveredSplitter || treeHoveredPanelId === panel.id"
          :is-horizontal="isHorizontal"
          :size-value="panel.sizeValue"
          :use-unit="panel.useUnit"
          @toggle-unit="toggleUnit(panel)"
        />
        <!-- 递归子分隔器 -->
        <RenderLayout
          v-if="getPanelSplitter(panel)"
          :node="getPanelSplitter(panel)!"
          :border="false"
          :parent="panel"
        />
      </div>
      <!-- 面板之间的拖拽 gutter：最后一个面板后不加 -->
      <div
        v-if="index < node.children.length - 1"
        :data-gutter="index"
        class="shrink-0 bg-gray-200 transition-colors hover:bg-(--p-primary-500) dark:bg-gray-700 dark:hover:bg-(--p-primary-500) relative z-10"
        :class="isHorizontal ? 'w-px cursor-col-resize' : 'h-px cursor-row-resize'"
        @mousedown="(event: MouseEvent) => onGutterMouseDown(index + 1, event)"
      ></div>
    </template>
  </div>
  <ContextMenu v-if="!injectedOpen" ref="menuRef" :model="menuItems">
    <template #itemicon="{ item }">
      <NeuralIcon :name="item.icon as string" />
    </template>
  </ContextMenu>
</template>
