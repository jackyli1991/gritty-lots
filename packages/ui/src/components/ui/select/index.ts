import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Select } from './Select.vue';
// 子组件保留导出，供需要手动组合的高级场景使用
export { default as SelectContent } from './SelectContent.vue';
export { default as SelectGroup } from './SelectGroup.vue';
export { default as SelectItem } from './SelectItem.vue';
export { default as SelectItemText } from './SelectItemText.vue';
export { default as SelectLabel } from './SelectLabel.vue';
export { default as SelectScrollDownButton } from './SelectScrollDownButton.vue';
export { default as SelectScrollUpButton } from './SelectScrollUpButton.vue';
export { default as SelectSeparator } from './SelectSeparator.vue';
export { default as SelectTrigger } from './SelectTrigger.vue';
export { default as SelectValue } from './SelectValue.vue';

/**
 * Select 触发器样式变体
 * 高度由 h-control-* / 内联 minHeight 单独控制，CVA 仅管理 padding/字号/间距
 */
export const selectTriggerVariants = cva(
  'border-input data-[placeholder]:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent text-sm whitespace-nowrap shadow-xs transition-[color,border-color,box-shadow] duration-200 outline-none focus-visible:ring-3 focus-within:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        mini: 'px-1.5 text-xs gap-0.5',
        xs: 'px-2 text-xs gap-1',
        sm: 'px-2.5 text-xs gap-1.5',
        default: 'px-3 text-sm',
        lg: 'px-4 text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export type SelectTriggerVariants = VariantProps<typeof selectTriggerVariants>;

/** 校验状态 */
export type SelectStatus = 'default' | 'error' | 'warning';

/** 选择模式：multiple=多选，tags=可创建新标签 */
export type SelectMode = 'multiple' | 'tags';

/** 选项数据结构 */
export interface SelectOption {
  label?: string;
  value?: string | number | boolean;
  disabled?: boolean;
  /** 子选项（分组） */
  options?: SelectOption[];
  [key: string]: unknown;
}

/** 自定义字段映射 */
export interface SelectFieldNames {
  label?: string;
  value?: string;
  disabled?: string;
  options?: string;
}
