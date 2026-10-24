<script setup lang="ts">
  import { NeuralToolbar } from '@neural/components';
  import type { ToolbarItem } from '@neural/components/toolbar';
  import { useNeuralToast } from '@neural/composables/useToast';
  import { useNeuralConfirm } from '@neural/core/confirmDialog.vue';
  import { usePageNeuralStore } from '@neural/store';
  import { invokeAction, type ActionTree, type Paths } from '@neural/utils/action';
  import { computed } from 'vue';
  const { neuralToastSuccess } = useNeuralToast();

  const pageNeuralStore = usePageNeuralStore();
  const { neuralConfirm } = useNeuralConfirm();

  // 根据当前页面的布局锁定状态决定显示「锁定布局」还是「编辑布局」
  const toolbarData = computed<ToolbarItem[][]>(() => [
    [
      {
        label: '锁定布局',
        icon: 'Lock',
        key: 'lockLayout',
        hidden: !!pageNeuralStore.activePage?.layoutLock,
      },
      {
        label: '编辑布局',
        icon: 'Unlock',
        key: 'unlockLayout',
        hidden: !pageNeuralStore.activePage?.layoutLock,
      },
    ],
  ]);

  const actions = {
    // 锁定布局
    lockLayout: () => {
      pageNeuralStore.setLayoutLock(true);
      neuralToastSuccess('布局已锁定', '成功');
    },
    // 解锁布局
    unlockLayout: () => {
      neuralConfirm({
        message: '解锁后可重新编辑布局，是否继续？',
        header: '解锁',
        type: 'alert',
        confirm: () => {
          pageNeuralStore.setLayoutLock(false);
          neuralToastSuccess('布局已解锁，可以重新编辑布局', '成功');
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
  <NeuralToolbar :data="toolbarData" @click="handleClick" />
</template>
