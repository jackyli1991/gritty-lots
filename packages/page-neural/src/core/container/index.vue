<script setup lang="ts">
  import type { OpenModal } from '@neural/composables/userModal';
  import DroppableItem from '@neural/dnd/components/droppableItem.vue';
  // import type { Container } from '@neural/types';
  import { generateContainerStyle, generateContainerClass } from '@neural/render/utils';
  import { usePageNeuralStore } from '@neural/store';
  import type { Component } from 'vue';
  import { computed, inject } from 'vue';

  import DrawerContainer from './drawer.vue';
  import FormContainer from './form.vue';
  import NormalContainer from './normal.vue';
  import TableContainer from './table.vue';
  import TabsContainer from './tabs.vue';

  defineOptions({
    name: 'PageNeuralContainer',
  });

  interface ContainerProps {
    id?: string;
  }

  const pageNeuralStore = usePageNeuralStore();

  const props = defineProps<ContainerProps>();

  // 容器子类型 → 基座组件；字符串 :is 未注册时会退化为原生标签，必须显式映射
  const CONTAINER_COMPONENTS: Record<string, Component> = {
    normal: NormalContainer,
    table: TableContainer,
    form: FormContainer,
    tabs: TabsContainer,
    drawer: DrawerContainer,
  };

  // 由最外层 core/index.vue 注入，容器内不重复创建弹窗实例
  const openModal = inject<OpenModal | null>('neural-modal', null);

  const container = computed(() => pageNeuralStore.getContainer(props.id || ''));

  // 未登记子类型（如 root）统一回退普通容器
  const containerComponent = computed(
    () => CONTAINER_COMPONENTS[container.value?.subType ?? 'normal'] ?? NormalContainer
  );

  const containerStyle = computed(() => generateContainerStyle(container.value?.props || {}));

  const containerClassList = computed(() => generateContainerClass(container.value?.props || {}));

  // 点击激活当前容器
  const handleActive = () => {
    pageNeuralStore.setActiveContainerId(props.id || '');
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
    <DroppableItem :id="props.id || ''" :active="pageNeuralStore.activeContainerId === props.id">
      <component :is="containerComponent" :id="props.id" />
    </DroppableItem>
  </div>
</template>
