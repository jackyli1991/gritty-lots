<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import { usePageNeuralStore } from '@neural/store';
  import { storeToRefs } from 'pinia';
  import Button from 'primeVue/button';
  import Select from 'primeVue/select';
  import { computed } from 'vue';

  // 页面切换：下拉选择当前页面，加号按钮新增页面
  const pageNeuralStore = usePageNeuralStore();
  const { pages, activePageId } = storeToRefs(pageNeuralStore);

  const options = computed(() => pages.value.map((page) => ({ label: page.name, value: page.id })));
</script>

<template>
  <div class="flex items-center gap-2">
    <Select
      v-model="activePageId"
      class="w-40"
      size="small"
      :options="options"
      option-label="label"
      option-value="value"
    />
    <Button iconOnly size="small" @click="pageNeuralStore.addPage">
      <NeuralIcon name="Plus" />
    </Button>
  </div>
</template>
