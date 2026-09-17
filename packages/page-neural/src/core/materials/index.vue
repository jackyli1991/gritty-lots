<template>
  <div class="gritty-page-neural-materials">
    <div class="materials-list">
      <div class="header">
        <NeuralIcon class="icon" name="Component" />
        <div class="title">Materials</div>
      </div>
      <div class="content">list</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { NeuralIcon } from '../../components';
</script>

<style lang="scss" scoped>
  .gritty-page-neural-materials {
    position: absolute;
    height: 100%;
    top: 0;
    left: 0;
    overflow: hidden;

    .materials-list {
      width: 32px;
      height: 32px;
      overflow: hidden;
      background-color: #fff;
      display: flex;
      flex-direction: column;
      border-radius: 4px;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.125);
      transition:
        width 200ms ease,
        height 200ms ease;

      .header {
        display: flex;
        align-items: center;
        padding: 4px;
        height: 32px;
        line-height: 32px;
        overflow: hidden;

        .icon {
          padding: 0 4px;
        }

        .title {
          display: none;
        }
      }

      .content {
        display: none;
        flex: 1;
        padding: 4px;
        overflow: hidden;
      }

      &:hover {
        width: 200px;
        height: 100%;
        overflow: auto;

        .header {
          border-bottom: 1px solid #e5e5e5;
        }

        .header .title {
          display: block;
        }

        .content {
          display: block;
        }
      }
    }
  }
</style>
