import type { ToastMessageOptions } from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

export function useNeuralToast() {
  const toast = useToast();

  function neuralToast(options: ToastMessageOptions) {
    toast.add({
      ...options,
      life: 1800,
    });
  }

  // 成功提示
  // @param detail 详细信息
  // @param summary 摘要信息
  function neuralToastSuccess(detail: string, summary: string) {
    neuralToast({
      severity: 'success',
      detail,
      summary,
    });
  }

  // 警告提示
  // @param detail 详细信息
  // @param summary 摘要信息
  function neuralToastWarning(detail: string, summary: string) {
    neuralToast({
      severity: 'warn',
      detail,
      summary,
    });
  }

  // 错误提示
  // @param detail 详细信息
  // @param summary 摘要信息
  function neuralToastError(detail: string, summary: string) {
    neuralToast({
      severity: 'error',
      detail,
      summary,
    });
  }

  // 信息提示
  // @param detail 详细信息
  // @param summary 摘要信息
  function neuralToastInfo(detail: string, summary: string) {
    neuralToast({
      severity: 'info',
      detail,
      summary,
    });
  }

  return {
    neuralToast,
    neuralToastSuccess,
    neuralToastWarning,
    neuralToastError,
    neuralToastInfo,
  };
}
