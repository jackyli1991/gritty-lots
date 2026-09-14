<template>
  <div ref="boxRef" class="glass-matte" :style="style">
    <div class="label">毛玻璃材质</div>
  </div>
</template>

<script setup lang="ts">
  import { useDraggable } from '@vueuse/core';
  import { onMounted, ref, useTemplateRef } from 'vue';

  const boxRef = useTemplateRef<HTMLElement | null>('boxRef');
  // 拖拽边界容器：setup 阶段 DOM 未挂载，无法直接 querySelector，故用 ref 在 onMounted 中取父元素
  const containerRef = ref<HTMLElement | null>(null);

  const { style } = useDraggable(boxRef, {
    initialValue: { x: 500, y: 650 },
    containerElement: containerRef,
  });

  onMounted(() => {
    containerRef.value = boxRef.value?.parentElement ?? null;
  });
</script>

<style lang="scss" scoped>
  .glass-matte {
    width: 12.5em;
    height: 12.5em;
    border-radius: 1em;
    // 半透明白底作为玻璃色调
    background: rgba(255, 255, 255, 0.2);
    // 真正的毛玻璃：模糊背后背景图
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 0.25em 1.875em rgba(0, 0, 0, 0.1);
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    user-select: none;

    &:active {
      cursor: grabbing;
    }
  }

  .label {
    color: #fff;
    font-size: 1em;
    font-weight: 500;
    text-shadow: 0 0.0625em 0.25em rgba(0, 0, 0, 0.3);
  }
</style>
