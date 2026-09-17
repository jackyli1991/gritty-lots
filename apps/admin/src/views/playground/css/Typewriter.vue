<template>
  <Draggable :initial-value="{ x: 200, y: 200 }">
    <div class="typewriter">
      <span class="text">{{ text }}</span>
      <span class="caret">&nbsp;</span>
    </div>
  </Draggable>
</template>

<script setup lang="ts">
  const text = 'Hello, Typewriter Effect';
</script>

<style lang="scss" scoped>
  .typewriter {
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: inline-flex;
    align-items: center;
    gap: 0.125em;
    // 容器入场过渡：淡入 + 轻微上移，让出现更平顺
    animation: enter 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) both;
  }

  .text {
    color: #fff;
    font-size: 1.25em;
    font-weight: 500;
    letter-spacing: 0.05em;
    // 按字符数截取宽度，配合 steps 实现逐字显示
    // 1ch = 一个等宽字符的宽度
    width: 0ch;
    white-space: nowrap;
    overflow: hidden;
    // alternate 让动画 0→24ch 后反向 24→0，实现打字 + 擦除循环
    // steps(24, end) 等距跳变，每步在结束时刻切换宽度，模拟逐字打出
    // 时长 4s → 3s，打字稍快（约 125ms/字符）
    animation: typing 3s steps(24, end) infinite alternate;
  }

  .caret {
    width: 1px;
    height: 1.25em;
    background: #fff;
    border-radius: 0.0625em;
    // 由 steps(1) 方波改为 ease-in-out，光标柔和淡入淡出，过渡更平顺
    animation: blink 0.9s ease-in-out infinite;
  }

  @keyframes typing {
    from {
      width: 0ch;
    }
    to {
      // 24 个字符（含逗号和空格）
      width: 24ch;
    }
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes enter {
    from {
      opacity: 0;
      transform: translateY(0.5em);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
