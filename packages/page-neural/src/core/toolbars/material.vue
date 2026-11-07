<script setup lang="ts">
  import { NeuralToolbar } from '@neural/components';
  import type { ToolbarItem } from '@neural/components/toolbar';
  import type { OpenModal } from '@neural/composables/userModal';
  import { materialTabs } from '@neural/materials/index';
  import { inject } from 'vue';

  // 由最外层 core/index.vue 注入，此处不再创建独立弹窗实例
  const openModal = inject<OpenModal | null>('neural-modal', null);

  // 工具栏数据：全部 + 各素材大类（由 materials 目录下的模块自动生成）
  const toolbarData: ToolbarItem[][] = [
    [
      { label: '全部素材', icon: 'Component', key: 'all' },
      ...materialTabs.map((tab) => ({
        label: tab.name,
        icon: tab.icon ?? 'Component',
        key: tab.value,
      })),
    ],
  ];

  // 点击任意大类均打开素材面板
  function handleClick(val: string | undefined) {
    const toolbarItem = toolbarData[0].find((item) => item.key === val);
    openModal?.({
      key: 'materials',
      props: {
        category: val,
      },
      nodeData: {},
      modalConfig: {
        header: toolbarItem?.label ?? '全部素材',
      },
    });
  }
</script>

<template>
  <NeuralToolbar :data="toolbarData" title="素材" @click="handleClick" />
</template>
