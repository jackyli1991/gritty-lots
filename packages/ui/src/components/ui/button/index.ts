import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Button } from './Button.vue';

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        success: 'bg-success text-success-foreground hover:bg-success/90',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
        info: 'bg-info text-info-foreground hover:bg-info/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-control-default px-4 py-2 has-[>svg]:px-3',
        mini: "h-control-mini gap-0.5 rounded px-1.5 text-xs has-[>svg]:px-1 [&_svg:not([class*='size-'])]:size-3",
        xs: "h-control-xs gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-control-sm rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-control-lg rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-control-default',
        'icon-xs': "size-control-xs rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-control-sm',
        'icon-lg': 'size-control-lg',
      },
      shape: {
        default: '',
        circle: 'rounded-full',
        round: 'rounded-full',
      },
      danger: {
        true: '',
        false: undefined,
      },
      ghost: {
        true: '',
        false: undefined,
      },
    },
    compoundVariants: [
      // danger overrides variant colors to destructive
      {
        danger: true,
        variant: 'default',
        class: 'bg-destructive text-white hover:bg-destructive/90',
      },
      {
        danger: true,
        variant: 'primary',
        class: 'bg-destructive text-white hover:bg-destructive/90',
      },
      {
        danger: true,
        variant: 'success',
        class: 'bg-destructive text-white hover:bg-destructive/90',
      },
      {
        danger: true,
        variant: 'warning',
        class: 'bg-destructive text-white hover:bg-destructive/90',
      },
      { danger: true, variant: 'info', class: 'bg-destructive text-white hover:bg-destructive/90' },
      {
        danger: true,
        variant: 'destructive',
        class: 'bg-destructive text-white hover:bg-destructive/90',
      },
      {
        danger: true,
        variant: 'outline',
        class:
          'border-destructive text-destructive hover:bg-destructive/10 dark:border-destructive',
      },
      {
        danger: true,
        variant: 'secondary',
        class: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
      },
      {
        danger: true,
        variant: 'ghost',
        class: 'text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/10',
      },
      {
        danger: true,
        variant: 'link',
        class: 'text-destructive underline-offset-4 hover:underline',
      },
      // ghost makes background transparent while keeping text color
      { ghost: true, variant: 'default', class: 'bg-transparent text-primary hover:bg-primary/10' },
      { ghost: true, variant: 'primary', class: 'bg-transparent text-primary hover:bg-primary/10' },
      { ghost: true, variant: 'success', class: 'bg-transparent text-success hover:bg-success/10' },
      { ghost: true, variant: 'warning', class: 'bg-transparent text-warning hover:bg-warning/10' },
      { ghost: true, variant: 'info', class: 'bg-transparent text-info hover:bg-info/10' },
      {
        ghost: true,
        variant: 'destructive',
        class: 'bg-transparent text-destructive hover:bg-destructive/10',
      },
      {
        ghost: true,
        variant: 'outline',
        class: 'bg-transparent border-transparent shadow-none hover:bg-accent',
      },
      {
        ghost: true,
        variant: 'secondary',
        class: 'bg-transparent text-secondary-foreground hover:bg-secondary/20',
      },
      { ghost: true, variant: 'ghost', class: '' },
      { ghost: true, variant: 'link', class: 'bg-transparent' },
      // ghost + danger
      {
        ghost: true,
        danger: true,
        class:
          'bg-transparent text-destructive hover:bg-destructive/10 border-transparent shadow-none',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default',
      danger: false,
      ghost: false,
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
