<script setup lang="ts">
interface Props {
  plotProgress: string;
  plotNodes: string[];
  isExpanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isExpanded: false,
});
</script>

<template>
  <div class="plot-content">
    <div class="plot-display" :class="{ collapsed: !isExpanded }">
      <div class="plot-header">
        <span class="plot-label">当前进度</span>
        <span class="plot-progress">{{ plotProgress }}</span>
      </div>

      <div class="plot-nodes-section">
        <div class="plot-section-title">剧情节点记录</div>
        <div class="plot-nodes-list">
          <div v-if="plotNodes.length === 0" class="plot-node-item no-data">暂无剧情节点记录</div>
          <div v-for="(node, index) in plotNodes" :key="index" class="plot-node-item">
            {{ node }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.plot-content {
  position: relative;
}

/* 可收缩内容区域 */
.plot-display {
  transition: all 0.4s ease;
  overflow: hidden;

  &.collapsed {
    max-height: 0;
    opacity: 0;
    padding: 0;
    margin: 0;
  }

  &:not(.collapsed) {
    max-height: 400px;
    opacity: 1;
    padding: 1rem 0;
    margin-top: 0.5rem;
  }
}

.plot-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-top: 0.5rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
  margin-bottom: 1rem;
}

.plot-label {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-right: 0.5rem;
}

.plot-progress {
  font-size: 1rem;
  color: var(--accent-purple);
  font-weight: 600;
  font-family: 'Consolas', monospace;
  background: rgba(99, 102, 241, 0.15);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.plot-nodes-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.plot-section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: var(--accent-purple);
    border-radius: 2px;
  }
}

.plot-nodes-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 0.5rem;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.plot-node-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-left: 3px solid var(--accent-purple);
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;

  &::before {
    content: '•';
    color: var(--accent-purple);
    font-weight: bold;
    margin-right: 0.5rem;
    font-size: 1rem;
  }

  &.no-data {
    font-style: italic;
    opacity: 0.7;

    &::before {
      content: '';
      margin-right: 0;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .plot-display:not(.collapsed) {
    max-height: 300px;
    padding: 0.75rem 0;
  }

  .plot-nodes-list {
    max-height: 150px;
  }

  .plot-node-item {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
}
</style>
