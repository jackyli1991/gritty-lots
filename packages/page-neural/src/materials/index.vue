<template>
  <Transition
    enter-active-class="transform transition duration-300 ease-out"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transform transition duration-200 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <div
      v-if="visible"
      class="absolute top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col"
    >
      <div class="flex-1 overflow-hidden relative">
        <Tabs class="h-full flex flex-col" value="tab1">
          <TabList>
            <Tab value="tab1">基础</Tab>
            <Tab value="tab2">自定义</Tab>
          </TabList>
          <TabPanels class="flex-1 overflow-auto !p-2">
            <TabPanel value="tab1">
              <div v-for="group in BaseMaterials" :key="group.type">
                <div class="px-1 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {{ group.groupName }}
                </div>
                <div class="grid grid-cols-1 gap-2">
                  <DraggableItem
                    v-for="item in group.children"
                    :key="item.type"
                    :id="`${group.type}-${item.type}`"
                    :data="item"
                  >
                    <div
                      class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 cursor-grab transition-colors hover:border-(--p-primary-color) dark:hover:border-(--p-primary-color)"
                    >
                      <NeuralIcon
                        :name="item.icon"
                        :size="20"
                        class="shrink-0 text-gray-700 dark:text-gray-200"
                      />
                      <div class="flex flex-1 flex-col gap-0.5 min-w-0">
                        <span class="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                          {{ item.name }}
                        </span>
                        <span class="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {{ item.description }}
                        </span>
                      </div>
                    </div>
                  </DraggableItem>
                </div>
              </div>
            </TabPanel>
            <!-- <TabPanel value="tab2">
              <h2 class="text-lg font-bold">Payment</h2>
              <p class="text-surface-500 mt-1">Manage your subscription plan, view invoices, and update your payment method.</p>
            </TabPanel> -->
          </TabPanels>
        </Tabs>
        <NeuralIcon
          name="X"
          class="absolute top-2 right-2 text-2xl cursor-pointer index-100"
          @click="handleClose"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import { BaseMaterials } from '@neural/data';
  import DraggableItem from '@neural/dnd/components/draggableItem.vue';
  import Tab from 'primevue/tab';
  import TabList from 'primevue/tablist';
  import TabPanel from 'primevue/tabpanel';
  import TabPanels from 'primevue/tabpanels';
  import Tabs from 'primevue/tabs';

  defineOptions({
    name: 'Materials',
  });

  defineProps<{
    visible: boolean;
  }>();

  const emit = defineEmits<{
    'update:visible': [value: boolean];
  }>();

  function handleClose() {
    emit('update:visible', false);
  }
</script>
