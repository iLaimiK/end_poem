<script setup lang="ts">
import type { AudioTrack } from '../types';

interface Props {
  tracks: AudioTrack[];
  currentIndex: number;
  isVisible: boolean;
}

defineProps<Props>();

defineEmits<{
  'select-track': [index: number];
}>();
</script>

<template>
  <div class="aplayer-list" :class="{ 'aplayer-list-show': isVisible }">
    <ol class="aplayer-list-ol">
      <li
        v-for="(track, index) in tracks"
        :key="`track-${index}-${track.name}`"
        class="aplayer-list-light"
        :class="{ 'aplayer-list-cur': index === currentIndex }"
        @click="$emit('select-track', index)"
      >
        <span class="aplayer-list-index">{{ index + 1 }}</span>
        <span class="aplayer-list-title">{{ track.name }}</span>
        <span class="aplayer-list-author">{{ track.artist }}</span>
      </li>
    </ol>
  </div>
</template>

<style lang="scss" scoped>
.aplayer-list {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  max-height: 0;
  overflow-y: auto;
  transition: max-height 0.5s ease;
  margin-right: 18px;

  &.aplayer-list-show {
    max-height: 300px;
  }

  .aplayer-list-ol {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  .aplayer-list-light {
    position: relative;
    height: 32px;
    line-height: 32px;
    padding: 0 10px;
    font-size: 15px;
    border-top: 1px solid #e9e9e9;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
    margin: 0;
    display: flex;
    align-items: center;

    &:first-child {
      border-top: none;
    }

    &:hover {
      background: #efefef;
    }

    &.aplayer-list-cur {
      background: #e6f3ff !important;
      border-left: 4px solid #258bc9;
    }
  }

  .aplayer-list-index {
    color: #666;
    margin-right: 12px;
    cursor: pointer;
    width: 15px;
    font-size: 14px;
  }

  .aplayer-list-title {
    color: #666;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 10px;
    font-size: 12px;
  }

  .aplayer-list-author {
    color: #ccc;
    font-size: 12px;
  }

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: #f9f9f9;
  }

  &::-webkit-scrollbar-thumb {
    background: #eee;
    border-radius: 3px;

    &:hover {
      background: #ccc;
    }
  }
}

@media screen and (max-width: 768px) {
  .aplayer-list {
    top: 100%;
    bottom: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
