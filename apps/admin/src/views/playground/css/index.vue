<template>
  <div class="cards w-full h-full overflow-auto">
    <GradientBorder />
    <GlassMatte />
    <LiquidGlass />
    <Typewriter />
  </div>
</template>

<script setup lang="ts">
  import GlassMatte from './GlassMatte.vue';
  import GradientBorder from './GradientBorder.vue';
  import LiquidGlass from './LiquidGlass.vue';
  import Typewriter from './Typewriter.vue';
</script>

<style scoped lang="scss">
  .cards {
    display: flex;
    flex-wrap: wrap;
    background: url('@/assets/css-bg.png') no-repeat;
    background-size: cover;
    position: relative;
  }
</style>
