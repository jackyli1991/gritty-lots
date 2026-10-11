<script lang="ts" setup>
  import { clipOptions, originOptions, repeatOptions, sizeOptions } from '@neural/data';
  import Button from 'primevue/button';
  import type { FileUploadUploaderEvent } from 'primevue/fileupload';
  import FileUpload from 'primevue/fileupload';
  import InputText from 'primevue/inputtext';
  import Listbox from 'primevue/listbox';
  import Popover from 'primevue/popover';
  import { computed, onBeforeUnmount, useTemplateRef } from 'vue';

  import ColorPicker from '../colorPicker';
  import NeuralIcon from '../icon';

  /** background 模型完整数据结构 */
  interface BackgroundModelValue {
    backgroundColor: string; // background-color
    backgroundImage: string; // background-image 图片地址
    backgroundPosition: string; // background-position 关键字组合
    backgroundRepeat: string; // background-repeat 重复方式
    backgroundOrigin: string; // background-origin 背景定位区域
    backgroundClip: string; // background-clip 背景绘制区域
    backgroundSize: string; // background-size 预设关键字或自定义 CSS 值
  }

  /** 九宫格位置项：图标名 / CSS 关键字 / 提示语 */
  interface PositionItem {
    icon: string;
    value: string;
    label: string;
  }

  /** 九宫格位置配置，顺序即网格渲染顺序 */
  const positions: PositionItem[] = [
    { icon: 'ArrowUpLeft', value: 'left top', label: '左上' },
    { icon: 'ArrowUpToLine', value: 'center top', label: '顶部居中' },
    { icon: 'ArrowUpRight', value: 'right top', label: '右上' },
    { icon: 'ArrowLeftToLine', value: 'left center', label: '左侧居中' },
    { icon: 'Shrink', value: 'center center', label: '居中' },
    { icon: 'ArrowRightToLine', value: 'right center', label: '右侧居中' },
    { icon: 'ArrowDownLeft', value: 'left bottom', label: '左下' },
    { icon: 'ArrowDownToLine', value: 'center bottom', label: '底部居中' },
    { icon: 'ArrowDownRight', value: 'right bottom', label: '右下' },
  ];

  /** background-size 预设关键字 */
  const presetSizes = ['cover', 'contain', 'auto'];

  /** v-model 绑定，带默认值 */
  const model = defineModel<BackgroundModelValue>({
    default: () => ({
      backgroundColor: '#fff',
      backgroundImage: '',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundOrigin: 'padding-box',
      backgroundClip: 'border-box',
    }),
  });

  /** 预览框实时样式 */
  const previewStyle = computed(() => ({
    backgroundColor: model.value.backgroundColor,
    backgroundImage: model.value.backgroundImage ? `url("${model.value.backgroundImage}")` : 'none',
    backgroundPosition: model.value.backgroundPosition,
    backgroundRepeat: model.value.backgroundRepeat,
    backgroundOrigin: model.value.backgroundOrigin,
    backgroundClip: model.value.backgroundClip,
    backgroundSize: model.value.backgroundSize,
  }));

  /** Listbox 选中值：预设关键字或 custom；选自定义时给出默认尺寸 */
  const sizeMode = computed<string>({
    get: () =>
      presetSizes.includes(model.value.backgroundSize) ? model.value.backgroundSize : 'custom',
    set: (val) => {
      model.value = {
        ...model.value,
        backgroundSize: val === 'custom' ? '100% auto' : val,
      };
    },
  });

  /** background-size 触发按钮文案：预设显示关键字，自定义显示实际 CSS 值 */
  const sizeLabel = computed(() =>
    sizeMode.value === 'custom' ? model.value.backgroundSize || '自定义' : sizeMode.value
  );

  /** 点击位置图标，写入 background-position */
  const setPosition = (val: string) => {
    model.value = { ...model.value, backgroundPosition: val };
  };

  /** 颜色选择器值更新 */
  const onColorChange = (val?: string) => {
    if (val === undefined) return;
    model.value = { ...model.value, backgroundColor: val };
  };

  /** Listbox 选择 background-repeat 后写回 */
  const onRepeatChange = (val?: string) => {
    if (!val) return;
    model.value = { ...model.value, backgroundRepeat: val };
  };

  /** Listbox 选择 background-origin 后写回 */
  const onOriginChange = (val?: string) => {
    if (!val) return;
    model.value = { ...model.value, backgroundOrigin: val };
  };

  /** Listbox 选择 background-clip 后写回 */
  const onClipChange = (val?: string) => {
    if (!val) return;
    model.value = { ...model.value, backgroundClip: val };
  };

  /** Listbox 选择 background-size 预设项后写回 */
  const onSizeSelect = (val?: string) => {
    if (!val) return;
    sizeMode.value = val;
  };

  /** 自定义 background-size 输入 */
  const onCustomSizeChange = (val?: string) => {
    if (val === undefined) return;
    model.value = { ...model.value, backgroundSize: val };
  };

  /** background-repeat 选择 Popover 实例引用 */
  const repeatPopover = useTemplateRef<InstanceType<typeof Popover>>('repeatPopover');

  /** background-origin 选择 Popover 实例引用 */
  const originPopover = useTemplateRef<InstanceType<typeof Popover>>('originPopover');

  /** background-clip 选择 Popover 实例引用 */
  const clipPopover = useTemplateRef<InstanceType<typeof Popover>>('clipPopover');

  /** background-size 选择 Popover 实例引用 */
  const sizePopover = useTemplateRef<InstanceType<typeof Popover>>('sizePopover');

  /** 打开 background-repeat 选择 Popover */
  const openRepeatPopover = (e: MouseEvent) => {
    repeatPopover.value?.toggle(e);
  };

  /** 打开 background-origin 选择 Popover */
  const openOriginPopover = (e: MouseEvent) => {
    originPopover.value?.toggle(e);
  };

  /** 打开 background-clip 选择 Popover */
  const openClipPopover = (e: MouseEvent) => {
    clipPopover.value?.toggle(e);
  };

  /** 打开 background-size 选择 Popover */
  const openSizePopover = (e: MouseEvent) => {
    sizePopover.value?.toggle(e);
  };

  /** 当前上传图片生成的 objectURL，替换图片时回收 */
  let currentObjectUrl: string | null = null;

  /** FileUpload 自定义上传：读取本地图片写入 background-image */
  const onImageUpload = (e: FileUploadUploaderEvent) => {
    const file = Array.isArray(e.files) ? e.files[0] : e.files;
    if (!file) return;
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = URL.createObjectURL(file);
    model.value = { ...model.value, backgroundImage: currentObjectUrl };
  };

  /** 清除已上传的背景图片，并回收 objectURL */
  const onClearImage = () => {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
    model.value = { ...model.value, backgroundImage: '' };
  };

  /** 组件卸载时回收 objectURL，避免内存泄漏 */
  onBeforeUnmount(() => {
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  });

  /** 位置图标按钮样式，当前选中项高亮 */
  const getPositionClass = (val: string) => [
    'p-0.5 rounded transition-colors',
    model.value.backgroundPosition === val
      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700',
  ];
