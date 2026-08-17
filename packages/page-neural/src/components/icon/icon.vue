<script setup lang="ts">
  import { type LucideProps } from '@lucide/vue';
  import { setLucideProps } from '@lucide/vue';
  import { computed } from 'vue';

  import icons from './register';

  defineOptions({
    name: 'NeuralIcon',
  });

  interface Props extends /* @vue-ignore */ LucideProps {
    label?: string;
    name: string;
  }

  const props = defineProps<Props>();

  setLucideProps({
    size: 18,
    strokeWidth: 1,
  });

  const icon = computed(() => icons[props.name as keyof typeof icons]);
</script>

<template>
  <button :aria-label="label">
    <component v-if="icon" :is="icon" v-bind="$attrs" />
    <template v-else>图标未找到</template>
  </button>
</template>
