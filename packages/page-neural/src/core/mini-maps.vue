<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import { usePageNeuralStore } from '@neural/store';
  import { useLayoutStore } from '@neural/store/layout';
  import type { LayoutSplitterNode } from '@neural/types';
  import { storeToRefs } from 'pinia';
  import { computed, ref } from 'vue';

  import { getPanelSplitter, percentFlexStyle } from './layout/utils';

  // 布局缩略图：默认收起为 Layout 图标，点击展开等比缩略布局树，悬停画布面板时对应色块高亮；
  // 递归子实例以 bare 模式直出缩略主体，不重复渲染外壳
  defineOptions({ name: 'MiniMaps' });

  const props = withDefaults(
    defineProps<{
      bare?: boolean; // 递归子实例模式：不渲染外壳，仅渲染缩略主体
      node?: LayoutSplitterNode; // 当前缩略渲染的分隔器节点，缺省渲染 store 中的根布局
    }>(),
    { bare: false }
  );

  const pageNeuralStore = usePageNeuralStore();
  const layoutStore = useLayoutStore();
  const { layouts } = storeToRefs(pageNeuralStore);
  const { hoveredPanelId } = storeToRefs(layoutStore);

  // 外壳展开状态：默认收起仅显示 Layout 图标
  const expanded = ref(false);

  const currentNode = computed(() => props.node ?? layouts.value);
  const isHorizontal = computed(() => currentNode.value.layout === 'horizontal');
</script>

<template>
  <!-- 外壳：固定图标占位，点击图标切换；展开的缩略图卡片绝对定位在图标上方，不占布局空间 -->
  <div v-if="!bare" class="relative h-6 w-6">
    <button
      class="absolute inset-0 z-20 flex items-center justify-center rounded text-gray-400 transition-colors hover:text-(--p-primary-500)"
      title="切换布局缩略图"
      @click="expanded = !expanded"
    >
      <NeuralIcon name="Layout" :size="14" />
    </button>
    <div
      v-show="expanded"
      class="absolute bottom-7 left-0 z-10 h-30 w-40 overflow-hidden rounded border border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900"
    >
      <MiniMaps bare />
    </div>
  </div>
  <!-- 缩略主体（根实例展开后与递归子实例共用）：gap-px 露出的容器背景充当分割线 -->
  <div
    v-else
    class="flex h-full w-full gap-px overflow-hidden bg-gray-300 dark:bg-gray-600"
    :class="isHorizontal ? '' : 'flex-col'"
  >
    <div
      v-for="panel in currentNode.children"
      :key="panel.id"
      class="min-h-0 min-w-0"
      :style="percentFlexStyle(panel)"
    >
      <!-- 嵌套分隔器：递归缩略 -->
      <MiniMaps v-if="getPanelSplitter(panel)" :node="getPanelSplitter(panel)!" bare />
      <!-- 叶子面板：色块，悬停面板高亮 -->
      <div
        v-else
        class="h-full w-full transition-colors"
        :class="
          hoveredPanelId === panel.id ? 'bg-(--p-primary-500)' : 'bg-gray-100 dark:bg-gray-800'
        "
      ></div>
    </div>
  </div>
</template>
