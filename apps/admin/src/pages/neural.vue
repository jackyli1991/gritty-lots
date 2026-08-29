<script setup lang="ts">
  import { RadioGroup, Radio } from 'ant-design-vue';

  import { useLocale } from '../i18n';
  import type { LocaleType } from '../i18n';

  const { locale, setLocale } = useLocale();

  const handleChange = () => {
    setLocale(locale.value as LocaleType);
  };
</script>

<template>
  <RadioGroup v-model:value="locale" @change="handleChange">
    <Radio value="zh-CN">中文</Radio>
    <Radio value="en-US">English</Radio>
  </RadioGroup>
  <NeuralJsonSchema />
  <NeuralGraph style="height: 100vh; width: 100vw" />
</template>
