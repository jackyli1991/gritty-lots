<script setup lang="ts">
  import { NeuralToolbar } from '@neural/components';
  import type { ToolbarItem } from '@neural/components/toolbar';
  import type { OpenModal } from '@neural/composables/userModal';
  import { useNeuralConfirm } from '@neural/core/confirmDialog.vue';
  import containerForm from '@neural/core/forms/container';
  import { usePageNeuralStore } from '@neural/store';
  import { getPlaceholderValue } from '@neural/utils';
  import { inject, computed } from 'vue';

  const pageNeuralStore = usePageNeuralStore();
  const { neuralConfirm } = useNeuralConfirm();

  // 由最外层 core/index.vue 注入，此处不再创建独立弹窗实例
  const openModal = inject<OpenModal | null>('neural-modal', null);

  // 工具栏配置
  const toolbarData = computed<ToolbarItem[][]>(() => {
    const { formConfig, modalConfig } = containerForm;
    const tools: ToolbarItem[][] = [
      formConfig.schema.map((item: any) => ({
        label: item.label,
        icon: item.icon,
        key: item.schemaName,
      })),
    ];
    // 删除按钮
    if (modalConfig.delete.enable) {
      tools[0].push({
        label: modalConfig.delete.label,
        icon: 'Trash2',
        key: 'delete',
        severity: 'danger',
        deleteConfig: modalConfig.delete,
      });
    }
    return tools;
  });

  function handleClick(key: string) {
    const activeContainer = pageNeuralStore.getContainer(pageNeuralStore.activeContainerId);
    if (key === 'delete') {
      // 获取删除配置
      const toolbarItem = toolbarData.value[0].find((it) => it.key === 'delete');
      const message = getPlaceholderValue(
        activeContainer || {},
        toolbarItem?.deleteConfig?.message || ''
      );
      neuralConfirm({
        // target: event.currentTarget as HTMLElement,
        message,
        type: 'delete',
        confirm: () => {
          // 执行删除回调
          pageNeuralStore.onDelete?.('container');
        },
      });
      return;
    }

    openModal?.({
      key: `container.${key}`, // 只打开指定配置
      props: activeContainer?.props || {},
      nodeData: activeContainer as Record<string, any>,
      modalConfig: {
        component: 'dialog', // 对话框方式
        delete: {
          enable: false, // 不显示删除按钮
        },
        collapse: {
          enable: false, // 不显示手风琴按钮
        },
      },
    });
  }
</script>

<template>
  <NeuralToolbar
    v-if="pageNeuralStore.activeContainerId"
    :data="toolbarData"
    title="容器"
    @click="handleClick"
  />
</template>
