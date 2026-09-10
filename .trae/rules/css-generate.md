---
alwaysApply: false
globs: src/**/*.vue,src/**/*.tsx,src/**/*.css,src/**/*.scss,src/**/*.postcss,src/**/*.tailwind.css
description: 根据需求生成符合项目规范的页面/组件样式，优先使用TailwindCSS，适配暗黑主题，保证响应式
---

# CSS & Tailwind 样式生成规范

> 适用于 Vue3 + TailwindCSS 项目，所有AI生成组件、页面、样式文件时自动遵守

## 基础约束

1. 优先使用 **TailwindCSS** 实现样式，**尽量不手写自定义CSS**。只有Tailwind无法实现的复杂效果，才写scoped样式。
2. Vue组件样式必须使用 `<style scoped>`，**禁止无scoped全局样式**，避免样式污染。
3. 不使用 `!important`，除非有特殊说明。
4. 单位优先使用Tailwind预设类，尽量避免直接写px；如需固定尺寸，优先用 `rem`。
5. 支持响应式：移动端优先，使用Tailwind断点前缀：`sm:/md:/lg:/xl:`。断点遵循项目默认配置。

## 命名与类名规范

1. Tailwind类名**分组排列**，顺序建议：布局 → 尺寸 → 间距 → 颜色 → 边框 → 阴影 → 动画 → 响应式
   示例：

```html
<div class="flex items-center gap-4 w-full p-4 bg-white rounded-lg shadow-sm lg:p-6"></div>
```

2. 如需自定义 CSS 类（极少场景）：使用短横线命名 `card-header`，禁止驼峰。
3. 不要写冗长一堆无序堆砌的 class；多个重复样式抽取到 `@apply`（仅在 scoped 内）。

> @apply 仅用于提取重复样式，不要滥用。

## 颜色规范

1. 优先复用 Tailwind 默认调色板，或者项目内自定义 tailwind 主题色，**不要硬写十六进制色值**。
2. 文字 / 背景区分明暗模式时，支持 `dark:` 前缀，适配暗黑主题。
   示例：

```html
<div class="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"></div>
```

## 布局规范

1. 布局优先 flex /grid，少用 position 绝对定位；绝对定位需要配套 relative 父容器。
2. 间距统一使用 Tailwind gap /p/m，禁止手动 margin 堆叠造成边距冲突。
3. 容器溢出处理：内容溢出用 `overflow-auto`，文本截断使用 `truncate`。

## 动画与过渡

1. 优先使用 Tailwind 内置 transition/animate 工具类，不手写复杂 keyframes，除非需求明确。
2. 动画时长控制在 150ms ~ 300ms，避免动画过快 / 过慢影响交互体验。

## ❌ 禁止行为

1. 禁止直接修改全局 tailwind 配置文件（tailwind.config.js），除非我明确提出修改要求。
2. 禁止写内联 style（`style="width:100px"`），优先使用 class。
3. 禁止写冗余无用样式，不要生成未使用的 class。
4. 不要引入额外 css 库，优先复用 Tailwind。

## 输出要求

1. 生成组件时，样式与模板放在同一个 vue 文件内，`<script setup>`在前，`<template>`中间，`<style scoped>`在最后。
2. 样式代码尽量精简，自动合并重复样式。
3. 如果需要复杂样式，先说明实现思路，再输出代码。
4. 生成后自查：是否污染全局、是否支持暗黑模式、响应式断点是否合理。

## 指令参考（聊天框可直接用）

`/css`：生成组件样式，遵循本规则
`/style-refactor`：重构现有组件样式，简化类名，优化响应式
`/darkmode`：给现有组件补充暗黑模式样式
