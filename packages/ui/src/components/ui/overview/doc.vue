<script setup lang="ts">
  import { computed, ref } from 'vue';

  import { useColorMode } from '../../../composables/useColorMode';
  import { useRipple } from '../../../composables/useRipple';
  import { useThemeColor } from '../../../composables/useThemeColor';

  defineOptions({ name: 'OverviewDoc' });

  const { mode, setMode, colorModes, isDark } = useColorMode();
  const { themeColor, setThemeColor, themeColors } = useThemeColor();
  const { trigger } = useRipple();

  const rippleCount = ref(0);

  const currentScaleSteps = computed(() =>
    Array.from({ length: 12 }, (_, i) => ({
      step: i + 1,
      cssVar: `var(--${themeColor.value}-${i + 1})`,
    }))
  );

  const codeBlock = 'rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground';

  const tagHtml = '<html>';
  const tagHtmlDataThemeColor = '<html data-theme-color>';

  const snippetInstall = [
    `import { createApp } from 'vue';`,
    `import { GrittyUI } from '@gritty-lots/ui';`,
    `import '@gritty-lots/ui/style.css';`,
    `import App from './App.vue';`,
    ``,
    `createApp(App).use(GrittyUI).mount('#app');`,
  ].join('\n');

  const snippetImport = [
    `import { GButton, buttonVariants, cn } from '@gritty-lots/ui';`,
    ``,
    `// <g-button variant="primary">按钮</g-button>`,
  ].join('\n');

  const snippetColorMode = [
    `import { useColorMode } from '@gritty-lots/ui';`,
    ``,
    `const { mode, resolved, isDark, setMode, toggle, colorModes } = useColorMode();`,
    `// mode.value: 'light' | 'dark' | 'system'`,
    `// resolved.value: 'light' | 'dark'`,
    `// setMode('dark'); toggle();`,
  ].join('\n');

  const snippetThemeColor = [
    `import { useThemeColor } from '@gritty-lots/ui';`,
    ``,
    `const { themeColor, setThemeColor, themeColors } = useThemeColor();`,
    `// themeColor.value: 'blue' | 'indigo' | ...`,
  ].join('\n');

  const snippetRipple = [
    `import { useRipple } from '@gritty-lots/ui';`,
    ``,
    `const { trigger } = useRipple({ duration: 550, peakOpacity: 0.35 });`,
    ``,
    `// template:`,
    `// <button class="relative overflow-hidden" @pointerdown="trigger">click</button>`,
  ].join('\n');

  const snippetUtilities = [
    `import { cn } from '@gritty-lots/ui';`,
    `import { buttonVariants } from '@gritty-lots/ui';`,
    ``,
    `const classes = cn('px-2 py-1', buttonVariants({ variant: 'primary', size: 'sm' }));`,
  ].join('\n');

  const snippetThemeCustomize = [
    `/* 新增主题色：在 style.css 添加规则 */`,
    `[data-theme-color="teal"] {`,
    `  --gritty-design-primary: var(--teal-10);`,
    `  --gritty-design-primary-foreground: var(--teal-1);`,
    `}`,
    `/* 并在 useThemeColor.ts 的 THEME_COLORS 中加入条目 */`,
  ].join('\n');

  const snippetDirStructure = [
    `src/`,
    `├── components/ui/        # 组件`,
    `│   ├── button/`,
    `│   │   ├── Button.vue    # 组件实现`,
    `│   │   ├── doc.vue       # 文档示例`,
    `│   │   └── index.ts      # CVA variants 导出`,
    `│   └── input/`,
    `├── composables/          # useColorMode / useThemeColor / useRipple`,
    `├── lib/utils.ts          # cn 工具`,
    `├── style.css             # 主题 token + Radix Colors`,
    `├── index.ts              # 包入口（组件 + composables）`,
    `└── doc.ts                # 文档组件入口`,
  ].join('\n');

  const snippetQuickStart = [
    `// main.ts`,
    `import { createApp } from 'vue';`,
    `import { GrittyUI } from '@gritty-lots/ui';`,
    `import '@gritty-lots/ui/style.css';`,
    `import App from './App.vue';`,
    ``,
    `createApp(App).use(GrittyUI).mount('#app');`,
    ``,
    `// App.vue`,
    `// <script setup>`,
    `//   import { useColorMode, useThemeColor } from '@gritty-lots/ui';`,
    `//   const { mode, setMode } = useColorMode();`,
    `//   const { themeColor, setThemeColor } = useThemeColor();`,
    `// ${'<'}script>`,
    `//`,
    `// <template>`,
    `//   <g-button variant="primary" @click="setMode(mode === 'dark' ? 'light' : 'dark')">`,
    `//     切换明暗模式`,
    `//   </g-button>`,
    `// ${'<'}template>`,
  ].join('\n');

  const snippetCn = [
    `import { cn } from '@gritty-lots/ui';`,
    `cn('px-2 py-1', isActive && 'bg-primary', disabled && 'opacity-50');`,
  ].join('\n');

  const controlSizes = [
    {
      key: 'mini',
      label: 'Mini',
      cssVar: '--gritty-design-control-mini',
      height: '1.25rem',
      px: 20,
    },
    { key: 'xs', label: 'XS', cssVar: '--gritty-design-control-xs', height: '1.5rem', px: 24 },
    { key: 'sm', label: 'SM', cssVar: '--gritty-design-control-sm', height: '1.75rem', px: 28 },
    {
      key: 'default',
      label: 'Default',
      cssVar: '--gritty-design-control-default',
      height: '2rem',
      px: 32,
    },
    { key: 'lg', label: 'LG', cssVar: '--gritty-design-control-lg', height: '2.25rem', px: 36 },
  ] as const;

  const statusColors = [
    {
      key: 'success',
      label: 'Success',
      colorVar: '--gritty-design-success',
      fgVar: '--gritty-design-success-foreground',
    },
    {
      key: 'warning',
      label: 'Warning',
      colorVar: '--gritty-design-warning',
      fgVar: '--gritty-design-warning-foreground',
    },
    {
      key: 'info',
      label: 'Info',
      colorVar: '--gritty-design-info',
      fgVar: '--gritty-design-info-foreground',
    },
    {
      key: 'destructive',
      label: 'Destructive',
      colorVar: '--gritty-design-destructive',
      fgVar: '--gritty-design-destructive-foreground',
    },
  ] as const;

  const disabledOpacity = 0.15;

  const borderColors = [
    {
      key: 'border',
      label: 'Border',
      cssVar: '--gritty-design-border',
      tailwind: 'border-border',
      desc: '默认边框色，用于卡片、分隔线等',
    },
  ] as const;

  const radiusTokens = [
    {
      key: 'sm',
      cssVar: '--radius-sm',
      formula: 'calc(var(--gritty-design-radius) - 4px)',
      tailwind: 'rounded-sm',
    },
    {
      key: 'md',
      cssVar: '--radius-md',
      formula: 'calc(var(--gritty-design-radius) - 2px)',
      tailwind: 'rounded-md',
    },
    {
      key: 'lg',
      cssVar: '--radius-lg',
      formula: 'var(--gritty-design-radius)',
      tailwind: 'rounded-lg',
    },
    {
      key: 'xl',
      cssVar: '--radius-xl',
      formula: 'calc(var(--gritty-design-radius) + 4px)',
      tailwind: 'rounded-xl',
    },
  ] as const;

  const focusRingTokens = [
    {
      key: 'width',
      label: '宽度',
      cssVar: '--gritty-design-focus-ring-width',
      value: '3px',
      tailwind: 'ring-[length:var(--gritty-design-focus-ring-width)]',
      desc: 'focus-within / focus-visible / data-[state=open] 时的 ring 宽度',
    },
    {
      key: 'opacity',
      label: '透明度',
      cssVar: '--gritty-design-focus-ring-opacity',
      value: '20%',
      tailwind: 'color-mix(in oklab, var(--color) 20%, transparent)',
      desc: 'ring 颜色相对于基础色的混合比例',
    },
  ] as const;

  const focusRingColors = [
    {
      key: 'primary',
      label: 'Primary',
      colorToken: '--color-focus-ring-primary',
      baseVar: '--gritty-design-primary',
      tailwind: 'ring-focus-ring-primary',
      status: 'default',
    },
    {
      key: 'destructive',
      label: 'Destructive',
      colorToken: '--color-focus-ring-destructive',
      baseVar: '--gritty-design-destructive',
      tailwind: 'ring-focus-ring-destructive',
      status: 'error',
    },
    {
      key: 'warning',
      label: 'Warning',
      colorToken: '--color-focus-ring-warning',
      baseVar: '--gritty-design-warning',
      tailwind: 'ring-focus-ring-warning',
      status: 'warning',
    },
  ] as const;
