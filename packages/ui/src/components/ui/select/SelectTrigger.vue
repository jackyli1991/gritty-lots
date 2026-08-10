<script setup lang="ts">
  import { RiArrowDownSLine } from '@remixicon/vue';
  import { reactiveOmit } from '@vueuse/core';
  import type { SelectTriggerProps } from 'reka-ui';
  import { SelectIcon, SelectTrigger, useForwardProps } from 'reka-ui';
  import type { HTMLAttributes } from 'vue';

  import { cn } from '../../../lib/utils';

  const props = withDefaults(
    defineProps<
      SelectTriggerProps & {
        class?: HTMLAttributes['class'];
        size?: 'mini' | 'xs' | 'sm' | 'default' | 'lg';
      }
    >(),
    { size: 'default' }
  );

  const delegatedProps = reactiveOmit(props, 'class', 'size');
  const forwardedProps = useForwardProps(delegatedProps);

  const sizeHeightClass = {
    mini: 'h-control-mini',
    xs: 'h-control-xs',
    sm: 'h-control-sm',
    default: 'h-control-default',
    lg: 'h-control-lg',
  };
</script>

<template>
  <SelectTrigger
    data-slot="select-trigger"
    :data-size="size"
    v-bind="forwardedProps"
    :class="
      cn(
        `border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20 focus-within:border-primary focus-within:ring-primary/20 data-[state=open]:border-primary data-[state=open]:ring-primary/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
        sizeHeightClass[size],
        props.class
      )
    "
  >
    <slot />
    <SelectIcon as-child>
      <RiArrowDownSLine class="size-4 opacity-50" />
    </SelectIcon>
  </SelectTrigger>
</template>
