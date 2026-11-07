<script setup lang="ts">
  import { type LucideProps } from '@lucide/vue';
  import { setLucideProps } from '@lucide/vue';
  import { computed, type Component } from 'vue';

  import icons from '../../icons';

  defineOptions({
    name: 'NeuralIcon',
  });

  const emit = defineEmits(['click']);

  interface Props extends /* @vue-ignore */ LucideProps {
    label?: string;
    name: string;
  }

  const props = defineProps<Props>();

  setLucideProps({
    size: 16,
    strokeWidth: 1,
  });

  // 图标命名空间同时包含工具函数等导出，这里统一收窄为组件类型供 <component :is> 使用
  const icon = computed(() => icons[props.name as keyof typeof icons] as Component | undefined);

  /**
   * 点击图标时触发的事件
   */
  function handleClick(event: MouseEvent) {
    emit('click', event);
  }
</script>

<template>
  <button type="button" :aria-label="label" @click="handleClick">
    <component v-if="icon" :is="icon" v-bind="$attrs">
      <slot></slot>
    </component>
    <template v-else>图标未找到</template>
  </button>
</template>
