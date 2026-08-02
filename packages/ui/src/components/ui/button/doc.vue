<script setup lang="ts">
  defineOptions({ name: 'ButtonDoc' });

  const variants = [
    'default',
    'primary',
    'success',
    'warning',
    'info',
    'destructive',
    'outline',
    'secondary',
    'ghost',
    'link',
  ] as const;

  const sizes = ['mini', 'xs', 'sm', 'default', 'lg'] as const;

  const shapes = ['default', 'circle', 'round'] as const;
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- variant -->
    <section class="flex flex-col gap-2">
      <div class="flex flex-col gap-0.5">
        <div class="flex items-center gap-2">
          <code class="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">variant</code>
          <span class="text-sm font-medium">按钮样式变体</span>
        </div>
        <p class="text-xs text-muted-foreground">
          控制按钮的视觉风格。可选值：default、primary、success、warning、info、destructive、outline、secondary、ghost、link。默认
          default。
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <g-button v-for="v in variants" :key="v" :variant="v">{{ v }}</g-button>
      </div>
    </section>

    <!-- size -->
    <section class="flex flex-col gap-2">
      <div class="flex flex-col gap-0.5">
        <div class="flex items-center gap-2">
          <code class="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">size</code>
          <span class="text-sm font-medium">按钮尺寸</span>
        </div>
        <p class="text-xs text-muted-foreground">
          控制按钮的高度与内边距。可选值：mini、xs、sm、default、lg，以及图标专用
          icon-xs、icon-sm、icon、icon-lg。默认 default。
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <g-button v-for="s in sizes" :key="s" :size="s" variant="primary">{{ s }}</g-button>
      </div>
    </section>

    <!-- shape -->
    <section class="flex flex-col gap-2">
      <div class="flex flex-col gap-0.5">
        <div class="flex items-center gap-2">
          <code class="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">shape</code>
          <span class="text-sm font-medium">按钮形状</span>
        </div>
        <p class="text-xs text-muted-foreground">
          控制按钮的圆角形态。可选值：default（圆角矩形）、circle（正圆，常配合 icon
          尺寸做图标按钮）、round（全圆角胶囊）。默认 default。
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <g-button v-for="sh in shapes" :key="sh" :shape="sh" variant="primary">{{ sh }}</g-button>
      </div>
    </section>

    <!-- state: loading / disabled / danger -->
    <section class="flex flex-col gap-2">
      <div class="flex flex-col gap-0.5">
        <div class="flex flex-wrap items-center gap-2">
          <code class="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">loading</code>
          <code class="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">disabled</code>
          <code class="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">danger</code>
          <span class="text-sm font-medium">按钮状态</span>
        </div>
        <ul class="flex flex-col gap-0.5 text-xs text-muted-foreground">
          <li>
            <code class="text-foreground">loading</code
            >：加载中，显示旋转图标并禁用交互（boolean，默认 false）。
          </li>
          <li>
            <code class="text-foreground">disabled</code
            >：禁用按钮，不可点击且降低不透明度（boolean，默认 false）。
          </li>
          <li>
            <code class="text-foreground">danger</code>：危险语义，将当前 variant 的配色覆盖为
            destructive 红色（boolean，默认 false）。
          </li>
        </ul>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <g-button variant="primary" loading>Loading</g-button>
        <g-button variant="primary" disabled>Disabled</g-button>
        <g-button variant="primary" danger>Danger</g-button>
      </div>
    </section>

    <!-- ghost -->
    <section class="flex flex-col gap-2">
      <div class="flex flex-col gap-0.5">
        <div class="flex items-center gap-2">
          <code class="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">ghost</code>
          <span class="text-sm font-medium">幽灵模式</span>
        </div>
        <p class="text-xs text-muted-foreground">
          使背景透明并保留 variant 的文字颜色，hover 时显示淡色背景。可与任意 variant
          组合，适合在有色背景上使用（boolean，默认 false）。
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <g-button v-for="v in variants" :key="'ghost-' + v" :variant="v" ghost>{{ v }}</g-button>
      </div>
    </section>
  </div>
</template>
