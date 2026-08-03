import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Input } from './Input.vue';

/**
 * Input 自身样式变体（仅作用于 <input> 元素）
 * - 边框 / 聚焦态 / status 由外层容器统一管理，确保聚焦时边框包裹 prefix/suffix
 */
export const inputVariants = cva(
  'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-transparent min-w-0 flex-1 text-base outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed read-only:cursor-default read-only:bg-muted/40 md:text-sm',
  {
    variants: {
      size: {
        mini: 'h-control-mini px-1.5 py-0 text-xs',
        xs: 'h-control-xs px-2 py-0 text-xs',
        sm: 'h-control-sm px-2.5 py-0 text-xs',
        default: 'h-control-default px-3 py-1 text-sm',
        lg: 'h-control-lg px-4 py-1 text-base',
      },
      // 有 prefix/suffix 时减小对应侧 padding，由 prefix/suffix 元素自身提供主间距
      hasPrefix: {
        true: 'pl-2',
        false: '',
      },
      hasSuffix: {
        true: 'pr-2',
        false: '',
      },
    },
    defaultVariants: {
      size: 'default',
      hasPrefix: false,
      hasSuffix: false,
    },
  }
);

export type InputVariants = VariantProps<typeof inputVariants>;

/** 校验状态类型（由外层容器应用边框/聚焦样式） */
export type InputStatus = 'default' | 'error' | 'warning';
