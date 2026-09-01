<template>
  <span
    class="inline-block cursor-pointer p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-300"
  >
    <Icon :style="{ width: `${size}px`, height: `${size}px` }" />
  </span>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';

  import { createIcon } from './create-icon';

  defineOptions({
    name: 'Iconify',
  });

  interface IconifyProps {
    name?: string; // 图标名称
    size?: number; // 图标大小
  }

  const props = withDefaults(defineProps<IconifyProps>(), {
    name: '',
    size: 18,
  });

  const Icon = computed(() => createIcon(props.name));
</script>
