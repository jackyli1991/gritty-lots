<script setup lang="ts">
  import { useClipboard } from '@vueuse/core';
  import { message } from 'ant-design-vue';
  import { JsonViewer } from 'vue3-json-viewer';

  import { NeuralIcon, NeuralTooltip } from '../../components';
  import ajv from './ajv-instance.ts';
  import { type JSONSchemaObject } from './types';
  import { exportJSON, importJSON } from './utils';

  import 'vue3-json-viewer/dist/vue3-json-viewer.css';

  interface Props {
    jsonData: JSONSchemaObject;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['update:jsonData']);

  const { copy } = useClipboard({ legacy: true });

  // 复制 JSON 数据
  const copyJson = () => {
    copy(JSON.stringify(props.jsonData, null, 2));
    message.success('已复制到剪贴板');
  };

  // 导出 JSON 数据
  const exportJson = () => {
    exportJSON(props.jsonData, 'json-schema.json');
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
      const validate = ajv.compile(data as JSONSchemaObject) as any;
      const valid = validate(validate);
      if (!valid) {
        message.error('json schema 校验失败');
        console.log(validate.errors);
        return;
      }
      emit('update:jsonData', data);
      message.success('导入完成');
    } catch (error: any) {
      message.error(error?.message || '导入失败');
      console.dir(error);
    }
  };
</script>

<template>
  <div class="gritty-data-schema-viewer">
    <div class="schema-view-header">
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
    <JsonViewer :value="jsonData" boxed theme="light" />
  </div>
  <!-- 隐藏的 上传选择input -->
  <input type="file" id="fileInput" accept=".json" style="display: none" @change="importJson" />
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
