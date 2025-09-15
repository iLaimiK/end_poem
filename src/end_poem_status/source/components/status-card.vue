<script setup lang="ts">
interface Props {
  title: string;
  cardClass?: string;
  gridArea?: string;
  iconPath: string;
  indicatorClass?: string;
  showIndicator?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  cardClass: '',
  gridArea: '',
  indicatorClass: '',
  showIndicator: true,
});
</script>

<template>
  <div class="status-card" :class="cardClass" :style="gridArea ? { gridArea } : {}">
    <div class="card-header">
      <svg class="card-icon" viewBox="0 0 24 24" fill="currentColor">
        <path :d="iconPath" />
      </svg>
      <h3 class="card-title">{{ title }}</h3>
      <!-- 操作按钮插槽，优先级高于指示器 -->
      <slot name="action"></slot>
      <div v-if="showIndicator && !$slots.action" class="status-indicator" :class="indicatorClass"></div>
    </div>
    <div class="card-content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 状态卡片基础样式
.status-card {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  padding: 1.25rem;
  background: rgba(139, 170, 199, 0.08);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--theme-backdrop-filter);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(139, 170, 199, 0.1), transparent);
  }
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
}

.card-icon {
  width: 24px;
  height: 24px;
  margin-right: 0.75rem;
  opacity: 0.9;
  color: #fff;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
}

.card-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

// 指示器基础样式
.status-indicator {
  margin-left: auto;
  border-radius: 50%;

  &.time-indicator {
    width: 12px;
    height: 12px;
    background: var(--accent-teal);
  }

  &.location-indicator {
    width: 10px;
    height: 10px;
    background: var(--accent-purple);
  }

  &.weather-indicator {
    width: 8px;
    height: 8px;
    background: var(--accent-teal);
  }

  &.anomaly-indicator {
    width: 14px;
    height: 14px;
    background: #ff6b6b;
  }
}

// 各种卡片特殊样式
.status-card.time-card {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.12) 0%, rgba(20, 184, 166, 0.08) 100%);
  border-color: rgba(74, 158, 255, 0.4);
}

.status-card.location-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 170, 199, 0.08) 100%);
  border-color: rgba(99, 102, 241, 0.3);
}

.status-card.weather-card {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(139, 170, 199, 0.08) 100%);
  border-color: rgba(20, 184, 166, 0.3);
}

.status-card.anomaly-card {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.08) 0%, rgba(139, 170, 199, 0.08) 100%);
  border-color: rgba(255, 107, 107, 0.2);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, #ff6b6b, #ff8e53);
    opacity: 0.8;
  }

  .card-icon {
    color: #ff6b6b;
  }
}

.status-card.plot-card {
  padding: 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 170, 199, 0.08) 100%);
  border-color: rgba(99, 102, 241, 0.3);

  .card-header {
    margin-bottom: 0;
  }
}
</style>
