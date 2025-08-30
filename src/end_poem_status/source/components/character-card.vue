<script setup lang="ts">
import { ref } from 'vue';
import type { Character } from '../types/character.d.ts';

interface Props {
  character: Character;
}

const props = defineProps<Props>();
const expanded = ref(false);

const getThemeClass = () => {
  const themeMap: Record<string, string> = {
    白: 'theme-shiro',
    澪: 'theme-mio',
    Lily: 'theme-lily',
    布施翠: 'theme-midori',
    蛭子小比奈: 'theme-kohina',
  };
  return themeMap[props.character.name] || '';
};

const getRoleClass = () => {
  if (props.character.name === '白') return 'role-tag mysterious';
  if (props.character.name === 'user' || !['白', '澪', 'Lily', '布施翠', '蛭子小比奈'].includes(props.character.name))
    return 'role-tag primary';

  const specialRoleMap: Record<string, string> = {
    Lily: 'role-tag holy',
    布施翠: 'role-tag cursed',
    蛭子小比奈: 'role-tag warrior',
  };

  return specialRoleMap[props.character.name] || 'role-tag secondary';
};

const toggleExpanded = () => {
  expanded.value = !expanded.value;
};

const isMysterious = () => props.character.name === '白';
const isSpecialCharacter = () => ['Lily', '布施翠', '蛭子小比奈'].includes(props.character.name);
</script>

