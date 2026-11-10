<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import { useLayoutStore } from '@neural/store/layout';
  import { storeToRefs } from 'pinia';
  import { computed } from 'vue';

  // 图层与属性面板显隐切换按钮：激活态有主色高亮，点击调用 store.toggleLayers()
  defineOptions({ name: 'LayersTogger' });

  const layoutStore = useLayoutStore();
  const { layersVisible } = storeToRefs(layoutStore);

  const layersBtnActive = computed(() => layersVisible.value);

  function toggleLayers() {
    layoutStore.toggleLayers();
  }
</script>

<template>
  <button
    class="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-(--p-primary-500)"
    :class="
      layersBtnActive
        ? 'text-white bg-(--p-primary-500) hover:bg-(--p-primary-600) dark:text-white'
        : ''
    "
    :title="layersVisible ? '隐藏图层面板' : '显示图层面板'"
    @click="toggleLayers"
  >
    <NeuralIcon name="Layers" :size="14" />
  </button>
</template>
