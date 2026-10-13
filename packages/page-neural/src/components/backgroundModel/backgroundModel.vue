<script lang="ts" setup>
  import Button from 'primevue/button';
  import type { FileUploadUploaderEvent } from 'primevue/fileupload';
  import FileUpload from 'primevue/fileupload';
  import Listbox from 'primevue/listbox';
  import Popover from 'primevue/popover';
  import vTooltip from 'primevue/tooltip';
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
    scale: [number, number]; // transform scale [x, y]，负值表示翻转
  }

  /** v-model 绑定，带默认值 */
  const model = defineModel<BackgroundModelValue>({
    default: () => ({
      backgroundColor: '#fff',
      backgroundImage: '',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      backgroundOrigin: 'padding-box',
      backgroundClip: 'border-box',
      scale: [1, 1],
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
    transform: `scale(${model.value.scale[0]}, ${model.value.scale[1]})`,
  }));

  /** 颜色选择器值更新 */
  const onColorChange = (val?: string) => {
    if (val === undefined) return;
    model.value = { ...model.value, backgroundColor: val };
  };

  /** 翻转选项：水平翻转 / 垂直翻转 */
  const flipOptions = [
    { label: '水平翻转', value: 'h' },
    { label: '垂直翻转', value: 'v' },
  ];

  /** Listbox 多选值：根据 scale 推导当前选中的翻转项 */
  const flipSelection = computed<string[]>({
    get: () => {
      const result: string[] = [];
      if (model.value.scale[0] === -1) result.push('h');
      if (model.value.scale[1] === -1) result.push('v');
      return result;
    },
    set: (vals) => {
      model.value = {
        ...model.value,
        scale: [vals.includes('h') ? -1 : 1, vals.includes('v') ? -1 : 1],
      };
    },
  });

  /** 翻转按钮文案：根据 scale 推导 */
  const flipLabel = computed(() => {
    const h = model.value.scale[0] === -1;
    const v = model.value.scale[1] === -1;
    if (h && v) return '水平+垂直翻转';
    if (h) return '水平翻转';
    if (v) return '垂直翻转';
    return '翻转';
  });

  /** 翻转选择 Popover 实例引用 */
  const flipPopover = useTemplateRef<InstanceType<typeof Popover>>('flipPopover');

  /** 打开翻转选择 Popover */
  const openFlipPopover = (e: MouseEvent) => {
    flipPopover.value?.toggle(e);
  };

  /** 当前上传图片生成的 objectURL，替换图片时回收 */
  let currentObjectUrl: string | null = null;

  /** FileUpload 组件实例，用于触发文件选择和清空内部文件列表 */
  const fileUploadRef = useTemplateRef<InstanceType<typeof FileUpload>>('fileUploadRef');

  /** 点击预览区域触发文件选择 */
  const onChoose = () => {
    fileUploadRef.value?.choose();
  };

  /** FileUpload 自定义上传：读取本地图片写入 background-image */
  const onImageUpload = (e: FileUploadUploaderEvent) => {
    const file = Array.isArray(e.files) ? e.files[0] : e.files;
    if (!file || !file.type.startsWith('image/')) return;
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = URL.createObjectURL(file);
    model.value = { ...model.value, backgroundImage: currentObjectUrl };
    fileUploadRef.value?.clear();
  };

  /** 清除已上传的背景图片，回收 objectURL，并重置图片相关属性到默认值 */
  const onClearImage = () => {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
    model.value = {
      ...model.value,
      backgroundImage: '',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      backgroundOrigin: 'padding-box',
      backgroundClip: 'border-box',
      scale: [1, 1],
    };
  };

  /** 组件卸载时回收 objectURL，避免内存泄漏 */
  onBeforeUnmount(() => {
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  });
</script>

<template>
  <div class="flex flex-col gap-2 w-full h-40">
    <!-- 预览区：支持拖拽或点击上传背景图片 -->
    <div class="relative flex-1 min-w-0">
      <FileUpload
        ref="fileUploadRef"
        mode="advanced"
        accept="image/*"
        :auto="true"
        :customUpload="true"
        :pt="{
          root: {
            class:
              'relative! h-full! w-full! rounded! overflow-hidden! border! border-gray-300! dark:border-gray-600! cursor-pointer!',
            style: previewStyle,
          },
          header: { class: 'hidden!' },
          content: { class: 'p-2! h-full!' },
          empty: { class: 'h-full w-full' },
        }"
        @uploader="onImageUpload"
      >
        <!-- 空文件列表时显示上传提示，整个区域可点击选择文件 -->
        <template #empty>
          <div class="flex h-full w-full items-center justify-center" @click="onChoose">
            <div
              v-if="!model.backgroundImage"
              class="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500"
            >
              <NeuralIcon name="CloudUpload" :size="28" label="上传背景图片" />
              <span class="text-xs">拖拽图片到此处或点击上传</span>
            </div>
          </div>
        </template>
      </FileUpload>
    </div>

    <!-- 底部：background-color 颜色选择器 + 清除背景图片 -->
    <div class="flex items-center gap-2">
      <ColorPicker
        v-tooltip.top="'背景颜色'"
        :modelValue="model.backgroundColor"
        :formControl="{ novalidate: true }"
        size="small"
        @update:modelValue="onColorChange"
      />
      <template v-if="model.backgroundImage">
        <Button size="small" severity="secondary" class="h-6">
          <NeuralIcon name="Scissors" :size="16" class="rounded text-gray-500 transition-colors" />
          裁剪
        </Button>
        <Button
          size="small"
          class="h-6"
          :severity="flipSelection.length ? 'primary' : 'secondary'"
          @click="openFlipPopover"
        >
          <NeuralIcon name="FlipHorizontal2" :size="16" class="rounded transition-colors" />
          {{ flipLabel }}
        </Button>
        <Button size="small" severity="danger" variant="text" class="h-6" @click="onClearImage">
          <NeuralIcon name="X" :size="16" class="rounded transition-colors text-red-600" />
          删除
        </Button>
      </template>
    </div>

    <!-- 翻转选择 Popover：多选 Listbox 选取水平/垂直翻转 -->
    <Popover ref="flipPopover">
      <div class="flex flex-col gap-2">
        <span class="text-xs font-medium text-gray-600 dark:text-gray-300">翻转</span>
        <Listbox
          :modelValue="flipSelection"
          :options="flipOptions"
          optionLabel="label"
          optionValue="value"
          :multiple="true"
          size="small"
          class="w-32"
          :formControl="{ novalidate: true }"
          @update:modelValue="flipSelection = $event"
        />
      </div>
    </Popover>
  </div>
</template>
