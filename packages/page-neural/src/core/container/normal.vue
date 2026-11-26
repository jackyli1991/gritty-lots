<!--
普通容器
@props id?: string
-->
<script setup lang="ts">
  import { NeuralFieldsSelect } from '@neural/components';
  import { useData } from '@neural/composables/useData';
  import Button from 'primevue/button';
  import { ref } from 'vue';

  defineOptions({
    name: 'PageNormalContainer',
  });

  interface ContainerProps {
    id?: string;
  }

  const page = ref(1);

  const props = defineProps<ContainerProps>();
  // 容器统一入口 index.vue 已触发数据加载，此处仅消费
  const { container, data, loading, loadData } = useData(props.id, { autoLoad: false });

  const loadPage = async () => {
    page.value++;
    await loadData({ page: page.value });
  };

  const modelValue = ref<string[]>([]);
</script>

<template>
  <div class="page-normal-container w-full h-full">
    <slot></slot>
    <NeuralFieldsSelect
      v-model="modelValue"
      selection-mode="multiple"
      size="small"
      customOption
      class="w-1/2"
      :data="data || {}"
    />
    {{ modelValue }}
    <Button label="刷新" @click="loadPage" />
    <!-- <PageNormalContainer v-for="child in container?.children || []" :key="child" :id="child" /> -->
  </div>
</template>
