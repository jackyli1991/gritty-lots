<script setup lang="ts">
  import { ref } from 'vue';

  import DocSection from '../overview/components/DocSection.vue';

  defineOptions({ name: 'SelectDoc' });

  const sizes = ['mini', 'xs', 'sm', 'default', 'lg'] as const;
  const statuses = ['default', 'error', 'warning'] as const;

  const basicOptions = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry' },
    { label: '葡萄', value: 'grape', disabled: true },
    { label: '芒果', value: 'mango' },
  ];

  const groupOptions = [
    {
      label: '水果',
      options: [
        { label: '苹果', value: 'apple' },
        { label: '香蕉', value: 'banana' },
      ],
    },
    {
      label: '蔬菜',
      options: [
        { label: '白菜', value: 'cabbage' },
        { label: '萝卜', value: 'radish' },
      ],
    },
  ];

  const customFieldOptions = [
    { name: '北京', code: 'BJ' },
    { name: '上海', code: 'SH' },
    { name: '广州', code: 'GZ' },
    { name: '深圳', code: 'SZ' },
  ];

  const manyOptions = Array.from({ length: 20 }, (_, i) => ({
    label: `选项 ${i + 1}`,
    value: `opt-${i + 1}`,
  }));

  const basicValue = ref<string>('apple');
  const lazyValue = ref<string>('');
  const sizeValue = ref<string>('');
  const disabledValue = ref<string>('apple');
  const statusValue = ref<string>('');
  const borderedValue = ref<string>('apple');
  const clearValue = ref<string>('banana');
  const searchValue = ref<string>('');
  const loadingValue = ref<string>('');
  const prefixValue = ref<string>('');
  const groupValue = ref<string>('');
  const customFieldValue = ref<string>('');
  const multipleValue = ref<string[]>(['apple', 'banana']);
  const tagsValue = ref<string[]>(['tag1', 'tag2']);
  const maxTagValue = ref<string[]>(['opt-1', 'opt-2', 'opt-3', 'opt-4', 'opt-5']);
  const suffixValue = ref<string>('');
  const openValue = ref<string>('');
  const combinedValue = ref<string | string[]>('');
  const lastChange = ref('');
  const lastSearch = ref('');
</script>