</script>

<template>
  <div class="flex items-start gap-3 w-full h-40">
    <!-- 左侧：背景效果实时预览框（铺满剩余宽度） -->
    <div
      class="relative flex-1 min-w-0 h-full rounded border border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-800"
      :style="previewStyle"
    >
      <!-- 九宫格 background-position 快捷选择 -->
      <div class="absolute inset-0 grid grid-cols-3 grid-rows-3">
        <template v-for="(pos, idx) in positions" :key="pos.value">
          <!-- 中间格：居中定位图标 -->
          <div v-if="idx === 4" class="flex items-center justify-center">
            <NeuralIcon
              name="Shrink"
              label="居中"
              :class="getPositionClass(pos.value)"
              @click="setPosition(pos.value)"
            />
          </div>
          <!-- 其余八格：对应方位图标 -->
          <div v-else class="flex items-center justify-center">
            <NeuralIcon
              :name="pos.icon"
              :label="pos.label"
              :class="getPositionClass(pos.value)"
              @click="setPosition(pos.value)"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- 右侧：背景属性配置区（固定宽度） -->
    <div class="flex shrink-0 w-30 h-full flex-col gap-2">
      <!-- 第一行：background-color 颜色选择器 + 背景图片上传（铺满右侧整行） -->
      <div class="flex items-center gap-2">
        <ColorPicker
          :modelValue="model.backgroundColor"
          :formControl="{ novalidate: true }"
          @update:modelValue="onColorChange"
        />
        <!-- 背景图片上传（铺满右侧整行），已上传时显示清除按钮 -->
        <FileUpload
          mode="basic"
          accept="image/*"
          :auto="true"
          :customUpload="true"
          chooseLabel=" "
          :pt="{
            root: { class: 'w-full flex-1' },
            pcChooseButton: { root: { class: 'w-full' } },
          }"
          @uploader="onImageUpload"
        />
        <NeuralIcon
          v-if="model.backgroundImage"
          name="X"
          label="清除背景图片"
          class="p-1 shrink-0 rounded text-gray-500 hover:text-red-600 hover:bg-red-100 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900 transition-colors"
          @click="onClearImage"
        />
      </div>

      <!-- 第二行：background-size 选择 -->
      <Button
        type="button"
        size="small"
        severity="secondary"
        variant="outlined"
        fluid
        :label="sizeLabel"
        @click="openSizePopover"
      />

      <!-- 第三行：background-repeat 选择 -->
      <Button
        type="button"
        size="small"
        severity="secondary"
        variant="outlined"
        fluid
        :label="model.backgroundRepeat"
        @click="openRepeatPopover"
      />

      <!-- 第四行：background-origin 选择 -->
      <Button
        type="button"
        size="small"
        severity="secondary"
        variant="outlined"
        fluid
        :label="model.backgroundOrigin"
        @click="openOriginPopover"
      />

      <!-- 第五行：background-clip 选择 -->
      <Button
        type="button"
        size="small"
        severity="secondary"
        variant="outlined"
        fluid
        :label="model.backgroundClip"
        @click="openClipPopover"
      />
    </div>

    <!-- background-repeat 选择 Popover：Listbox 选取重复方式 -->
    <Popover ref="repeatPopover">
      <div class="flex flex-col gap-2">
        <span class="text-xs font-medium text-gray-600 dark:text-gray-300">background-repeat</span>
        <Listbox
          :modelValue="model.backgroundRepeat"
          :options="repeatOptions"
          optionLabel="label"
          optionValue="value"
          size="small"
          class="w-32"
          :formControl="{ novalidate: true }"
          @update:modelValue="onRepeatChange"
        />
      </div>
    </Popover>

    <!-- background-origin 选择 Popover：Listbox 选取背景定位区域 -->
    <Popover ref="originPopover">
      <div class="flex flex-col gap-2">
        <span class="text-xs font-medium text-gray-600 dark:text-gray-300">background-origin</span>
        <Listbox
          :modelValue="model.backgroundOrigin"
          :options="originOptions"
          optionLabel="label"
          optionValue="value"
          size="small"
          class="w-36"
          :formControl="{ novalidate: true }"
          @update:modelValue="onOriginChange"
        />
      </div>
    </Popover>

    <!-- background-clip 选择 Popover：Listbox 选取背景绘制区域 -->
    <Popover ref="clipPopover">
      <div class="flex flex-col gap-2">
        <span class="text-xs font-medium text-gray-600 dark:text-gray-300">background-clip</span>
        <Listbox
          :modelValue="model.backgroundClip"
          :options="clipOptions"
          optionLabel="label"
          optionValue="value"
          size="small"
          class="w-36"
          :formControl="{ novalidate: true }"
          @update:modelValue="onClipChange"
        />
      </div>
    </Popover>

    <!-- background-size 选择 Popover：Listbox 选取预设，选自定义时补充输入框 -->
    <Popover ref="sizePopover">
      <div class="flex flex-col gap-2 w-40">
        <span class="text-xs font-medium text-gray-600 dark:text-gray-300">background-size</span>
        <Listbox
          :modelValue="sizeMode"
          :options="sizeOptions"
          optionLabel="label"
          optionValue="value"
          size="small"
          :formControl="{ novalidate: true }"
          @update:modelValue="onSizeSelect"
        />
        <InputText
          v-if="sizeMode === 'custom'"
          :modelValue="model.backgroundSize"
          size="small"
          fluid
          class="font-mono"
          placeholder="例如 100px 100px"
          :formControl="{ novalidate: true }"
          @update:modelValue="onCustomSizeChange"
        />
      </div>
    </Popover>
  </div>
</template>
