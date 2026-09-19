<script setup lang="ts">
  import NeuralIcon from '@neural/components/icon';
  import Button from 'primevue/button';
  import type { MenuItem } from 'primevue/menuitem';
  import SplitButton from 'primevue/splitbutton';
  import vTooltip from 'primevue/tooltip';
  import { computed } from 'vue';

  import type { ToolbarDropdownItem, ToolbarItem } from './index';

  defineOptions({
    name: 'NeuralToolbar',
  });

  const props = defineProps<{
    /**
     * 二维数组：外层为按钮组，内层为组内按钮
     */
    data: ToolbarItem[][];
    /**
     * 是否显示按钮标签
     */
    showLabel?: boolean;
    /**
     * 是否禁用所有按钮
     */
    disabled?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'click', key: string): void;
  }>();

  // 过滤空组与无 key 的占位项，空数组组不渲染（也不产生多余分隔符）
  const visibleGroups = computed(() =>
    props.data.map((g) => (g || []).filter((it) => it && it.key)).filter((g) => g.length)
  );

  // 为带下拉的项构造 SplitButton 的 model，command 闭包绑定 key
  function buildModel(list: ToolbarDropdownItem[] = []): MenuItem[] {
    return list
      .filter((d) => d && d.key && !d.hidden)
      .map((d) => ({
        ...d,
        command: () => emit('click', d.key),
      }));
  }

  function handleClick(key: string) {
    emit('click', key);
  }
</script>

<template>
  <div class="neural-toolbar flex items-center gap-1">
    <template v-for="(group, gi) in visibleGroups" :key="gi">
      <div class="flex items-center gap-1.5 gap-px bg-white p-0.5 rounded-md">
        <template v-for="(item, ii) in group" :key="item.key ?? `${gi}-${ii}`">
          <!-- 带下拉：PrimeVue SplitButton -->
          <SplitButton
            v-if="item.dropdownList?.length"
            v-tooltip.top="!showLabel ? item.label : ''"
            :model="buildModel(item.dropdownList)"
            :disabled="disabled || item.disabled || item.hidden"
            :label="showLabel ? item.label : ''"
            text
            size="small"
            @click="handleClick(item.key)"
          >
            <template #icon>
              <NeuralIcon v-if="item.icon" :name="item.icon" :size="14" />
            </template>
            <template #menuitemicon="scope">
              <NeuralIcon v-if="scope.item.icon" :name="scope.item.icon as string" :size="14" />
            </template>
          </SplitButton>
          <!-- 普通按钮：PrimeVue Button -->
          <Button
            v-else
            v-tooltip.top="!showLabel ? item.label : ''"
            :disabled="disabled || item.disabled || item.hidden"
            text
            size="small"
            variant="text"
            :iconOnly="!showLabel"
            @click="handleClick(item.key)"
          >
            <NeuralIcon v-if="item.icon" :name="item.icon as string" :size="14" />
            {{ showLabel ? item.label : '' }}
          </Button>
        </template>
      </div>
    </template>
  </div>
</template>
