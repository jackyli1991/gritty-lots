<script setup lang="ts">
  import { ref } from 'vue';

  import { NeuralIcon, NeuralTooltip, NeuralBadge } from '../../components';

  interface Props {
    addBtnTooltip: string; // 添加字段按钮提示
    isEmpty: boolean; // 是否为空
    num: number; // 字段数量
    emptyText: string; // 为空时的提示
    foldingTooltip: string; // 折叠时提示信息
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['add']);

  const modelValue = defineModel<boolean>(); // 是否展开

  function add() {
    emit('add');
  }
</script>

<template>
  <div class="schema-item-tool">
    <div class="schema-tool-btn">
      <NeuralTooltip :title="addBtnTooltip">
        <NeuralBadge>
          <template #count>
            <span class="schema-badge-count">{{ num }}</span>
          </template>
          <NeuralIcon name="CirclePlus" @click="add" />
        </NeuralBadge>
      </NeuralTooltip>
      <NeuralTooltip title="折叠/展开" v-if="!isEmpty">
        <NeuralIcon
          :class="{
            'schema-expand-icon': true,
            'is-expanded': modelValue,
          }"
          name="ChevronRight"
          @click="modelValue = !modelValue"
        />
      </NeuralTooltip>
    </div>
    <div v-if="isEmpty" class="schema-empty">
      <NeuralIcon name="ArrowLeft" />
      {{ emptyText }}
    </div>
    <div v-if="!isEmpty && !modelValue" class="schema-expanded-tips">
      <NeuralIcon name="ArrowLeft" />
      {{ foldingTooltip }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .schema-item-tool {
    display: flex;
    align-items: center;
    gap: 8px;
    .schema-tool-btn {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: flex-start;
      gap: 4px;
      // 展开状态下的样式
      .schema-expand-icon {
        transition: transform 0.12s ease-in-out;
        &.is-expanded {
          transform: rotate(90deg);
        }
      }

      .schema-badge-count {
        padding: 2px;
        min-width: 14px;
        border-radius: 6px;
        color: #0588f0;
        font-size: 10px;
        font-weight: bold;
        text-align: center;
        line-height: 1;
        background-color: #e6f4fe;
      }
    }
    .schema-empty,
    .schema-expanded-tips {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }
  }
</style>
