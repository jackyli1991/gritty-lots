<script setup lang="ts">
  import { useData } from '@neural/composables/useData';
  import { getEnumLabel, getEnumProps } from '@neural/render/utils/common';
  import type { TableColumn } from '@neural/types/table';
  import Tag from 'primevue/tag';
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

  // 列不是容器，直接指定数据模型配置，枚举数据以列 id 为键写入缓存
  const { data } = useData(props.column.id, { dataModel: props.column.tagOptions });

  /** 列绑定字段的展示文本：从枚举数据（label/value）中匹配，未命中时回退原始值 */
  const text = computed(() => {
    return getEnumLabel(data.value, fieldData) ?? String(fieldData);
  });

  // 标签属性：枚举数据中指定的类型优先，未指定时回退列上的默认类型
  const tagProps = computed<Record<string, unknown>>(() => {
    return {
      severity: props.column.severity,
      ...getEnumProps(data.value, fieldData),
    };
  });
</script>

<template>
  <Tag :value="text" size="small" v-bind="tagProps" />
</template>
