import type { FormItemProps } from '@neural/components/form';
import {
  ALIGN_OPTIONS,
  ALL_TYPE_VALUES,
  FIXED_OPTIONS,
  TABLE_COLUMN_TYPE_LABEL,
} from '@neural/data/table';
import type { TableColumn, TableColumnType } from '@neural/types/table';
import { generateId } from '@neural/utils';

/** 表单字段的隐藏联动：非数据列不渲染 field / width / align / fixed / sortable */
// export const hideForNonDataColumn = {
//   trigger: ['type'],
//   resolve: ({ values }: { values: Record<string, any> }) => ({
//     hidden: !isDataColumn(values.type as TableColumnType),
//   }),
// };

/** 各列类型通过 registerTableColumn 追加的配置表单项 */
const COLUMN_FORM_SCHEMA = new Map<TableColumnType, FormItemProps[]>();

/** 各列类型新增列时的默认值（对应配置表单项的初始值） */
const COLUMN_DEFAULTS = new Map<TableColumnType, Record<string, unknown>>();

/** 注册某列类型追加的配置表单项 */
export function registerColumnFormSchema(type: TableColumnType, schema: FormItemProps[]): void {
  COLUMN_FORM_SCHEMA.set(type, [...schema]);
}

/** 注册某列类型新增列时的默认值 */
export function registerColumnDefaults(type: TableColumnType, defaults: Record<string, unknown>) {
  COLUMN_DEFAULTS.set(type, { ...defaults });
}

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

  const baseSchema: FormItemProps[] = [
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
      // dependencies: hideForNonDataColumn,
    },
    {
      fieldName: 'width',
      label: '宽度',
      component: 'InputNumber',
      componentProps: {
        min: 0,
        placeholder: '自适应',
        suffix: 'px',
      },
      // dependencies: hideForNonDataColumn,
    },
    {
      fieldName: 'align',
      label: '对齐',
      component: 'Select',
      componentProps: {
        options: ALIGN_OPTIONS,
      },
      // dependencies: hideForNonDataColumn,
    },
    {
      fieldName: 'fixed',
      label: '固定',
      component: 'Select',
      componentProps: {
        options: FIXED_OPTIONS,
        showClear: true,
      },
      // dependencies: hideForNonDataColumn,
    },
    {
      fieldName: 'sortable',
      label: '可排序',
      component: 'ToggleSwitch',
      componentProps: {},
      // dependencies: hideForNonDataColumn,
    },
  ];

  // 合并当前列类型追加的表单项
  const extraSchema = activeType ? (COLUMN_FORM_SCHEMA.get(activeType) ?? []) : [];
  return [...baseSchema, ...extraSchema];
}

/** 构造表格列默认值，合并该类型注册的默认配置 */
export function createTableColumn(type: TableColumnType): TableColumn {
  const defaults = { ...COLUMN_DEFAULTS.get(type) };
  // id / type 由创建过程决定，不允许被默认值覆盖
  delete defaults.id;
  delete defaults.type;
  return {
    id: generateId('col'),
    type,
    title: TABLE_COLUMN_TYPE_LABEL[type],
    field: '',
    width: 200,
    align: 'left',
    fixed: null,
    sortable: false,
    ...defaults,
  };
}

// 用于 FormItemProps / FormItemProps[] 的类型占位，避免上层必须自行引入
export type { FormItemProps };
