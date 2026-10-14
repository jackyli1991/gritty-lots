<script setup lang="ts">
  import Panel from 'primevue/panel';
  import Splitter from 'primevue/splitter';
  import SplitterPanel from 'primevue/splitterpanel';

  import Toolbar from './toolbar.vue';
</script>

<template>
  <div class="w-full h-full flex">
    <Splitter class="flex-1 w-full h-full" :sizes="[100]">
      <SplitterPanel>
        <Toolbar />
      </SplitterPanel>
    </Splitter>
    <Panel class="h-full ml-2 flex! flex-col! overflow-hidden w-[450px]!" header="布局设置"></Panel>
  </div>
</template>
