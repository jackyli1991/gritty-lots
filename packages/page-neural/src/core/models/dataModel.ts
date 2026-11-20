import type { FormItemProps } from '@neural/components/form';
import type { OpenModal } from '@neural/composables/userModal';
// import requestFormConfig from '@neural/core/forms/request';
import { createRequest } from '@neural/core/forms/request';
import { usePageNeuralStore } from '@neural/store';
import type { DataSource } from '@neural/types';
import { generateId } from '@neural/utils';
import Button from 'primevue/button';
import { h, inject } from 'vue';

/** 数据模型的获取方式，与 fetch.ts 保持一致 */
export type DataModelMode = 'reference' | 'source' | 'custom';

/** 数据模型配置的扁平字段（共享定义，避免 fetch ↔ store 循环依赖） */
export interface DataModelOptions {
  /** 获取方式；缺省时按已有字段推断 */
  mode?: DataModelMode;
  /** 引用模式：来源页面 / 容器 / 节点 id */
  referenceId?: string;
  /** 数据源模式：数据源 id */
  sourceId?: string;
  /** 数据源模式：请求参数 */
  params?: Record<string, string>;
  /** 引用 / 数据源模式：响应字段路径 */
  responseField?: string;
  /** 自定义模式：JSON 字符串 */
  customJson?: string;
}

/** 添加数据源 */
function handleAddDataSource(openModal: OpenModal | null) {
  const requestForm = createRequest();
  openModal?.({
    key: 'request',
    props: requestForm,
    formConfig: {
      submitText: '新增',
      onSubmit: (data: DataSource) => {
        const dataSource: DataSource = {
          id: generateId('d'),
          ...data,
        };
        usePageNeuralStore().addDataSource(dataSource);
      },
    },
  });
}

// 打开数据源弹窗
function openDataSourceModal(openModal: OpenModal | null) {
  openModal?.({
    key: 'database',
    props: {},
    nodeData: {},
  });
}

/**
 * 数据源提示：tips 使用渲染函数，才能在组件渲染上下文中执行 inject
 * 拿到 core/index.vue 通过 provide('neural-modal') 注入的 openModal
 */
function dataSourceTips(slotScope: any) {
  const openModal = inject<OpenModal | null>('neural-modal', null);
  const mode = slotScope.field.value.mode;
  if (mode === 'reference')
    return h('div', {}, [
      h('div', {}, '1、引用页面/容器/组件的已有数据；'),
      h('div', {}, '2、不应用引用源的responseField解析字段，如需指定字段，可自定义responseField。'),
    ]);
  if (mode === 'custom')
    return h('div', {}, '自定义模式，需要手动输入 JSON 数据，当前配置项独享。');
  return h('div', {}, [
    h('span', {}, '选择'),
    h(
      Button,
      {
        security: 'primary',
        variant: 'text',
        size: 'small',
        onClick: () => openDataSourceModal(openModal),
      },
      { default: () => '已有的数据源' }
    ),
    h('span', {}, '。如果没有，请先'),
    h(
      Button,
      {
        security: 'primary',
        variant: 'text',
        size: 'small',
        onClick: () => handleAddDataSource(openModal),
      },
      { default: () => '添加' }
    ),
  ]);
}

function getForm(options: Record<string, any>): FormItemProps {
  return {
    label: '数据源',
    formGroup: true,
    component: 'Fieldset',
    icon: 'Database',
    children: [
      {
        label: '',
        fieldName: 'dataModel',
        component: 'DataSourcePicker',
        class: 'col-span-full',
        componentProps: {},
        help: [],
        tips: dataSourceTips,
        ...options,
      },
    ],
  };
}

const model: DataModelOptions = {
  mode: 'source',
  referenceId: '',
  sourceId: '',
  params: {},
  responseField: '',
  customJson: '',
};

export default {
  getForm,
  model,
};
