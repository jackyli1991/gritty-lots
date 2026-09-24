import { NeuralForm } from '@neural/components';
import type { ModalOptions, FormOptions } from '@neural/types';
import Dialog from 'primevue/dialog';
import Drawer from 'primevue/drawer';
import type { Component } from 'vue';
import { ref, computed, h } from 'vue';

interface UserModalOptions {
  formMaps: Record<string, { formConfig: FormOptions; modalConfig: ModalOptions }>;
  onShow?: (key: string) => void;
  onHide?: (key: string) => void;
}

// 默认弹窗配置
const defaultModalConfig = {
  // 抽屉draw
  drawer: {
    position: 'right',
    showCloseIcon: true,
    class: '!w-[32rem]',
    pt: {
      header: {
        class: 'py-2!',
      },
      title: {
        class: 'text-sm!',
      },
    },
  },
  // 弹窗dialog
  dialog: {
    position: 'center',
    showCloseIcon: true,
    modal: true,
    class: '!w-[50%]',
    dismissableMask: true,
    pt: {
      header: {
        class: 'py-2!',
      },
      title: {
        class: 'text-sm!',
      },
    },
  },
};

/**
 * 自定义弹窗组件
 * @param options 弹窗组件选项
 * @returns 弹窗组件实例
 */
export function useModal(options: UserModalOptions) {
  const modalVisible = ref(false);
  const modalKey = ref<string>('');
  const formData = ref<Record<string, any>>({});

  function closeModal(visible: boolean) {
    const timer = setTimeout(() => {
      modalVisible.value = visible;
      clearTimeout(timer);
    }, 100);
  }

  // 使用 computed 让 VNode 随 modalVisible 响应式重建，
  // 否则 h() 产出的静态 VNode 会把 visible 固化，导致关闭事件无法回写到组件
  const ModalEl = computed<Component | null>(() => {
    if (!modalKey.value) return null;
    const { formConfig, modalConfig } = options.formMaps[modalKey.value];

    if (!modalConfig) {
      console.error('缺少弹窗载体配置【modalConfig】');
      return null;
    }

    if (!formConfig) {
      console.error('缺少表单配置【formConfig】');
      return null;
    }

    const { component, ...rest } = modalConfig;

    return h(
      component === 'drawer' ? Drawer : Dialog,
      {
        ...defaultModalConfig[component as keyof typeof defaultModalConfig],
        ...rest,
        visible: modalVisible.value,
        'onUpdate:visible': (visible: boolean) => {
          closeModal(visible);
        },
        onShow: () => {
          options?.onShow?.(modalKey.value);
        },
        onHide: () => {
          options?.onHide?.(modalKey.value);
        },
      },
      {
        default: () =>
          h(NeuralForm, {
            data: formData.value,
            ...formConfig,
            onSubmit: (data: Record<string, any>) => {
              console.log('提交数据', data);
              Object.assign(formData.value, data);
              closeModal(false);
            },
            onClose: () => {
              closeModal(false);
            },
          }),
      }
    );
  });

  function openModal(key: string, data: Record<string, any>) {
    modalKey.value = key;
    formData.value = data;
    modalVisible.value = true;
  }

  return {
    openModal,
    ModalEl,
  };
}
