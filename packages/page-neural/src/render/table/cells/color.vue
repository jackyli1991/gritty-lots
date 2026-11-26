<script setup lang="ts">
  import type { TableColumn } from '@neural/types/table';
  import { computed } from 'vue';

  import { useColumnData } from '../useColumnData';

  interface Props {
    /** 当前行数据 */
    row: Record<string, unknown>;
    /** 当前列配置 */
    column: TableColumn;
  }

  const props = defineProps<Props>();

  const { fieldData, prefix, suffix } = useColumnData(props.row, props.column);

  /** 是否显示颜色值文本，未配置时默认显示 */
  const showColorValue = computed(() => props.column.showColorValue !== false);
</script>

<template>
  <div class="inline-block">
    <span class="flex items-center overflow-hidden">
      <span
        class="inline-block size-4 shrink-0 rounded-sm border border-gray-200 dark:border-gray-700"
        :style="{ backgroundColor: fieldData }"
      />
      <span
        v-if="showColorValue && fieldData"
        class="truncate text-xs text-gray-600 dark:text-gray-300 ml-2"
      >
        {{ prefix }}{{ fieldData }}{{ suffix }}
      </span>
    </span>
  </div>
</template>
