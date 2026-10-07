<script lang="ts" setup>
  import { useDroppable } from '@dnd-kit/vue';
  import { ref } from 'vue';

  interface DroppableItemProps {
    id: string;
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
    class="w-full h-full border border-transparent"
    :class="{ 'border-(--p-primary-500)!': isDropTarget }"
  >
    <slot></slot>
  </div>
</template>
