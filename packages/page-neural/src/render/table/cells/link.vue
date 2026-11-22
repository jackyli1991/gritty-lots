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

  /** 链接文本：未配置或为空时回退为链接地址，过长时保留首尾各 12 个字符 */
  const text = computed(() => {
    const linkText = props.column.linkText?.trim();
    if (linkText) return linkText;
    return href.value.length > 24
      ? `${href.value.slice(0, 12)}···${href.value.slice(-12)}`
      : href.value;
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
    {{ text }}
  </a>
  <span v-else class="text-gray-400">-</span>
</template>
