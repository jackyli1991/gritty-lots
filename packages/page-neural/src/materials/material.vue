<template>
  <div class="flex-1 overflow-hidden relative">
    <Tabs class="h-full flex flex-col" :value="visibleTabs[0]?.value">
      <!-- 仅展示全部大类时显示大类切换栏 -->
      <TabList v-if="activeCategory === 'all'">
        <Tab v-for="tab in visibleTabs" :key="tab.value" :value="tab.value">{{ tab.name }}</Tab>
      </TabList>
      <TabPanels class="flex-1 overflow-auto">
        <TabPanel v-for="tab in visibleTabs" :key="tab.value" :value="tab.value">
          <div v-for="group in tab.groups" :key="group.type">
            <div class="px-1 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              {{ group.name }}
            </div>
            <!-- 小类内容：最多两行，超出横向滚动；无数据展示空态 -->
            <div v-if="group.children?.length" class="overflow-x-auto pb-1">
              <div class="grid grid-flow-col grid-rows-1 gap-4 auto-cols-max">
                <DraggableItem
                  v-for="item in group.children"
                  :key="item.type"
                  :id="`${tab.value}-${group.type}-${item.type}`"
                  :data="item"
                >
                  <div
                    v-tooltip.top="item.description"
                    class="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-2 text-center cursor-grab transition-colors hover:border-(--p-primary-color) dark:border-gray-700 dark:bg-gray-700/50 dark:hover:border-(--p-primary-color)"
                  >
                    <NeuralIcon
                      :name="item.icon"
                      :size="20"
                      class="shrink-0 text-gray-700 dark:text-gray-200"
                    />
                    <span
                      class="w-full truncate text-xs font-medium text-gray-700 dark:text-gray-200"
                    >
                      {{ item.name }}
                    </span>
                  </div>
                </DraggableItem>
              </div>
            </div>
            <!-- 小类空态 -->
            <div v-else class="py-12 text-xs text-center text-gray-400 dark:text-gray-500">
              暂无素材
            </div>
          </div>
          <!-- 空态 -->
          <div
            v-if="!tab.groups.length"
            class="py-6 text-center text-xs text-gray-400 dark:text-gray-500"
          >
            暂无素材
          </div>
        </TabPanel>
        <!-- 指定大类不存在时的空态 -->
        <div
          v-if="!visibleTabs.length"
          class="py-6 text-center text-xs text-gray-400 dark:text-gray-500"
        >
          暂无素材
        </div>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import DraggableItem from '@neural/dnd/components/draggableItem.vue';
  import Tab from 'primevue/tab';
  import TabList from 'primevue/tablist';
  import TabPanel from 'primevue/tabpanel';
  import TabPanels from 'primevue/tabpanels';
  import Tabs from 'primevue/tabs';
  import vTooltip from 'primevue/tooltip';
  import { computed } from 'vue';

  import { materialTabs } from './index';

  interface MaterialPanelProps {
    // 弹窗透传的节点数据，category 为大类标识，'all' 表示展示所有大类
    data?: { category?: string };
  }

  const props = withDefaults(defineProps<MaterialPanelProps>(), {
    data: () => ({ category: 'all' }),
  });

  // 当前大类：'all' 展示所有大类，否则仅展示指定大类
  const activeCategory = computed(() => props.data?.category ?? 'all');

  const visibleTabs = computed(() =>
    activeCategory.value === 'all'
      ? materialTabs
      : materialTabs.filter((tab) => tab.value === activeCategory.value)
  );
</script>
