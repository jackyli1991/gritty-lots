<script setup lang="ts">
  import { useSortable } from '@dnd-kit/vue/sortable';
  import { ref } from 'vue';

  interface SortableColumnItemProps {
    /** 列唯一标识，同时作为可排序项 id */
    id: string;
    /** 当前列在数组中的索引 */
    index: number;
    /** 同组排序标识，用于限定仅与同列表内的元素互相排序 */
    group: string;
    /** 是否禁用拖拽（如搜索过滤时，避免可见索引与真实索引错位） */
    disabled?: boolean;
    /** 列数据 */
    data?: Record<string, any>;
    /** 列类型 */
    type?: string;
  }

  const props = defineProps<SortableColumnItemProps>();

  const element = ref<HTMLElement | null>(null);

  const { isDragging } = useSortable({
    id: () => props.id,
    index: () => props.index,
    group: () => props.group,
    disabled: () => props.disabled ?? false,
    data: () => props.data,
    type: () => props.type ?? 'sortable',
    element,
  });
</script>

<template>
  <div ref="element" :class="isDragging ? 'opacity-50' : ''">
    <slot />
  </div>
</template>
