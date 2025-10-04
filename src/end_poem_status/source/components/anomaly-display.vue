<script setup lang="ts">
interface Props {
  anomalies: Record<string, string>;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="anomaly-display">
    <!-- 有异常时的显示 -->
    <template v-if="Object.keys(anomalies).length > 0">
      <div class="anomaly-header">
        <div class="anomaly-status-text">
          <span class="anomaly-count">检测到 {{ Object.keys(anomalies).length }} 种异常</span>
        </div>
      </div>
      <div class="anomaly-list">
        <div v-for="(description, type) in anomalies" :key="type" class="anomaly-item" data-severity="medium">
          <div class="anomaly-severity"></div>
          <div class="anomaly-content">
            <div class="anomaly-type">{{ type }}</div>
            <div class="anomaly-description">{{ description }}</div>
          </div>
        </div>
      </div>
    </template>

    <!-- 无异常时的占位符 -->
    <template v-else>
      <div class="anomaly-placeholder">
        <div class="anomaly-placeholder-icon">
          <i class="fas fa-check anomaly-placeholder-checkmark"></i>
        </div>
        <div class="anomaly-placeholder-content">
          <div class="anomaly-placeholder-title">系统状态正常</div>
          <div class="anomaly-placeholder-desc">未检测到任何异常情况</div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.anomaly-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.anomaly-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 107, 107, 0.2);
}

.anomaly-count {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.anomaly-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.anomaly-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  background: rgba(255, 107, 107, 0.08);
  border-color: rgba(255, 107, 107, 0.25);
  border-radius: 8px;
  border-left: 3px solid #ff6b6b;
}

.anomaly-severity {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.75rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
  background: #ff6b6b;
}

.anomaly-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.anomaly-type {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 600;
}

.anomaly-description {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.anomaly-monitor {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.anomaly-monitor-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-teal);
}

// 占位符
.anomaly-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  text-align: center;
}

.anomaly-placeholder-icon {
  margin-bottom: 1rem;
}

.anomaly-placeholder-checkmark {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.anomaly-placeholder-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.anomaly-placeholder-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.anomaly-placeholder-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.4;
}
</style>