</script>

<template>
  <div class="flex flex-col gap-8 p-6">
    <!-- 框架介绍 -->
    <section class="flex flex-col gap-2">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold tracking-tight">@gritty-lots/ui</h1>
        <span class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          v0.0.0
        </span>
      </div>
      <p class="text-sm text-muted-foreground leading-relaxed">
        基于 Vue 3 + TypeScript + Tailwind CSS v4 + Radix Colors 的内部组件库。组件采用
        <code :class="codeBlock">class-variance-authority</code> 管理 variants，样式 token 走
        Tailwind 主题变量。颜色系统接入 Radix Colors，支持 8
        套主题色实时切换，内置明暗模式与防首屏闪烁。
      </p>
      <div class="flex flex-wrap gap-2 pt-1">
        <span class="rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground">Vue 3.5+</span>
        <span class="rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground"
          >TypeScript</span
        >
        <span class="rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground"
          >Tailwind CSS v4</span
        >
        <span class="rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground"
          >Radix Colors</span
        >
        <span class="rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground">CVA</span>
      </div>
    </section>

    <!-- 安装 -->
    <section class="flex flex-col gap-3">
      <h2 class="text-base font-semibold">安装</h2>
      <div class="rounded-lg border border-border bg-muted/30 p-3">
        <code class="text-sm font-mono">pnpm add @gritty-lots/ui</code>
      </div>
      <p class="text-xs text-muted-foreground">
        依赖要求：vue ^3.5.0、tailwindcss ^4、@tailwindcss/vite
      </p>
    </section>

    <!-- 使用 -->
    <section class="flex flex-col gap-3">
      <h2 class="text-base font-semibold">使用</h2>

      <div class="flex flex-col gap-2">
        <h3 class="text-sm font-medium">1. 引入样式</h3>
        <div class="rounded-lg border border-border bg-muted/30 p-3">
          <pre
            class="text-xs font-mono leading-relaxed"
          ><code>import '@gritty-lots/ui/style.css';</code></pre>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <h3 class="text-sm font-medium">2. 注册插件（推荐）</h3>
        <p class="text-xs text-muted-foreground">
          注册后模板内可直接使用 <code :class="codeBlock">g-button</code> 等全局组件。
        </p>
        <div class="rounded-lg border border-border bg-muted/30 p-3">
          <pre
            class="text-xs font-mono leading-relaxed whitespace-pre-wrap"
          ><code>{{ snippetInstall }}</code></pre>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <h3 class="text-sm font-medium">3. 具名导入（按需）</h3>
        <p class="text-xs text-muted-foreground">可显式导入组件与工具，便于 tree-shaking。</p>
        <div class="rounded-lg border border-border bg-muted/30 p-3">
          <pre
            class="text-xs font-mono leading-relaxed whitespace-pre-wrap"
          ><code>{{ snippetImport }}</code></pre>
        </div>
      </div>
    </section>

    <!-- Composables -->
    <section class="flex flex-col gap-4">
      <h2 class="text-base font-semibold">Composables</h2>

      <!-- useColorMode -->
      <section class="flex flex-col gap-3 rounded-lg border border-border p-4">
        <div class="flex flex-col gap-1">
          <h3 class="text-sm font-semibold flex items-center gap-2">
            <code :class="codeBlock">useColorMode()</code>
            <span class="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              状态持久化
            </span>
          </h3>
          <p class="text-xs text-muted-foreground">
            明暗模式控制器：light / dark / system（跟随系统），持久化到 localStorage（key:
            <code :class="codeBlock">gritty-color-mode</code>），在
            <code :class="codeBlock">{{ tagHtml }}</code> 上 toggle
            <code :class="codeBlock">.dark</code> 类。
          </p>
        </div>
        <div class="rounded-lg border border-border bg-muted/30 p-3">
          <pre
            class="text-xs font-mono leading-relaxed whitespace-pre-wrap"
          ><code>{{ snippetColorMode }}</code></pre>
        </div>
        <!-- 实时演示 -->
        <div class="flex flex-col gap-2 rounded-md bg-background p-4 border border-border">
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted-foreground">
              当前模式：<span class="font-medium text-foreground">{{ mode }}</span> （解析为：<span
                class="font-medium text-foreground"
                >{{ isDark ? 'dark' : 'light' }}</span
              >）
            </span>
            <span class="text-xs text-muted-foreground">存储键：gritty-color-mode</span>
          </div>
          <div class="inline-flex rounded-md border border-border p-0.5 w-fit">
            <button
              v-for="m in colorModes"
              :key="m.value"
              type="button"
              :aria-pressed="mode === m.value"
              class="rounded px-3 py-1.5 text-xs font-medium transition"
              :class="
                mode === m.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="setMode(m.value)"
            >
              {{ m.label }}
            </button>
          </div>
        </div>
      </section>

      <!-- useThemeColor -->
      <section class="flex flex-col gap-3 rounded-lg border border-border p-4">
        <div class="flex flex-col gap-1">
          <h3 class="text-sm font-semibold flex items-center gap-2">
            <code :class="codeBlock">useThemeColor()</code>
            <span class="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              8 套主题色
            </span>
          </h3>
          <p class="text-xs text-muted-foreground">
            主题色控制器：8 套 Radix 色阶（blue / indigo / violet / purple / pink / red / cyan /
            green），step-10 驱动 <code :class="codeBlock">--gritty-design-primary</code>。持久化到
            localStorage（key: <code :class="codeBlock">gritty-theme-color</code>），写入
            <code :class="codeBlock">{{ tagHtmlDataThemeColor }}</code
            >。
          </p>
          <p class="text-xs text-muted-foreground">详见下文：设计 Token-主题色</p>
        </div>
        <div class="rounded-lg border border-border bg-muted/30 p-3">
          <pre
            class="text-xs font-mono leading-relaxed whitespace-pre-wrap"
          ><code>{{ snippetThemeColor }}</code></pre>
        </div>
      </section>

      <!-- useRipple -->
      <section class="flex flex-col gap-3 rounded-lg border border-border p-4">
        <div class="flex flex-col gap-1">
          <h3 class="text-sm font-semibold flex items-center gap-2">
            <code :class="codeBlock">useRipple()</code>
            <span class="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              Material 风格
            </span>
          </h3>
          <p class="text-xs text-muted-foreground">
            点击波纹效果（Web Animations API +
            <code :class="codeBlock">currentColor</code>），可挂到任意元素。宿主元素需
            <code :class="codeBlock">position: relative</code> +
            <code :class="codeBlock">overflow: hidden</code> 以裁剪波纹；<code :class="codeBlock"
              >disabled</code
            >
            状态自动跳过。
          </p>
        </div>
        <div class="rounded-lg border border-border bg-muted/30 p-3">
          <pre
            class="text-xs font-mono leading-relaxed whitespace-pre-wrap"
          ><code>{{ snippetRipple }}</code></pre>
        </div>
        <!-- 实时演示 -->
        <div class="flex items-center gap-4">
          <div
            class="relative overflow-hidden rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground cursor-pointer select-none"
            @pointerdown="
              (e: PointerEvent) => {
                trigger(e);
                rippleCount++;
              }
            "
          >
            点击触发波纹
          </div>
          <span class="text-xs text-muted-foreground">已触发次数：{{ rippleCount }}</span>
        </div>
      </section>
    </section>

    <!-- 工具 -->
    <section class="flex flex-col gap-3">
      <h2 class="text-base font-semibold">工具</h2>

      <div class="flex flex-col gap-2">
        <h3 class="text-sm font-medium">cn(...inputs)</h3>
        <p class="text-xs text-muted-foreground">
          <code :class="codeBlock">clsx</code> +
          <code :class="codeBlock">tailwind-merge</code>，合并类名并解决 Tailwind 冲突。
        </p>
        <div class="rounded-lg border border-border bg-muted/30 p-3">
          <pre
            class="text-xs font-mono leading-relaxed whitespace-pre-wrap"
          ><code>{{ snippetCn }}</code></pre>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <h3 class="text-sm font-medium">buttonVariants(props)</h3>
        <p class="text-xs text-muted-foreground">
          获取按钮的类名字符串，便于自定义元素复用同一套样式。
        </p>
        <div class="rounded-lg border border-border bg-muted/30 p-3">
          <pre
            class="text-xs font-mono leading-relaxed whitespace-pre-wrap"
          ><code>{{ snippetUtilities }}</code></pre>
        </div>
      </div>
    </section>

    <!-- 主题定制 -->
    <section class="flex flex-col gap-3">
      <h2 class="text-base font-semibold">主题定制</h2>
      <p class="text-xs text-muted-foreground leading-relaxed">
        样式 token 定义在 <code :class="codeBlock">src/style.css</code>，基于 Tailwind v4
        <code :class="codeBlock">@theme</code> + Radix Colors。
      </p>
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <code :class="codeBlock">明暗</code>
          <span class="text-xs text-muted-foreground">
            <code :class="codeBlock">.dark</code> 选择器覆盖
            <code :class="codeBlock">--background</code>、<code :class="codeBlock"
              >--foreground</code
            >
            等 token
          </span>
        </div>
        <div class="flex items-center gap-2">
          <code :class="codeBlock">主题色</code>
          <span class="text-xs text-muted-foreground">
            <code :class="codeBlock">[data-theme-color="..."]</code> 规则块将
            <code :class="codeBlock">--gritty-design-primary</code> 映射到对应 Radix 色阶的 step-10
          </span>
        </div>
      </div>
      <div class="rounded-lg border border-border bg-muted/30 p-3">
        <pre
          class="text-xs font-mono leading-relaxed whitespace-pre-wrap"
        ><code>{{ snippetThemeCustomize }}</code></pre>
      </div>
    </section>

    <!-- 设计 Token -->
    <section class="flex flex-col gap-3">
      <h2 class="text-base font-semibold">设计 Token</h2>
      <p class="text-xs text-muted-foreground leading-relaxed">
        <code :class="codeBlock">--gritty-design-*</code>
        开头的设计系统变量，统一控制组件的尺寸、状态配色与交互反馈。
      </p>

      <!-- 主题色 -->
      <section class="flex flex-col gap-3 rounded-lg border border-border p-4">
        <div class="flex flex-col gap-1">
          <h3 class="text-sm font-semibold">主题色（Theme Color）</h3>
          <p class="text-xs text-muted-foreground">
            8 套 Radix 色阶（blue / indigo / violet / purple / pink / red / cyan / green），step-10
            驱动 <code :class="codeBlock">--gritty-design-primary</code>，step-1 驱动
            <code :class="codeBlock">--gritty-design-primary-foreground</code>。通过
            <code :class="codeBlock">useThemeColor()</code>
            切换，持久化到 localStorage（key:
            <code :class="codeBlock">gritty-theme-color</code>）。
          </p>
        </div>

        <div class="flex flex-col gap-3 rounded-md bg-background p-4 border border-border">
          <!-- 主题色切换 -->
          <div class="flex flex-wrap items-center gap-1.5">
            <button
              v-for="c in themeColors"
              :key="c.value"
              type="button"
              :title="c.label"
              :aria-label="c.label"
              :aria-pressed="themeColor === c.value"
              class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              :class="
                themeColor === c.value
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              "
              @click="setThemeColor(c.value)"
            >
              <span class="size-3 rounded-full" :style="{ backgroundColor: c.swatch }" />
              {{ c.label }}
            </button>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted-foreground">
              当前主题色：
              <span class="font-medium text-foreground capitalize">{{ themeColor }}</span>
              <span class="text-muted-foreground">（Radix 12 阶色阶）</span>
            </span>
            <span class="text-xs text-muted-foreground">存储键：gritty-theme-color</span>
          </div>

          <!-- Radix 12 步色阶 -->
          <div class="flex flex-col gap-1">
            <div class="flex items-end gap-0.5">
              <div
                v-for="s in currentScaleSteps"
                :key="s.step"
                class="flex-1 rounded-sm"
                :style="{
                  backgroundColor: s.cssVar,
                  height: s.step === 10 ? '2.5rem' : '1.25rem',
                  outline: s.step === 10 ? '2px solid var(--gritty-design-ring)' : 'none',
                  outlineOffset: s.step === 10 ? '2px' : '0',
                }"
                :title="`${themeColor}-${s.step}`"
              />
            </div>
            <div class="flex items-center gap-0.5">
              <span
                v-for="s in currentScaleSteps"
                :key="s.step"
                class="flex-1 text-center text-[9px] font-mono text-muted-foreground"
              >
                {{ s.step }}
              </span>
            </div>
          </div>

          <!-- --gritty-design-primary / --gritty-design-primary-foreground 映射 -->
          <div class="flex flex-col gap-2 rounded-md border border-border p-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-foreground">CSS 变量映射</span>
              <span class="text-[10px] text-muted-foreground"
                >step-10 → --gritty-design-primary · step-1 →
                --gritty-design-primary-foreground</span
              >
            </div>
            <div class="flex items-center gap-2">
              <div
                class="flex h-10 flex-1 items-center justify-center rounded-md text-xs font-medium"
                :style="{
                  backgroundColor: `var(--${themeColor}-10)`,
                  color: `var(--${themeColor}-1)`,
                }"
              >
                bg-primary / text-primary-foreground
              </div>
              <span class="text-xs text-muted-foreground">=</span>
              <div
                class="flex h-10 flex-1 items-center justify-center rounded-md border border-border text-xs font-medium"
                :style="{
                  backgroundColor: `var(--${themeColor}-1)`,
                  color: `var(--${themeColor}-10)`,
                }"
              >
                反转：step-1 底 + step-10 字
              </div>
            </div>
            <p class="text-[11px] text-muted-foreground">
              <code :class="codeBlock">--gritty-design-primary-foreground: var(--purple-1)</code
              >，确保浅色文字在深色
              <code :class="codeBlock">--gritty-design-primary</code> 背景上有足够对比度。
            </p>
          </div>
        </div>
      </section>

      <!-- 控制尺寸 -->
      <section class="flex flex-col gap-3 rounded-lg border border-border p-4">
        <div class="flex flex-col gap-1">
          <h3 class="text-sm font-semibold">控制尺寸（Control Heights）</h3>
          <p class="text-xs text-muted-foreground">
            全局统一的控件高度，驱动 <code :class="codeBlock">h-control-*</code> /
            <code :class="codeBlock">size-control-*</code> 工具类。 所有组件（Button / Input /
            Select 等）共享同一套尺寸体系。
          </p>
        </div>
        <div class="flex items-end gap-4">
          <div v-for="s in controlSizes" :key="s.key" class="flex flex-col items-center gap-1">
            <div
              class="w-10 rounded-md bg-primary/80"
              :style="{ height: s.px + 'px' }"
              :title="s.cssVar"
            />
            <span class="text-[10px] font-mono text-muted-foreground">{{ s.height }}</span>
            <span class="text-[10px] font-medium text-foreground">{{ s.label }}</span>
          </div>
        </div>
        <table class="w-full text-xs">
          <thead>
            <tr class="text-muted-foreground">
              <th class="text-left font-medium py-1 pr-3">Token</th>
              <th class="text-left font-medium py-1 pr-3">值</th>
              <th class="text-left font-medium py-1">Tailwind 工具类</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in controlSizes" :key="'row-' + s.key" class="border-t border-border">
              <td class="py-1 pr-3">
                <code :class="codeBlock">{{ s.cssVar }}</code>
              </td>
              <td class="py-1 pr-3 font-mono">{{ s.height }}（{{ s.px }}px）</td>
              <td class="py-1 font-mono text-muted-foreground">
                h-control-{{ s.key }} / size-control-{{ s.key }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 状态颜色 -->
      <section class="flex flex-col gap-3 rounded-lg border border-border p-4">
        <div class="flex flex-col gap-1">
          <h3 class="text-sm font-semibold">状态颜色（Status Colors）</h3>
          <p class="text-xs text-muted-foreground">
            success / warning / info 三种语义配色，分别在 light 与 dark 模式下有独立的值。<code
              :class="codeBlock"
              >--gritty-design-disabled-opacity</code
            >
            控制全局禁用态不透明度。
          </p>
        </div>
        <div class="grid grid-cols-4 gap-3">
          <div
            v-for="c in statusColors"
            :key="c.key"
            class="flex flex-col gap-2 rounded-md border border-border p-3"
          >
            <div
              class="flex h-9 items-center justify-center rounded-md text-sm font-medium"
              :style="{
                backgroundColor: 'var(' + c.colorVar + ')',
                color: 'var(' + c.fgVar + ')',
              }"
            >
              {{ c.label }}
            </div>
            <div class="flex flex-col gap-1 text-[10px] font-mono">
              <div class="flex justify-between">
                <span class="text-muted-foreground">color</span>
                <span>{{ c.colorVar }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">fg</span>
                <span>{{ c.fgVar }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3 py-3">
          <span class="text-xs text-muted-foreground">禁用不透明度：</span>
          <div class="flex gap-2">
            <g-button
              v-for="c in statusColors"
              :key="'demo-' + c.key"
              type="button"
              class="rounded-md px-3 py-1.5 text-xs font-medium transition"
              :style="{
                backgroundColor: 'var(' + c.colorVar + ')',
                color: 'var(' + c.fgVar + ')',
              }"
              disabled
            >
              {{ c.label }}
            </g-button>
          </div>
          <code class="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            disabled: opacity = {{ disabledOpacity }}
          </code>
        </div>
      </section>

      <!-- 边框颜色 -->
      <section class="flex flex-col gap-3 rounded-lg border border-border p-4">
        <div class="flex flex-col gap-1">
          <h3 class="text-sm font-semibold">边框颜色（Border Colors）</h3>
          <p class="text-xs text-muted-foreground">
            统一的边框与输入框边框色，在 light / dark 模式下自动切换。
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="b in borderColors"
            :key="b.key"
            class="flex flex-col gap-2 rounded-md border border-border p-3"
          >
            <div
              class="h-8 rounded-md"
              :style="{
                backgroundColor: 'var(' + b.cssVar + ')',
                border: '1px solid var(' + b.cssVar + ')',
              }"
            />
            <div class="flex flex-col gap-1 text-[10px] font-mono">
              <div class="flex justify-between">
                <span class="text-muted-foreground">token</span>
                <span>{{ b.cssVar }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">tailwind</span>
                <span>{{ b.tailwind }}</span>
              </div>
            </div>
            <span class="text-xs text-muted-foreground">{{ b.desc }}</span>
          </div>
        </div>
      </section>

      <!-- 焦点环 -->
      <section class="flex flex-col gap-3 rounded-lg border border-border p-4">
        <div class="flex flex-col gap-1">
          <h3 class="text-sm font-semibold">焦点环（Focus Ring）</h3>
          <p class="text-xs text-muted-foreground">
            <code :class="codeBlock">--gritty-design-ring</code> 控制
            <code :class="codeBlock">:focus-visible</code> 的 outline 颜色；
            <code :class="codeBlock">--gritty-design-focus-ring-width</code> 和
            <code :class="codeBlock">--gritty-design-focus-ring-opacity</code>
            统一控制 Input / Select 等组件在 focus-within / focus-visible / data-[state=open] 时的
            ring 宽度与颜色透明度。
          </p>
        </div>

        <!-- 基础焦点环变量 -->
        <table class="w-full text-xs">
          <thead>
            <tr class="text-muted-foreground">
              <th class="text-left font-medium py-1 pr-3">Token</th>
              <th class="text-left font-medium py-1 pr-3">值</th>
              <th class="text-left font-medium py-1">Tailwind 工具类</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in focusRingTokens" :key="t.key" class="border-t border-border">
              <td class="py-1 pr-3">
                <code :class="codeBlock">{{ t.cssVar }}</code>
              </td>
              <td class="py-1 pr-3 font-mono">{{ t.value }}</td>
              <td class="py-1 font-mono text-muted-foreground">{{ t.tailwind }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 派生焦点环颜色 Token -->
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-foreground">派生颜色 Token（@theme inline）</span>
          <p class="text-[11px] text-muted-foreground">
            每个颜色 Token =
            <code :class="codeBlock"
              >color-mix(in oklab, var(--gritty-design-{color})
              var(--gritty-design-focus-ring-opacity), transparent)</code
            >，修改透明度变量即可全局生效。
          </p>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="c in focusRingColors"
            :key="c.key"
            class="flex flex-col gap-2 rounded-md border border-border p-3"
          >
            <g-input :status="c.status as any" :placeholder="`点击聚焦-${c.label}`" />
            <div class="flex flex-col gap-1 text-[10px] font-mono">
              <div class="flex justify-between">
                <span class="text-muted-foreground">token</span>
                <span>{{ c.colorToken }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">base</span>
                <span>{{ c.baseVar }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">tw</span>
                <span>{{ c.tailwind }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 圆角 -->
      <section class="flex flex-col gap-3 rounded-lg border border-border p-4">
        <div class="flex flex-col gap-1">
          <h3 class="text-sm font-semibold">圆角（Border Radius）</h3>
          <p class="text-xs text-muted-foreground">
            全局圆角基于 <code :class="codeBlock">--gritty-design-radius</code>（默认 10px）， 派生
            <code :class="codeBlock">sm/md/lg/xl</code> 四个档位。
          </p>
        </div>
        <div class="flex items-end gap-4">
          <div v-for="r in radiusTokens" :key="r.key" class="flex flex-col items-center gap-1">
            <div
              class="w-14 h-14 bg-primary/20 border border-border"
              :style="{ borderRadius: 'var(' + r.cssVar + ')' }"
            />
            <span class="text-[10px] font-mono text-muted-foreground">{{ r.cssVar }}</span>
            <span class="text-[10px] font-medium text-foreground">{{ r.tailwind }}</span>
          </div>
        </div>
        <table class="w-full text-xs">
          <thead>
            <tr class="text-muted-foreground">
              <th class="text-left font-medium py-1 pr-3">Token</th>
              <th class="text-left font-medium py-1 pr-3">公式</th>
              <th class="text-left font-medium py-1">Tailwind 工具类</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in radiusTokens" :key="'row-' + r.key" class="border-t border-border">
              <td class="py-1 pr-3">
                <code :class="codeBlock">{{ r.cssVar }}</code>
              </td>
              <td class="py-1 pr-3 font-mono">{{ r.formula }}</td>
              <td class="py-1 font-mono text-muted-foreground">{{ r.tailwind }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>

    <!-- 目录结构 -->
    <section class="flex flex-col gap-3">
      <h2 class="text-base font-semibold">目录结构</h2>
      <div class="rounded-lg border border-border bg-muted/30 p-3">
        <pre
          class="text-xs font-mono leading-relaxed whitespace-pre-wrap"
        ><code>{{ snippetDirStructure }}</code></pre>
      </div>
    </section>

    <!-- 快速上手 -->
    <section class="flex flex-col gap-3">
      <h2 class="text-base font-semibold">快速上手</h2>
      <p class="text-xs text-muted-foreground leading-relaxed">
        以下示例展示一个完整的使用流程：注册插件、切换主题、使用组件。
      </p>
      <div class="rounded-lg border border-border bg-muted/30 p-3">
        <pre
          class="text-xs font-mono leading-relaxed whitespace-pre-wrap"
        ><code>{{ snippetQuickStart }}</code></pre>
      </div>
    </section>
  </div>
</template>
