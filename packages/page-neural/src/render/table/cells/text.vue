<script setup lang="ts">
  import type { TableColumn } from '@neural/types/table';
  import { computed, type CSSProperties } from 'vue';

  // import vTooltip from 'primevue/tooltip';
  import { useColumnData } from '../useColumnData';

  interface Props {
    /** 当前行数据 */
    row: Record<string, unknown>;
    /** 当前列配置 */
    column: TableColumn;
  }

  const props = defineProps<Props>();

  const { fieldData, prefix, suffix } = useColumnData(props.row, props.column);

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
          // DataTable 的 td 默认 white-space: nowrap，需复位才能换行
          whiteSpace: 'normal',
          overflowWrap: 'break-word',
        }
      : undefined
  );
</script>

<template>
  <!-- v-tooltip.top="{ value: fieldData, autoHide: false }" -->
  <span v-if="fieldData" class="block" :class="{ truncate: rows === 1 }" :style="clampStyle"
    >{{ prefix }}{{ fieldData }}{{ suffix }}</span
  >
</template>
