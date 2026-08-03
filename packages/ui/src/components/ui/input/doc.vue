<script setup lang="ts">
  import { ref } from 'vue';

  import DocSection from '../overview/components/DocSection.vue';

  defineOptions({ name: 'InputDoc' });

  const sizes = ['mini', 'xs', 'sm', 'default', 'lg'] as const;
  const statuses = ['default', 'error', 'warning'] as const;
  const types = ['text', 'password', 'number', 'email', 'search', 'tel', 'url'] as const;

  const basicValue = ref('Hello gritty-lots');
  const lazyValue = ref('');
  const sizeValue = ref('');
  const disabledValue = ref('不可编辑');
  const readonlyValue = ref('只读内容');
  const borderedValue = ref('无边框');
  const statusValue = ref('');
  const prefixValue = ref('');
  const suffixValue = ref('');
  const allowClearValue = ref('点击右侧叉号清除');
  const countValue = ref('test value');
  const countMaxValue = ref('');
  const countFormatterValue = ref('abc');
  const addonValue = ref('mysite');
  const addonSlotValue = ref('mysite');
  const typeValue = ref('');
  const enterValue = ref('');
  const lastEnter = ref('');
  const customClearValue = ref('自定义清除图标');
  const combinedValue = ref('');
</script>

<template>
  <div class="grid grid-cols-2 gap-4 p-6">
    <!-- 基本用法 -->
    <DocSection title="基本用法" :tags="['v-model']" demo-class="flex flex-col gap-2">
      <template #description>
        通过 <code class="text-foreground">v-model</code> 双向绑定输入值。支持
        <code class="text-foreground">.lazy</code> 修饰符延迟同步。
      </template>
      <g-input v-model="basicValue" placeholder="Basic usage" />
      <g-input v-model.lazy="lazyValue" placeholder="Lazy usage（失焦同步）" />
      <p class="text-xs text-muted-foreground">当前值：{{ basicValue }}｜lazy：{{ lazyValue }}</p>
    </DocSection>

    <!-- size -->
    <DocSection title="控件尺寸" :tags="['size']" demo-class="flex flex-col gap-2">
      <template #description>
        沿用设计系统控件高度变量。可选值：mini(20px)、xs(24px)、sm(28px)、default(32px)、lg(36px)。默认
        default。
      </template>
      <g-input
        v-for="s in sizes"
        :key="s"
        v-model="sizeValue"
        :size="s"
        :placeholder="`size = ${s}`"
      />
    </DocSection>

    <!-- disabled / readonly -->
    <DocSection
      title="禁用 / 只读"
      :tags="['disabled', 'readonly']"
      demo-class="flex flex-col gap-2"
    >
      <template #description>
        <ul class="flex flex-col gap-0.5">
          <li>
            <code class="text-foreground">disabled</code
            >：禁用输入，降低不透明度且不可聚焦编辑（boolean，默认 false）。
          </li>
          <li>
            <code class="text-foreground">readonly</code>：只读，可聚焦/选择但不可编辑，背景为
            muted（boolean，默认 false）。
          </li>
        </ul>
      </template>
      <g-input v-model="disabledValue" disabled />
      <g-input v-model="readonlyValue" readonly />
    </DocSection>

    <!-- bordered -->
    <DocSection title="无边框" :tags="['bordered']" demo-class="flex flex-col gap-2">
      <template #description>
        设置
        <code class="text-foreground">:bordered="false"</code>
        移除边框与阴影，适合嵌入到带背景的容器中（boolean，默认 true）。
      </template>
      <g-input v-model="borderedValue" :bordered="false" />
    </DocSection>

    <!-- status -->
    <DocSection title="校验状态" :tags="['status']" demo-class="flex flex-col gap-2">
      <template #description>
        可选值：<code class="text-foreground">default</code>、<code class="text-foreground"
          >error</code
        >（红色边框）、<code class="text-foreground">warning</code>（黄色边框）。默认 default。
      </template>
      <g-input
        v-for="s in statuses"
        :key="s"
        v-model="statusValue"
        :status="s"
        :placeholder="`status = ${s}`"
      />
    </DocSection>

    <!-- prefix / suffix -->
    <DocSection title="前缀 / 后缀" :tags="['prefix', 'suffix']" demo-class="flex flex-col gap-2">
      <template #description>
        支持字符串或具名插槽（<code class="text-foreground">#prefix</code> /
        <code class="text-foreground">#suffix</code>），常用于放置图标或单位。
      </template>
      <g-input v-model="prefixValue" prefix="￥" placeholder="prefix=￥" />
      <g-input v-model="suffixValue" suffix="RMB" placeholder="suffix=RMB" />
      <g-input v-model="prefixValue" placeholder="插槽前缀">
        <template #prefix>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </template>
      </g-input>
    </DocSection>

    <!-- allowClear / clearIcon -->
    <DocSection
      title="清除按钮"
      :tags="['allowClear', 'clearIcon']"
      demo-class="flex flex-col gap-2"
    >
      <template #description>
        <code class="text-foreground">allowClear</code>
        显示清除图标，仅在非空且非禁用/只读时出现。可通过
        <code class="text-foreground">#clearIcon</code> 插槽自定义图标（插槽参数
        <code class="text-foreground">clear</code> 可直接调用）。
      </template>
      <g-input v-model="allowClearValue" allow-clear placeholder="输入内容后查看叉号" />
      <g-input v-model="customClearValue" allow-clear placeholder="自定义清除图标">
        <template #clearIcon="{ clear }">
          <button
            type="button"
            tabindex="-1"
            aria-label="clear"
            class="inline-flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-destructive"
            @click="clear"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </template>
      </g-input>
    </DocSection>

    <!-- showCount / maxlength -->
    <DocSection
      title="字数统计"
      :tags="['showCount', 'maxlength']"
      demo-class="flex flex-col gap-2"
    >
      <template #description>
        <code class="text-foreground">showCount</code> 显示字数；与
        <code class="text-foreground">maxlength</code> 组合显示
        <code class="text-foreground">count / max</code>；也可传入
        <code class="text-foreground">{ formatter }</code> 自定义输出。
      </template>
      <g-input v-model="countValue" show-count :maxlength="20" />
      <g-input v-model="countMaxValue" show-count :maxlength="10" placeholder="最多 10 字符" />
      <g-input
        v-model="countFormatterValue"
        :show-count="{
          formatter: ({ count, maxLength }: { count: number; maxLength?: number }) =>
            `已输入 ${count}${maxLength ? `/${maxLength}` : ''} 字`,
        }"
        :maxlength="20"
      />
    </DocSection>

    <!-- addonBefore / addonAfter -->
    <DocSection
      title="前置 / 后置标签"
      :tags="['addonBefore', 'addonAfter']"
      demo-class="flex flex-col gap-2"
    >
      <template #description>
        支持字符串或具名插槽（<code class="text-foreground">#addonBefore</code> /
        <code class="text-foreground">#addonAfter</code>），用于固定组合（如 Http://、.com）。
      </template>
      <g-input v-model="addonValue" addon-before="Http://" addon-after=".com" />
      <g-input v-model="addonSlotValue">
        <template #addonBefore>Https://</template>
        <template #addonAfter>.cn</template>
      </g-input>
    </DocSection>

    <!-- type -->
    <DocSection title="输入类型" :tags="['type']" demo-class="grid grid-cols-2 gap-2">
      <template #description>
        同原生 input 的 type 属性。常用：text、password、number、email、search、tel、url。默认
        text。
      </template>
      <g-input
        v-for="t in types"
        :key="t"
        v-model="typeValue"
        :type="t"
        :placeholder="`type = ${t}`"
      />
    </DocSection>

    <!-- pressEnter 事件 -->
    <DocSection title="回车事件" :tags="['@pressEnter']" demo-class="flex flex-col gap-2">
      <template #description>
        按下回车键时触发 <code class="text-foreground">pressEnter</code> 事件，回调参数为原生
        <code class="text-foreground">KeyboardEvent</code>。同时支持
        <code class="text-foreground">@change</code> / <code class="text-foreground">@input</code> /
        <code class="text-foreground">@focus</code> / <code class="text-foreground">@blur</code>。
      </template>
      <g-input
        v-model="enterValue"
        placeholder="按回车查看效果"
        @press-enter="(e: KeyboardEvent) => (lastEnter = enterValue + ' @ ' + e.key)"
      />
      <p class="text-xs text-muted-foreground">回车触发：{{ lastEnter || '（暂未触发）' }}</p>
    </DocSection>

    <!-- 组合用法 -->
    <DocSection title="属性组合" :tags="[]" span2 demo-class="grid grid-cols-2 gap-2">
      <template #description>
        以下示例展示常见属性组合：size + status、addon + prefix、allowClear + showCount +
        maxlength、disabled + prefix + suffix 等。
      </template>
      <g-input
        v-model="combinedValue"
        size="sm"
        status="error"
        placeholder="sm + error"
        allow-clear
      />
      <g-input
        v-model="combinedValue"
        size="lg"
        status="warning"
        placeholder="lg + warning"
        prefix="!"
        suffix="?"
        allow-clear
      />
      <g-input
        v-model="combinedValue"
        addon-before="Http://"
        addon-after=".com"
        placeholder="addon + 内置输入"
        allow-clear
      />
      <g-input
        v-model="combinedValue"
        show-count
        :maxlength="30"
        allow-clear
        placeholder="showCount + maxlength + allowClear"
      />
      <g-input
        v-model="combinedValue"
        disabled
        prefix="locked"
        suffix="RMB"
        placeholder="disabled + prefix + suffix"
      />
      <g-input
        v-model="combinedValue"
        :bordered="false"
        prefix="user"
        suffix="ok"
        placeholder="borderless + prefix + suffix"
      />
    </DocSection>
  </div>
</template>
