<script setup lang="ts">
import { computed } from 'vue';
import CharacterCard from '../components/character-card.vue';
import { useAppData } from '../composables/useAppData';
import { appState } from '../stores/app-state';
import type { Character } from '../types/character.d.ts';

// 使用应用数据组合式API
const { charactersData, specialCharacterData } = useAppData();

// 计算属性：获取当前可见的主要角色列表
const visibleCharacters = computed<Character[]>(() => {
  const allCharacters = charactersData.value;
  const specialCharacters = specialCharacterData.value;

  // 主要角色包括：动态获取的用户名、白、澪以及队伍中的特殊角色
  const mainCharacterNames = [appState.userName.value, '白', '澪'];

  const result: Character[] = [];

  // 添加主要角色（user、白、澪）
  Object.entries(allCharacters)
    .filter(([name]) => mainCharacterNames.includes(name))
    .forEach(([name, data]) => {
      result.push({
        name,
        ...data,
        visible: data.visible !== false, // 默认可见，除非显式设为false
      });
    });

  // 添加已入队的特殊角色（根据角色数据中的 inTeam 字段判断）
  Object.entries(specialCharacters).forEach(([name, data]) => {
    if (data.inTeam === true) {
      result.push({
        name,
        ...data,
        visible: true,
      });
    }
  });

  // 排序：user首位，然后是白、澪，其他角色按名称排序
  return result
    .filter(char => char.visible && char.name) // 确保角色可见且有名称
    .sort((a, b) => {
      // 提供默认值，避免undefined
      const nameA = a.name || '';
      const nameB = b.name || '';

      const order = [appState.userName.value, '白', '澪'];
      const aIndex = order.indexOf(nameA);
      const bIndex = order.indexOf(nameB);

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return nameA.localeCompare(nameB);
    });
});
</script>

<template>
  <div class="main-characters-container">
    <CharacterCard v-for="character in visibleCharacters" :key="character.name" :character="character" />
  </div>
</template>

<style lang="scss" scoped>
.main-characters-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 100%;
}
</style>
