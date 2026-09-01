<template>
  <aDropdown placement="bottom" arrow>
    <Iconify :name="ICONIFY_ICONS.language" />
    <template #overlay>
      <aMenu @click="handleMenuClick">
        <aMenu.Item v-for="item in localeList" :key="item.value" :value="item.value">
          <span
            :style="{
              color: locale === item.value ? themeColor : 'inherit',
            }"
          >
            {{ item.label }}
          </span>
        </aMenu.Item>
      </aMenu>
    </template>
  </aDropdown>
</template>

<script setup lang="ts">
  import type { MenuProps } from 'ant-design-vue';
  import { Dropdown as aDropdown, Menu as aMenu } from 'ant-design-vue';
  import { storeToRefs } from 'pinia';

  import { localeList, useLocale, setLocale, type LocaleType } from '@/i18n';
  import { ICONIFY_ICONS } from '@/icons';
  import { useLayoutStore } from '@/stores/layout';

  // 主题色
  const layoutStore = useLayoutStore();
  const { themeColor } = storeToRefs(layoutStore);
  const { locale } = useLocale();

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    setLocale(key as LocaleType);
  };
</script>

<style scoped lang="scss">
  .active-locale {
    color: #1890ff;
  }
</style>
