<template>
  <Card title="Web Component" size="small">
    <div class="flex items-start gap-4">
      <gritty-shadow-web-component title="原生 Web Component 示例">
        <p>{{ name }}</p>
      </gritty-shadow-web-component>
      <Input v-model:value="name" placeholder="请输入" style="width: 200px" />
    </div>
    <div>
      <gritty-hello-lit :name="name"></gritty-hello-lit>
    </div>
  </Card>
</template>

<script setup lang="ts">
  // oxlint-disable-next-line import/no-unassigned-import
  import './ShadowWebComponent.js';
  // oxlint-disable-next-line import/no-unassigned-import
  import './lit.ts';
  import { Card, Input } from 'ant-design-vue';
  import { ref } from 'vue';

  defineOptions({
    name: 'PlaygroundHtml',
  });

  const name = ref('lit');
</script>
