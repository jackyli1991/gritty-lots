<script setup lang="ts">
  import { NeuralButton, NeuralIcon } from '../components';

  defineOptions({
    name: 'NeuralGraph',
  });
</script>

<template>
  <div>
    I am a neural graph.
    <NeuralButton type="primary">Click me</NeuralButton>
    <NeuralIcon label="Click me" name="ArrowBigDown" stroke-width="3" />
    <NeuralIcon name="AlarmClock" color="red" />
  </div>
</template>
