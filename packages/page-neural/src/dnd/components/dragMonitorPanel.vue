<!-- DragMonitorPanel.vue 【核心：useDragDropMonitor】 -->
<template>
  <div class="flex items-center gap-2 text-xs text-gray-500 font-light">
    <h4>拖拽监视器：</h4>
    <div>拖拽ID：{{ activeId }}</div>
    <div>位置：x:{{ position.x }} y:{{ position.y }}</div>
    <div>目标：{{ overId }}</div>
    <div>状态：{{ dragStatus }}</div>
  </div>
</template>

<script lang="ts" setup>
  import type {
    DragEndEvent,
    DragStartEvent,
    DragMoveEvent,
    // BeforeDragStartEvent,
    // CollisionEvent,
  } from '@dnd-kit/vue';
  import { useDragDropMonitor } from '@dnd-kit/vue';
  import { ref } from 'vue';

  const activeId = ref<string | null>(null);
  const overId = ref<string | null>(null);
  const position = ref<Record<string, number>>({});
  const dragStatus = ref('空闲');

  const emit = defineEmits<{
    (e: 'dragStart', id: string): void;
    (
      e: 'droppedIn',
      data: {
        source: DragEndEvent['operation']['source'];
        target: DragEndEvent['operation']['target'];
      }
    ): void;
  }>();

  function clear() {
    activeId.value = null;
    overId.value = null;
    position.value = {};
    dragStatus.value = '空闲';
  }

  useDragDropMonitor({
    // 拖拽开始前触发 event: BeforeDragStartEvent
    onBeforeDragStart() {
      clear();
      // 示例：可以阻止id=blocked的元素拖拽
      // if (event.operation.source.id === 'blocked') event.preventDefault()
    },
    // 拖拽开始触发
    onDragStart(event: DragStartEvent) {
      // console.log('拖拽开始', event.operation)
      activeId.value = event.operation?.source?.id as string;
      dragStatus.value = '拖拽中';
      emit('dragStart', activeId.value);
    },
    // 实时移动
    onDragMove(event: DragMoveEvent) {
      // console.log(event.operation.position);
      position.value = event.operation.position.current;
    },
    // 悬浮到放置区触发
    onDragOver(event: DragMoveEvent) {
      if (event.operation.target) {
        overId.value = event.operation.target.id as string;
      } else {
        overId.value = null;
      }
    },
    // 碰撞列表 event: CollisionEvent
    onCollision() {
      // console.log('碰撞项列表', event?.collisions || [])
    },
    // 拖拽结束触发
    onDragEnd(event: DragEndEvent) {
      // console.log('拖拽结束', event)
      if (event.canceled) {
        dragStatus.value = '已取消';
      } else {
        const { source, target } = event.operation;
        if (target) {
          dragStatus.value = '已放置';
          emit('droppedIn', { source, target });
        } else {
          dragStatus.value = '目标为空';
        }
      }
      clear();
    },
  });
</script>
