import type { FormItemProps } from '@neural/components/form';
import type { OpenModal } from '@neural/composables/userModal';
import MethodTag from '@neural/core/components/MethodTag.vue';
// import requestFormConfig from '@neural/core/forms/request';
import { createRequest } from '@neural/core/forms/request';
import { usePageNeuralStore } from '@neural/store';
import type { DataSource } from '@neural/types';
import { generateId } from '@neural/utils';
import Button from 'primevue/button';
import Select from 'primevue/select';
import { h, inject } from 'vue';
import { z } from 'zod';

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

/**
 * 数据源提示：tips 使用渲染函数，才能在组件渲染上下文中执行 inject
 * 拿到 core/index.vue 通过 provide('neural-modal') 注入的 openModal
 */
function dataSourceTips() {
  const openModal = inject<OpenModal | null>('neural-modal', null);
  return h('div', {}, [
    h('span', {}, '选择已有的数据源。如果没有，请先'),
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

/** 类型徽标样式 */
const typeBadgeClass =
  'rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-300';

// 数据源下拉选择框
const dataBaseSelect = h(
  Select,
  {},
  {
    // value 作用域插槽：选中项回显依次显示 name、type、method、url、json（单行截断）
    value: (scope: { value: any; placeholder: string }) => {
      // optionValue 为 id，插槽拿到的是 id，需反查对应数据源对象
      const dataSource = usePageNeuralStore().dataSources.find((item) => item.id === scope.value);
      // 未选中或数据源已被删除时显示占位符
      if (!dataSource) {
        return [
          h('span', { class: 'text-gray-400 dark:text-gray-500' }, scope.placeholder || '请选择'),
        ];
      }
      return [
        h('div', { class: 'flex min-w-0 items-center gap-2' }, [
          h(
            'span',
            { class: 'text-sm font-medium text-gray-800 dark:text-gray-100' },
            dataSource.name
          ),
          h('span', { class: typeBadgeClass }, dataSource.type?.toUpperCase()),
          dataSource.method ? h(MethodTag, { method: dataSource.method }) : null,
          dataSource.url
            ? h(
                'span',
                {
                  class: 'truncate font-mono text-xs text-gray-400 dark:text-gray-500',
                },
                dataSource.url
              )
            : null,
          dataSource.type === 'json' && dataSource.json
            ? h(
                'span',
                {
                  class: 'truncate font-mono text-xs text-gray-400 dark:text-gray-500',
                },
                dataSource.json
              )
            : null,
        ]),
      ];
    },
    // option 作用域插槽：渲染数据源详细信息（名称、类型、method、url）
    option: (scope: { option: DataSource }) => [
      h('div', { class: 'flex min-w-0 flex-col gap-1 py-1' }, [
        // 名称 + 类型徽标
        h('div', { class: 'flex items-center gap-2' }, [
          h(
            'span',
            { class: 'text-sm font-medium text-gray-800 dark:text-gray-100' },
            scope.option.name
          ),
          h('span', { class: typeBadgeClass }, scope.option.type?.toUpperCase()),
        ]),
        // 第二行：http 类型显示 method 徽标 + url；json 类型显示 JSON 字符串（单行截断）
        h('div', { class: 'flex max-w-[500px] items-center gap-2' }, [
          scope.option.method ? h(MethodTag, { method: scope.option.method }) : null,
          (scope.option.type === 'json' ? scope.option.json : scope.option.url)
            ? h(
                'span',
                {
                  class: 'truncate font-mono text-xs text-gray-400 dark:text-gray-500',
                },
                scope.option.type === 'json' ? scope.option.json : scope.option.url
              )
            : null,
        ]),
      ]),
    ],
  }
);

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
        component: 'NeuralForm',
        class: 'col-span-full',
        componentProps: {
          columns: 1,
          rules: z.object({
            sourceId: z.string('数据源不能为空'),
          }),
          schema: [
            {
              label: '启用',
              fieldName: 'enable',
              component: 'ToggleSwitch',
              class: 'col-span-full',
              componentProps: {},
              help: [],
            },
            {
              label: '数据源',
              fieldName: 'sourceId',
              component: 'Select',
              renderComponent: dataBaseSelect,
              class: 'col-span-full',
              componentProps: {
                optionValue: 'id',
                optionLabel: 'name',
                emptyMessage: '暂无数据源',
                placeholder: '请选择数据源',
                showClear: true,
                // 延迟到渲染阶段读取 store：模型模块会在 app.use(pinia) 之前被加载
                get options() {
                  return usePageNeuralStore().dataSources;
                },
              },
              help: [],
              tips: dataSourceTips,
              dependencies: {
                trigger: ['enable'],
                resolve: ({ values }: { values: Record<string, any> }) => ({
                  required: values.enable, // 启用时必填
                }),
              },
            },
            {
              label: '请求参数',
              fieldName: 'params',
              component: 'ObjectEditor',
              class: 'col-span-full',
              componentProps: {
                placeholder: '请求参数',
              },
              help: [],
              required: false,
              dependencies: {
                trigger: ['sourceId'],
                resolve: ({ values }: { values: Record<string, any> }) => {
                  const sourceId = values.sourceId;
                  const dataSource = usePageNeuralStore().dataSources.find(
                    (item) => item.id === sourceId
                  );
                  const hidden = !sourceId || dataSource?.type === 'json';
                  return {
                    hidden,
                  };
                },
              },
            },
          ],
        },
        help: [],
        ...options,
      },
    ],
  } as FormItemProps;
}

const model = {
  enable: false,
  sourceId: '',
  params: {},
};

export default {
  getForm,
  model,
};
