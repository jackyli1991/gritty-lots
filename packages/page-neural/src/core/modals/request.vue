<template>
  <Drawer v-model:visible="visible" :showCloseIcon="false" position="right" class="!w-[32rem]">
    <template #header>
      <div class="flex justify-between items-center">
        <span class="text-sm">请求配置</span>
      </div>
    </template>
    <Form v-bind="$attrs" />
  </Drawer>
</template>

<script setup lang="ts">
  import Drawer from 'primevue/drawer';

  import Form from '../forms/request.vue';

  const visible = defineModel<boolean>();
</script>
