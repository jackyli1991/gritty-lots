<template>
  <Divider class="m-0!" :align="align" :type="type">
    <code class="uppercase text-xs">{{ text }}</code>
  </Divider>
</template>
<script setup lang="ts">
  import Divider from 'primevue/divider';

  interface Props {
    text: string;
    align?: string;
    type?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    align: 'left',
    type: 'solid',
  });
</script>
