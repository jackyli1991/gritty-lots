<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import { useLayoutStore } from '@neural/store/layout';
  import type { LayoutPanelNode, LayoutSplitterNode } from '@neural/types';
  import { storeToRefs } from 'pinia';
  import vTooltip from 'primevue/tooltip';
  import { computed, ref } from 'vue';

  import LayerProperties from './layerProperties.vue';
  import { getPanelSplitter } from './utils';

  // 布局图层：左侧树形展示布局层级，右侧展示选中分隔器/面板的属性，悬停画布时对应节点高亮
  defineOptions({ name: 'Layers' });

  const props = defineProps<{
    node: LayoutSplitterNode; // 当前渲染的分隔器节点
    parentPanel?: LayoutPanelNode; // 当前分隔器所在的父面板，缺省表示根分隔器（不可删除）
  }>();

  const layoutStore = useLayoutStore();
  const { hoveredPanelId, locked, selectedNode } = storeToRefs(layoutStore);

  const isHorizontal = computed(() => props.node.layout === 'horizontal');

  // 根分隔器不可删除；仅根实例渲染右侧属性面板
  const isRoot = !props.parentPanel;

  // 当前分隔器是否被选中
  const isSplitterSelected = computed(
    () => selectedNode.value?.type === 'splitter' && selectedNode.value.id === props.node.id
  );

  // 面板是否被选中
  function isPanelSelected(panel: LayoutPanelNode): boolean {
    return selectedNode.value?.type === 'splitterPanel' && selectedNode.value.id === panel.id;
  }

  // 删除面板：从当前分隔器移除；删空后该嵌套分隔器已成空壳，连同清除（由 store 处理）
  function deletePanel(index: number) {
    layoutStore.deletePanel(props.node, props.parentPanel, index);
  }

  // 删除当前分隔器：清空其所在父面板内容
  function deleteSplitter() {
    layoutStore.deleteSplitter(props.parentPanel);
  }

  // 树行悬停 → 画布联动高亮对应面板/分隔器
  function setTreeHoveredPanel(id: string | null) {
    layoutStore.setTreeHoveredPanelId(id);
  }

  function setTreeHoveredSplitter(id: string | null) {
    layoutStore.setTreeHoveredSplitterId(id);
  }

  // 已折叠的面板 id（仅针对带子分隔器的面板），控制其子树显隐
  const collapsedPanelIds = ref<string[]>([]);

  function isCollapsed(id: string): boolean {
    return collapsedPanelIds.value.includes(id);
  }

  function toggleCollapsed(id: string) {
    collapsedPanelIds.value = isCollapsed(id)
      ? collapsedPanelIds.value.filter((item) => item !== id)
      : [...collapsedPanelIds.value, id];
  }
</script>

<template>
  <div :class="isRoot ? 'flex h-full min-w-0 gap-2' : ''">
    <!-- 左侧：图层树（根实例可滚动，递归子实例保持列布局） -->
    <div
      class="flex flex-col gap-0.5 text-xs"
      :class="isRoot ? 'min-w-0 flex-1 overflow-y-auto' : ''"
    >
      <!-- 分隔器节点行：方向图标 + 子级数量 + 间距；点击选中，悬停时画布对应分隔器描边高亮 -->
      <div
        class="group flex items-center gap-1 rounded px-0.5 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer text-nowrap"
        :class="isSplitterSelected ? 'bg-gray-100 text-(--p-primary-500) dark:bg-gray-800' : ''"
        @click.stop="layoutStore.selectNode('splitter', node.id)"
        @mouseenter="setTreeHoveredSplitter(node.id)"
        @mouseleave="setTreeHoveredSplitter(null)"
      >
        <NeuralIcon :name="isHorizontal ? 'Columns2' : 'Rows2'" :size="12" />
        <span>{{ node.name || (isHorizontal ? '水平布局' : '垂直布局') }}</span>
        <span class="text-gray-400 dark:text-gray-500">({{ node.children.length }})</span>
        <!-- 间距只读展示，编辑入口在右侧属性面板 -->
        <span class="ml-1 text-[11px] text-gray-400 dark:text-gray-500">
          gap {{ node.gap }}px
        </span>
        <button
          v-if="!isRoot && !locked"
          class="ml-auto text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
          v-tooltip.left="'删除分隔器'"
          @click.stop="deleteSplitter"
        >
          <NeuralIcon name="Trash2" :size="12" />
        </button>
      </div>
      <!-- 子级：树线缩进，面板行或递归子树 -->
      <div class="ml-2 flex flex-col gap-0.5 border-l border-gray-200 pl-2 dark:border-gray-700">
        <template v-for="(panel, index) in node.children" :key="panel.id">
          <!-- 叶子面板行：点击选中；悬停面板高亮，悬停行显示删除按钮 -->
          <div
            class="group flex items-center gap-1 rounded px-0.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-nowrap"
            :class="
              isPanelSelected(panel)
                ? 'bg-gray-100 text-(--p-primary-500) dark:bg-gray-800'
                : hoveredPanelId === panel.id
                  ? 'text-(--p-primary-500)'
                  : 'text-gray-500 dark:text-gray-400'
            "
            @click.stop="layoutStore.selectNode('splitterPanel', panel.id)"
            @mouseenter="setTreeHoveredPanel(panel.id)"
            @mouseleave="setTreeHoveredPanel(null)"
          >
            <!-- 有子分隔器时显示折叠箭头，否则显示面板色点 -->
            <button
              v-if="getPanelSplitter(panel)"
              class="flex items-center text-gray-400 transition-colors hover:text-(--p-primary-500)"
              v-tooltip.left="isCollapsed(panel.id) ? '展开' : '折叠'"
              @click.stop="toggleCollapsed(panel.id)"
            >
              <NeuralIcon
                :name="isCollapsed(panel.id) ? 'ChevronRight' : 'ChevronDown'"
                :size="12"
              />
            </button>
            <span v-else class="mx-1 h-1 w-1 rounded-sm bg-current"></span>
            <span>{{ panel.name || '面板' }}</span>
            <!-- 尺寸只读展示，单位切换入口在右侧属性面板 -->
            <span class="text-gray-400 dark:text-gray-500">
              {{ panel.sizeValue ?? '' }}{{ panel.useUnit ?? '' }}
            </span>
            <button
              v-if="!locked"
              class="ml-auto text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
              v-tooltip.left="'删除面板'"
              @click.stop="deletePanel(index)"
            >
              <NeuralIcon name="Trash2" :size="12" />
            </button>
          </div>
          <Layers
            v-if="getPanelSplitter(panel) && !isCollapsed(panel.id)"
            :node="getPanelSplitter(panel)!"
            :parent-panel="panel"
          />
        </template>
      </div>
    </div>
    <!-- 右侧：选中节点的属性编辑面板（仅根实例渲染） -->
    <LayerProperties v-if="isRoot" />
  </div>
</template>
