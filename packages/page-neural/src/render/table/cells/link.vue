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

  /** 列绑定字段的链接地址 */
  const href = computed(() => {
    const value = props.row[props.column.field];
    return typeof value === 'string' ? value : '';
  });
</script>

<template>
  <a
    v-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="block truncate text-(--p-primary-500) hover:underline"
  >
    {{ href }}
  </a>
  <span v-else class="text-gray-400">-</span>
</template>
