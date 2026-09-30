<script lang="ts" setup>
  import { useDraggable } from '@dnd-kit/vue';
  import { ref } from 'vue';

  interface DraggableItemProps {
    id: string;
    data?: Record<string, any>;
  }

  const props = withDefaults(defineProps<DraggableItemProps>(), {});

  const element = ref(null);
  const { isDragging } = useDraggable({
    id: props.id,
    element,
    data: props.data,
  });
</script>

<template>
  <div ref="element" :data-dragging="isDragging">
    <slot></slot>
  </div>
</template>
