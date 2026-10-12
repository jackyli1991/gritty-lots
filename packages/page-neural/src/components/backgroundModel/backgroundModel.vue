<script lang="ts" setup>
  import Button from 'primevue/button';
  import type { FileUploadUploaderEvent } from 'primevue/fileupload';
  import FileUpload from 'primevue/fileupload';
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
  }

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

  /** 颜色选择器值更新 */
  const onColorChange = (val?: string) => {
    if (val === undefined) return;
    model.value = { ...model.value, backgroundColor: val };
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
        <Button size="small" severity="secondary" class="h-6">
          <NeuralIcon
            name="TrianglesCenterlineDashedHorizontal"
            :size="16"
            class="rounded text-gray-500 transition-colors"
          />
          垂直居中
        </Button>
        <Button size="small" severity="secondary" class="h-6">
          <NeuralIcon
            name="TrianglesCenterlineDashedVertical"
            :size="16"
            class="rounded text-gray-500 transition-colors"
          />
          水平居中
        </Button>
        <Button size="small" severity="danger" variant="text" class="h-6" @click="onClearImage">
          <NeuralIcon name="X" :size="16" class="rounded transition-colors text-red-600" />
          删除
        </Button>
      </template>
    </div>
  </div>
</template>
