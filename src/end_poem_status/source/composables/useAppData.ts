import { computed, onMounted, onUnmounted } from 'vue';
import { appState } from '../stores/app-state';
import { CharacterUtils } from '../utils/character-utils';

/**
 * 应用数据组合式API
 * 提供全局数据访问和管理功能
 */
export function useAppData() {
  // 初始化应用状态
  const initializeApp = async () => {
    await appState.initialize();
  };

  // 更新数据
  const updateData = () => {
    appState.updateData();
  };

  // 响应式数据
  const worldData = computed(() => appState.worldData.value);
  const charactersData = computed(() => appState.charactersData.value);
  const specialCharacterData = computed(() => appState.specialCharacterData.value);
  const sideCharactersData = computed(() => appState.sideCharactersData.value);
  const isInitialized = computed(() => appState.isInitialized.value);
  const errorCount = computed(() => appState.errorCount.value);

  // 计算属性
  const userName = computed(() => appState.userName.value);
  const hasAnomalies = computed(() => appState.hasAnomalies.value);
  const anomalyCount = computed(() => appState.anomalyCount.value);
  const hasSideCharacters = computed(() => appState.hasSideCharacters.value);

  // 工具方法
  const getCharacter = (name: string) => appState.getCharacter(name);
  const getSpecialCharacter = (name: string) => appState.getSpecialCharacter(name);
  const isSpecialCharacterInTeam = (name: string) => appState.isSpecialCharacterInTeam(name);

  // 角色工具方法
  const getCharacterPrefix = CharacterUtils.getCharacterPrefix;
  const getCharacterTheme = CharacterUtils.getCharacterTheme;
  const getRoleClassName = CharacterUtils.getRoleClassName;
  const getSpecialRoleClassName = CharacterUtils.getSpecialRoleClassName;
  const getProgressText = CharacterUtils.getProgressText;
  const getProgressWidth = CharacterUtils.getProgressWidth;

  // 清理
  const cleanup = () => {
    appState.cleanup();
  };

  // 生命周期
  onMounted(() => {
    initializeApp();
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    // 数据
    worldData,
    charactersData,
    specialCharacterData,
    sideCharactersData,
    isInitialized,
    errorCount,

    // 计算属性
    userName,
    hasAnomalies,
    anomalyCount,
    hasSideCharacters,

    // 方法
    initializeApp,
    updateData,
    getCharacter,
    getSpecialCharacter,
    isSpecialCharacterInTeam,

    // 工具方法
    getCharacterPrefix,
    getCharacterTheme,
    getRoleClassName,
    getSpecialRoleClassName,
    getProgressText,
    getProgressWidth,

    // 清理
    cleanup,
  };
}
