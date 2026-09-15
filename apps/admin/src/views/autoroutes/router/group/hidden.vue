<template>
  <div class="flex flex-col gap-4">
    <Card title="隐藏路由" size="small">
      <h1>这是一个隐藏路由，不会在菜单中显示，但是你仍然可以通过路由跳转访问它。</h1>
      <Button @click="router.back()" size="small">返回</Button>
    </Card>
    <Card title="子窗口通信" size="small">
      <p>子窗口收到的消息：{{ receiveMessage }}</p>
      <Button @click="sendMessage('你好，我是子窗口！', 'message')">向父窗口通信</Button>
      <Button @click="closeWindow('JS主动关闭子窗口')">关闭子窗口</Button>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { Button, Card } from 'ant-design-vue';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const receiveMessage = ref('');

  function sendMessage(msg: string, type: string) {
    if (!window.opener) {
      return;
    }
    window.opener.postMessage({ msg: msg + Date.now(), type: type }, '*');
  }

  window.addEventListener('message', (event) => {
    receiveMessage.value = event.data.msg;
  });

  // 方式1：JS主动关闭按钮
  function closeWindow(msg: string) {
    sendMessage(msg, 'window-close');
    window.close();
  }

  // 方式2：用户点击浏览器关闭按钮（右上角X）- 不可靠，最佳实践：`unload` 发消息 + 父窗口轮询 `childWin.closed` 做双重保险
  window.addEventListener('unload', () => {
    closeWindow('右上角X关闭了子窗口');
  });
</script>
