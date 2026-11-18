<script setup lang="ts">
  import type { TableColumn } from '@neural/types/table';
  import { computed } from 'vue';

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
</script>

<template>
  <span class="block truncate">{{ text }}</span>
</template>
