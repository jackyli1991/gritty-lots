<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import { useLayoutStore } from '@neural/store/layout';
  import type { LayoutPanelNode, LayoutSplitterNode } from '@neural/types';
  import { storeToRefs } from 'pinia';
  import Tag from 'primevue/tag';
  import vTooltip from 'primevue/tooltip';
  import { computed, ref } from 'vue';

  import { getPanelSplitter } from './utils';

  // 布局图层树：递归展示布局树的层级关系，悬停画布面板时对应节点高亮，支持删除面板/分隔器
  defineOptions({ name: 'Layers' });

  const props = defineProps<{
    node: LayoutSplitterNode; // 当前渲染的分隔器节点
    parentPanel?: LayoutPanelNode; // 当前分隔器所在的父面板，缺省表示根分隔器（不可删除）
  }>();

  const layoutStore = useLayoutStore();
  const { hoveredPanelId } = storeToRefs(layoutStore);

  const isHorizontal = computed(() => props.node.layout === 'horizontal');

  // 根分隔器不可删除
  const isRoot = !props.parentPanel;

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

  // 单位对应的标签样式：px 为 success，% 为 info（与画布指示线一致）
  function unitSeverity(unit: LayoutPanelNode['useUnit']) {
    return unit === 'px' ? 'success' : 'info';
  }

  // 标签文本：尺寸值 + 单位
  function unitLabel(panel: LayoutPanelNode) {
    return `${panel.sizeValue ?? ''}${panel.useUnit ?? ''}`;
  }

  // 点击标签循环切换面板尺寸单位，与画布指示线标签行为一致
  function toggleUnit(panel: LayoutPanelNode) {
    layoutStore.toggleUnit(props.node, panel);
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
  <div class="flex flex-col gap-0.5 text-xs">
    <!-- 分隔器节点行：方向图标 + 子级数量 + 悬停显示删除按钮；悬停时画布对应分隔器描边高亮 -->
    <div
      class="group flex items-center gap-1 rounded px-0.5 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
      @mouseenter="setTreeHoveredSplitter(node.id)"
      @mouseleave="setTreeHoveredSplitter(null)"
    >
      <NeuralIcon :name="isHorizontal ? 'Columns2' : 'Rows2'" :size="12" />
      <span>{{ isHorizontal ? '水平布局' : '垂直布局' }}</span>
      <span class="text-gray-400 dark:text-gray-500">({{ node.children.length }})</span>
      <button
        v-if="!isRoot"
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
        <!-- 叶子面板行：尺寸 + 单位，悬停面板高亮，悬停行显示删除按钮；悬停时画布对应面板背景高亮 -->
        <div
          class="group flex items-center gap-1 rounded px-0.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          :class="
            hoveredPanelId === panel.id
              ? 'text-(--p-primary-500)'
              : 'text-gray-500 dark:text-gray-400'
          "
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
            <NeuralIcon :name="isCollapsed(panel.id) ? 'ChevronRight' : 'ChevronDown'" :size="12" />
          </button>
          <span v-else class="h-1 w-1 mx-1 rounded-sm bg-current"></span>
          <span>面板</span>
          <!-- 尺寸标签：点击循环切换单位（px 绿色 / % 蓝色），与画布指示线一致 -->
          <Tag
            class="cursor-pointer"
            :severity="unitSeverity(panel.useUnit)"
            :value="unitLabel(panel)"
            :pt="{
              root: {
                style: {
                  backgroundColor: 'transparent',
                  padding: '0 4px',
                },
              },
            }"
            @click.stop="toggleUnit(panel)"
          />
          <button
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
</template>
