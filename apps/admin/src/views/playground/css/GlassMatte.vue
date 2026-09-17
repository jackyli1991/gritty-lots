<template>
  <Draggable :initial-value="{ x: 500, y: 150 }">
    <div class="glass-matte">
      <div class="label">毛玻璃材质</div>
    </div>
  </Draggable>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
  .glass-matte {
    width: 12.5em;
    height: 12.5em;
    border-radius: 1em;
    // 半透明白底作为玻璃色调
    background: rgba(255, 255, 255, 0.2);
    // 真正的毛玻璃：模糊背后背景图
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 0.25em 1.875em rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .label {
    color: #fff;
    font-size: 1em;
    font-weight: 500;
    text-shadow: 0 0.0625em 0.25em rgba(0, 0, 0, 0.3);
  }
</style>
