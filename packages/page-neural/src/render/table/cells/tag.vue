<script setup lang="ts">
  import { useData } from '@neural/composables/useData';
  import { getEnumLabel, getEnumProps } from '@neural/render/utils/common';
  import type { TableColumn } from '@neural/types/table';
  import Tag from 'primevue/tag';
  import { computed } from 'vue';

  interface Props {
    /** 当前行数据 */
    row: Record<string, unknown>;
    /** 当前列配置 */
    column: TableColumn;
  }

  const props = defineProps<Props>();

  // 列不是容器，直接指定数据模型配置，枚举数据以列 id 为键写入缓存
  const { data } = useData(props.column.id, { dataModel: props.column.tagOptions });

  /** 列绑定字段的展示文本：从枚举数据（label/value）中匹配，未命中时回退原始值 */
  const text = computed(() => {
    const value = props.row[props.column.field];
    if (value === undefined || value === null || value === '') return '-';
    return getEnumLabel(data.value, value) ?? String(value);
  });

  // 标签属性
  const tagProps = computed(() => {
    const value = props.row[props.column.field];
    if (value === undefined || value === null || value === '') return {};
    return getEnumProps(data.value, value);
  });
</script>

<template>
  <Tag :value="text" size="small" v-bind="tagProps" />
</template>
