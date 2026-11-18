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

  /** 列绑定字段的图片地址 */
  const src = computed(() => {
    const value = props.row[props.column.field];
    return typeof value === 'string' ? value : '';
  });

  const imageStyle = computed(() => ({
    height: `${props.column.imageSize}px`,
    width: `${props.column.imageSize}px`,
    borderRadius: `${props.column.imageBorderRadius}px`,
  }));
</script>

<template>
  <img v-if="src" :src="src" alt="" :style="imageStyle" />
  <span v-else class="text-gray-400">-</span>
</template>
