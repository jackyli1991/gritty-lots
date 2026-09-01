<!--
基于 a-design-vue Layout的布局组件
包含 header、sider、content、footer 四个区域
content区域用于渲染路由组件 -->
<template>
  <aConfigProvider :theme="antDesignTheme">
    <aLayout :style="layoutStyle">
      <!-- 侧边栏 -->
      <aLayoutSider v-model:collapsed="collapsed" class="h-full" collapsible theme="light">
        <LayoutAside />
      </aLayoutSider>
      <aLayout>
        <!-- 头部 -->
        <aLayoutHeader :style="headerStyle">
          <LayoutHeader />
        </aLayoutHeader>
        <!-- 内容区域 -->
        <aLayout>
          <aLayoutContent>
            <LayoutContent>
              <RouterView />
            </LayoutContent>
          </aLayoutContent>
          <!-- <aLayoutFooter>footer</aLayoutFooter> -->
        </aLayout>
      </aLayout>
    </aLayout>
  </aConfigProvider>
</template>

<script setup lang="ts">
  import {
    ConfigProvider as aConfigProvider,
    Layout as aLayout,
    LayoutHeader as aLayoutHeader,
    LayoutSider as aLayoutSider,
    LayoutContent as aLayoutContent,
    // LayoutFooter as aLayoutFooter,
  } from 'ant-design-vue';
  import { storeToRefs } from 'pinia';
  import type { CSSProperties } from 'vue';

  import { useLayoutStore } from '@/stores/layout';

  import LayoutAside from './LayoutAside.vue';
  import LayoutContent from './layoutContent.vue';
  import LayoutHeader from './LayoutHeader.vue';

  const layoutStore = useLayoutStore();
  const { collapsed, antDesignTheme } = storeToRefs(layoutStore);

  defineOptions({
    name: 'LayoutIndex',
  });

  const layoutStyle: CSSProperties = {
    height: '100%',
  };

  const headerStyle: CSSProperties = {
    backgroundColor: 'transparent',
    height: 'auto',
    padding: 0,
    lineHeight: 1,
  };
</script>
