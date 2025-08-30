<script setup lang="ts">
import { ref } from 'vue';
import type { SideCharacter } from '../types/character.d.ts';

interface Props {
  character: SideCharacter;
}

const props = defineProps<Props>();
const expanded = ref(false);

const toggleExpanded = () => {
  expanded.value = !expanded.value;
};
</script>

<template>
  <div class="side-character-card" :class="{ expanded }" @click="toggleExpanded">
    <!-- 次要角色卡片头部 -->
    <div class="side-character-header">
      <div class="side-character-info">
        <div class="side-character-name">{{ character.name }}</div>
        <div class="side-character-identity">{{ character.identity }}</div>
        <div class="side-trust-indicator">
          <span class="trust-label">信任值</span>
          <span class="trust-value">{{ character.trustLevel }}</span>
        </div>
      </div>
      <div class="side-expand-indicator">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M7,10L12,15L17,10H7Z" />
        </svg>
      </div>
    </div>

    <!-- 次要角色卡片内容 -->
    <div class="side-character-content">
      <div class="side-content-section">
        <div class="side-section-title">外观描述</div>
        <div class="side-appearance-desc">{{ character.appearance }}</div>
      </div>

      <div class="side-content-section">
        <div class="side-section-title">当前姿态</div>
        <div class="side-posture-desc">{{ character.posture }}</div>
      </div>

      <div v-if="character.items && Object.keys(character.items).length > 0" class="side-content-section">
        <div class="side-section-title">持有物品</div>
        <div class="side-items-grid">
          <div v-for="(item, name) in character.items" :key="name" class="item-slot">
            <div class="item-name">{{ name }}</div>
            <div class="item-type">{{ item.type }}</div>
            <div class="item-desc">{{ item.desc }}</div>
            <div v-if="item.quantity && item.quantity > 1" class="item-quantity">{{ item.quantity }}</div>
          </div>
        </div>
      </div>

      <div v-if="character.abilities && Object.keys(character.abilities).length > 0" class="side-content-section">
        <div class="side-section-title">能力</div>
        <div class="side-abilities-list">
          <div v-for="(desc, name) in character.abilities" :key="name" class="side-ability-item">
            <div class="ability-name">{{ name }}</div>
            <div class="ability-desc">{{ desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 次要角色卡片基础样式 */
.side-character-card {
  background: rgba(139, 170, 199, 0.08);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  overflow: hidden;
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(139, 170, 199, 0.1), transparent);
  }

  &:hover::before {
    left: 100%;
  }
}

/* 次要角色卡片头部 */
.side-character-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid rgba(139, 170, 199, 0.1);
  position: relative;
  z-index: 2;
}

.side-character-info {
  flex: 1;
  min-width: 0;
}

.side-character-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-family: 'Great Vibes', cursive;
}

.side-character-identity {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-style: italic;
  margin-bottom: 0.5rem;
}

.side-trust-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.trust-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
}

.trust-value {
  font-size: 0.85rem;
  color: var(--accent-teal);
  font-weight: 600;
  font-family: 'Consolas', monospace;
}

.side-expand-indicator {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(139, 170, 199, 0.1);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  color: var(--text-secondary);
}

.side-character-card.expanded .side-expand-indicator {
  transform: rotate(180deg);
  background: rgba(74, 158, 255, 0.2);
  border-color: rgba(74, 158, 255, 0.3);
}

/* 次要角色卡片内容 */
.side-character-content {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.side-character-card.expanded .side-character-content {
  max-height: 800px;
  opacity: 1;
  padding: 1.5rem;
  padding-top: 1rem;
}

.side-content-section {
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.side-section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: var(--accent-blue);
    border-radius: 2px;
  }
}

/* 外观描述样式 */
.side-appearance-desc {
  background: rgba(139, 170, 199, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  font-style: italic;
}

/* 姿态描述样式 */
.side-posture-desc {
  background: rgba(20, 184, 166, 0.05);
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  border-left: 3px solid var(--accent-teal);
}

/* 次要角色物品网格 */
.side-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

/* 次要角色能力列表 */
.side-abilities-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.side-ability-item {
  background: rgba(139, 170, 199, 0.05);
  border: 1px solid var(--glass-border);
  border-left: 4px solid var(--accent-purple);
  border-radius: 8px;
  padding: 1rem;

  .ability-name {
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
    font-size: 0.95rem;
  }

  .ability-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .side-character-header {
    padding: 1rem;
    flex-wrap: wrap;
  }

  .side-character-name {
    font-size: 1.1rem;
  }

  .side-character-card.expanded .side-character-content {
    padding: 1rem;
  }

  .side-items-grid {
    grid-template-columns: 1fr;
  }

  .side-section-title {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .side-character-header {
    padding: 0.875rem;
  }

  .side-character-name {
    font-size: 1rem;
  }

  .side-character-identity {
    font-size: 0.8rem;
  }

  .trust-label,
  .trust-value {
    font-size: 0.75rem;
  }

  .side-expand-indicator {
    width: 24px;
    height: 24px;
  }

  .side-character-card.expanded .side-character-content {
    padding: 0.875rem;
  }
}
</style>
