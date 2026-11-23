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

  /** 进度条颜色配置项：阈值 + 颜色 */
  interface ProcessColorItem {
    value: number | string;
    color: string;
  }

  /**
   * 匹配当前进度对应的颜色：
   * 按配置顺序取第一个满足「进度 <= 阈值」的项；未命中时返回 null，沿用默认主题色。
   */
  const activeColor = computed<string | null>(() => {
    const current = value.value;
    if (current === null) return null;

    const list = props.column.processColors;
    if (!Array.isArray(list)) return null;

    for (const item of list as ProcessColorItem[]) {
      const threshold = Number(item?.value);
      if (!Number.isFinite(threshold)) continue;
      if (current <= threshold) return item.color || null;
    }
    return null;
  });

  /**
   * 通过 pt 控制进度条样式：
   * - root：class 提供样式钩子，style 覆盖设计令牌 --p-progressbar-height
   * - value：命中颜色配置时以行内 background 覆盖填充色
   */
  const pt = computed(() => ({
    root: {
      class: 'page-progress-bar',
      style: { '--p-progressbar-height': `${barHeight.value}px` } as Record<string, string>,
    },
    value: activeColor.value ? { style: { background: activeColor.value } } : {},
  }));
</script>

<template>
  <ProgressBar
    class="w-full"
    :value="value ?? 0"
    mode="determinate"
    :show-value="showValue"
    :pt="pt"
  />
</template>
