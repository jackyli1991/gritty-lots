<script setup lang="ts">
  import { NeuralToolbar } from '@neural/components';
  // import { Background } from '@vue-flow/background';
  // import { Controls } from '@vue-flow/controls';
  // import { VueFlow } from '@vue-flow/core';
  // import { MiniMap } from '@vue-flow/minimap';
  import type { ToolbarItem } from '@neural/components/toolbar';
  import { useModal } from '@neural/composables/userModal';
  import { formMaps } from '@neural/core/forms';
  import { ref } from 'vue';

  const { openModal, ModalEl } = useModal({
    formMaps,
  });

  const toolbarData: ToolbarItem[][] = [
    [{ label: '组件库', icon: 'Component', key: 'component' }],
    [
      { label: '设置', icon: 'Settings2', key: 'settings' },
      { label: '撤销', icon: 'Undo', key: 'undo' },
      { label: '重做', icon: 'Redo', key: 'redo', disabled: true },
    ],
    [
      { label: '设置', icon: 'Settings2', key: 'settings' },
      { label: '撤销', icon: 'Undo', key: 'undo' },
      {
        label: '删除',
        icon: 'Trash2',
        key: 'trash',
        dropdownList: [
          { label: '删除选中项', icon: 'Trash2', key: 'delete-selected' },
          { label: '清空', key: 'clear-all' },
        ],
      },
      { label: '设置', icon: 'Settings2', key: 'container' },
      { label: '请求', icon: 'Undo', key: 'request' },
    ],
  ];

  const requestConfig = ref({
    url: '/test/api',
    method: 'GET',
    headers: {
      keyword: 'params',
    },
    params: {},
    responseField: 'result.list',
  });

  const containerConfig = ref({
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
  });

  function handleClick(key: string) {
    console.log('toolbar click:', key);
    if (key === 'request') {
      openModal(key, requestConfig.value);
    }

    if (key === 'container') {
      openModal(key, containerConfig.value);
    }
  }
</script>

<template>
  <div class="gritty-page-neural-graph">
    <NeuralToolbar :data="toolbarData" @click="handleClick" />
    {{ requestConfig }}
    {{ containerConfig }}
    <component :is="ModalEl" />
  </div>
</template>

<style lang="scss" scoped>
  .gritty-page-neural-graph {
    position: relative;
    height: 100%;
    width: 100%;
  }
</style>
