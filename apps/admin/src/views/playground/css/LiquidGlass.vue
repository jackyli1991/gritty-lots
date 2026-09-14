<template>
  <div ref="boxRef" class="liquid-glass" :style="style">
    <div class="content">
      <div class="title">液体玻璃</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDraggable } from '@vueuse/core';
  import { onMounted, ref, useTemplateRef } from 'vue';

  const boxRef = useTemplateRef<HTMLElement | null>('boxRef');
  // 拖拽边界容器：setup 阶段 DOM 未挂载，无法直接 querySelector，故用 ref 在 onMounted 中取父元素
  const containerRef = ref<HTMLElement | null>(null);

  const { style } = useDraggable(boxRef, {
    initialValue: { x: 100, y: 100 },
    containerElement: containerRef,
  });

  onMounted(() => {
    containerRef.value = boxRef.value?.parentElement ?? null;
  });
</script>

<style lang="scss" scoped>
  .liquid-glass {
    // 液体玻璃色板（对齐参考样式变量）
    --lg-bg-color: rgba(255, 255, 255, 0.25);
    --lg-highlight: rgba(255, 255, 255, 0.75);
    --lg-text: #ffffff;

    width: 100px;
    height: 40px;
    border-radius: 2rem;
    position: absolute;
    cursor: grab;
    user-select: none;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--lg-text);
    // 半透明玻璃底色（glass-overlay 层）
    background: var(--lg-bg-color);
    // 模糊 + 饱和度 + 亮度提升，模拟玻璃折射（glass-filter 层）
    backdrop-filter: blur(4px) saturate(120%) brightness(1.15);
    -webkit-backdrop-filter: blur(4px) saturate(120%) brightness(1.15);
    // specular 高光：左上 1px 实边 + 5px 模糊光晕，模拟玻璃边缘反射
    box-shadow:
      inset 1px 1px 0 var(--lg-highlight),
      inset 0 0 5px var(--lg-highlight),
      0 6px 6px rgba(0, 0, 0, 0.2),
      0 0 20px rgba(0, 0, 0, 0.1);
    // 弹性过渡，体现液体回弹感
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);

    &:active {
      cursor: grabbing;
    }

    &:hover {
      transform: scale(1.05);
    }
  }

  .content {
    position: relative;
    z-index: 3;
    text-align: center;
    pointer-events: none;

    .title {
      color: var(--lg-text);
      font-size: 1em;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-shadow: 0 0.0625em 0.25em rgba(0, 0, 0, 0.3);
    }
  }
</style>
