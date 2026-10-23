<script setup lang="ts">
  import { getPanelSplitter, panelFlexStyle } from '@neural/core/layout/utils';
  import { usePageNeuralStore } from '@neural/store';
  import type { LayoutSplitterNode } from '@neural/types';
  import { storeToRefs } from 'pinia';
  import { computed } from 'vue';

  // 布局运行时渲染：按布局树数据以 flex 布局纯展示（无编辑交互），编辑态见 core/layout
  defineOptions({ name: 'LayoutRender' });

  const props = defineProps<{
    node?: LayoutSplitterNode; // 待渲染的分隔器节点，缺省渲染 store 中的根布局
  }>();

  const pageNeuralStore = usePageNeuralStore();
  const { layouts } = storeToRefs(pageNeuralStore);

  const currentNode = computed(() => props.node ?? layouts.value);
  const isHorizontal = computed(() => currentNode.value.layout === 'horizontal');
</script>

<template>
  <!-- gap-px 露出的容器背景充当分割线，与编辑态的 gutter 对应 -->
  <div class="flex h-full w-full gap-px overflow-hidden" :class="isHorizontal ? '' : 'flex-col'">
    <div
      v-for="panel in currentNode.children"
      :key="panel.id"
      class="min-h-0 min-w-0"
      :style="panelFlexStyle(panel)"
    >
      <!-- 嵌套分隔器：递归渲染 -->
      <LayoutRender v-if="getPanelSplitter(panel)" :node="getPanelSplitter(panel)!" />
    </div>
  </div>
</template>
