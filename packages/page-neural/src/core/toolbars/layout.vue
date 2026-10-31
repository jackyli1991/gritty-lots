<script setup lang="ts">
  import { NeuralToolbar } from '@neural/components';
  import type { ToolbarItem } from '@neural/components/toolbar';
  import { useNeuralToast } from '@neural/composables/useToast';
  import { useNeuralConfirm } from '@neural/core/confirmDialog.vue';
  import { usePageNeuralStore } from '@neural/store';
  import { useLayoutStore } from '@neural/store/layout';
  import { invokeAction, type ActionTree, type Paths } from '@neural/utils';
  import { computed } from 'vue';
  const { neuralToastSuccess } = useNeuralToast();

  const pageNeuralStore = usePageNeuralStore();
  const layoutStore = useLayoutStore();
  const { neuralConfirm } = useNeuralConfirm();

  // 根据当前页面的布局锁定状态决定显示「锁定布局」还是「编辑布局」
  const toolbarData = computed<ToolbarItem[][]>(() => [
    [
      {
        label: '锁定布局',
        icon: 'Lock',
        key: 'lockLayout',
        hidden: layoutStore.locked,
      },
      {
        label: '编辑布局',
        icon: 'SquarePen',
        key: 'unlockLayout',
        hidden: !layoutStore.locked,
      },
    ],
  ]);

  const actions = {
    // 锁定布局
    lockLayout: () => {
      pageNeuralStore.setLayoutLock(true);
      neuralToastSuccess('已锁定');
      pageNeuralStore.ensureLayoutContainers();
    },
    // 解锁布局
    unlockLayout: () => {
      neuralConfirm({
        message: '解锁后可重新编辑布局，是否继续？',
        header: '编辑布局',
        type: 'alert',
        confirm: () => {
          pageNeuralStore.setLayoutLock(false);
          neuralToastSuccess('已解锁', '可以重新编辑布局');
        },
        reject: () => {},
      });
    },
  } satisfies ActionTree;

  function handleClick(key: string) {
    invokeAction(actions, key as Paths<typeof actions>);
  }
</script>

<template>
  <NeuralToolbar :data="toolbarData" showLabel @click="handleClick" />
</template>
