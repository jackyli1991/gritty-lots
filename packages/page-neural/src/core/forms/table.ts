import type { FormItemProps } from '@neural/components/form';
import TableActionAttrs from '@neural/core/attrs/container/table-action.vue';
import TableColumnAttrs from '@neural/core/attrs/container/table-column.vue';
import { tableColumnSchema, createTableColumn } from '@neural/core/forms/table-column';
import {
  rowsPerPageOptions,
  paginatorTemplateOptions,
  paginatorPositionOptions,
} from '@neural/data/options';
import type { TableModelValue } from '@neural/types/table';
import { z } from 'zod';

const excludeFields = ['type', 'field', 'sortable'];

const schema: FormItemProps[] = [
  {
    label: '表格配置',
    formGroup: true,
    component: 'Panel',
    children: [
      {
        fieldName: 'size',
        label: '尺寸',
        component: 'SelectButton',
        class: 'col-span-2',
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
        class: 'col-span-2',
        componentProps: {},
      },
      {
        fieldName: 'stripedRows',
        label: '斑马行',
        component: 'ToggleSwitch',
        class: 'col-span-2',
        componentProps: {},
      },
      {
        fieldName: 'emptyText',
        label: '空数据提示',
        component: 'Input',
        class: 'col-span-2',
        componentProps: {},
      },
      {
        fieldName: 'emptyCellPlaceholder',
        label: '数据缺省占位',
        component: 'Input',
        class: 'col-span-2',
        componentProps: {},
        tips: '表格单元格数据为空时的占位符',
      },
    ],
  },
  {
    label: '数据列',
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
    label: '操作列',
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
    label: '分页',
    formGroup: true,
    component: 'Panel',
    children: [
      {
        fieldName: 'paginator',
        label: '启用',
        component: 'ToggleSwitch',
        componentProps: {},
      },
      {
        fieldName: 'alwaysShowPaginator',
        label: '始终显示',
        component: 'ToggleSwitch',
        componentProps: {},
        help: ['关闭后，分页器仅在页数超过1时显示。'],
      },
      {
        fieldName: 'rows',
        label: '默认每页数量',
        component: 'InputNumber',
        class: 'col-span-2',
        componentProps: {
          min: 10,
          max: 100,
        },
      },
      {
        fieldName: 'paginatorPosition',
        label: '位置',
        component: 'Select',
        class: 'col-span-2',
        componentProps: {
          allowEmpty: false,
          options: paginatorPositionOptions,
        },
      },
      {
        fieldName: 'totalField',
        label: '总页数字段',
        component: 'InputText',
        class: 'col-span-2',
        componentProps: {
          placeholder: '取数据源中的字段',
        },
      },
      {
        fieldName: 'paginatorTemplate',
        label: '分页器模板',
        component: 'Select',
        class: 'col-span-full',
        componentProps: {
          multiple: true,
          checkmark: true,
          options: paginatorTemplateOptions,
        },
      },
      {
        fieldName: 'pageLinkSize',
        label: '显示页码数量',
        component: 'InputNumber',
        class: 'col-span-2',
        componentProps: {
          min: 1,
          max: 20,
        },
        dependencies: {
          trigger: ['paginatorTemplate'],
          resolve: ({ values }: { values: Record<string, any> }) => ({
            hidden: !values.paginatorTemplate.includes(2), // 模板中包含页码时可配置显示数量
          }),
        },
      },
      {
        fieldName: 'rowsPerPageOptions',
        label: '每页数量选项',
        component: 'Select',
        class: 'col-span-2',
        componentProps: {
          multiple: true,
          checkmark: true,
          options: rowsPerPageOptions,
        },
        dependencies: {
          trigger: ['paginatorTemplate'],
          resolve: ({ values }: { values: Record<string, any> }) => ({
            hidden: !values.paginatorTemplate.includes(5), // 模板中包含每页数量选项时可配置显示数量
          }),
        },
      },
      {
        fieldName: 'currentPageReportTemplate',
        label: '自定义信息模板',
        component: 'FieldsSelect',
        class: 'col-span-full',
        componentProps: {
          placeholder: '配置模板',
          selectionMode: 'multiple', // 可以选择多个字段
          customOption: true, // 允许添加自定义内容
          data: {
            currentPage: '当前页码',
            totalPages: '总页数',
            rows: '每页显示数量',
            first: '开始于第n条',
            last: '结束于第n条',
            totalRecords: '总数',
          },
        },
        dependencies: {
          trigger: ['paginatorTemplate'],
          resolve: ({ values }: { values: Record<string, any> }) => ({
            hidden: !values.paginatorTemplate.includes(8), // 模板中包含自定义模板时可配置显示数量
          }),
        },
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
    columns: 4,
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
    paginator: true,
    rows: 20,
    totalField: '',
    alwaysShowPaginator: true,
    paginatorPosition: 'bottom-right',
    pageLinkSize: 5,
    rowsPerPageOptions: [10, 20, 30, 50, 100],
    paginatorTemplate: [0, 1, 2, 3, 4, 5],
    currentPageReportTemplate: [],
  };
}
