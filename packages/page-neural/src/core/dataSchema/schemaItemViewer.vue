<script setup lang="ts">
  import { useCloned } from '@vueuse/core';
  //   import { useClipboard } from '@vueuse/core';
  import { computed } from 'vue';
  import { JsonViewer } from 'vue3-json-viewer';

  // import { is } from './utils';
  //   import { NeuralIcon, NeuralTooltip } from '../../components';
  // import ajv from './ajv-instance.ts';
  import { type JSONSchemaObject } from './types';

  import 'vue3-json-viewer/dist/vue3-json-viewer.css';

  interface Props {
    jsonData: JSONSchemaObject;
  }

  const props = defineProps<Props>();

  const viewJson = computed(() => {
    const json = useCloned(props.jsonData);
    const { cloned } = json;
    delete cloned.value.properties;
    delete cloned.value.items;
    return cloned.value;
  });

  //   const { copy } = useClipboard({ legacy: true });
</script>

<template>
  <div class="gritty-schema-item-viewer">
    <JsonViewer :value="viewJson" theme="light" :expandDepth="10" />
  </div>
</template>

<style lang="scss" scoped>
  .gritty-schema-item-viewer {
    :deep(.jv-container) {
      .jv-code {
        padding: 0 !important;
        .jv-toggle {
          display: none;
        }
      }
    }
  }
</style>
