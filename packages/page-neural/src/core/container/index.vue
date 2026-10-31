<script setup lang="ts">
  import type { OpenModal } from '@neural/composables/userModal';
  import DroppableItem from '@neural/dnd/components/droppableItem.vue';
  // import type { Container } from '@neural/types';
  import { generateContainerStyle, generateContainerClass } from '@neural/render/utils';
  import { usePageNeuralStore } from '@neural/store';
  import { computed, inject } from 'vue';

  defineOptions({
    name: 'PageNeuralContainer',
  });

  interface ContainerProps {
    id?: string;
  }

  const pageNeuralStore = usePageNeuralStore();

  const props = defineProps<ContainerProps>();

  // 由最外层 core/index.vue 注入，容器内不重复创建弹窗实例
  const openModal = inject<OpenModal | null>('neural-modal', null);

  const container = computed(() => pageNeuralStore.getContainer(props.id || ''));

  const containerStyle = computed(() => generateContainerStyle(container.value?.props || {}));

  const containerClassList = computed(() => generateContainerClass(container.value?.props || {}));

  // 点击激活当前容器
  const handleActive = () => {
    pageNeuralStore.setActiveNodeId(props.id || '');
    openModal?.({
      key: 'container',
      props: container.value?.props || {},
      nodeData: container.value as Record<string, any>,
    });
  };
</script>

<template>
  <div
    class="page-neural-container relative"
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
