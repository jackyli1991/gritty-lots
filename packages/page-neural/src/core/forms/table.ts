import type { FormItemProps } from '@neural/components/form';
import TableActionAttrs from '@neural/core/attrs/container/table-action.vue';
import TableColumnAttrs from '@neural/core/attrs/container/table-column.vue';
import { tableColumnSchema, createTableColumn } from '@neural/core/forms/table-column';
import type { TableModelValue } from '@neural/types/table';
import { z } from 'zod';

const excludeFields = ['type', 'field', 'sortable'];

const schema: FormItemProps[] = [
  {
    label: '表格配置',
    formGroup: true,
    component: 'Panel',
    class: 'col-span-full',
    children: [
      {
        fieldName: 'size',
        label: '尺寸',
        component: 'SelectButton',
        componentProps: {
          options: [
            { label: '小', value: 'small' },
            { label: '中', value: 'medium' },
            { label: '大', value: 'large' },
          ],
        },
      },
      {
        fieldName: 'showGridlines',
        label: '显示网格线',
        component: 'ToggleSwitch',
        componentProps: {},
      },
      {
        fieldName: 'stripedRows',
        label: '斑马行',
        component: 'ToggleSwitch',
        componentProps: {},
      },
      {
        fieldName: 'emptyText',
        label: '空数据提示',
        component: 'Input',
        componentProps: {},
      },
      {
        fieldName: 'emptyCellPlaceholder',
        label: '数据缺省占位',
        component: 'Input',
        componentProps: {},
        tips: '表格单元格数据为空时的占位符',
      },
    ],
  },
  {
    label: '表格列',
    formGroup: true,
    component: 'Panel',
    children: [
      {
        fieldName: 'columns',
        label: '',
        showLabel: false,
        class: 'col-span-full',
        renderComponent: TableColumnAttrs,
        componentProps: {},
      },
    ],
  },
  {
    label: '表格操作',
    formGroup: true,
    component: 'Panel',
    children: [
      {
        fieldName: 'actionColumnConfig',
        label: '',
        showLabel: false,
        component: 'NeuralForm',
        class: 'col-span-full',
        componentProps: {
          schema: [
            {
              fieldName: 'enable',
              label: '启用',
              component: 'ToggleSwitch',
              componentProps: {},
            },
            // 使用表格列配置中的属性，移除部分字段
            ...tableColumnSchema.filter((item) => !excludeFields.includes(item.fieldName || '')),
            {
              fieldName: 'showActionCount',
              label: '展示按钮数量',
              component: 'InputNumber',
              componentProps: {
                min: 1,
              },
              tips: '最多显示的按钮数量，超出时【更多】下拉显示',
            },
          ],
          columns: 2,
          rules: z.object({
            showActionCount: z.number().min(1, '展示按钮数量不能小于1'),
          }),
        },
      },
      {
        fieldName: 'actionBtns',
        label: '',
        showLabel: false,
        renderComponent: TableActionAttrs,
        class: 'col-span-full',
        componentProps: {},
      },
    ],
  },
  {
    label: '表格分页',
    formGroup: true,
    component: 'Panel',
    children: [
      {
        fieldName: 'pagination',
        label: '启用分页',
        component: 'ToggleSwitch',
        componentProps: {},
      },
    ],
  },
];

const rules = z.object({
  size: z.string('请选择尺寸').min(1),
});

export default {
  // 表单配置
  formConfig: {
    schema,
    rules,
    columns: 2,
  },
  // 弹窗配置
  // modalConfig: {
  //   header: '表格配置',
  //   component: 'dialog',
  //   class: 'w-[50vw]',
  // },
};

/**
 * 创建表格表单模型
 */
export function createTable(): TableModelValue {
  // 操作列默认配置
  const column = createTableColumn('action');
  column.title = '操作';
  column.fixed = 'right';
  column.width = 100;
  column.align = 'center';

  return {
    size: 'medium',
    showGridlines: false,
    stripedRows: false,
    emptyText: '暂无数据',
    emptyCellPlaceholder: '-',
    columns: [],
    // 操作列配置仅保留渲染所需的列属性，与 TableModelValue.actionColumnConfig 的 Pick 类型保持一致
    actionColumnConfig: {
      id: column.id,
      title: column.title,
      width: column.width,
      align: column.align,
      fixed: column.fixed,
      showActionCount: 2,
      enable: true,
    },
    actionBtns: [],
  };
}
