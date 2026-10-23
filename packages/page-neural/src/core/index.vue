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
  import Layout from './layout/index.vue';
  import MiniMaps from './mini-maps.vue';
  import ContainerToolbar from './toolbars/container.vue';
  import LayoutToolbar from './toolbars/layout.vue';
  import MaterialToolbar from './toolbars/material.vue';

  const showMaterials = ref(false);
  const showLayout = ref(false);
  const { createNode } = crud();
  const pageNeuralStore = usePageNeuralStore();

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
      <div class="py-2 flex items-center gap-2">
        <MaterialToolbar v-model="showMaterials" />
        <ContainerToolbar />
        <LayoutToolbar v-model="showLayout" />
      </div>
      <!-- 内容区域 -->
      <div class="flex-1 flex overflow-hidden relative">
        <template v-if="!showLayout">
          <div class="flex-1">
            <!-- 布局容器：按 store 中的布局树渲染 -->
            <LayoutRender />
          </div>
          <!-- 右侧属性编辑统一入口 -->
          <component :is="attrConfigEl" />
        </template>
        <Layout v-else />
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
