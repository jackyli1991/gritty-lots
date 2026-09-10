---
name: css-generate
version: 1.0.0
description: 根据需求生成符合项目规范的页面/组件样式，优先使用TailwindCSS，适配暗黑主题，保证响应式
---

# Skill: CSS & Tailwind 样式生成技能

## 能力描述

根据需求生成符合项目规范的页面/组件样式，优先使用TailwindCSS，适配暗黑主题，保证响应式。

## 触发条件

当需求包含：样式、css、tailwind、页面布局、组件美化、暗黑模式、响应式适配、动画等关键词自动触发。

## 执行步骤

1. 读取项目css-generate.md规则，确认约束
2. 确认需求：组件用途、目标尺寸、响应式要求、是否需要暗黑模式
3. 优先用Tailwind类名实现，尽量不新增自定义css
4. 类名按规范分组排版，保证可读性
5. 检查是否全局污染，vue组件必须scoped
6. 输出代码，并简单说明样式实现思路

## 限制

- 不修改tailwind.config，不新增全局样式
- 禁止滥用!important
- 禁止写内联 style（`style="width:100px"`），优先使用 class
- 禁止写冗余无用样式，不要生成未使用的 class
