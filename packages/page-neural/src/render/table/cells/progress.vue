<script setup lang="ts">
  import type { TableColumn } from '@neural/types/table';
  import ProgressBar from 'primevue/progressbar';
  import { computed } from 'vue';

  interface Props {
    /** 当前行数据 */
    row: Record<string, unknown>;
    /** 当前列配置 */
    column: TableColumn;
  }

  const props = defineProps<Props>();

  /** 进度值：非数字时为 null，determinate 模式下不渲染进度条 */
  const value = computed<number | null>(() => {
    const raw = props.row[props.column.field];
    const num = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isFinite(num)) return null;
    return Math.min(100, Math.max(0, num));
  });

  /** 是否显示百分比文本，默认显示 */
  const showValue = computed(() => props.column.showValue === true);

  /** 进度条高度：未配置或非法时默认 10px */
  const barHeight = computed(() => {
    const n = Number(props.column.barHeight);
    return Number.isFinite(n) && n >= 0 ? n : 10;
  });

  /**
   * 通过 pt root 控制进度条高度：
   * - class 提供样式钩子
   * - style 覆盖设计令牌 --p-progressbar-height，根元素的 height 由该令牌驱动
   */
  const pt = computed(() => ({
    root: {
      class: 'page-progress-bar',
      style: { '--p-progressbar-height': `${barHeight.value}px` } as Record<string, string>,
    },
  }));
</script>

<template>
  <ProgressBar
    v-if="value !== null"
    class="w-full"
    :value="value ?? 0"
    mode="determinate"
    :show-value="showValue"
    :pt="pt"
  />
  <span v-else class="text-gray-400">-</span>
</template>
