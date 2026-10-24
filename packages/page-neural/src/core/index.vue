<script setup lang="ts">
  import { DragDropProvider } from '@dnd-kit/vue';
  import { useAttrConfig } from '@neural/composables/useAttrConfig';
  // import { CONTAINER_ROOT_ID } from '@neural/const';
  import { crud } from '@neural/core/crud';
  import { formMaps } from '@neural/core/forms';
  import DragMonitorPanel from '@neural/dnd/components/dragMonitorPanel.vue';
  import DragOverlay from '@neural/dnd/components/dragOverlay.vue';
  import Materials from '@neural/materials/index.vue';
  // import Container from '@neural/render/container/index.vue';
  import LayoutRender from '@neural/render/layout/index.vue';
  import { usePageNeuralStore } from '@neural/store';
  // import { Background } from '@vue-flow/background';
  // import { Controls } from '@vue-flow/controls';
  // import { VueFlow } from '@vue-flow/core';
  // import { MiniMap } from '@vue-flow/minimap';
  import type { DragNodeOptions } from '@neural/types';
  import Toast from 'primevue/toast';
  import { ref } from 'vue';

  import ConfirmDialog from './confirmDialog.vue';
  import { initPageNeural } from './init';
  import Layout from './layout/index.vue';
  import MiniMaps from './mini-maps.vue';
  import PageSwitch from './pages/switch.vue';
  import Steps from './steps.vue';
  import ContainerToolbar from './toolbars/container.vue';
  import LayoutToolbar from './toolbars/layout.vue';
  import MaterialToolbar from './toolbars/material.vue';

  const stepValue = ref(1);

  const showMaterials = ref(false);
  const { createNode } = crud();
  const pageNeuralStore = usePageNeuralStore();

  // 同步初始化默认页面与布局（必须在 Layout 渲染前完成）
  initPageNeural(pageNeuralStore);

  const { attrConfigEl } = useAttrConfig({
    formMaps,
    store: pageNeuralStore,
  });

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
      <div class="py-2 flex justify-between items-center gap-2">
        <!-- 步骤条 -->
        <Steps v-model="stepValue">
          <template #step1>
            <LayoutToolbar />
          </template>
          <template #step2>
            <MaterialToolbar v-model="showMaterials" />
            <ContainerToolbar />
          </template>
        </Steps>
        <!-- 切换页面 -->
        <PageSwitch />
      </div>
      <!-- 内容区域 -->
      <div class="flex-1 flex overflow-hidden relative">
        <Layout v-if="stepValue === 1" />
        <template v-if="stepValue === 2">
          <div class="flex-1">
            <!-- 布局容器：按 store 中的布局树渲染 -->
            <LayoutRender />
          </div>
          <!-- 右侧属性编辑统一入口 -->
          <component :is="attrConfigEl" />
        </template>
      </div>
      <!-- 底部状态栏 -->
      <div class="p-1 flex justify-between items-center">
        <!-- 左下角布局缩略图：展示布局树层级关系 -->
        <MiniMaps />
        <!-- 拖拽监控 -->
        <DragMonitorPanel @dragStart="showMaterials = false" @droppedIn="handleDroppedIn" />
      </div>
      <!-- 左侧组件库 -->
      <Materials :visible="showMaterials" @update:visible="showMaterials = $event" />
      <!-- 所有confirm dialog 落地 -->
      <ConfirmDialog />
      <!-- 所有toast 落地 -->
      <Toast />
    </div>
    <DragOverlay />
  </DragDropProvider>
</template>
