<script setup lang="ts">
  import DocSection from '../overview/components/DocSection.vue';

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
  <div class="grid grid-cols-2 gap-4 p-6">
    <DocSection title="按钮样式变体" :tags="['variant']">
      <template #description>
        <p class="text-xs text-muted-foreground">
          控制按钮的视觉风格。可选值：default、primary、success、warning、info、destructive、outline、secondary、ghost、link。默认
          default。
        </p>
      </template>
      <div class="flex flex-wrap gap-2">
        <g-button v-for="v in variants" :key="v" :variant="v">{{ v }}</g-button>
      </div>
    </DocSection>

    <DocSection title="按钮尺寸" :tags="['size']">
      <template #description>
        <p class="text-xs text-muted-foreground">
          控制按钮的高度与内边距。可选值：mini、xs、sm、default、lg，以及图标专用
          icon-xs、icon-sm、icon、icon-lg。默认 default。
        </p>
      </template>
      <div class="flex flex-wrap items-center gap-2">
        <g-button v-for="s in sizes" :key="s" :size="s" variant="primary">{{ s }}</g-button>
      </div>
    </DocSection>

    <DocSection title="按钮形状" :tags="['shape']">
      <template #description>
        <p class="text-xs text-muted-foreground">
          控制按钮的圆角形态。可选值：default（圆角矩形）、circle（正圆，常配合 icon
          尺寸做图标按钮）、round（全圆角胶囊）。默认 default。
        </p>
      </template>
      <div class="flex flex-wrap items-center gap-2">
        <g-button v-for="sh in shapes" :key="sh" :shape="sh" variant="primary">{{ sh }}</g-button>
      </div>
    </DocSection>

    <DocSection title="按钮状态" :tags="['loading', 'disabled', 'danger']">
      <template #description>
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
      </template>
      <div class="flex flex-wrap items-center gap-2">
        <g-button variant="primary" loading>Loading</g-button>
        <g-button variant="primary" disabled>Disabled</g-button>
        <g-button variant="primary" danger>Danger</g-button>
      </div>
    </DocSection>

    <DocSection title="幽灵模式" :tags="['ghost']" span2>
      <template #description>
        <p class="text-xs text-muted-foreground">
          使背景透明并保留 variant 的文字颜色，hover 时显示淡色背景。可与任意 variant
          组合，适合在有色背景上使用（boolean，默认 false）。
        </p>
      </template>
      <div class="flex flex-wrap gap-2">
        <g-button v-for="v in variants" :key="'ghost-' + v" :variant="v" ghost>{{ v }}</g-button>
      </div>
    </DocSection>
  </div>
</template>
