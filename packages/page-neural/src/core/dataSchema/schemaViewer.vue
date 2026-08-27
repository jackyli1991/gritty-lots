<script setup lang="ts">
  import { JsonViewer } from 'vue3-json-viewer';

  // import ajv from './ajv-instance.ts';
  import { type JSONSchemaObject } from './types';

  import 'vue3-json-viewer/dist/vue3-json-viewer.css';

  interface Props {
    jsonData: JSONSchemaObject;
  }

  const props = defineProps<Props>();
</script>

<template>
  <div class="gritty-data-schema-viewer">
    <JsonViewer :value="jsonData" boxed theme="light" />
  </div>
</template>

<style lang="scss" scoped>
  .gritty-data-schema-viewer {
    height: 100%;
    display: flex;
    flex-direction: column;
    .schema-view-header {
      line-height: 1;
      padding: 12px;
      font-size: 12px;
      font-weight: 500;
      color: #333;
      border-radius: 8px 8px 0 0;
      background-color: #f5f5f5;
      display: flex;
      align-items: center;
      gap: 8px;
      .title {
        flex: 1;
      }
      .tools {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
    :deep(.jv-container) {
      flex: 1;
      overflow: hidden;
      border-radius: 0 0 8px 8px;
      .jv-code {
        padding: 6px;
        height: 100%;
        max-height: 100%;
        overflow: auto;
      }

      .jv-more {
        display: none;
      }
    }
  }
</style>
