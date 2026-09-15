<template>
  <div ref="boxRef" class="draggable" :style="wrapperStyle">
    <slot />
  </div>
</template>

<script lang="ts" setup>
  import { useDraggable } from '@vueuse/core';
  import { computed, onMounted, ref, useTemplateRef } from 'vue';

  defineOptions({
    name: 'Draggable',
    // 外部传入的 class/style 不会自动透传到根 div，避免与内部合并冲突
    inheritAttrs: false,
  });

  interface DraggableProps {
    // 初始位置（相对父容器）
    initialValue?: { x: number; y: number };
    // 拖拽边界容器，默认取父元素
    container?: HTMLElement | null;
    // 是否禁用拖拽
    disabled?: boolean;
  }

  const props = withDefaults(defineProps<DraggableProps>(), {
    initialValue: () => ({ x: 0, y: 0 }),
    container: null,
    disabled: false,
  });

  const boxRef = useTemplateRef<HTMLElement | null>('boxRef');
  // setup 阶段 DOM 未挂载，用 ref 在 onMounted 中取 parentElement 作为边界
  const containerRef = ref<HTMLElement | null>(null);

  const { style: dragStyle } = useDraggable(boxRef, {
    initialValue: props.initialValue,
    containerElement: containerRef,
    disabled: props.disabled,
  });

  onMounted(() => {
    containerRef.value = props.container ?? boxRef.value?.parentElement ?? null;
  });

  // 合并 useDraggable 产生的 transform / left / top 与基础样式
  const wrapperStyle = computed(() => {
    let style: string = 'user-select: none;';
    if (props.disabled) {
      style += ' cursor: not-allowed;';
    } else {
      style += ' cursor: grab;';
    }
    return style + dragStyle.value;
  });
</script>

<style scoped>
  .draggable {
    position: absolute;
    cursor: grab;
    user-select: none;
  }

  .draggable:active {
    cursor: grabbing;
  }
</style>