<template>
  <div class="grid grid-cols-2 gap-4 p-6">
    <!-- 基本用法 -->
    <DocSection
      title="基本用法"
      :tags="['v-model:value', 'options']"
      demo-class="flex flex-col gap-2"
    >
      <template #description>
        通过 <code class="text-foreground">v-model:value</code> 双向绑定选中值，
        <code class="text-foreground">options</code> 传入选项数组（{ label, value, disabled? }）。
      </template>
      <g-select v-model:value="basicValue" :options="basicOptions" placeholder="请选择水果" />
      <p class="text-xs text-muted-foreground">当前值：{{ basicValue }}</p>
    </DocSection>

    <!-- 控件尺寸 -->
    <DocSection title="控件尺寸" :tags="['size']" demo-class="flex flex-col gap-2">
      <template #description>
        沿用设计系统控件高度。可选值：mini(20px)、xs(24px)、sm(28px)、default(32px)、lg(36px)。默认
        default。
      </template>
      <g-select
        v-for="s in sizes"
        :key="s"
        v-model:value="sizeValue"
        :size="s"
        :options="basicOptions"
        :placeholder="`size = ${s}`"
      />
    </DocSection>

    <!-- 禁用 -->
    <DocSection title="禁用" :tags="['disabled']" demo-class="flex flex-col gap-2">
      <template #description>
        <code class="text-foreground">disabled</code>
        禁用整个选择器，不可点击且降低不透明度（boolean，默认 false）。
      </template>
      <g-select v-model:value="disabledValue" disabled :options="basicOptions" />
    </DocSection>

    <!-- 校验状态 -->
    <DocSection title="校验状态" :tags="['status']" demo-class="flex flex-col gap-2">
      <template #description>
        可选值：<code class="text-foreground">default</code>、<code class="text-foreground"
          >error</code
        >（红色边框）、<code class="text-foreground">warning</code>（黄色边框）。默认 default。
      </template>
      <g-select
        v-for="s in statuses"
        :key="s"
        v-model:value="statusValue"
        :status="s"
        :options="basicOptions"
        :placeholder="`status = ${s}`"
      />
    </DocSection>

    <!-- 无边框 -->
    <DocSection title="无边框" :tags="['bordered']" demo-class="flex flex-col gap-2">
      <template #description>
        设置 <code class="text-foreground">:bordered="false"</code> 移除边框与阴影（boolean，默认
        true）。
      </template>
      <g-select v-model:value="borderedValue" :bordered="false" :options="basicOptions" />
    </DocSection>

    <!-- 允许清除 -->
    <DocSection title="允许清除" :tags="['allowClear']" demo-class="flex flex-col gap-2">
      <template #description>
        <code class="text-foreground">allowClear</code>
        在有值时显示清除按钮，点击清空选中（boolean，默认 false）。可通过
        <code class="text-foreground">#clearIcon</code> 插槽自定义图标。
      </template>
      <g-select v-model:value="clearValue" allow-clear :options="basicOptions" />
    </DocSection>

    <!-- 搜索 -->
    <DocSection
      title="搜索"
      :tags="['showSearch', 'filterOption']"
      demo-class="flex flex-col gap-2"
    >
      <template #description>
        <code class="text-foreground">showSearch</code> 开启搜索过滤。<code class="text-foreground"
          >filterOption</code
        >
        可传 false 关闭前端过滤（服务端搜索），或传自定义函数。<code class="text-foreground"
          >optionFilterProp</code
        >
        指定过滤字段（默认 value）。
      </template>
      <g-select
        v-model:value="searchValue"
        show-search
        :options="basicOptions"
        placeholder="搜索水果..."
        @search="(v: string) => (lastSearch = v)"
      />
      <p class="text-xs text-muted-foreground">搜索词：{{ lastSearch || '（无）' }}</p>
    </DocSection>

    <!-- 加载中 -->
    <DocSection title="加载中" :tags="['loading']" demo-class="flex flex-col gap-2">
      <template #description>
        <code class="text-foreground">loading</code>
        在箭头位置显示旋转图标，适合异步加载选项场景（boolean，默认 false）。
      </template>
      <g-select
        v-model:value="loadingValue"
        loading
        :options="basicOptions"
        placeholder="加载中..."
      />
    </DocSection>

    <!-- 前缀 -->
    <DocSection title="前缀" :tags="['prefix']" demo-class="flex flex-col gap-2">
      <template #description>
        支持字符串或具名插槽（<code class="text-foreground">#prefix</code>），常用于放置图标。
      </template>
      <g-select
        v-model:value="prefixValue"
        :options="basicOptions"
        prefix="📍"
        placeholder="选择地点"
      />
    </DocSection>

    <!-- 分组 -->
    <DocSection title="分组选项" :tags="['options.group']" demo-class="flex flex-col gap-2">
      <template #description>
        选项支持分组：在 options 项中设置
        <code class="text-foreground">options</code> 子数组，组件自动渲染 SelectGroup +
        SelectLabel。
      </template>
      <g-select v-model:value="groupValue" :options="groupOptions" placeholder="选择品类" />
    </DocSection>

    <!-- 自定义字段名 -->
    <DocSection title="自定义字段名" :tags="['fieldNames']" demo-class="flex flex-col gap-2">
      <template #description>
        通过 <code class="text-foreground">fieldNames</code> 映射选项字段（{ label, value, disabled,
        options }），适配后端数据结构。
      </template>
      <g-select
        v-model:value="customFieldValue"
        :options="customFieldOptions"
        :field-names="{ label: 'name', value: 'code' }"
        placeholder="选择城市"
      />
    </DocSection>

    <!-- 多选 -->
    <DocSection title="多选模式" :tags="['mode=multiple']" demo-class="flex flex-col gap-2">
      <template #description>
        <code class="text-foreground">mode="multiple"</code>
        开启多选，选中项以标签形式展示在触发器内，可逐个移除。
      </template>
      <g-select
        v-model:value="multipleValue"
        mode="multiple"
        :options="basicOptions"
        placeholder="选择水果"
      />
      <p class="text-xs text-muted-foreground">当前值：{{ multipleValue }}</p>
    </DocSection>

    <!-- 标签模式 -->
    <DocSection title="标签模式" :tags="['mode=tags']" demo-class="flex flex-col gap-2">
      <template #description>
        <code class="text-foreground">mode="tags"</code>
        允许输入新值创建标签（回车或点击"创建"按钮），内置搜索。
      </template>
      <g-select
        v-model:value="tagsValue"
        mode="tags"
        :options="basicOptions"
        placeholder="输入创建标签"
      />
      <p class="text-xs text-muted-foreground">当前值：{{ tagsValue }}</p>
    </DocSection>

    <!-- 最大标签数 -->
    <DocSection title="最大标签数" :tags="['maxTagCount']" demo-class="flex flex-col gap-2">
      <template #description>
        <code class="text-foreground">maxTagCount</code> 限制多选时显示的标签数量，超出部分折叠为
        <code class="text-foreground">+N</code>。
      </template>
      <g-select
        v-model:value="maxTagValue"
        mode="multiple"
        :options="manyOptions"
        :max-tag-count="2"
        placeholder="最多显示 2 个标签"
      />
    </DocSection>

    <!-- 受控展开 -->
    <DocSection title="受控展开" :tags="['open', 'v-model:open']" demo-class="flex flex-col gap-2">
      <template #description>
        通过 <code class="text-foreground">v-model:open</code> 或
        <code class="text-foreground">defaultOpen</code> 控制下拉面板展开状态。
      </template>
      <g-select
        v-model:value="openValue"
        default-open
        :options="basicOptions"
        placeholder="默认展开"
      />
    </DocSection>

    <!-- 事件 -->
    <DocSection
      title="事件"
      :tags="['@change', '@select', '@search']"
      demo-class="flex flex-col gap-2"
    >
      <template #description>
        支持 <code class="text-foreground">@change</code>（值变更）、<code class="text-foreground"
          >@select</code
        >
        （选中）、<code class="text-foreground">@deselect</code>（取消选中）、<code
          class="text-foreground"
          >@search</code
        >
        （搜索）、<code class="text-foreground">@focus</code> /
        <code class="text-foreground">@blur</code>、
        <code class="text-foreground">@dropdownVisibleChange</code>（展开状态变更）。
      </template>
      <g-select
        v-model:value="basicValue"
        :options="basicOptions"
        placeholder="触发事件"
        @change="(v: any) => (lastChange = String(v))"
      />
      <p class="text-xs text-muted-foreground">最近 change：{{ lastChange || '（暂未触发）' }}</p>
    </DocSection>

    <!-- 组合用法 -->
    <DocSection title="属性组合" :tags="[]" span2 demo-class="grid grid-cols-2 gap-2">
      <template #description>
        以下示例展示常见属性组合：size + status、allowClear + showSearch、multiple +
        maxTagCount、tags + allowClear、borderless + prefix 等。
      </template>
      <g-select
        v-model:value="combinedValue"
        size="sm"
        status="error"
        :options="basicOptions"
        placeholder="sm + error"
      />
      <g-select
        v-model:value="combinedValue"
        size="lg"
        status="warning"
        :options="basicOptions"
        placeholder="lg + warning"
        allow-clear
      />
      <g-select
        v-model:value="combinedValue"
        show-search
        allow-clear
        :options="basicOptions"
        placeholder="showSearch + allowClear"
      />
      <g-select
        v-model:value="combinedValue"
        mode="multiple"
        :options="manyOptions"
        :max-tag-count="3"
        placeholder="multiple + maxTagCount=3"
      />
      <g-select
        v-model:value="combinedValue"
        mode="tags"
        allow-clear
        :options="basicOptions"
        placeholder="tags + allowClear"
      />
      <g-select
        v-model:value="combinedValue"
        :bordered="false"
        prefix="🔍"
        show-search
        :options="basicOptions"
        placeholder="borderless + prefix + search"
      />
    </DocSection>
  </div>
</template>
