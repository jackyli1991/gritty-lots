<script setup lang="ts">
  import { Icon as GIcon } from '.';
  import DocSection from '../overview/components/DocSection.vue';

  defineOptions({ name: 'IconDoc' });

  const sizes = ['xs', 'sm', 'default', 'lg'] as const;
  const variants = ['line', 'fill', 'original'] as const;

  const commonIcons = [
    'home',
    'search',
    'settings-3',
    'user',
    'notification-3',
    'mail',
    'heart',
    'star',
    'check',
    'close',
    'arrow-down-s',
    'arrow-right-s',
    'arrow-left',
    'arrow-right',
    'add',
    'subtract',
    'edit',
    'delete-bin',
    'download',
    'upload',
    'eye',
    'eye-off',
    'file-copy',
    'clipboard',
  ];

  const colorIcons = [
    { name: 'checkbox-circle', color: 'var(--color-success)' },
    { name: 'error-warning', color: 'var(--color-warning)' },
    { name: 'close-circle', color: 'var(--color-destructive)' },
    { name: 'information', color: 'var(--color-info)' },
    { name: 'heart', color: 'var(--color-primary)' },
  ];

  const originalIcons = ['github', 'google', 'apple', 'twitter', 'wechat', 'alipay'];
</script>

<template>
  <div class="grid grid-cols-2 gap-4 p-6">
    <!-- 基本用法 -->
    <DocSection title="基本用法" :tags="['name', 'variant']" demo-class="flex flex-col gap-2">
      <template #description>
        通过 <code class="text-foreground">name</code> 指定图标名称，支持 kebab-case（
        <code class="text-foreground">home</code>）或全名（
        <code class="text-foreground">RiHomeLine</code>）。通过
        <code class="text-foreground">variant</code> 选择线性/填充/品牌变体。默认使用
        <code class="text-foreground">line</code>（线性）。
      </template>
      <div class="flex items-center gap-4 text-foreground">
        <GIcon name="home" />
        <GIcon name="search" />
        <GIcon name="settings-3" />
        <GIcon name="notification-3" />
        <GIcon name="user" />
      </div>
    </DocSection>

    <!-- 尺寸 -->
    <DocSection title="图标尺寸" :tags="['size']" demo-class="flex flex-col gap-2">
      <template #description>
        <code class="text-foreground">size</code> 支持预设档位（xs/sm/default/lg）或自定义像素值。
      </template>
      <div class="flex items-end gap-4 text-foreground">
        <div v-for="s in sizes" :key="s" class="flex flex-col items-center gap-1">
          <GIcon name="star" :size="s" />
          <span class="text-xs text-muted-foreground">{{ s }}</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <GIcon name="star" :size="32" />
          <span class="text-xs text-muted-foreground">32</span>
        </div>
      </div>
    </DocSection>

    <!-- 变体 -->
    <DocSection title="图标变体" :tags="['variant']" demo-class="flex flex-col gap-2">
      <template #description>
        Remix Icon 提供三种变体：<code class="text-foreground">line</code>（线性描边）、
        <code class="text-foreground">fill</code>（填充）、
        <code class="text-foreground">original</code>（品牌原色）。
      </template>
      <div class="flex items-center gap-6 text-foreground">
        <div v-for="v in variants" :key="v" class="flex flex-col items-center gap-1">
          <GIcon name="star" :variant="v" size="lg" />
          <span class="text-xs text-muted-foreground">{{ v }}</span>
        </div>
      </div>
    </DocSection>

    <!-- 颜色 -->
    <DocSection title="图标颜色" :tags="['color']" demo-class="flex flex-col gap-2">
      <template #description>
        <code class="text-foreground">color</code> 接受任意 CSS 颜色值。不设置时使用
        <code class="text-foreground">currentColor</code> 继承父级。
      </template>
      <div class="flex items-center gap-4">
        <GIcon
          v-for="item in colorIcons"
          :key="item.name"
          :name="item.name"
          size="lg"
          :color="item.color"
        />
      </div>
      <div class="flex items-center gap-4 text-primary">
        <GIcon name="check" size="sm" />
        <span class="text-sm">继承父级 currentColor</span>
      </div>
    </DocSection>

    <!-- 品牌原色 -->
    <DocSection
      title="品牌原色图标"
      :tags="['variant: original']"
      span2
      demo-class="flex flex-wrap gap-3"
    >
      <template #description>
        使用
        <code class="text-foreground">variant="original"</code>
        显示品牌原色图标（部分品牌图标需使用全名，如
        <code class="text-foreground">RiGithubLine</code>）。
      </template>
      <div
        v-for="name in originalIcons"
        :key="name"
        class="flex flex-col items-center gap-1 rounded-md border border-border p-2 hover:bg-accent transition-colors"
        :title="name"
      >
        <GIcon :name="name" variant="original" size="lg" />
        <span class="text-[10px] text-muted-foreground">{{ name }}</span>
      </div>
    </DocSection>

    <!-- 常用图标集 -->
    <DocSection title="常用图标" :tags="['24 icons']" span2 demo-class="grid grid-cols-8 gap-3">
      <template #description>
        基于 <code class="text-foreground">@remixicon/vue</code>，提供 2800+
        图标。以下为常用图标展示，完整列表见
        <a
          href="https://remixicon.com"
          target="_blank"
          class="text-primary underline-offset-2 hover:underline"
          >remixicon.com</a
        >。
      </template>
      <div
        v-for="name in commonIcons"
        :key="name"
        class="flex flex-col items-center gap-1 rounded-md border border-border p-2 hover:bg-accent transition-colors cursor-pointer"
        :title="name"
      >
        <GIcon :name="name" class="text-foreground" />
        <span class="text-[10px] text-muted-foreground truncate w-full text-center">{{
          name
        }}</span>
      </div>
    </DocSection>

    <!-- 与按钮组合 -->
    <DocSection title="与按钮组合" :tags="['slot']" span2 demo-class="flex flex-wrap gap-2">
      <template #description>
        图标可直接作为
        <code class="text-foreground">GButton</code> 的子元素，按钮会自动调整内边距并设置图标尺寸。
      </template>
      <g-button variant="primary">
        <GIcon name="add" />
        新建
      </g-button>
      <g-button variant="outline">
        <GIcon name="download" />
        下载
      </g-button>
      <g-button variant="destructive">
        <GIcon name="delete-bin" />
        删除
      </g-button>
      <g-button variant="ghost">
        <GIcon name="edit" />
        编辑
      </g-button>
      <g-button variant="outline" size="icon">
        <GIcon name="search" />
      </g-button>
      <g-button variant="outline" size="icon-sm">
        <GIcon name="settings-3" />
      </g-button>
    </DocSection>
  </div>
</template>
