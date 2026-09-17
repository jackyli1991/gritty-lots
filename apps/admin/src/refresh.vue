<script setup lang="ts">
  import { Modal, Button } from 'ant-design-vue';
  import { useRegisterSW } from 'virtual:pwa-register/vue';

  const {
    // offlineReady, // 离线就绪
    needRefresh, // 存在新版本，true=需要提示用户
    updateServiceWorker, // 执行更新+刷新页面
  } = useRegisterSW({
    immediate: true, // 立即注册SW
    // 定时轮询检查新版本（单位毫秒，可选，默认只在页面加载时检查）
    onRegistered(r) {
      console.log('SW注册成功', r);
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 1000); // 60s检查一次新版本
      }
    },
    onRegisterError(error) {
      console.error('SW注册失败', error);
    },
    onNeedRefresh() {
      console.log('have new version', needRefresh.value);
    },
  });

  // 用户点击【更新】
  const handleUpdate = async () => {
    await updateServiceWorker(true);
  };

  function close() {
    // offlineReady.value = false
    needRefresh.value = false;
  }
</script>

<template>
  <!-- 更新弹窗：needRefresh.value=true 出现 -->
  <Modal :open="needRefresh">
    <p>检测到新版本，是否立即更新？</p>
    <template #footer>
      <Button type="primary" @click="handleUpdate">立即更新</Button>
      <Button @click="close">稍后</Button>
    </template>
  </Modal>
</template>
