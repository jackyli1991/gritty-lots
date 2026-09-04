<template>
  <pre :class="preClass"><code :class="codeClass"><slot>{{ displayCode }}</slot></code></pre>
</template>

<script setup lang="ts">
  import { computed, useSlots } from 'vue';

  defineOptions({
    name: 'CodeBlock',
  });

  type Size = 'sm' | 'md';

  interface CodeBlockProps {
    size?: Size;
    /** 代码文本；传入时优先使用，可完全避免 slot 模板编译导致的换行丢失 */
    code?: string;
  }

  const props = withDefaults(defineProps<CodeBlockProps>(), {
    size: 'md',
    code: undefined,
  });

  const slots = useSlots();

  const preClass = computed(() => {
    const base = 'bg-gray-900 text-green-400 overflow-x-auto whitespace-pre';
    const sizeMap: Record<Size, string> = {
      sm: 'rounded p-3 text-xs',
      md: 'rounded-md p-4 text-sm',
    };
    return `${base} ${sizeMap[props.size]}`;
  });

  const codeClass = 'whitespace-pre';

  const displayCode = computed(() => {
    if (props.code != null) return props.code;
    // 当没有提供 code prop 且没有 slot 内容时，兜底为空字符串
    if (!slots.default) return '';
    return undefined; // 让 slot 自行渲染
  });
</script>
