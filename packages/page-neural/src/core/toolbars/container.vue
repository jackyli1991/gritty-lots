<script setup lang="ts">
// import { ref } from 'vue';
import type { ToolbarItem } from '@neural/components/toolbar';
import { NeuralToolbar } from '@neural/components';
import { invokeAction, type ActionTree, type Paths } from '@neural/utils/action';
import { useNeuralConfirm } from '@neural/core/confirmDialog.vue';
import { useNeuralToast } from '@neural/composables/useToast';
import { useModal } from '@neural/composables/userModal';
import { usePageNeuralStore } from '@neural/store';
import { CONTAINER_ROOT_ID } from '@neural/const';
import { formMaps } from '@neural/core/forms';

const { neuralConfirm } = useNeuralConfirm();
const { neuralToastWarning } = useNeuralToast();
const pageNeuralStore = usePageNeuralStore();

const { openModal, ModalEl } = useModal({
  formMaps,
});

const toolbarData: ToolbarItem[][] = [
  [
    { label: '设置', icon: 'Settings2', key: 'container.setting' },
    { label: '复制', icon: 'Copy', key: 'container.copy' },
    { label: '删除', icon: 'Trash2', key: 'container.delete.confirm' },
  ],
];

const actions = {
  container: {
    setting: () => {
      const activeContainer = pageNeuralStore.getContainer(pageNeuralStore.activeNodeId);
      // console.log('activeContainer', activeContainer);
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
} satisfies ActionTree;

function handleClick(key: string) {
  invokeAction(actions, key as Paths<typeof actions>);
}

</script>

<template>
  <NeuralToolbar :data="toolbarData" @click="handleClick" />
  <component :is="ModalEl" />
</template>