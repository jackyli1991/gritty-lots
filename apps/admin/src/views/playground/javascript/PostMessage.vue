<template>
  <Card title="打开独立的新窗口，并实现双向通信" size="small">
    <div class="flex items-center gap-4">
      <Button @click="openNewWindow">打开新窗口</Button>
      <Button @click="sendMessage">向子窗口通信</Button>
      <span>收到的消息：{{ receiveMessage }}</span>
      <Button v-if="childWindow" @click="closeNewWindow">关闭新窗口</Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { Card, Button, message } from 'ant-design-vue';
  import { ref, onUnmounted } from 'vue';
  defineOptions({
    name: 'PlaygroundJavascript',
  });

  const receiveMessage = ref('');
  const timer = ref<number>(0);
  const childWindow = ref<Window | null>(null);

  function openNewWindow() {
    // 第三个参数：窗口特征字符串
    // 只要写了任意一个 feature，浏览器就倾向于弹出独立窗口而不是 tab；完全不传第三个参数默认新 tab 打开。
    childWindow.value = window.open(
      '/#/autoroutes/router/group/hidden',
      '_blank',
      'width=1080,height=500,left=200,top=500,scrollbars=yes,resizable=yes,popup=yes'
    );
    checkChildWindowClosed();
  }

  function closeNewWindow() {
    if (childWindow.value) {
      childWindow.value.close();
      childWindow.value = null;
      clearInterval(timer.value);
    }
  }

  function sendMessage() {
    if (!childWindow.value) {
      message.error('请先打开新窗口');
      return;
    }
    childWindow.value.postMessage({ msg: '你好，我是父窗口！' + Date.now() }, '*');
  }

  window.addEventListener('message', (event) => {
    receiveMessage.value = event.data.msg;
    if (event.data.type === 'window-close') {
      closeNewWindow();
    }
  });

  // 兜底轮询（推荐，弥补unload中postMessage丢失问题）
  function checkChildWindowClosed() {
    timer.value = setInterval(() => {
      if (childWindow.value && childWindow.value.closed) {
        receiveMessage.value = '兜底检测：子窗口已关闭';
        childWindow.value = null;
        clearInterval(timer.value);
      }
    }, 500);
  }

  onUnmounted(() => {
    clearInterval(timer.value);
  });
</script>
