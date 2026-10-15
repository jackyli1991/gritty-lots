<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import { generateId } from '@neural/core/crud/utils';
  import type { LayoutPanelNode, LayoutSplitterNode } from '@neural/types';
  import ContextMenu from 'primevue/contextmenu';
  import type { MenuItem } from 'primevue/menuitem';
  import Splitter from 'primevue/splitter';
  import SplitterPanel from 'primevue/splitterpanel';
  import { inject, provide, ref, useAttrs, type ComponentPublicInstance } from 'vue';

  import {
    DEFAULT_PANEL_UNIT,
    DEFAULT_SPLIT_SIZES,
    generatePanelNode,
    generateSplitterNode,
    isSplitterNode,
    nextUnit,
    normalizeSizes,
    toSizeValue,
  } from './utils';

  // 模板存在多个根节点，需手动把 class 等属性透传给 Splitter
  defineOptions({ name: 'RenderLayout', inheritAttrs: false });

  const props = defineProps<{
    node: LayoutSplitterNode; // 当前渲染的分隔器节点
    parent?: LayoutPanelNode; // 父面板，缺省表示当前为根分隔器
  }>();

  const attrs = useAttrs();

  // 根分隔器不可删除
  const isRoot = !props.parent;

  // 删除项统一样式
  const DELETE_CLASS =
    '[&>.p-contextmenu-item-content]:text-red-500! dark:[&>.p-contextmenu-item-content]:text-red-400!';

  // 悬停面板所属分隔器的高亮边框：outline 内嵌 2px，不占布局空间也不会被父面板裁剪
  const HIGHLIGHT_CLASS = '[outline:2px_solid_var(--p-primary-500)] [outline-offset:-2px]';

  // 嵌套分隔器置为透明背景：PrimeVue 的 .p-splitter 根自带不透明主题背景，
  // 而元素自身 outline 先于后代绘制，会遮住上层分隔器的高亮边框
  const NESTED_CLASS = 'bg-transparent!';

  // 当前悬停的面板 id，仅记录直接归属于本分隔器的面板
  const hoveredPanelId = ref<string | null>(null);

  // 分隔器根元素，用于测量容器轴向像素
  const splitterRef = ref<ComponentPublicInstance | null>(null);

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

  /** 取分隔器下的面板元素（按插槽顺序，过滤掉分隔条） */
  function getPanelEls(): HTMLElement[] {
    const root = splitterRef.value?.$el as HTMLElement | undefined;
    if (!root) return [];

    return Array.from(root.children).filter(
      (child): child is HTMLElement =>
        (child as HTMLElement).getAttribute('data-pc-name') === 'splitterpanel'
    );
  }

  /** 容器沿分隔器轴向的像素尺寸 */
  function containerAxisSize(): number {
    const rect = (splitterRef.value?.$el as HTMLElement | undefined)?.getBoundingClientRect();
    if (!rect) return 0;

    return props.node.layout === 'horizontal' ? rect.width : rect.height;
  }

  /** 单个面板沿分隔器轴向的像素尺寸 */
  function panelAxisSize(el?: HTMLElement): number {
    if (!el) return 0;

    const rect = el.getBoundingClientRect();
    return props.node.layout === 'horizontal' ? rect.width : rect.height;
  }

  /** 按面板自身单位把实测像素写回 sizeValue */
  function syncPanelSizeValue(panel: LayoutPanelNode, index: number) {
    panel.sizeValue = toSizeValue(
      panelAxisSize(getPanelEls()[index]),
      panel.useUnit ?? DEFAULT_PANEL_UNIT,
      containerAxisSize()
    );
  }

  // 拖拽结束后，把每个面板按自身单位换算后写回 sizeValue
  function onResizeEnd() {
    props.node.children.forEach((panel, index) => syncPanelSizeValue(panel, index));
  }

  // 悬停：事件冒泡到每层分隔器，各自只在面板为自己的直接子面板时记录，
  // 从而只高亮直接父分隔器，嵌套分隔器由更深层实例自行处理
  function onSplitterMouseOver(event: MouseEvent) {
    const root = splitterRef.value?.$el as HTMLElement | undefined;
    const panelEl = (event.target as HTMLElement | null)?.closest?.(
      '[data-pc-name="splitterpanel"]'
    ) as HTMLElement | null;
    const index = root && panelEl?.parentElement === root ? getPanelEls().indexOf(panelEl) : -1;

    hoveredPanelId.value = index >= 0 ? (props.node.children[index]?.id ?? null) : null;
  }

  // 离开分隔器（包含从嵌套面板回到上层面板）时清除悬停态
  function onSplitterMouseLeave() {
    hoveredPanelId.value = null;
  }

  // 点击标签单位：循环切换后按新单位重算当前面板的尺寸值
  function toggleUnit(panel: LayoutPanelNode, index: number) {
    panel.useUnit = nextUnit(panel.useUnit ?? DEFAULT_PANEL_UNIT);
    syncPanelSizeValue(panel, index);
  }

  /** 包一层父分隔器并保留原有内容 */
  function wrapSplitter(target: LayoutSplitterNode, layout: LayoutSplitterNode['layout']) {
    const preserved: LayoutSplitterNode = {
      ...target,
      id: generateId(),
      sizes: [...target.sizes],
      children: [...target.children],
    };

    return generateSplitterNode({
      layout,
      children: [generatePanelNode({ children: preserved }), generatePanelNode()],
    });
  }

  // Splitter 拆分：包一层选定方向的父分隔器，原内容落在第一个面板内
  function splitSplitter(layout: LayoutSplitterNode['layout']) {
    const wrapper = wrapSplitter(props.node, layout);

    if (props.parent) {
      props.parent.children = wrapper;
    } else {
      // 根节点：原地替换，保持 store 中的对象引用不变
      Object.assign(props.node, wrapper);
    }
  }

  // SplitterPanel 拆分：在面板下新建分隔器，已有嵌套分隔器则再包一层
  function splitPanel(panel: LayoutPanelNode, layout: LayoutSplitterNode['layout']) {
    panel.children = isSplitterNode(panel.children)
      ? wrapSplitter(panel.children, layout)
      : generateSplitterNode({ layout, children: [generatePanelNode(), generatePanelNode()] });
  }

  // 在指定位置新增同级面板，并把 sizes 归一到合计 100
  function addPanel(index: number) {
    props.node.children.splice(index, 0, generatePanelNode());
    props.node.sizes.splice(index, 0, DEFAULT_SPLIT_SIZES[0]);
    props.node.sizes = normalizeSizes(props.node.sizes);
  }

  // 删除当前面板（同级保留至少 2 个）
  function deletePanel(index: number) {
    if (props.node.children.length <= 2) return;

    props.node.children.splice(index, 1);
    props.node.sizes.splice(index, 1);
    props.node.sizes = normalizeSizes(props.node.sizes);
  }

  // 删除当前分隔器：嵌套分隔器清空其父面板内容，根分隔器不处理
  function deleteSplitter() {
    if (!props.parent) return;

    props.parent.children = [];
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
    const isHorizontal = props.node.layout === 'horizontal';

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
        icon: isHorizontal ? 'ArrowLeftToLine' : 'ArrowUpToLine',
        command: () => addPanel(index),
      },
      {
        label: '在后面添加',
        icon: isHorizontal ? 'ArrowRightToLine' : 'ArrowDownToLine',
        command: () => addPanel(index + 1),
      },
      { separator: true },
      {
        label: '删除',
        icon: 'Trash2',
        disabled: props.node.children.length <= 2,
        class: DELETE_CLASS,
        command: () => deletePanel(index),
      },
    ];
  }

  // 分隔器右键：仅右键落在分隔条（非面板区域）时触发，阻止冒泡避免影响上层
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
  <Splitter
    ref="splitterRef"
    :key="node.id"
    v-bind="attrs"
    :class="[parent ? NESTED_CLASS : '', hoveredPanelId ? HIGHLIGHT_CLASS : '']"
    :layout="node.layout"
    v-model:sizes="node.sizes"
    @resizeend="onResizeEnd"
    @contextmenu="onSplitterContextMenu"
    @mouseover="onSplitterMouseOver"
    @mouseleave="onSplitterMouseLeave"
  >
    <SplitterPanel
      v-for="(panel, index) in node.children"
      :key="panel.id"
      class="relative transition-colors"
      :class="{ 'bg-black/5 dark:bg-white/10': hoveredPanelId === panel.id }"
      @contextmenu="(event: Event) => onPanelContextMenu(event, index)"
    >
      <span
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center text-xs text-gray-500 dark:text-gray-400"
      >
        <span>{{ panel.sizeValue }}</span>
        <span
          class="cursor-pointer hover:text-(--p-primary-500)"
          @click.stop="toggleUnit(panel, index)"
          >{{ panel.useUnit }}</span
        >
      </span>
      <RenderLayout v-if="isSplitterNode(panel.children)" :node="panel.children" :parent="panel" />
    </SplitterPanel>
  </Splitter>
  <ContextMenu v-if="!injectedOpen" ref="menuRef" :model="menuItems">
    <template #itemicon="{ item }">
      <NeuralIcon :name="item.icon as string" />
    </template>
  </ContextMenu>
</template>
