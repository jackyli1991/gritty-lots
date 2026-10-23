<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import { usePageNeuralStore } from '@neural/store';
  import type { LayoutPanelNode, LayoutSplitterNode } from '@neural/types';
  import { storeToRefs } from 'pinia';
  import vTooltip from 'primevue/tooltip';
  import { computed } from 'vue';

  import { getPanelSplitter } from './utils';

  // 布局图层树：递归展示布局树的层级关系，悬停画布面板时对应节点高亮，支持删除面板/分隔器
  defineOptions({ name: 'Layers' });

  const props = defineProps<{
    node: LayoutSplitterNode; // 当前渲染的分隔器节点
    parentPanel?: LayoutPanelNode; // 当前分隔器所在的父面板，缺省表示根分隔器（不可删除）
  }>();

  const pageNeuralStore = usePageNeuralStore();
  const { hoveredPanelId } = storeToRefs(pageNeuralStore);

  const isHorizontal = computed(() => props.node.layout === 'horizontal');

  // 根分隔器不可删除
  const isRoot = !props.parentPanel;

  // 删除面板：从当前分隔器移除；删空后该嵌套分隔器已成空壳，连同清除（与画布右键删除逻辑一致）
  function deletePanel(index: number) {
    props.node.children.splice(index, 1);

    if (!props.node.children.length && props.parentPanel) props.parentPanel.children = [];
  }

  // 删除当前分隔器：清空其所在父面板内容
  function deleteSplitter() {
    if (!props.parentPanel) return;

    props.parentPanel.children = [];
  }

  // 树行悬停 → 画布联动高亮对应面板/分隔器
  function setTreeHoveredPanel(id: string | null) {
    pageNeuralStore.setTreeHoveredPanelId(id);
  }

  function setTreeHoveredSplitter(id: string | null) {
    pageNeuralStore.setTreeHoveredSplitterId(id);
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
        <Layers
          v-if="getPanelSplitter(panel)"
          :node="getPanelSplitter(panel)!"
          :parent-panel="panel"
        />
        <!-- 叶子面板行：尺寸 + 单位，悬停面板高亮，悬停行显示删除按钮；悬停时画布对应面板背景高亮 -->
        <div
          v-else
          class="group flex items-center gap-1 rounded px-0.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          :class="
            hoveredPanelId === panel.id
              ? 'text-(--p-primary-500)'
              : 'text-gray-500 dark:text-gray-400'
          "
          @mouseenter="setTreeHoveredPanel(panel.id)"
          @mouseleave="setTreeHoveredPanel(null)"
        >
          <span class="h-1.5 w-1.5 rounded-sm bg-current"></span>
          <span>面板</span>
          <span>{{ panel.sizeValue }}{{ panel.useUnit }}</span>
          <button
            class="ml-auto text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
            v-tooltip.left="'删除面板'"
            @click.stop="deletePanel(index)"
          >
            <NeuralIcon name="Trash2" :size="12" />
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
