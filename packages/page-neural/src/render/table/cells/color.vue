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

  /** 列绑定字段的颜色值 */
  const color = computed(() => {
    const value = props.row[props.column.field];
    return typeof value === 'string' ? value.trim() : '';
  });

  /** 是否显示颜色值文本，未配置时默认显示 */
  const showColorValue = computed(() => props.column.showColorValue !== false);
</script>

<template>
  <div v-if="color" class="inline-block">
    <span class="flex items-center gap-2 overflow-hidden">
      <span
        class="inline-block size-4 shrink-0 rounded-sm border border-gray-200 dark:border-gray-700"
        :style="{ backgroundColor: color }"
      />
      <span v-if="showColorValue" class="truncate text-xs text-gray-600 dark:text-gray-300">
        {{ color }}
      </span>
    </span>
  </div>
  <span v-else class="text-gray-400">-</span>
</template>
