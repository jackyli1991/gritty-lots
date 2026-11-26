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

  /** 链接文本：未配置或为空时回退为链接地址，过长时保留首尾各 12 个字符 */
  const text = computed(() => {
    const linkText = props.column.linkText?.trim();
    if (linkText) return linkText;
    return fieldData.length > 24
      ? `${fieldData.slice(0, 12)}···${fieldData.slice(-12)}`
      : fieldData;
  });
</script>

<template>
  <a
    :href="fieldData"
    target="_blank"
    rel="noopener noreferrer"
    class="block truncate text-(--p-primary-500) hover:underline"
  >
    {{ prefix }}{{ text }}{{ suffix }}
  </a>
</template>
