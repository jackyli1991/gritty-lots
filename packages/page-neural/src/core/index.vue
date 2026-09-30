<script setup lang="ts">
  import { DragDropProvider } from '@dnd-kit/vue';
  import { NeuralToolbar } from '@neural/components';
  // import { Background } from '@vue-flow/background';
  // import { Controls } from '@vue-flow/controls';
  // import { VueFlow } from '@vue-flow/core';
  // import { MiniMap } from '@vue-flow/minimap';
  import type { ToolbarItem } from '@neural/components/toolbar';
  import { useModal } from '@neural/composables/userModal';
  import { formMaps } from '@neural/core/forms';
  import DragMonitorPanel from '@neural/dnd/components/dragMonitorPanel.vue';
  import DragOverlay from '@neural/dnd/components/dragOverlay.vue';
  import Materials from '@neural/materials/index.vue';
  import Container from '@neural/render/container/index.vue';
  import { invokeAction, type ActionTree, type Paths } from '@neural/utils/action';
  import { ref } from 'vue';

  const showMaterials = ref(false);

  const { openModal, ModalEl } = useModal({
    formMaps,
  });

  const toolbarData: ToolbarItem[][] = [
    [{ label: '组件库', icon: 'Component', key: 'showComponents' }],
    [
      { label: '设置', icon: 'Settings2', key: 'settings' },
      { label: '撤销', icon: 'Undo', key: 'undo' },
      { label: '重做', icon: 'Redo', key: 'redo', disabled: true },
    ],
    [
      { label: '容器', icon: 'Container', key: 'container.add' },
      { label: '撤销', icon: 'Undo', key: 'undo' },
      {
        label: '删除',
        icon: 'Trash2',
        key: 'trash',
        dropdownList: [
          { label: '删除选中项', icon: 'Trash2', key: 'container.delete.confirm' },
          { label: '清空', key: 'clear-all' },
        ],
      },
      { label: '设置', icon: 'Settings2', key: 'container.setting' },
      { label: '请求', icon: 'Undo', key: 'request' },
    ],
  ];

  const actions = {
    showComponents: () => {
      showMaterials.value = true;
    },
    container: {
      add: () => {
        console.log('add container');
      },
      setting: () => {
        openModal('container', containerConfig.value);
      },
      delete: {
        confirm: () => {
          console.log('delete container');
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

  const containerConfig = ref({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
  });

  function handleClick(key: string) {
    // console.log('toolbar click:', key);
    invokeAction(actions, key as Paths<typeof actions>);
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
        <Container id="page-container"></Container>
      </div>
      <!-- 底部状态栏 -->
      <div class="p-1 flex justify-end">
        <DragMonitorPanel @dragStart="showMaterials = false" />
      </div>
      <!-- 左侧组件库 -->
      <Materials :visible="showMaterials" @update:visible="showMaterials = $event" />
      <!-- 抽屉、弹窗统一入口 -->
      <component :is="ModalEl" />
    </div>
    <DragOverlay />
  </DragDropProvider>
</template>
