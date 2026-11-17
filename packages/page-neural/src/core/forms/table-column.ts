import type { FormItemProps } from '@neural/components/form';
import {
  ALIGN_OPTIONS,
  ALL_TYPE_VALUES,
  FIXED_OPTIONS,
  TABLE_COLUMN_TYPE_LABEL,
  isDataColumn,
} from '@neural/data/table';
import type { TableColumn, TableColumnType } from '@neural/types/table';
import { generateId } from '@neural/utils';

/** 表单字段的隐藏联动：非数据列不渲染 field / width / align / fixed / sortable */
export const hideForNonDataColumn = {
  trigger: ['type'],
  resolve: ({ values }: { values: Record<string, any> }) => ({
    hidden: !isDataColumn(values.type as TableColumnType),
  }),
};

/**
 * 列配置表单 schema 工厂。
 * 实时计算部分（阻塞状态、当前选中类型）由调用方传入，保持 schema 本身为纯函数。
 */
export function getColumnSchema(params: {
  /** 当前被阻塞的列类型集合（单例占用 + 互斥组占用） */
  blockedTypes: ReadonlySet<TableColumnType>;
  /** 当前正在编辑的列类型（允许切换到自身） */
  activeType?: TableColumnType | null;
}): FormItemProps[] {
  const { blockedTypes, activeType } = params;

  return [
    {
      fieldName: 'title',
      label: '标题',
      component: 'Input',
      componentProps: { placeholder: '列标题' },
    },
    {
      fieldName: 'type',
      label: '类型',
      component: 'Select',
      componentProps: {
        optionLabel: 'label',
        optionValue: 'value',
        optionDisabled: (option: { disabled: boolean }) => option.disabled,
        options: ALL_TYPE_VALUES.map((type) => ({
          label: TABLE_COLUMN_TYPE_LABEL[type],
          value: type,
          // 允许切换到当前列自身的类型；其余类型若被阻塞（单例或互斥）则禁用
          disabled: blockedTypes.has(type) && type !== activeType,
        })),
      },
    },
    {
      fieldName: 'field',
      label: '字段',
      component: 'Input',
      componentProps: { placeholder: '绑定字段' },
      dependencies: hideForNonDataColumn,
    },
    {
      fieldName: 'width',
      label: '宽度',
      component: 'InputNumber',
      componentProps: { min: 0, showButtons: true, placeholder: '自适应', fluid: true },
      dependencies: hideForNonDataColumn,
    },
    {
      fieldName: 'align',
      label: '对齐',
      component: 'Select',
      componentProps: {
        optionLabel: 'label',
        optionValue: 'value',
        options: ALIGN_OPTIONS,
      },
      dependencies: hideForNonDataColumn,
    },
    {
      fieldName: 'fixed',
      label: '固定',
      component: 'Select',
      componentProps: {
        optionLabel: 'label',
        optionValue: 'value',
        options: FIXED_OPTIONS,
        showClear: true,
      },
      dependencies: hideForNonDataColumn,
    },
    {
      fieldName: 'sortable',
      label: '可排序',
      component: 'ToggleSwitch',
      componentProps: {},
      dependencies: hideForNonDataColumn,
    },
  ];
}

/** 构造新列默认值 */
export function createNewColumn(type: TableColumnType): TableColumn {
  return {
    id: generateId('col'),
    type,
    title: TABLE_COLUMN_TYPE_LABEL[type],
    field: '',
    width: null,
    align: 'left',
    fixed: null,
    sortable: false,
  };
}

// 用于 FormItemProps / FormItemProps[] 的类型占位，避免上层必须自行引入
export type { FormItemProps };

// 保留 isDataColumn 的便捷再导出，方便组件侧按需消费
export { isDataColumn };
