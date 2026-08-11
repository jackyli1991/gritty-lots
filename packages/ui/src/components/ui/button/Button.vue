<script setup lang="ts">
  import type { PrimitiveProps } from 'reka-ui';
  import { Primitive } from 'reka-ui';
  import type { HTMLAttributes } from 'vue';
  import { computed } from 'vue';

  import type { ButtonVariants } from '.';
  import { buttonVariants } from '.';
  import { useRipple } from '../../../composables/useRipple';
  import { cn } from '../../../lib/utils';
  import { Icon } from '../icon';

  interface Props extends PrimitiveProps {
    variant?: ButtonVariants['variant'];
    size?: ButtonVariants['size'];
    shape?: ButtonVariants['shape'];
    danger?: boolean;
    ghost?: boolean;
    disabled?: boolean;
    loading?: boolean;
    class?: HTMLAttributes['class'];
  }

  const props = withDefaults(defineProps<Props>(), {
    as: 'button',
    shape: 'default',
    danger: false,
    ghost: false,
    disabled: false,
    loading: false,
  });

  const mergedDisabled = computed(() => props.disabled || props.loading);
  const { trigger: triggerRipple } = useRipple();
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :data-disabled="mergedDisabled ? '' : undefined"
    :as="as"
    :as-child="asChild"
    :disabled="mergedDisabled"
    :class="
      cn(
        buttonVariants({ variant, size, shape, danger, ghost }),
        disabled && !loading && 'opacity-disabled',
        props.class
      )
    "
    @pointerdown="triggerRipple"
  >
    <Icon v-if="loading" name="loader4" class="animate-spin" />
    <slot />
  </Primitive>
</template>
