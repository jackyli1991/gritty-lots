<script setup lang="ts">
  import { useClipboard } from '@vueuse/core';
  import { ref, nextTick, useTemplateRef, watch, onMounted } from 'vue';

  import {
    NeuralIcon,
    NeuralTooltip,
    NeuralMessage,
    NeuralConfigProvider,
    NeuralTheme,
  } from '../../components';
  import SchemaGroup from './schemaGroup.vue';
  import SchemaViewer from './schemaViewer.vue';
  import { type JSONSchemaObject } from './types';
  import { exportJSON, importJSON } from './utils';

  interface Props {
    readonly?: boolean; // 是否只读
    colorPrimary?: string; // 主色
  }

  const props = withDefaults(defineProps<Props>(), {
    readonly: false,
    colorPrimary: '#12A594',
  });

  const schemaData = ref<JSONSchemaObject>({
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    properties: {},
    required: [],
  });
  const { copy } = useClipboard({ legacy: true });
  const schemaGroupRef = useTemplateRef<typeof SchemaGroup>('schemaGroupRef');

  const { useToken } = NeuralTheme;
  const { token } = useToken();

  // 复制 JSON 数据
  const copyJson = () => {
    copy(JSON.stringify(schemaData.value, null, 2));
    NeuralMessage.success('已复制到剪贴板');
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
      NeuralMessage.success('导入完成');
    } catch (error: any) {
      NeuralMessage.error(error?.message || '导入失败');
    }
  };

  // 折叠所有配置
  const foldOptions = () => {
    schemaGroupRef.value?.foldOptions();
  };

  // 更新主色css变量
  async function updateColorPrimary() {
    await nextTick();
    const el = document.querySelector('.gritty-data-schema') as HTMLElement;
    if (el) {
      el.style.setProperty('--gritty-schema-color-primary', token.value.colorPrimary);
      el.style.setProperty('--gritty-schema-color-primary-bg', token.value.colorPrimaryBg);
    }
  }

  onMounted(() => {
    updateColorPrimary();
  });

  // 监听 colorPrimary 变化
  watch(() => props.colorPrimary, updateColorPrimary, { immediate: true });
</script>

<template>
  <NeuralConfigProvider
    :theme="{
      token: {
        colorPrimary,
      },
    }"
  >
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
              :readonly="readonly"
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
  </NeuralConfigProvider>
</template>

<style lang="scss" scoped>
  .gritty-data-schema {
    --gritty-schema-color-primary: #0588f0; // 主色
    --gritty-schema-color-primary-bg: #e6f4fe; // 主色背景
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
