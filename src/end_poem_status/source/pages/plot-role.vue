<script setup lang="ts">
import { computed } from 'vue';
import SideCharacterCard from '../components/side-character-card.vue';
import { useAppData } from '../composables/useAppData';
import type { SideCharacter } from '../types/character.d.ts';

// 使用应用数据组合式API
const { sideCharactersData } = useAppData();

// 将获取到的数据转换为组件期望的数组格式
const sideCharacters = computed<SideCharacter[]>(() => {
  return Object.entries(sideCharactersData.value).map(([name, data]) => ({
    name,
    ...data,
  }));
});
</script>

<template>
  <div class="side-characters-container">
    <!-- 次要角色列表 -->
    <div v-if="sideCharacters.length > 0" class="side-character-list">
      <SideCharacterCard v-for="character in sideCharacters" :key="character.name" :character="character" />
    </div>

    <!-- 空状态占位符 -->
    <div v-else class="empty-state-card">
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" class="icon">
            <path
              d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"
            />
          </svg>
        </div>
        <h3 class="empty-state-title">暂无邂逅之人</h3>
        <p class="empty-state-description">
          在这片广袤的世界中，你尚未与其他旅行者产生交集。<br />
          当命运的丝线将你们联系在一起时，他们的身影将会出现在这里。
        </p>
        <div class="empty-state-footer">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path
              d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z"
            />
          </svg>
          <span>等待命运的邂逅...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.side-characters-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 100%;
}

/* 次要角色列表 */
.side-character-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* 空状态样式 */
.empty-state-card {
  background: rgba(139, 170, 199, 0.08);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  text-align: center;
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(139, 170, 199, 0.1), transparent);
    transition: left 0.6s ease;
  }

  &:hover::before {
    left: 100%;
  }
}

.empty-state-content {
  position: relative;
  z-index: 2;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  opacity: 0.6;

  .icon {
    width: 100%;
    height: 100%;
    color: var(--accent-purple);
  }
}

.empty-state-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-family: 'Great Vibes', cursive;
}

.empty-state-description {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.8;
}

.empty-state-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  font-style: italic;

  svg {
    opacity: 0.7;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .side-character-list {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .empty-state-card {
    padding: 2rem 1.5rem;
  }

  .empty-state-title {
    font-size: 1.3rem;
  }

  .empty-state-description {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .side-characters-container {
    gap: 1rem;
  }

  .empty-state-card {
    padding: 1.5rem 1rem;
  }

  .empty-state-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
  }

  .empty-state-title {
    font-size: 1.2rem;
  }

  .empty-state-description {
    font-size: 0.85rem;
    margin-bottom: 1.5rem;
  }

  .empty-state-footer {
    font-size: 0.8rem;
  }
}
</style>
