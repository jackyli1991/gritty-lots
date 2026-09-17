<template>
  <Draggable :initial-value="{ x: 50, y: 150 }">
    <div class="gradient-border">
      <div>渐变边框</div>
    </div>
  </Draggable>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
  .gradient-border {
    --white: #fff;
    --primary: #0d4ef2;
    width: 10em;
    height: 10em;
    border-radius: 1em;
    box-shadow: 0 0.25em 0.375em hsla(0, 0%, 64%, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;

    &:before,
    &:after {
      border-radius: inherit;
      content: '';
      display: block;
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    &:before {
      border: 1px solid var(--white);
      mask-image: linear-gradient(135deg, var(--white), transparent 50%);
    }
    &:after {
      border: 1px solid var(--primary);
      mask-image: linear-gradient(135deg, transparent 50%, var(--white));
    }
  }
</style>
