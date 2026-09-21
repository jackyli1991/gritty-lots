<template>
  <Drawer
    v-model:visible="visible"
    :showCloseIcon="false"
    position="right"
    class="!w-[32rem] max-w-[100vw]"
  >
    <template #header>
      <div class="flex justify-between items-center">
        <span class="text-sm">请求</span>
      </div>
    </template>
    <Form />
  </Drawer>
</template>

<script setup lang="ts">
  import Drawer from 'primevue/drawer';

  import Form from '../forms/request.vue';

  const visible = defineModel<boolean>();
</script>
