<template>
  <div ref="boxRef" class="gradient-border" :style="style">
    <div>渐变边框</div>
  </div>
</template>

<script setup lang="ts">
  import { useDraggable } from '@vueuse/core';
  import { onMounted, ref, useTemplateRef } from 'vue';

  const boxRef = useTemplateRef<HTMLElement | null>('boxRef');
  // 拖拽边界容器：setup 阶段 DOM 未挂载，无法直接 querySelector，故用 ref 在 onMounted 中取父元素
  const containerRef = ref<HTMLElement | null>(null);

  const { style } = useDraggable(boxRef, {
    initialValue: { x: 50, y: 500 },
    containerElement: containerRef,
  });

  onMounted(() => {
    containerRef.value = boxRef.value?.parentElement ?? null;
  });
</script>

<style lang="scss" scoped>
  .gradient-border {
    --white: #fff;
    --primary: #0d4ef2;
    width: 10em;
    height: 10em;
    border-radius: 1em;
    box-shadow: 0 0.25em 0.375em hsla(0, 0%, 64%, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    cursor: grab;
    user-select: none;

    &:active {
      cursor: grabbing;
    }

    &:before,
    &:after {
      border-radius: inherit;
      content: '';
      display: block;
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    &:before {
      border: 1px solid var(--white);
      mask-image: linear-gradient(135deg, var(--white), transparent 50%);
    }
    &:after {
      border: 1px solid var(--primary);
      mask-image: linear-gradient(135deg, transparent 50%, var(--white));
    }
  }
</style>
