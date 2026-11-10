<script setup lang="ts">
  import { DragDropProvider } from '@dnd-kit/vue';
  // import { useAttrConfig } from '@neural/composables/useAttrConfig';
  import { useModal } from '@neural/composables/userModal';
  import { crud } from '@neural/core/crud';
  import { formMaps } from '@neural/core/forms';
  import DragMonitorPanel from '@neural/dnd/components/dragMonitorPanel.vue';
  import DragOverlay from '@neural/dnd/components/dragOverlay.vue';
  import { usePageNeuralStore } from '@neural/store';
  // import Container from '@neural/render/container/index.vue';
  import { useLayoutStore } from '@neural/store/layout';
  // import { Background } from '@vue-flow/background';
  // import { Controls } from '@vue-flow/controls';
  // import { VueFlow } from '@vue-flow/core';
  // import { MiniMap } from '@vue-flow/minimap';
  import type { DragNodeOptions } from '@neural/types';
  import Button from 'primevue/button';
  import Toast from 'primevue/toast';
  import { provide } from 'vue';

  import ConfirmDialog from './confirmDialog.vue';
  import { initPageNeural } from './init';
  import Layout from './layout/index.vue';
  import LayersTogger from './layout/layers-togger.vue';
  import MiniMaps from './layout/mini-maps.vue';
  import ContainerToolbar from './toolbars/container.vue';
  import MaterialToolbar from './toolbars/material.vue';
  import PageToolbar from './toolbars/page.vue';

  const { createNode } = crud();
  const pageNeuralStore = usePageNeuralStore();
  const layoutStore = useLayoutStore();

  const { openModal, ModalEl } = useModal({
    formMaps,
    store: pageNeuralStore,
  });

  // 同步初始化默认页面与布局（必须在 Layout 渲染前完成）
  initPageNeural(pageNeuralStore);
  // 向所有后代容器组件注入打开弹窗的方法，避免各层级重复创建弹窗实例
  provide('neural-modal', openModal);

  // const { attrConfigEl } = useAttrConfig({
  //   formMaps,
  //   store: pageNeuralStore,
  // });

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
      <div class="pb-2 flex justify-between items-center gap-2">
        <div class="flex items-center gap-4">
          <!-- 切换页面 -->
          <PageToolbar />
          <!-- 容器编辑 -->
          <template v-if="layoutStore.locked">
            <MaterialToolbar />
            <ContainerToolbar />
          </template>
        </div>
        <div>
          <Button size="small">保存</Button>
        </div>
      </div>
      <!-- 内容区域 -->
      <div class="flex-1 flex overflow-hidden relative">
        <Layout />
      </div>
      <!-- 底部状态栏 -->
      <div class="p-1 flex justify-between items-center">
        <!-- 拖拽监控 -->
        <DragMonitorPanel @droppedIn="handleDroppedIn" />
        <div class="flex items-center gap-1">
          <!-- 图层与属性面板切换按钮 -->
          <LayersTogger />
          <!-- 布局缩略图：展示布局树层级关系 -->
          <MiniMaps />
        </div>
      </div>
      <!-- 所有confirm dialog落地 -->
      <ConfirmDialog />
      <!-- 所有toast落地 -->
      <Toast />
      <!-- 所有modal落地 -->
      <component :is="ModalEl" />
    </div>
    <DragOverlay />
  </DragDropProvider>
</template>
