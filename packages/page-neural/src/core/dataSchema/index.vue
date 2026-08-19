<script setup lang="ts">
  import { ref } from 'vue';

  import SchemaGroup from './schemaGroup.vue';
  import { type JSONSchemaObject } from './types';

  const schemaData = ref<JSONSchemaObject>({
    $schema: 'https://json-schema.org/draft-07/schema',
    type: 'object',
    properties: {},
    required: [],
  });
</script>

<template>
  <div class="gritty-data-schema">
    <div class="data-schema-panel">
      <div class="panel-content">
        <SchemaGroup
          :schemaProperties="schemaData.properties || {}"
          :requiredList="schemaData.required || []"
        />
      </div>
      <div class="panel-content panel-view">
        {{ schemaData }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .gritty-data-schema {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    background-color: #fff;
    .data-schema-panel {
      display: flex;
      height: 100%;
      .panel-content {
        flex: 1;
        height: 100%;
        padding: 12px;
      }
    }
  }
</style>
