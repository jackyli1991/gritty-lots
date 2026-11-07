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
import type { Component, VNode } from 'vue';
import { ref, computed, defineComponent, h } from 'vue';

interface UserModalOptions {
  formMaps: Record<string, { formConfig: FormOptions; modalConfig: ModalOptions }>;
  store: PageNeuralStore;
  onShow?: (key: string) => void;
  onHide?: (key: string) => void;
}

interface OpenModalOptions {
  key: string; // 节点类型  格式为 'type[.subType]' 如果只有type 则显示全部formConfig.schema 如果有subType 则显示subType对应的formConfig.schema
  props?: Record<string, any>; // 节点props数据
  nodeData?: Record<string, any>; // 节点完整数据
  modalConfig?: Partial<ModalOptions>; // 自定义弹窗配置
  formConfig?: Partial<FormOptions>; // 自定义表单配置
}

// 单个弹窗实例的状态
interface ModalEntry {
  id: number; // 实例唯一标识，作为 vnode key 保证 Dialog 不被重建
  key: string; // 弹窗 key（openModal 传入的 key，同 key 复用同一实例）
  visible: boolean;
  nodeProps: Record<string, any>; // 节点props数据
  nodeFullData: Record<string, any>; // 节点完整数据
  selfModalConfig: Record<string, any>; // 自定义弹窗配置
  selfFormConfig: Partial<FormOptions>; // 自定义表单配置
  fieldSetCollapsable: boolean; // 表单手风琴模式控制变量
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
function getFormConfig(
  formConfig: FormOptions,
  selfFormConfig: Partial<FormOptions>,
  schemaName: string
) {
  const config = merge({}, formConfig, selfFormConfig);
  // lodash merge 会深拷贝普通对象，组件定义对象被克隆后引用发生变化，
  // 会让 h() 每次渲染都视为新的组件类型从而重新挂载面板，导致面板内部状态（如选中项）丢失，
  // 因此这里还原为原始组件引用
  config.connectedComponent = selfFormConfig.connectedComponent ?? formConfig.connectedComponent;
  if (!schemaName) return config;
  return {
    ...config,
    schema: config.schema.filter((item: any) => item.schemaName === schemaName),
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

function closeEntry(entry: ModalEntry, visible: boolean) {
  const timer = setTimeout(() => {
    entry.visible = visible;
    clearTimeout(timer);
  }, 100);
}

/**
 * 自定义弹窗组件
 * 支持同时打开多个弹窗：不同 key 的弹窗并存，相同 key 复用已有实例并更新数据
 * @param options 弹窗组件选项
 * @returns 弹窗组件实例
 */
export function useModal(options: UserModalOptions) {
  // 所有已打开的弹窗实例（含关闭动画进行中的）
  const modalEntries = ref<ModalEntry[]>([]);
  let modalSeq = 0;

  // 弹窗确认弹窗
  const { neuralConfirm } = useNeuralConfirm();

  // 关闭动画结束（after-hide）后移除实例，避免不可见 Dialog 堆积
  function removeEntry(entry: ModalEntry) {
    modalEntries.value = modalEntries.value.filter((item) => item.id !== entry.id);
  }

  // 渲染单个弹窗实例
  function renderModal(entry: ModalEntry): VNode | null {
    const [nodeKey, schemaName] = entry.key.split('.');
    const { formConfig, modalConfig } = options.formMaps[nodeKey];

    if (!modalConfig) {
      console.error('缺少弹窗载体配置【modalConfig】');
      return null;
    }

    if (!formConfig) {
      console.error('缺少表单配置【formConfig】');
      return null;
    }

    const { component, ...rest } = merge({}, modalConfig, entry.selfModalConfig);

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
    entry.fieldSetCollapsable = collapseConfig.defaultCollapsed ?? true;

    // 合并表单配置
    const formConfigMerge = getFormConfig(formConfig, entry.selfFormConfig, schemaName);

    // console.log('entry', entry);

    return h(
      component === 'drawer' ? Drawer : Dialog,
      {
        key: entry.id, // 稳定 key，避免弹窗列表重渲染时 Dialog/Drawer 被销毁重建
        ...defaultModalConfig[component as keyof typeof defaultModalConfig],
        ...rest,
        visible: entry.visible,
        'onUpdate:visible': (visible: boolean) => {
          closeEntry(entry, visible);
        },
        onShow: () => {
          options?.onShow?.(entry.key);
        },
        onHide: () => {
          options?.onHide?.(entry.key);
        },
        // hide 在 leave 动画开始时就触发，必须等 after-hide（动画结束）再移除实例，
        // 否则 Dialog 被立即卸载，关闭动画丢失
        onAfterHide: () => {
          removeEntry(entry);
        },
      },
      {
        default: () =>
          h(formConfigMerge.connectedComponent || NeuralForm, {
            // key 带上节点 id：切换节点/页面时重建表单实例，避免 PrimeVue Form 字段状态沿用上一个节点的旧值
            key: `form-${entry.key}-${(entry.nodeFullData as { id?: string })?.id ?? ''}`,
            data: entry.nodeProps,
            ...formConfigMerge,
            fieldSetCollapsable: entry.fieldSetCollapsable, // 非手风琴模式，全部可独立展开/折叠
            onSubmit: async (data: Record<string, any>) => {
              console.log('NeuralForm.onSubmit', data);
              if (formConfigMerge.autoComplete) {
                // 自动完成模式下，直接更新节点props数据
                Object.assign(entry.nodeProps, data);
              } else {
                // 非自动模式下，调用回调函数处理提交数据
                await formConfigMerge?.onSubmit?.(data, entry.key);
              }
              closeEntry(entry, false);
            },
            onClose: () => {
              closeEntry(entry, false);
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
                        modelValue: entry.fieldSetCollapsable,
                        'onUpdate:modelValue': (val: boolean) => {
                          entry.fieldSetCollapsable = val;
                        },
                      },
                      {
                        icon: () => {
                          return h(NeuralIcon, {
                            name: entry.fieldSetCollapsable ? 'ListCollapse' : 'List',
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
                    const message = getPlaceholderValue(entry.nodeFullData, deleteConfig.message);
                    neuralConfirm({
                      target: event.currentTarget as HTMLElement,
                      message,
                      type: 'delete',
                      confirm: async () => {
                        // 执行删除回调
                        await options.store?.onDelete?.(entry.key);
                        // 关闭弹窗
                        closeEntry(entry, false);
                      },
                    });
                  },
                }),
            ]
          ),
      }
    );
  }

  // 弹窗列表容器：组件引用保持稳定，内部渲染函数依赖响应式 modalEntries，
  // 弹窗增删或 visible 变化时按需重渲染，避免 h() 产出的静态 VNode 固化状态
  const ModalList = defineComponent({
    name: 'NeuralModalList',
    setup: () => () => modalEntries.value.map((entry) => renderModal(entry)),
  });

  // 无弹窗时返回 null，模板中 <component :is="ModalEl" /> 不渲染任何内容
  const ModalEl = computed<Component | null>(() => (modalEntries.value.length ? ModalList : null));

  /**
   * 节点配置弹窗打开方法
   * 相同 key 复用已有实例（更新数据并重新显示），不同 key 新建实例并存
   */
  function openModal({ key, props, nodeData, modalConfig, formConfig }: OpenModalOptions) {
    const existing = modalEntries.value.find((item) => item.key === key);
    if (existing) {
      existing.nodeProps = props || {};
      existing.nodeFullData = nodeData || {};
      existing.selfModalConfig = modalConfig || {};
      existing.selfFormConfig = formConfig || {};
      existing.visible = true;
      return;
    }

    modalEntries.value.push({
      id: ++modalSeq,
      key,
      visible: true,
      nodeProps: props || {},
      nodeFullData: nodeData || {},
      selfModalConfig: modalConfig || {},
      selfFormConfig: formConfig || {},
      fieldSetCollapsable: true,
    });
  }

  return {
    openModal,
    ModalEl,
  };
}

export type OpenModal = ({ key, props, nodeData, modalConfig }: OpenModalOptions) => void;
