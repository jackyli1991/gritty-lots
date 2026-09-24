<template>
  <InputGroup>
    <InputGroupAddon v-if="props.prefix">{{ props.prefix }}</InputGroupAddon>
    <InputText v-bind="$attrs" v-model="modalValue" />
    <InputGroupAddon v-if="props.suffix">{{ props.suffix }}</InputGroupAddon>
  </InputGroup>
</template>

<script lang="ts" setup>
  import InputGroup from 'primevue/inputgroup';
  import InputGroupAddon from 'primevue/inputgroupaddon';
  // import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';

  const props = defineProps<{
    prefix?: string;
    suffix?: string;
  }>();

  const modalValue = defineModel<string>();
</script>
