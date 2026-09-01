import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useProgressStore = defineStore('progress', () => {
  const visible = ref(false);
  const percentage = ref(0);
  let timer: ReturnType<typeof setInterval> | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  const start = () => {
    visible.value = true;
    percentage.value = 0;

    // 清除之前的定时器
    if (timer) clearInterval(timer);
    if (hideTimer) clearTimeout(hideTimer);

    // 模拟进度增长
    timer = setInterval(() => {
      if (percentage.value < 90) {
        // 前90%快速增长
        percentage.value += Math.random() * 15 + 5;
        if (percentage.value > 90) {
          percentage.value = 90;
        }
      } else {
        // 90%后缓慢增长
        percentage.value += Math.random() * 2;
        if (percentage.value > 95) {
          percentage.value = 95;
        }
      }
    }, 200);
  };

  const finish = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    percentage.value = 100;

    // 延迟隐藏
    hideTimer = setTimeout(() => {
      visible.value = false;
      percentage.value = 0;
    }, 300);
  };

  const error = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    visible.value = true;
    percentage.value = 100;
    hideTimer = setTimeout(() => {
      visible.value = false;
      percentage.value = 0;
    }, 500);
  };

  return {
    visible,
    percentage,
    start,
    finish,
    error,
  };
});
