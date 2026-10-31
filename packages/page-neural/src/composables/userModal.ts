import { NeuralForm, NeuralIcon } from '@neural/components';
import { useNeuralConfirm } from '@neural/core/confirmDialog.vue';
import type { PageNeuralStore } from '@neural/store';
import type { ModalOptions, FormOptions } from '@neural/types';
import { getPlaceholderValue } from '@neural/utils';
import { merge } from 'lodash-es';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Drawer from 'primevue/drawer';
import ToggleButton from 'primevue/togglebutton';
import type { Component } from 'vue';
import { ref, computed, h } from 'vue';

interface UserModalOptions {
  formMaps: Record<string, { formConfig: FormOptions; modalConfig: ModalOptions }>;
  store: PageNeuralStore;
  onShow?: (key: string) => void;
  onHide?: (key: string) => void;
}

interface OpenModalOptions {
  key: string; // 节点类型  格式为 'type[.subType]' 如果只有type 则显示全部formConfig.schema 如果有subType 则显示subType对应的formConfig.schema
  props: Record<string, any>; // 节点props数据
  nodeData: Record<string, any>; // 节点完整数据
  modalConfig?: Partial<ModalOptions>; // 自定义弹窗配置
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

// 从formConfig中根据nodeKeys获取对应的schema
function getFormConfig(formConfig: FormOptions, schemaName: string) {
  if (!schemaName) return formConfig;
  return {
    ...formConfig,
    schema: formConfig.schema.filter((item: any) => item.schemaName === schemaName),
  };
}

function getModalHeader(
  modalConfig: Omit<ModalOptions, 'component'>,
  formConfig: FormOptions,
  schemaName: string
) {
  let title = modalConfig.header || '配置';
  if (!schemaName) return title;
  const schema = formConfig.schema.find((item: any) => item.schemaName === schemaName);
  return schema?.label ? `${title} - ${schema.label}` : title;
}

/**
 * 自定义弹窗组件
 * @param options 弹窗组件选项
 * @returns 弹窗组件实例
 */
export function useModal(options: UserModalOptions) {
  const modalVisible = ref(false);
  const modalKey = ref<string>('');
  const nodeProps = ref<Record<string, any>>({}); // 节点props数据
  const nodeFullData = ref<Record<string, any>>({}); // 节点完整数据
  const selfModalConfig = ref<Record<string, any>>({}); // 自定义弹窗配置

  // 表单手风琴模式控制变量
  const formFieldSetCollapsable = ref(true);

  // 弹窗确认弹窗
  const { neuralConfirm } = useNeuralConfirm();

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
    const [nodeKey, schemaName] = modalKey.value.split('.');
    const { formConfig, modalConfig } = options.formMaps[nodeKey];

    if (!modalConfig) {
      console.error('缺少弹窗载体配置【modalConfig】');
      return null;
    }

    if (!formConfig) {
      console.error('缺少表单配置【formConfig】');
      return null;
    }

    const { component, ...rest } = merge({}, modalConfig, selfModalConfig.value);

    // 删除按钮配置
    const deleteConfig = {
      enable: false,
      message: '确认删除吗？',
      label: '删除',
      ...rest.delete,
    };

    // 手风琴模式配置
    const collapseConfig = {
      enable: false,
      defaultCollapsed: true,
      ...rest.collapse,
    };

    // 表单手风琴模式，取配置值
    formFieldSetCollapsable.value = collapseConfig.defaultCollapsed ?? true;

    return h(
      component === 'drawer' ? Drawer : Dialog,
      {
        key: modalKey.value, // 稳定 key，避免 computed 重算时 Dialog/Drawer 被销毁重建
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
            key: `form-${modalKey.value}`, // 表单实例复用避免重建
            data: nodeProps.value,
            ...getFormConfig(formConfig, schemaName),
            fieldSetCollapsable: formFieldSetCollapsable.value, // 非手风琴模式，全部可独立展开/折叠
            onSubmit: (data: Record<string, any>) => {
              console.log('提交数据', data);
              Object.assign(nodeProps.value, data);
              closeModal(false);
            },
            onClose: () => {
              closeModal(false);
            },
          }),
        header: () =>
          h(
            'div',
            {
              class: 'w-full flex justify-between items-center',
            },
            [
              h(
                'div',
                {
                  class: 'flex items-center gap-2',
                },
                [
                  h(
                    'span',
                    { class: 'text-sm font-bold' },
                    getModalHeader(rest, formConfig, schemaName)
                  ),
                  collapseConfig.enable &&
                    h(
                      ToggleButton,
                      {
                        size: 'small',
                        onLabel: '风琴模式',
                        offLabel: '风琴模式',
                        modelValue: formFieldSetCollapsable.value,
                        'onUpdate:modelValue': (val: boolean) => {
                          formFieldSetCollapsable.value = val;
                        },
                      },
                      {
                        icon: () => {
                          return h(NeuralIcon, {
                            name: formFieldSetCollapsable.value ? 'ListCollapse' : 'List',
                          });
                        },
                      }
                    ),
                ]
              ),
              deleteConfig.enable &&
                h(Button, {
                  severity: 'danger',
                  variant: 'outlined',
                  size: 'small',
                  label: deleteConfig.label || '删除',
                  onClick: (event) => {
                    // 消息中的 {{path}} 占位符替换为节点完整数据中的对应值
                    // 例如：'确认删除【{{props.boxModel.width}}】吗？' → '确认删除【100】吗？'
                    const message = getPlaceholderValue(nodeFullData.value, deleteConfig.message);
                    neuralConfirm({
                      target: event.currentTarget as HTMLElement,
                      message,
                      type: 'delete',
                      confirm: async () => {
                        // 执行删除回调
                        await options.store?.onDelete?.(modalKey.value);
                        // 关闭弹窗
                        closeModal(false);
                      },
                    });
                  },
                }),
            ]
          ),
      }
    );
  });

  /**
   * 节点配置弹窗打开方法
   */
  function openModal({ key, props, nodeData, modalConfig }: OpenModalOptions) {
    modalKey.value = key;
    nodeProps.value = props;
    nodeFullData.value = nodeData;
    selfModalConfig.value = modalConfig || {};
    modalVisible.value = true;
  }

  return {
    openModal,
    ModalEl,
  };
}

export type OpenModal = ({ key, props, nodeData, modalConfig }: OpenModalOptions) => void;
