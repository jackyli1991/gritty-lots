import type { FormItemProps } from '@neural/components/form';
import ColumnAttrs from '@neural/core/attrs/container/table-column.vue';
import type { TableModelValue } from '@neural/types/table';
import { z } from 'zod';

const schema: FormItemProps[] = [
  {
    fieldName: '',
    label: '',
    showLabel: false,
    component: 'Divider',
    class: 'col-span-full',
    componentProps: {
      text: '表格基础',
    },
  },
  {
    fieldName: 'size',
    label: '尺寸',
    component: 'SelectButton',
    componentProps: {
      optionLabel: 'label',
      optionValue: 'value',
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
  {
    fieldName: '',
    label: '',
    showLabel: false,
    component: 'Divider',
    class: 'col-span-full',
    componentProps: {
      text: '表格列',
    },
  },
  {
    fieldName: 'columns',
    label: '',
    showLabel: false,
    class: 'col-span-full',
    renderComponent: ColumnAttrs,
    componentProps: {},
  },
  {
    fieldName: '',
    label: '',
    showLabel: false,
    component: 'Divider',
    class: 'col-span-full',
    componentProps: {
      text: '表格分页',
    },
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
  return {
    size: 'medium',
    showGridlines: false,
    stripedRows: false,
    emptyText: '暂无数据',
    emptyCellPlaceholder: '-',
    columns: [],
  };
}
