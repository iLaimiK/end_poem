<script setup lang="ts">
interface Props {
  isPlaying: boolean;
  canSkipPrev: boolean;
  canSkipNext: boolean;
}

defineProps<Props>();

defineEmits<{
  play: [];
  pause: [];
  prev: [];
  next: [];
  'toggle-list': [];
}>();
</script>

<template>
  <div class="aplayer-control">
    <button class="aplayer-prev aplayer-control-btn" :disabled="!canSkipPrev" title="上一首" @click="$emit('prev')">
      <i class="fas fa-step-backward"></i>
    </button>

    <button
      class="aplayer-play-btn aplayer-control-btn"
      :title="isPlaying ? '暂停' : '播放'"
      @click="isPlaying ? $emit('pause') : $emit('play')"
    >
      <i class="fas fa-play" v-show="!isPlaying"></i>
      <i class="fas fa-pause" v-show="isPlaying"></i>
    </button>

    <button class="aplayer-next aplayer-control-btn" :disabled="!canSkipNext" title="下一首" @click="$emit('next')">
      <i class="fas fa-step-forward"></i>
    </button>

    <button class="aplayer-menu aplayer-control-btn" title="菜单" @click="$emit('toggle-list')">
      <i class="fas fa-bars"></i>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.aplayer-control {
  display: flex;
  align-items: center;
  gap: 1px;
  flex-shrink: 0;
}

.aplayer-control-btn {
  appearance: none;
  -webkit-appearance: none;
  background-color: transparent !important;
  border: none;
  padding: 0;
  margin: 0;
  outline: none;
  width: 24px;
  height: 24px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 0.2s ease;

  &:hover {
    color: #b7daff;
  }

  &.active {
    color: #b7daff;
  }
}

.fa-play {
  width: 8.75px;
}
</style>
