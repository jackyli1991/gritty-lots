<script setup lang="ts">
  import { useClipboard } from '@vueuse/core';
  import { message } from 'ant-design-vue';
  import { ref, nextTick, useTemplateRef } from 'vue';

  import { NeuralIcon, NeuralTooltip } from '../../components';
  import SchemaGroup from './schemaGroup.vue';
  import SchemaViewer from './schemaViewer.vue';
  import { type JSONSchemaObject } from './types';
  import { exportJSON, importJSON } from './utils';

  const schemaData = ref<JSONSchemaObject>({
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    properties: {},
    required: [],
  });
  const { copy } = useClipboard({ legacy: true });
  const schemaGroupRef = useTemplateRef<typeof SchemaGroup>('schemaGroupRef');

  // 复制 JSON 数据
  const copyJson = () => {
    copy(JSON.stringify(schemaData.value, null, 2));
    message.success('已复制到剪贴板');
  };

  // 导出 JSON 数据
  const exportJson = () => {
    exportJSON(schemaData.value, 'json-schema.json');
  };

  // 导入 JSON 数据
  const importJsonClick = () => {
    document.getElementById('fileInput')?.click();
  };

  // 导入 JSON 数据
  const importJson = async (event: Event) => {
    try {
      const data = await importJSON((event.target as HTMLInputElement).files?.[0]);
      console.log(data);
      schemaData.value = data as JSONSchemaObject;
      await nextTick();
      schemaGroupRef.value?.init();
      message.success('导入完成');
    } catch (error: any) {
      message.error(error?.message || '导入失败');
    }
  };

  // 折叠所有配置
  const foldOptions = () => {
    schemaGroupRef.value?.foldOptions();
  };
</script>

<template>
  <div class="gritty-data-schema">
    <div class="data-schema-panel">
      <div class="panel-content">
        <div class="schema-content-header">
          <NeuralIcon name="ListIndentIncrease" />
          <span class="title">Editor</span>
          <div class="tools">
            <NeuralTooltip title="折叠配置">
              <NeuralIcon name="FoldVertical" @click="foldOptions" />
            </NeuralTooltip>
          </div>
        </div>
        <div class="schema-config">
          <SchemaGroup
            ref="schemaGroupRef"
            :schemaProperties="schemaData.properties || {}"
            :requiredList="schemaData.required || []"
          />
        </div>
      </div>
      <div class="panel-content panel-view">
        <div class="schema-content-header">
          <NeuralIcon name="FileBraces" />
          <span class="title">JSON Schema</span>
          <div class="tools">
            <NeuralTooltip title="导入">
              <NeuralIcon name="Import" @click="importJsonClick" />
            </NeuralTooltip>
            <NeuralTooltip title="复制">
              <NeuralIcon name="Copy" @click="copyJson" />
            </NeuralTooltip>
            <NeuralTooltip title="下载">
              <NeuralIcon name="Download" @click="exportJson" />
            </NeuralTooltip>
          </div>
        </div>
        <SchemaViewer :jsonData="schemaData" />
        <!-- 隐藏的 上传选择input -->
        <input
          type="file"
          id="fileInput"
          accept=".json"
          style="display: none"
          @change="importJson"
        />
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
    font-size: 12px;
    .data-schema-panel {
      display: flex;
      height: 100%;
      .panel-content {
        flex: 1;
        padding: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        .schema-content-header {
          height: 40px;
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
        .schema-config {
          flex: 1;
          overflow: auto;
        }
      }
    }
  }
</style>
