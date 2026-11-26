<script setup lang="ts">
  import { useData } from '@neural/composables/useData';
  import { getEnumLabel, getEnumProps } from '@neural/render/utils/common';
  import type { TableColumn } from '@neural/types/table';
  import Tag from 'primevue/tag';
  import vTooltip from 'primevue/tooltip';
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

  // 列不是容器，直接指定数据模型配置，枚举数据以列 id 为键写入缓存
  const { data } = useData(props.column.id, { dataModel: props.column.tagOptions });

  /** 拆分多值字段：数组原样使用，字符串兼容逗号/顿号拼接，其他非空值视为单值 */
  function parseValues(value: unknown): unknown[] {
    if (Array.isArray(value)) {
      return value.filter((item) => item !== undefined && item !== null && item !== '');
    }
    if (typeof value === 'string') {
      return value
        .split(/[,，、]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return value === undefined || value === null || value === '' ? [] : [value];
  }

  /** 每个值的展示文本与标签属性：均从枚举数据中匹配，文本未命中时回退原始值 */
  const tags = computed(() =>
    parseValues(fieldData).map((value) => ({
      label: getEnumLabel(data.value, value) ?? String(value),
      props: getEnumProps(data.value, value) ?? {},
    }))
  );

  /** 最大显示数量：未配置或非法时不限制（Infinity） */
  const maxTags = computed(() => {
    const n = Number(props.column.maxTags);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : Infinity;
  });

  /** 实际展示的标签 */
  const visibleTags = computed(() => tags.value.slice(0, maxTags.value));

  /** 超出最大数量的标签数 */
  const overflowCount = computed(() => Math.max(tags.value.length - maxTags.value, 0));

  /** 全部标签文本，+n 标签悬停时展示 */
  const allLabels = computed(() => tags.value.map((tag) => tag.label).join('、'));
</script>

<template>
  <span v-if="!tags.length" class="text-gray-400">-</span>
  <span v-else>
    <span>{{ prefix }}</span>
    <Tag
      v-for="(tag, index) in visibleTags"
      :key="index"
      :value="tag.label"
      size="small"
      class="mr-1 mb-1"
      v-bind="{
        severity: props.column.severity,
        ...tag.props,
      }"
    />
    <Tag
      v-if="overflowCount > 0"
      v-tooltip.top="{ value: allLabels, autoHide: false }"
      :value="`+${overflowCount}`"
      size="small"
      :severity="props.column.severity"
    />
    <span>{{ suffix }}</span>
  </span>
</template>
