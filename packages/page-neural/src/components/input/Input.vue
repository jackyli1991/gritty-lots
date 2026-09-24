<template>
  <InputGroup>
    <InputGroupAddon v-if="$attrs.prefix">{{ $attrs.prefix }}</InputGroupAddon>
    <InputText v-bind="$attrs" v-model="modalValue" />
    <InputGroupAddon v-if="$attrs.suffix">{{ $attrs.suffix }}</InputGroupAddon>
  </InputGroup>
</template>

<script lang="ts" setup>
  import InputGroup from 'primevue/inputgroup';
  import InputGroupAddon from 'primevue/inputgroupaddon';
  // import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';

  const modalValue = defineModel<string>();
</script>
