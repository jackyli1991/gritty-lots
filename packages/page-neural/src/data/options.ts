import type { TableColumnAlign, TableColumnFixed } from '@neural/types/table';

// 单位选项
export const unitOptions = [
  { label: '%', value: '%' },
  { label: 'px', value: 'px' },
  { label: 'rem', value: 'rem' },
  { label: 'em', value: 'em' },
  { label: 'vh', value: 'vh' },
  { label: 'vw', value: 'vw' },
];

// 边框样式
export const borderStyleOptions = [
  { label: 'solid', value: 'solid' },
  { label: 'dashed', value: 'dashed' },
  { label: 'dotted', value: 'dotted' },
  { label: 'double', value: 'double' },
];

// background-repeat 重复方式
export const repeatOptions = [
  { label: 'no-repeat', value: 'no-repeat' },
  { label: 'repeat', value: 'repeat' },
  { label: 'repeat-x', value: 'repeat-x' },
  { label: 'repeat-y', value: 'repeat-y' },
  { label: 'space', value: 'space' },
  { label: 'round', value: 'round' },
];

// background-origin 背景定位区域
export const originOptions = [
  { label: 'border-box', value: 'border-box' },
  { label: 'padding-box', value: 'padding-box' },
  { label: 'content-box', value: 'content-box' },
];

// background-clip 背景绘制区域
export const clipOptions = [
  { label: 'border-box', value: 'border-box' },
  { label: 'padding-box', value: 'padding-box' },
  { label: 'content-box', value: 'content-box' },
  // { label: 'text', value: 'text' },
];

// background-size 尺寸预设
export const sizeOptions = [
  { label: 'cover', value: 'cover' },
  { label: 'contain', value: 'contain' },
  { label: 'auto', value: 'auto' },
  { label: '自定义', value: 'custom' },
];

// 容器类型选项
export const containerOptions = [
  { label: '普通容器', value: 'normal' },
  { label: '表格容器', value: 'table' },
  { label: '表单容器', value: 'form' },
  { label: '抽屉容器', value: 'drawer' },
  { label: 'Tabs容器', value: 'tabs' },
];

// 列水平对齐选项
export const ALIGN_OPTIONS: { label: string; value: TableColumnAlign }[] = [
  { label: '左', value: 'left' },
  { label: '中', value: 'center' },
  { label: '右', value: 'right' },
];

// 列固定选项
export const FIXED_OPTIONS: { label: string; value: TableColumnFixed }[] = [
  { label: '左固定', value: 'left' },
  { label: '右固定', value: 'right' },
];

// 标签类型选项
export const SEVERITY_OPTIONS = [
  { label: '普通', value: 'secondary' },
  { label: '成功', value: 'success' },
  { label: '通知', value: 'info' },
  // { label: '提醒', value: 'help' },
  { label: '警告', value: 'warn' },
  { label: '错误', value: 'danger' },
  { label: '高对比', value: 'contrast' },
];

// 分页器每页显示行数选项
export const rowsPerPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '30', value: 30 },
  { label: '40', value: 40 },
  { label: '50', value: 50 },
  { label: '60', value: 60 },
  { label: '70', value: 70 },
  { label: '80', value: 80 },
  { label: '90', value: 90 },
  { label: '100', value: 100 },
  { label: '200', value: 200 },
  { label: '300', value: 300 },
  { label: '400', value: 400 },
  { label: '500', value: 500 },
  { label: '1000', value: 1000 },
];

// 分页器模板选项
export const paginatorTemplateOptions = [
  { label: '第一页', value: 0, field: 'FirstPageLink' },
  { label: '上一页', value: 1, field: 'PrevPageLink' },
  { label: '页码', value: 2, field: 'PageLinks' },
  { label: '下一页', value: 3, field: 'NextPageLink' },
  { label: '最后一页', value: 4, field: 'LastPageLink' },
  { label: '每页数量选项', value: 5, field: 'RowsPerPageDropdown' },
  { label: '跳转页码', value: 6, field: 'JumpToPageDropdown' },
  { label: '输入页码', value: 7, field: 'JumpToPageInput' },
  { label: '自定义信息', value: 8, field: 'CurrentPageReport' },
];

// 分页器位置选项
export const paginatorPositionOptions = [
  { label: '顶部-左', value: 'top-left' },
  { label: '顶部-中', value: 'top-center' },
  { label: '顶部-右', value: 'top-right' },
  { label: '底部-左', value: 'bottom-left' },
  { label: '底部-中', value: 'bottom-center' },
  { label: '底部-右', value: 'bottom-right' },
];
