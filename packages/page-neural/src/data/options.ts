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
  { label: '警告', value: 'warn' },
  { label: '错误', value: 'danger' },
  { label: '高对比', value: 'contrast' },
];
