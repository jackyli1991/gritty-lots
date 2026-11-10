<!--
Tabs 容器
基于 PrimeVue Tabs 的基座，仅一个占位标签页，子节点映射后续实现
@props id?: string
-->
<script setup lang="ts">
  import { usePageNeuralStore } from '@neural/store';
  import Tab from 'primevue/tab';
  import TabList from 'primevue/tablist';
  import TabPanel from 'primevue/tabpanel';
  import TabPanels from 'primevue/tabpanels';
  import Tabs from 'primevue/tabs';
  import { computed } from 'vue';

  defineOptions({
    name: 'PageTabsContainer',
  });

  interface ContainerProps {
    id?: string;
  }

  const pageNeuralStore = usePageNeuralStore();

  const props = defineProps<ContainerProps>();

  const container = computed(() => pageNeuralStore.getContainer(props.id || ''));

  // 基座占位标签页标识，后续按容器子节点生成
  const BASE_TAB_VALUE = 'tab-1';
</script>

<template>
  <Tabs
    v-if="container"
    :value="BASE_TAB_VALUE"
    class="page-tabs-container flex h-full w-full flex-col"
  >
    <TabList>
      <Tab :value="BASE_TAB_VALUE">标签页 1</Tab>
    </TabList>
    <TabPanels class="flex-1 overflow-auto">
      <TabPanel :value="BASE_TAB_VALUE">
        <div
          class="flex h-full items-center justify-center text-xs text-gray-400 dark:text-gray-500"
        >
          Tabs 容器
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
