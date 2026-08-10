<script setup lang="ts">
  import { OverviewDoc, ButtonDoc, InputDoc, SelectDoc } from '@gritty-lots/ui/doc';
  import { markRaw, ref, computed } from 'vue';

  import ColorModeSwitcher from './ColorModeSwitcher.vue';
  import ThemeColorSwitcher from './ThemeColorSwitcher.vue';

  defineOptions({ name: 'ComponentDocs' });

  interface DocEntry {
    key: string;
    label: string;
    doc: ReturnType<typeof markRaw>;
  }

  const components: DocEntry[] = [
    { key: 'overview', label: '框架总览', doc: markRaw(OverviewDoc) },
    { key: 'button', label: 'Button 按钮', doc: markRaw(ButtonDoc) },
    { key: 'input', label: 'Input 输入框', doc: markRaw(InputDoc) },
    { key: 'select', label: 'Select 选择器', doc: markRaw(SelectDoc) },
  ];

  const activeKey = ref<string>(components[0].key);
  const activeDoc = computed(() => components.find((c) => c.key === activeKey.value)?.doc);
</script>

<template>
  <main
    class="mx-auto p-3 h-screen bg-background text-foreground flex flex-col gap-6 overflow-hidden"
  >
    <header
      class="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-border bg-background pb-3"
    >
      <ColorModeSwitcher />
      <ThemeColorSwitcher />
    </header>

    <div class="flex gap-8 flex-1 overflow-auto">
      <!-- 左侧导航：sticky 跟随滚动 -->
      <nav class="sticky top-4 h-fit w-48 shrink-0">
        <ul class="flex flex-col gap-1">
          <li v-for="c in components" :key="c.key">
            <button
              type="button"
              :aria-current="activeKey === c.key ? 'page' : undefined"
              class="w-full rounded-md px-3 py-1.5 text-left text-sm transition"
              :class="
                activeKey === c.key
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              "
              @click="activeKey = c.key"
            >
              {{ c.label }}
            </button>
          </li>
        </ul>
      </nav>

      <!-- 右侧文档内容 -->
      <div class="min-w-0 flex-1">
        <component :is="activeDoc" />
      </div>
    </div>
  </main>
</template>
