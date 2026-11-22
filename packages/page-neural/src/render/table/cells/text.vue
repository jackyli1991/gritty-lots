<script setup lang="ts">
  import type { TableColumn } from '@neural/types/table';
  import vTooltip from 'primevue/tooltip';
  import { computed, type CSSProperties } from 'vue';

  interface Props {
    /** 当前行数据 */
    row: Record<string, unknown>;
    /** 当前列配置 */
    column: TableColumn;
  }

  const props = defineProps<Props>();

  /** 列绑定字段的展示文本 */
  const text = computed(() => {
    const value = props.row[props.column.field];
    return value === undefined || value === null || value === '' ? '-' : String(value);
  });

  /** 最多显示行数：未配置或非法时回退 1（单行） */
  const rows = computed(() => {
    const n = Number(props.column.rows);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  });

  /** 多行省略样式：行数 > 1 时启用 line-clamp；单行走 truncate 类 */
  const clampStyle = computed<CSSProperties | undefined>(() =>
    rows.value > 1
      ? {
          display: '-webkit-box',
          WebkitLineClamp: String(rows.value),
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }
      : undefined
  );
</script>

<template>
  <span
    class="block"
    :class="{ truncate: rows === 1 }"
    :style="clampStyle"
    v-tooltip.top="{ value: text, autoHide: false }"
    >{{ text }}</span
  >
</template>
