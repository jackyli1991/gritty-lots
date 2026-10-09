<script lang="ts">
  // import { useToast } from "primevue/usetoast";
  import { NeuralIcon } from '@neural/components';
  import { useConfirm } from 'primevue/useconfirm';
  import { h } from 'vue';

  interface ConfirmOptions {
    message: string; // 确认消息
    header?: string; // 确认标题
    type?: 'info' | 'alert' | 'delete'; // 确认类型
    confirmText?: string; // 确认按钮文本
    cancelText?: string; // 取消按钮文本
    confirm?: () => void; // 确认回调
    reject?: () => void; // 拒绝回调
  }

  const IconMaps = {
    info: 'Info',
    alert: 'TriangleAlert',
    danger: 'TriangleAlert',
    delete: 'Trash2',
  };

  export function useNeuralConfirm() {
    const confirm = useConfirm();

    function neuralConfirm(options: ConfirmOptions) {
      confirm.require({
        message: options.message,
        header: options.header || '确认',
        icon: h(NeuralIcon, { name: IconMaps[options.type || 'info'] }),
        rejectProps: {
          label: options.cancelText || '取消',
          severity: 'secondary',
          outlined: true,
          size: 'small',
        },
        acceptProps: {
          label: options.confirmText || '确认',
        },
        accept: () => {
          options.confirm?.();
        },
        reject: () => {
          options.reject?.();
        },
      });
    }

    return {
      neuralConfirm,
    };
  }
</script>

<script setup lang="ts">
  import ConfirmDialog from 'primevue/confirmdialog';
</script>

<template>
  <ConfirmDialog
    :pt="{
      root: {
        class: 'min-w-sm',
      },
      icon: {
        class: 'size-5!',
      },
      header: {
        class: 'p-3!',
      },
      content: {
        class: 'pl-3! pr-3! pb-3!',
      },
      footer: {
        class: 'pl-3! pr-3! pb-3!',
      },
    }"
  ></ConfirmDialog>
</template>
