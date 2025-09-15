<template>
  <div class="map_controls">
    <button
      class="control_button zoom_in"
      @click="$emit('zoom-in')"
      @touchstart.prevent="$emit('zoom-in')"
      title="放大"
    >
      <i class="fa-solid fa-plus"></i>
    </button>
    <button
      class="control_button zoom_out"
      @click="$emit('zoom-out')"
      @touchstart.prevent="$emit('zoom-out')"
      title="缩小"
    >
      <i class="fa-solid fa-minus"></i>
    </button>
    <button
      class="control_button reset_view"
      @click="$emit('reset-view')"
      @touchstart.prevent="$emit('reset-view')"
      title="重置视图"
    >
      <i class="fa-solid fa-expand-arrows-alt"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
// 事件定义
defineEmits<{
  'zoom-in': [];
  'zoom-out': [];
  'reset-view': [];
}>();
</script>

<style lang="scss" scoped>
.map_controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;

  .control_button {
    width: 36px;
    height: 36px;
    background: rgba(22, 33, 62, 0.9);
    border: 1px solid #4a9eff;
    border-radius: 6px;
    color: #4a9eff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.2s ease;
    user-select: none;

    &:hover {
      background: rgba(74, 158, 255, 0.2);
      color: #e8eaf0;
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
      background: rgba(74, 158, 255, 0.4);
    }

    i {
      pointer-events: none;
    }
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .map_controls {
    top: 8px;
    right: 8px;
    gap: 6px;

    .control_button {
      width: 32px;
      height: 32px;
      font-size: 12px;

      &:active {
        transform: scale(0.9);
        background: rgba(74, 158, 255, 0.5);
      }
    }
  }
}

@media (max-width: 480px) {
  .map_controls {
    top: 6px;
    right: 6px;
    gap: 4px;

    .control_button {
      width: 30px;
      height: 30px;
      font-size: 11px;
      border-radius: 4px;

      &:active {
        transform: scale(0.85);
      }
    }
  }
}
</style>
