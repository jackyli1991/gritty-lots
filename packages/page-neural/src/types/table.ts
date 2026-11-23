import type { DataModelOptions } from '@neural/core/models/dataModel';
import type { Component } from 'vue';

/** 内置编辑组件类型 */
export type BuiltinEditComponentType = 'InputText' | 'InputNumber' | 'Select';

/** 单元格编辑配置 */
export interface TableColumnEditConfig {
  /** 是否开启编辑 */
  enable: boolean;
  /** 编辑组件：内置字符串 key，或直接传 Vue Component */
  component?: BuiltinEditComponentType | Component;
  /** Select 等组件的选项数据 */
  options?: unknown[];
  /** 透传给编辑组件的额外 props（如 InputNumber 的 min/max、Select 的 optionLabel 等） */
  [key: string]: unknown;
}

/** 内置列类型：决定该列在 DataTable 中的渲染方式 */
export type BuiltinTableColumnType =
  | 'selection' // 单选列
  | 'multiSelection' // 多选列
  | 'index' // 序号列
  | 'text' // 文本
  | 'tag' // 标签
  | 'multiTag' // 多标签
  | 'image' // 图片
  | 'link' // 链接
  | 'progress' // 进度条
  | 'color' // 颜色
  | 'button'; // 操作列

/** 表格列类型：内置类型 + 通过 registerTableColumn 注册的自定义类型 */
export type TableColumnType = BuiltinTableColumnType | (string & {});

/** 水平对齐 */
export type TableColumnAlign = 'left' | 'center' | 'right';

/** 固定列位置 */
export type TableColumnFixed = 'left' | 'right' | null;

export interface TableColumn {
  /** 行唯一 id，排序 / diff 用 */
  id: string;
  /** 列类型 */
  type: TableColumnType;
  /** 列标题（selection/multiSelection/index 可不填） */
  title: string;
  /** 绑定字段；非数据列（selection/multiSelection/index/button）留空 */
  field: string;
  /** 列宽（像素），0 / null 表示自适应 */
  width?: number | null;
  /** 水平对齐 */
  align?: TableColumnAlign;
  /** 固定列位置 */
  fixed?: TableColumnFixed;
  /** 是否可排序（仅数据类型列有效） */
  sortable?: boolean;
  /** 标签 / 多标签列：枚举数据的数据模型配置 */
  tagOptions?: DataModelOptions;
  /** 标签类型 */
  severity?: string;
  /** 文本列：最多显示行数，超出省略；未配置时单行省略 */
  rows?: number;
  /** 多标签列：最多显示的标签数量，超出时以 +n 展示；未配置时显示全部 */
  maxTags?: number;
  /** 链接列：链接文本，未配置时显示链接地址 */
  linkText?: string;
  /** 进度条列：进度条模式，未配置时为 determinate */
  mode?: 'determinate' | 'indeterminate';
  /** 进度条列：是否显示百分比文本，默认显示 */
  showValue?: boolean;
  /** 进度条列：进度条高度（px），未配置时默认 6 */
  barHeight?: number;
  /** 颜色列：是否显示颜色值文本，默认显示 */
  showColorValue?: boolean;
  /** 单元格编辑配置 */
  editConfig?: TableColumnEditConfig;
  /** 自定义列注册时通过配置表单追加的字段（平铺存储） */
  [key: string]: unknown;
}

export interface TableModelValue {
  size: string;
  showGridlines?: boolean;
  stripedRows?: boolean;
  emptyText?: string;
  columns: TableColumn[];
}
