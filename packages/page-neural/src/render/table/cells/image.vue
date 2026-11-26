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

  const { fieldData } = useColumnData(props.row, props.column);

  const imageStyle = computed(() => ({
    display: 'inline-block',
    height: `${props.column.imageSize}px`,
    width: `${props.column.imageSize}px`,
    borderRadius: `${props.column.imageBorderRadius}px`,
  }));
</script>

<template>
  <img :src="fieldData" alt="" :style="imageStyle" />
</template>
