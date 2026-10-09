<script setup lang="ts">
  import DroppableItem from '@neural/dnd/components/droppableItem.vue';
  import { usePageNeuralStore } from '@neural/store';
  import { computed } from 'vue';

  // import type { Container } from '@neural/types';
  import { generateContainerStyle, generateContainerClass } from '../utils';

  defineOptions({
    name: 'PageNeuralContainer',
  });

  interface ContainerProps {
    id?: string;
  }

  const pageNeuralStore = usePageNeuralStore();

  const props = defineProps<ContainerProps>();

  const container = computed(() => pageNeuralStore.getContainer(props.id || ''));

  const containerStyle = computed(() => generateContainerStyle(container.value?.props || {}));

  const containerClassList = computed(() => generateContainerClass(container.value?.props || {}));

  // 点击激活当前容器
  const handleActive = () => {
    pageNeuralStore.setActiveNodeId(props.id || '');
  };
</script>

<template>
  <div
    class="page-neural-container"
    :class="containerClassList"
    :style="containerStyle"
    @click.stop="handleActive"
  >
    <DroppableItem :id="props.id || ''" :active="pageNeuralStore.activeNodeId === props.id">
      <slot></slot>
      <PageNeuralContainer v-for="child in container?.children || []" :key="child" :id="child" />
    </DroppableItem>
  </div>
</template>