<template>
  <div v-if="character.visible !== false" class="character-profile-card" :class="[getThemeClass(), { expanded }]">
    <!-- 卡片头部 -->
    <div class="character-card-header" @click="toggleExpanded">
      <div class="character-basic-info">
        <h3 class="character-name">{{ character.name }}</h3>
        <div class="dynamic-roles-container">
          <span v-for="role in character.roles" :key="role" :class="getRoleClass()">
            {{ role }}
          </span>
        </div>
      </div>
      <button class="expand-btn" :class="{ expanded }">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M7,10L12,15L17,10H7Z" />
        </svg>
      </button>
    </div>

    <!-- 快速统计 -->
    <div class="character-quick-stats">
      <!-- 状态 -->
      <div class="quick-stat-item">
        <span class="stat-label">当前状态</span>
        <div v-if="character.status && character.status.length > 0" class="dynamic-status-container">
          <span v-for="status in character.status" :key="status" class="status-tag">
            {{ status }}
          </span>
        </div>
        <span v-else-if="isMysterious()" class="stat-value mysterious">？？？</span>
        <span v-else class="stat-value neutral">暂无</span>
      </div>

      <!-- 动态统计项 -->
      <div v-if="character.task" class="quick-stat-item">
        <span class="stat-label">当前任务</span>
        <span class="stat-value">{{ character.task }}</span>
      </div>

      <div v-if="character.focus !== undefined" class="quick-stat-item">
        <span class="stat-label">关注度</span>
        <span class="stat-value" id="focus">{{ character.focus }}</span>
      </div>

      <div v-if="character.affection !== undefined" class="quick-stat-item">
        <span class="stat-label">好感度</span>
        <span class="stat-value neutral" id="affection">{{ character.affection }}</span>
      </div>

      <div v-if="character.healingProgress !== undefined" class="quick-stat-item">
        <span class="stat-label">治愈进度</span>
        <div class="progress-indicator">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${character.healingProgress}%` }"></div>
          </div>
          <span class="progress-text">{{ character.healingProgress }}%</span>
        </div>
      </div>

      <div v-if="character.factor" class="quick-stat-item">
        <span class="stat-label">因子</span>
        <span class="stat-value">{{ character.factor }}</span>
      </div>

      <div v-if="character.dependency !== undefined" class="quick-stat-item">
        <span class="stat-label">依赖度</span>
        <span class="stat-value" id="dependency">{{ character.dependency }}</span>
      </div>

      <div v-if="character.recognition !== undefined" class="quick-stat-item">
        <span class="stat-label">认可度</span>
        <span class="stat-value">{{ character.recognition }}</span>
      </div>

      <div v-if="character.memeCorruption !== undefined" class="quick-stat-item">
        <span class="stat-label">模因侵蚀率</span>
        <div class="progress-indicator">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${character.memeCorruption * 100}%` }"></div>
          </div>
          <span class="progress-text">{{ (character.memeCorruption * 100).toFixed(1) }}%</span>
        </div>
      </div>

      <div v-if="character.corruption !== undefined" class="quick-stat-item">
        <span class="stat-label">污秽侵蚀度</span>
        <div class="progress-indicator">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${character.corruption * 100}%` }"></div>
          </div>
          <span class="progress-text">{{ (character.corruption * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <!-- 详细信息 -->
    <div class="character-details" :class="{ collapsed: !expanded }">
      <!-- 外貌描述 -->
      <div v-if="character.appearance?.外貌" class="details-section">
        <div class="section-header">
          <h4 class="section-title">外貌描述</h4>
        </div>
        <div class="dynamic-appearance-grid">
          <div v-for="(value, feature) in character.appearance.外貌" :key="feature" class="appearance-item">
            <span class="appearance-label">{{ feature }}</span>
            <span class="appearance-value">{{ value }}</span>
          </div>
        </div>
      </div>

      <!-- 服饰描述 -->
      <div v-if="character.appearance?.服饰" class="details-section">
        <div class="section-header">
          <h4 class="section-title">服饰描述</h4>
        </div>
        <div class="dynamic-clothing-grid">
          <div v-for="(value, item) in character.appearance.服饰" :key="item" class="appearance-item">
            <span class="appearance-label">{{ item }}</span>
            <span class="appearance-value">{{ value }}</span>
          </div>
        </div>
      </div>

      <!-- 当前姿态 -->
      <div v-if="character.posture" class="details-section">
        <div class="section-header">
          <h4 class="section-title">当前姿态</h4>
        </div>
        <div class="posture-description">{{ character.posture }}</div>
      </div>

      <!-- 持有物品 -->
      <div v-if="character.items && Object.keys(character.items).length > 0" class="details-section">
        <div class="section-header">
          <h4 class="section-title">持有物品</h4>
        </div>
        <div class="dynamic-items-grid">
          <div v-for="(item, name) in character.items" :key="name" class="item-slot">
            <div class="item-name">{{ name }}</div>
            <div class="item-type">{{ item.type }}</div>
            <div class="item-desc">{{ item.desc }}</div>
            <div v-if="item.quantity && item.quantity > 1" class="item-quantity">{{ item.quantity }}</div>
          </div>
        </div>
      </div>

      <!-- 能力 -->
      <div v-if="character.abilities" class="details-section">
        <div class="section-header">
          <h4 class="section-title">能力</h4>
        </div>
        <div class="dynamic-abilities-list" :class="{ mysterious: isMysterious() }">
          <!-- 白的神秘能力 -->
          <template v-if="isMysterious() && Array.isArray(character.abilities)">
            <div v-for="(ability, index) in character.abilities" :key="index" class="ability-item">
              <div class="ability-name">？？？</div>
              <div class="ability-desc">？？？</div>
            </div>
          </template>
          <!-- 普通能力 -->
          <template v-else-if="!Array.isArray(character.abilities)">
            <div v-for="(desc, name) in character.abilities" :key="name" class="ability-item active">
              <div class="ability-name">{{ name }}</div>
              <div class="ability-desc">{{ desc }}</div>
            </div>
          </template>
        </div>
      </div>

      <!-- Lily的可用灵魂 -->
      <div
        v-if="character.name === 'Lily' && character.souls && Object.keys(character.souls).length > 0"
        class="details-section"
      >
        <div class="section-header">
          <h4 class="section-title">可用灵魂</h4>
        </div>
        <div class="dynamic-items-grid">
          <div v-for="(soul, name) in character.souls" :key="name" class="item-slot">
            <div class="item-name">{{ name }}</div>
            <div class="item-desc">{{ soul.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.character-profile-card {
  // 白（Shiro）专属样式
  &.theme-shiro {
    background: var(--shiro-bg) !important;
    position: relative !important;
    overflow: hidden !important;
    backdrop-filter: blur(2px) !important;
    border: var(--theme-border-width) solid var(--shiro-border) !important;

    &::before {
      content: '' !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: url('https://cdn.pixabay.com/photo/2017/12/10/12/49/andromeda-3009853_1280.jpg') center center !important;
      background-size: cover !important;
      background-repeat: no-repeat !important;
      border-radius: 14px !important;
      z-index: 0 !important;
      opacity: 0.6 !important;
      clip-path: inset(0) !important;
    }

    &:hover {
      box-shadow: var(--shiro-shadow), var(--theme-shadow-hover) !important;
      transform: translateY(-3px) !important;
    }

    .character-card-header {
      position: relative !important;
      z-index: 2 !important;
      background: var(--shiro-sub-bg) !important;
      backdrop-filter: blur(4px) !important;
      border-radius: 14px 14px 0 0 !important;
      border-bottom: var(--theme-border-width) solid rgba(255, 255, 255, 0.1) !important;

      .character-name {
        color: var(--shiro-text) !important;
        text-shadow:
          0 0 10px rgba(255, 255, 255, 0.4),
          0 0 20px rgba(139, 170, 199, 0.3) !important;
        font-weight: 300 !important;
        letter-spacing: 0.5px !important;
      }

      .role-tag.mysterious {
        background: rgba(255, 255, 255, 0.1) !important;
        color: rgba(255, 255, 255, 0.8) !important;
        border-color: var(--shiro-border) !important;
        font-family: 'Great Vibes', cursive !important;
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.3) !important;
      }
    }

    .character-quick-stats {
      position: relative !important;
      z-index: 2 !important;
      background: rgba(0, 0, 0, 0.6) !important;
      backdrop-filter: blur(3px) !important;

      .stat-label {
        color: var(--shiro-text-muted) !important;
      }

      .stat-value.mysterious {
        color: rgba(255, 255, 255, 0.7) !important;
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.3) !important;
        font-family: 'Great Vibes', cursive !important;
        font-size: 1rem !important;
      }

      #focus {
        color: rgba(255, 255, 255, 0.9) !important;
        font-family: 'Great Vibes', cursive !important;
        font-size: 1.1rem !important;
        text-shadow:
          0 0 10px rgba(255, 255, 255, 0.4),
          0 0 20px rgba(139, 170, 199, 0.3),
          0 0 30px rgba(99, 102, 241, 0.2) !important;
        letter-spacing: 0.5px !important;
      }
    }

    .character-details {
      position: relative !important;
      z-index: 2 !important;
      background: rgba(0, 0, 0, 0.8) !important;
      backdrop-filter: blur(2px) !important;
      border-radius: 0 0 14px 14px !important;

      .appearance-label,
      .section-title {
        color: rgba(255, 255, 255, 0.9) !important;
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.2) !important;
      }

      .appearance-value {
        color: rgba(255, 255, 255, 0.8) !important;
      }

      .appearance-item,
      .posture-description {
        background: rgba(255, 255, 255, 0.05) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }

      .ability-item {
        background: rgba(255, 255, 255, 0.05) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
        border-left-color: rgba(255, 255, 255, 0.3) !important;

        .ability-name,
        .ability-desc {
          color: rgba(255, 255, 255, 0.7) !important;
          font-family: 'Great Vibes', cursive !important;
        }
      }
    }

    .item-quantity {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(220, 220, 240, 0.8)) !important;
      color: rgba(50, 50, 80, 0.9) !important;
      border: 1px solid rgba(255, 255, 255, 0.4) !important;
      text-shadow: 0 0 3px rgba(255, 255, 255, 0.5) !important;
      box-shadow:
        0 0 8px rgba(255, 255, 255, 0.3),
        0 2px 4px rgba(0, 0, 0, 0.2) !important;
    }
  }

  // 澪（Mio）专属样式
  &.theme-mio {
    background: var(--mio-bg) !important;
    border: var(--theme-border-width) solid var(--mio-border) !important;
    position: relative !important;
    overflow: hidden !important;

    &::before {
      content: '' !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background:
        radial-gradient(2px 2px at 20px 30px, rgba(220, 200, 240, 0.8), transparent),
        radial-gradient(1.5px 1.5px at 90px 50px, rgba(200, 180, 230, 0.6), transparent),
        radial-gradient(1px 1px at 130px 20px, rgba(240, 230, 250, 0.9), transparent),
        radial-gradient(2.5px 2.5px at 180px 60px, rgba(190, 170, 220, 0.7), transparent),
        radial-gradient(1px 1px at 50px 80px, rgba(230, 210, 245, 0.8), transparent),
        radial-gradient(1.5px 1.5px at 100px 90px, rgba(210, 190, 235, 0.6), transparent),
        radial-gradient(2px 2px at 140px 100px, rgba(200, 180, 230, 0.7), transparent),
        radial-gradient(1px 1px at 30px 110px, rgba(240, 220, 250, 0.9), transparent),
        radial-gradient(1.5px 1.5px at 160px 130px, rgba(190, 170, 220, 0.6), transparent),
        radial-gradient(2px 2px at 70px 140px, rgba(220, 200, 240, 0.8), transparent),
        radial-gradient(1px 1px at 110px 15px, rgba(235, 225, 248, 0.9), transparent),
        radial-gradient(1.5px 1.5px at 40px 35px, rgba(205, 185, 235, 0.7), transparent) !important;
      background-size: 220px 170px !important;
      border-radius: 14px !important;
      z-index: 0 !important;
      clip-path: inset(0) !important;
    }

    &:hover {
      box-shadow: var(--mio-shadow), var(--theme-shadow-hover) !important;
      transform: var(--theme-hover-lift) !important;
      border-color: rgba(200, 180, 230, 0.4) !important;
    }

    .character-card-header {
      position: relative !important;
      z-index: 2 !important;
      border-radius: 14px 14px 0 0 !important;
      border-bottom: var(--theme-border-width) solid rgba(180, 160, 210, 0.2) !important;

      .character-name {
        color: var(--mio-text) !important;
        text-shadow:
          0 0 8px rgba(180, 160, 210, 0.5),
          0 0 15px rgba(200, 180, 230, 0.3) !important;
        font-weight: 400 !important;
        letter-spacing: 0.3px !important;
      }

      .role-tag.secondary {
        background: rgba(180, 160, 210, 0.2) !important;
        color: rgba(220, 200, 240, 0.9) !important;
        border-color: rgba(180, 160, 210, 0.4) !important;
        text-shadow: 0 0 3px rgba(180, 160, 210, 0.2) !important;
      }
    }

    .character-quick-stats {
      position: relative !important;
      z-index: 2 !important;

      .stat-label {
        color: rgba(200, 180, 230, 0.7) !important;
      }

      .status-tag {
        background: rgba(180, 160, 210, 0.15) !important;
        color: rgba(220, 200, 240, 0.9) !important;
        border-color: rgba(180, 160, 210, 0.3) !important;
      }

      .stat-value.neutral {
        color: rgba(220, 200, 240, 0.9) !important;
      }

      #affection {
        color: rgba(200, 180, 230, 0.9) !important;
        font-family: 'Consolas', monospace !important;
        font-size: 0.9rem !important;
        text-shadow: 0 0 5px rgba(180, 160, 210, 0.3) !important;
      }

      .progress-fill {
        background: linear-gradient(90deg, rgba(180, 160, 210, 0.8), rgba(220, 200, 240, 0.7)) !important;
      }
    }

    .character-details {
      position: relative !important;
      z-index: 2 !important;
      border-radius: 0 0 14px 14px !important;

      .appearance-item {
        background: rgba(180, 160, 210, 0.08) !important;
        border-color: rgba(180, 160, 210, 0.2) !important;
      }

      .appearance-label,
      .section-title {
        color: rgba(220, 200, 240, 0.9) !important;
        text-shadow: 0 0 3px rgba(180, 160, 210, 0.2) !important;
      }

      .appearance-value {
        color: rgba(200, 180, 230, 0.8) !important;
      }

      .item-slot {
        background: rgba(180, 160, 210, 0.08) !important;
        border-color: rgba(180, 160, 210, 0.2) !important;

        .item-name {
          color: rgba(220, 200, 240, 0.9) !important;
        }

        .item-type {
          color: rgba(200, 180, 230, 0.6) !important;
        }

        .item-desc {
          color: rgba(200, 180, 230, 0.8) !important;
        }
      }

      .ability-item {
        background: rgba(180, 160, 210, 0.08) !important;
        border-color: rgba(180, 160, 210, 0.2) !important;

        &.active {
          border-left-color: rgba(160, 140, 190, 0.8) !important;
        }

        .ability-name {
          color: rgba(220, 200, 240, 0.9) !important;
        }

        .ability-desc {
          color: rgba(200, 180, 230, 0.8) !important;
        }
      }

      .posture-description {
        background: rgba(180, 160, 210, 0.08) !important;
        border-color: rgba(180, 160, 210, 0.2) !important;
        color: rgba(200, 180, 230, 0.8) !important;
      }
    }

    .item-quantity {
      background: linear-gradient(135deg, rgba(180, 160, 210, 0.9), rgba(220, 200, 240, 0.8)) !important;
      color: rgba(60, 40, 80, 0.9) !important;
      border: 1px solid rgba(200, 180, 230, 0.4) !important;
      text-shadow: 0 0 3px rgba(180, 160, 210, 0.4) !important;
      box-shadow:
        0 0 6px rgba(180, 160, 210, 0.4),
        0 2px 4px rgba(0, 0, 0, 0.2) !important;
    }
  }

  // Lily专属样式
  &.theme-lily {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(240, 248, 255, 0.2) 30%,
      rgba(255, 255, 255, 0.18) 70%,
      rgba(248, 250, 252, 0.15) 100%
    ) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    position: relative !important;
    overflow: hidden !important;

    &::before {
      content: '' !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background:
        radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 40%),
        radial-gradient(circle at 70% 80%, rgba(240, 248, 255, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 60%) !important;
      border-radius: 14px !important;
      z-index: 0 !important;
      clip-path: inset(0) !important;
    }

    &:hover {
      box-shadow:
        0 0 25px rgba(255, 255, 255, 0.5),
        0 0 35px rgba(240, 248, 255, 0.3),
        0 15px 25px rgba(0, 0, 0, 0.3) !important;
      transform: translateY(-2px) !important;
      border-color: rgba(255, 255, 255, 0.5) !important;
    }

    .character-card-header,
    .character-quick-stats,
    .character-details {
      position: relative !important;
      z-index: 2 !important;
    }

    .character-card-header {
      .character-name {
        color: rgba(255, 255, 255, 0.95) !important;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.6) !important;
        font-weight: 300 !important;
        letter-spacing: 1px !important;
      }

      .role-tag.holy {
        background: rgba(255, 255, 255, 0.2) !important;
        color: rgba(255, 255, 255, 0.9) !important;
        border-color: rgba(255, 255, 255, 0.4) !important;
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.3) !important;
      }
    }

    .character-quick-stats {
      .status-tag {
        background: rgba(255, 255, 255, 0.15) !important;
        color: rgba(255, 255, 255, 0.9) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
      }

      .progress-fill {
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(240, 248, 255, 0.9)) !important;
      }
    }

    .stat-label,
    .appearance-label,
    .section-title {
      color: rgba(255, 255, 255, 0.8) !important;
    }

    .stat-value,
    .appearance-value {
      color: rgba(255, 255, 255, 0.9) !important;
    }

    .character-details {
      .item-slot,
      .ability-item {
        background: rgba(255, 255, 255, 0.08) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
      }

      .item-name,
      .ability-name {
        color: rgba(255, 255, 255, 0.9) !important;
      }

      .item-desc,
      .ability-desc {
        color: rgba(255, 255, 255, 0.8) !important;
      }

      .posture-description {
        background: rgba(255, 255, 255, 0.08) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
        color: rgba(255, 255, 255, 0.8) !important;
      }

      .appearance-item {
        background: rgba(255, 255, 255, 0.08) !important;
        border-color: rgba(255, 255, 255, 0.15) !important;
      }
    }

    .item-quantity {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 248, 255, 0.9)) !important;
      color: rgba(40, 60, 100, 0.9) !important;
      border: 1px solid rgba(255, 255, 255, 0.5) !important;
      text-shadow: 0 0 4px rgba(255, 255, 255, 0.6) !important;
      box-shadow:
        0 0 10px rgba(255, 255, 255, 0.5),
        0 2px 4px rgba(0, 0, 0, 0.2) !important;
    }
  }

  // 布施翠专属样式
  &.theme-midori {
    background: linear-gradient(
      135deg,
      rgba(255, 182, 193, 0.15) 0%,
      rgba(221, 160, 221, 0.2) 30%,
      rgba(230, 190, 230, 0.18) 70%,
      rgba(240, 200, 240, 0.15) 100%
    ) !important;
    border: 1px solid rgba(221, 160, 221, 0.3) !important;
    position: relative !important;
    overflow: hidden !important;

    &::before {
      content: '' !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background:
        radial-gradient(ellipse at 25% 30%, rgba(255, 182, 193, 0.4) 0%, transparent 35%),
        radial-gradient(ellipse at 75% 70%, rgba(221, 160, 221, 0.3) 0%, transparent 40%),
        radial-gradient(circle at 50% 20%, rgba(230, 190, 230, 0.25) 0%, transparent 50%) !important;
      border-radius: 14px !important;
      z-index: 0 !important;
      clip-path: inset(0) !important;
    }

    &:hover {
      box-shadow:
        0 0 25px rgba(255, 182, 193, 0.4),
        0 0 35px rgba(221, 160, 221, 0.3),
        0 15px 25px rgba(0, 0, 0, 0.3) !important;
      transform: translateY(-2px) !important;
      border-color: rgba(230, 190, 230, 0.5) !important;
    }

    .character-card-header,
    .character-quick-stats,
    .character-details {
      position: relative !important;
      z-index: 2 !important;
    }

    .character-card-header {
      .character-name {
        color: rgba(200, 160, 220, 0.95) !important;
        text-shadow: 0 0 8px rgba(255, 182, 193, 0.5) !important;
        font-weight: 300 !important;
        letter-spacing: 0.3px !important;
      }

      .role-tag.cursed {
        background: rgba(221, 160, 221, 0.2) !important;
        color: rgba(200, 160, 220, 0.9) !important;
        border-color: rgba(230, 190, 230, 0.4) !important;
        text-shadow: 0 0 3px rgba(255, 182, 193, 0.3) !important;
      }
    }

    .character-quick-stats {
      .status-tag {
        background: rgba(221, 160, 221, 0.15) !important;
        color: rgba(200, 160, 220, 0.9) !important;
        border-color: rgba(230, 190, 230, 0.3) !important;
      }

      .progress-fill {
        background: linear-gradient(90deg, rgba(221, 160, 221, 0.8), rgba(255, 182, 193, 0.7)) !important;
      }
    }

    .stat-label,
    .appearance-label,
    .section-title {
      color: rgba(200, 160, 220, 0.8) !important;
    }

    .stat-value,
    .appearance-value {
      color: rgba(200, 160, 220, 0.9) !important;
    }

    .character-details {
      .item-slot,
      .ability-item {
        background: rgba(221, 160, 221, 0.08) !important;
        border-color: rgba(200, 160, 220, 0.2) !important;
      }

      .item-name,
      .ability-name {
        color: rgba(200, 160, 220, 0.9) !important;
      }

      .item-desc,
      .ability-desc {
        color: rgba(200, 160, 220, 0.8) !important;
      }

      .posture-description {
        background: rgba(221, 160, 221, 0.08) !important;
        border-color: rgba(200, 160, 220, 0.2) !important;
        color: rgba(200, 160, 220, 0.8) !important;
      }

      .appearance-item {
        background: rgba(221, 160, 221, 0.08) !important;
        border-color: rgba(200, 160, 220, 0.15) !important;
      }
    }

    .item-quantity {
      background: linear-gradient(135deg, rgba(221, 160, 221, 0.9), rgba(255, 182, 193, 0.8)) !important;
      color: rgba(80, 40, 80, 0.9) !important;
      border: 1px solid rgba(230, 190, 230, 0.4) !important;
      text-shadow: 0 0 3px rgba(255, 182, 193, 0.4) !important;
      box-shadow:
        0 0 6px rgba(221, 160, 221, 0.4),
        0 2px 4px rgba(0, 0, 0, 0.2) !important;
    }
  }

  // 小比奈专属样式
  &.theme-kohina {
    background: linear-gradient(
      135deg,
      rgba(25, 50, 100, 0.75) 0%,
      rgba(40, 70, 120, 0.8) 30%,
      rgba(60, 30, 80, 0.75) 70%,
      rgba(30, 40, 90, 0.75) 100%
    ) !important;
    border: 1px solid rgba(100, 150, 255, 0.3) !important;
    position: relative !important;
    overflow: hidden !important;

    &::before {
      content: '' !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background:
        radial-gradient(circle at 20% 30%, rgba(255, 100, 100, 0.3) 0%, transparent 30%),
        radial-gradient(circle at 80% 70%, rgba(100, 150, 255, 0.4) 0%, transparent 40%),
        radial-gradient(ellipse at 50% 50%, rgba(150, 100, 200, 0.2) 0%, transparent 60%) !important;
      border-radius: 14px !important;
      z-index: 0 !important;
      clip-path: inset(0) !important;
    }

    &:hover {
      box-shadow:
        0 0 25px rgba(100, 150, 255, 0.4),
        0 0 35px rgba(255, 100, 100, 0.3),
        0 15px 25px rgba(0, 0, 0, 0.4) !important;
      transform: translateY(-2px) !important;
      border-color: rgba(150, 100, 200, 0.5) !important;
    }

    .character-card-header,
    .character-quick-stats,
    .character-details {
      position: relative !important;
      z-index: 2 !important;
    }

    .character-card-header {
      .character-name {
        color: rgba(200, 220, 255, 0.95) !important;
        text-shadow:
          0 0 8px rgba(100, 150, 255, 0.5),
          0 0 15px rgba(255, 100, 100, 0.3) !important;
        font-weight: 500 !important;
        letter-spacing: 0.3px !important;
      }

      .role-tag.warrior {
        background: rgba(100, 150, 255, 0.2) !important;
        color: rgba(200, 220, 255, 0.9) !important;
        border-color: rgba(150, 100, 200, 0.4) !important;
        text-shadow: 0 0 3px rgba(100, 150, 255, 0.3) !important;
      }
    }

    .character-quick-stats {
      .status-tag {
        background: rgba(100, 150, 255, 0.15) !important;
        color: rgba(200, 220, 255, 0.9) !important;
        border-color: rgba(150, 100, 200, 0.3) !important;
      }

      .progress-fill {
        background: linear-gradient(90deg, rgba(100, 150, 255, 0.8), rgba(255, 100, 100, 0.7)) !important;
      }
    }

    .stat-label,
    .appearance-label,
    .section-title {
      color: rgba(200, 220, 255, 0.8) !important;
    }

    .stat-value,
    .appearance-value {
      color: rgba(200, 220, 255, 0.9) !important;
    }

    .character-details {
      .item-slot,
      .ability-item {
        background: rgba(100, 150, 255, 0.1) !important;
        border-color: rgba(100, 150, 255, 0.3) !important;
      }

      .item-name,
      .ability-name {
        color: rgba(200, 220, 255, 0.9) !important;
      }

      .item-desc,
      .ability-desc {
        color: rgba(200, 220, 255, 0.8) !important;
      }

      .posture-description {
        background: rgba(100, 150, 255, 0.1) !important;
        border-color: rgba(100, 150, 255, 0.3) !important;
        color: rgba(200, 220, 255, 0.8) !important;
      }

      .appearance-item {
        background: rgba(100, 150, 255, 0.08) !important;
        border-color: rgba(100, 150, 255, 0.15) !important;
      }
    }

    .item-quantity {
      background: linear-gradient(135deg, rgba(100, 150, 255, 0.9), rgba(150, 100, 200, 0.8)) !important;
      color: rgba(20, 20, 40, 0.9) !important;
      border: 1px solid rgba(150, 100, 200, 0.4) !important;
      text-shadow: 0 0 3px rgba(100, 150, 255, 0.4) !important;
      box-shadow:
        0 0 6px rgba(100, 150, 255, 0.4),
        0 2px 4px rgba(0, 0, 0, 0.2) !important;
    }
  }

  // 用户角色的物品数量样式
  &:not(.theme-shiro):not(.theme-mio):not(.theme-lily):not(.theme-midori):not(.theme-kohina) {
    .item-quantity {
      background: linear-gradient(135deg, var(--accent-blue), rgba(99, 102, 241, 0.9)) !important;
      color: white !important;
      border: 1px solid rgba(74, 158, 255, 0.3) !important;
      text-shadow: 0 0 3px rgba(74, 158, 255, 0.4) !important;
      box-shadow:
        0 0 6px rgba(74, 158, 255, 0.3),
        0 2px 4px rgba(0, 0, 0, 0.2) !important;
    }
  }
}
</style>
