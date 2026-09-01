<!-- 主题切换图标 -->
<template>
  <aPopover>
    <Iconify class="mr-2.5" :name="ICONIFY_ICONS.theme" />
    <template #content>
      <div class="flex items-center justify-center">
        <ChromePicker :modelValue="color" @update:modelValue="toggleColor" />
      </div>
    </template>
  </aPopover>
</template>

<script setup lang="ts">
  import { Popover as aPopover } from 'ant-design-vue';
  import { storeToRefs } from 'pinia';
  import { ref } from 'vue';
  import { ChromePicker } from 'vue-color';

  import 'vue-color/style.css';
  import { ICONIFY_ICONS } from '@/icons';
  import { useLayoutStore } from '@/stores/layout';

  defineOptions({
    name: 'ThemeIcon',
  });

  const layoutStore = useLayoutStore();
  const { themeColor } = storeToRefs(layoutStore);
  const { setThemeColor } = layoutStore;

  // 主题颜色
  const color = ref<string>(themeColor.value);

  // 切换颜色
  const toggleColor = (val: string) => {
    color.value = val;
    setThemeColor(val); // 更新主题颜色
  };
</script>
