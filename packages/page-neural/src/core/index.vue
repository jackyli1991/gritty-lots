<script setup lang="ts">
  import { DragDropProvider } from '@dnd-kit/vue';
  import { NeuralToolbar } from '@neural/components';
  import type { ToolbarItem } from '@neural/components/toolbar';
  import { useModal } from '@neural/composables/userModal';
  import { useNeuralToast } from '@neural/composables/useToast';
  import { CONTAINER_ROOT_ID } from '@neural/const';
  import { crud } from '@neural/core/crud';
  import { formMaps } from '@neural/core/forms';
  import DragMonitorPanel from '@neural/dnd/components/dragMonitorPanel.vue';
  import DragOverlay from '@neural/dnd/components/dragOverlay.vue';
  import Materials from '@neural/materials/index.vue';
  import Container from '@neural/render/container/index.vue';
  import { usePageNeuralStore } from '@neural/store';
  // import { Background } from '@vue-flow/background';
  // import { Controls } from '@vue-flow/controls';
  // import { VueFlow } from '@vue-flow/core';
  // import { MiniMap } from '@vue-flow/minimap';
  import type { DragNodeOptions } from '@neural/types';
  import { invokeAction, type ActionTree, type Paths } from '@neural/utils/action';
  import Toast from 'primevue/toast';
  import { ref } from 'vue';

  import ConfirmDialog, { useNeuralConfirm } from './confirmDialog.vue';

  const showMaterials = ref(false);
  const { createNode } = crud();
  const pageNeuralStore = usePageNeuralStore();
  const { neuralConfirm } = useNeuralConfirm();
  const { neuralToastWarning } = useNeuralToast();

  const { openModal, ModalEl } = useModal({
    formMaps,
  });

  const toolbarData: ToolbarItem[][] = [
    [{ label: '组件库', icon: 'Component', key: 'showComponents' }],
    [
      // { label: '撤销', icon: 'Undo', key: 'undo' },
      // { label: '重做', icon: 'Redo', key: 'redo', disabled: true },
    ],
    [
      // {
      //   label: '删除',
      //   icon: 'Trash2',
      //   key: 'trash',
      //   dropdownList: [
      //     { label: '清空', key: 'clear-all' },
      //   ],
      // },
      // { label: '请求', icon: 'Undo', key: 'request' },
    ],
    [
      { label: '设置', icon: 'Settings2', key: 'container.setting' },
      { label: '复制', icon: 'Copy', key: 'container.copy' },
      { label: '删除', icon: 'Trash2', key: 'container.delete.confirm' },
    ],
  ];

  const actions = {
    showComponents: () => {
      showMaterials.value = true;
    },
    container: {
      setting: () => {
        const activeContainer = pageNeuralStore.getContainer(pageNeuralStore.activeNodeId);
        openModal('container', activeContainer?.props || {});
      },
      copy: () => {
        const activeContainer = pageNeuralStore.getContainer(pageNeuralStore.activeNodeId);
        if (!activeContainer) {
          return;
        }
        if (activeContainer.id === CONTAINER_ROOT_ID) {
          neuralToastWarning('不能复制根容器', '拒绝');
          return;
        }
        pageNeuralStore.copyContainer(activeContainer.id);
      },
      delete: {
        confirm: () => {
          const activeContainer = pageNeuralStore.getContainer(pageNeuralStore.activeNodeId);
          if (!activeContainer) {
            return;
          }
          if (activeContainer.id === CONTAINER_ROOT_ID) {
            neuralToastWarning('不能删除根容器', '拒绝');
            return;
          }
          neuralConfirm({
            message: `确认删除【${activeContainer.name}】吗？`,
            header: '删除',
            type: 'delete',
            confirm: () => {
              pageNeuralStore.deleteContainer(activeContainer.id);
            },
            reject: () => {},
          });
        },
      },
    },
    request: () => {
      openModal('request', requestConfig.value);
    },
  } satisfies ActionTree;

  const requestConfig = ref({
    url: '/test/api',
    method: 'GET',
    headers: {
      keyword: 'params',
    },
    params: {},
    enable: true,
    responseField: 'result.list',
  });

  function handleClick(key: string) {
    // console.log('toolbar click:', key);
    invokeAction(actions, key as Paths<typeof actions>);
  }

  // 拖拽到容器
  function handleDroppedIn(data: Omit<DragNodeOptions, 'type'>) {
    createNode({
      type: 'container',
      source: data.source,
      target: data.target,
    });
  }
</script>

<template>
  <DragDropProvider>
    <div class="page-neural-graph w-full h-full flex flex-col relative overflow-hidden">
      <!-- 顶部工具栏 -->
      <div class="p-1">
        <NeuralToolbar :data="toolbarData" @click="handleClick" />
      </div>
      <!-- 内容区域 -->
      <div class="flex-1 overflow-hidden relative">
        <Container :id="CONTAINER_ROOT_ID"></Container>
      </div>
      <!-- 底部状态栏 -->
      <div class="p-1 flex justify-end">
        <DragMonitorPanel @dragStart="showMaterials = false" @droppedIn="handleDroppedIn" />
      </div>
      <!-- 左侧组件库 -->
      <Materials :visible="showMaterials" @update:visible="showMaterials = $event" />
      <!-- 抽屉、弹窗统一入口 -->
      <component :is="ModalEl" />
      <ConfirmDialog />
      <Toast />
    </div>
    <DragOverlay />
  </DragDropProvider>
</template>
