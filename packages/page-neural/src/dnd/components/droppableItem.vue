<script lang="ts" setup>
  import { useDroppable } from '@dnd-kit/vue';
  import { ref } from 'vue';

  interface DroppableItemProps {
    id: string;
    active?: boolean;
  }

  const props = withDefaults(defineProps<DroppableItemProps>(), {});

  const element = ref(null);
  const { isDropTarget } = useDroppable({
    id: props.id,
    element,
  });
</script>

<template>
  <div
    ref="element"
    class="w-full h-full border border-transparent [&:hover:not(:has(*:hover))]:border-(--p-primary-500) [&:hover:not(:has(*:hover))]:border-dashed"
    :class="{
      'border-(--p-primary-500)!': isDropTarget || props.active,
    }"
  >
    <slot></slot>
  </div>
</template>
