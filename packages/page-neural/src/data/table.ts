import type { TableColumnAlign, TableColumnFixed, TableColumnType } from '@neural/types/table';

/** 单例列类型：表格中最多存在一个 */
export const SINGLETON_COLUMN_TYPES: ReadonlySet<TableColumnType> = new Set([
  'selection',
  'multiSelection',
  'index',
  'button',
]);

/** 列类型显示名称，供配置面板的下拉选项使用 */
export const TABLE_COLUMN_TYPE_LABEL: Record<TableColumnType, string> = {
  selection: '单选列',
  multiSelection: '多选列',
  index: '序号列',
  text: '文本',
  tag: '标签',
  image: '图片',
  link: '链接',
  button: '操作',
};

/** 所有列类型数组，按固定顺序 */
export const ALL_TYPE_VALUES: TableColumnType[] = [
  'selection',
  'multiSelection',
  'index',
  'text',
  'tag',
  'image',
  'link',
  'button',
];

/** 列类型图标 */
export const TYPE_ICON: Record<TableColumnType, string> = {
  selection: 'CircleDot',
  multiSelection: 'SquareCheck',
  index: 'Hash',
  text: 'Type',
  tag: 'Tag',
  image: 'Image',
  link: 'Link2',
  button: 'MousePointerClick',
};

/** 水平对齐选项 */
export const ALIGN_OPTIONS: { label: string; value: TableColumnAlign }[] = [
  { label: '左', value: 'left' },
  { label: '中', value: 'center' },
  { label: '右', value: 'right' },
];

/** 固定列选项 */
export const FIXED_OPTIONS: { label: string; value: TableColumnFixed }[] = [
  { label: '左固定', value: 'left' },
  { label: '右固定', value: 'right' },
];

/** 数据列类型集合：需要 field/width/align 等字段的类型 */
export const DATA_COLUMN_TYPES: ReadonlySet<TableColumnType> = new Set([
  'text',
  'tag',
  'image',
  'link',
]);

/** 是否为数据列（需要绑定字段的列类型） */
export function isDataColumn(type: TableColumnType): boolean {
  return DATA_COLUMN_TYPES.has(type);
}
