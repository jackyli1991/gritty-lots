<script setup lang="ts">
  import * as RemixIcons from '@remixicon/vue';
  import type { Component, HTMLAttributes } from 'vue';
  import { computed } from 'vue';

  import { cn } from '../../../lib/utils';

  defineOptions({ name: 'GIcon', inheritAttrs: false });

  type IconSize = 'xs' | 'sm' | 'default' | 'lg';
  type IconVariant = 'line' | 'fill' | 'original';

  interface Props {
    /** 图标名称（支持多种格式）：
     *  - kebab-case: "home"、"chevron-down"
     *  - PascalCase: "Home"、"ChevronDown"
     *  - 全名: "RiHomeLine"、"RiChevronDownFill"
     */
    name: string;
    /** 图标变体：line(线性) / fill(填充) / original(品牌原色) */
    variant?: IconVariant;
    /** 图标尺寸：预设档位或自定义像素值 */
    size?: IconSize | number;
    /** 图标颜色（CSS 颜色值，默认使用 currentColor 继承父级） */
    color?: string;
    /** 自定义类名 */
    class?: HTMLAttributes['class'];
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'line',
    size: 'default',
  });

  function toPascalCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join('');
  }

  const iconComponent = computed<Component | null>(() => {
    const { name, variant } = props;
    // 如果已经是 Ri 开头的全名，直接使用
    if (/^Ri[A-Z]/.test(name)) {
      return (RemixIcons as Record<string, Component>)[name] ?? null;
    }
    const pascal = toPascalCase(name);
    const suffix = variant === 'original' ? 'Original' : variant === 'fill' ? 'Fill' : 'Line';
    const componentName = `Ri${pascal}${suffix}`;
    return (RemixIcons as Record<string, Component>)[componentName] ?? null;
  });

  const sizeClass = computed(() => {
    if (typeof props.size === 'number') return '';
    const map: Record<IconSize, string> = {
      xs: 'size-3',
      sm: 'size-4',
      default: 'size-5',
      lg: 'size-6',
    };
    return map[props.size] ?? 'size-4';
  });

  const sizeValue = computed(() =>
    typeof props.size === 'number' ? String(props.size) : undefined
  );

  const className = computed(() => cn(sizeClass.value, props.class));
</script>

<template>
  <component
    v-if="iconComponent"
    :is="iconComponent"
    data-slot="icon"
    :size="sizeValue"
    :color="color"
    :class-name="className"
    v-bind="$attrs"
  />
  <span
    v-else
    data-slot="icon"
    :class="cn('inline-flex shrink-0', sizeClass, props.class)"
    :style="color ? { color } : undefined"
  />
</template>
