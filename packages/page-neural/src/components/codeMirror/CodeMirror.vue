<template>
  <div
    :style="{ height: props.height }"
    class="border border-[var(--p-surface-300)] rounded-md overflow-hidden"
    ref="editorEl"
  ></div>
</template>

<script lang="ts" setup>
  import { javascript } from '@codemirror/lang-javascript';
  import { EditorView, basicSetup } from 'codemirror';
  import { ref, watch, onMounted, onUnmounted } from 'vue';

  interface Props {
    modelValue?: string;
    height?: string;
    editable?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    height: '200px',
    editable: true,
  });

  const emit = defineEmits<{
    'update:modelValue': [value: string];
  }>();

  const editorEl = ref<HTMLElement>();
  let view: EditorView | null = null;

  onMounted(() => {
    view = new EditorView({
      doc: props.modelValue ?? '',
      extensions: [
        basicSetup,
        javascript(),
        EditorView.editable.of(props.editable),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            emit('update:modelValue', update.state.doc.toString());
          }
        }),
      ],
      parent: editorEl.value,
    });
  });

  onUnmounted(() => {
    view?.destroy();
  });

  // 外部值变化时同步到 editor，避免覆盖用户正在输入的内容
  watch(
    () => props.modelValue,
    (val) => {
      if (!view) return;
      const next = val ?? '';
      const current = view.state.doc.toString();
      if (next !== current) {
        view.dispatch({
          changes: { from: 0, to: current.length, insert: next },
        });
      }
    }
  );
</script>
