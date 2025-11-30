import _ from 'lodash';
import { computed, ref } from 'vue';
import { DataService } from '../services/data-service';
import type { Character } from '../types/character';
import type { CharacterData, SideCharacterData, SpecialCharacterData, WorldData } from '../types/data';

/**
 * 应用状态管理
 */
export class AppStateManager {
  private static instance: AppStateManager;
  private readonly dataService: DataService;

  // 响应式状态
  public worldData = ref<WorldData>({
    全局信息: {
      日期: '',
      时间: '',
      当前位置: '',
      天气: '',
      异常: {},
    },
    plot_record: {
      剧情进度: 'v1',
      剧情节点记录: [],
    },
  });

  public charactersData = ref<CharacterData>({});
  public specialCharacterData = ref<SpecialCharacterData>({});
  public joinedTeamData = ref<Record<string, boolean>>({});
  public sideCharactersData = ref<SideCharacterData>({});
  public isInitialized = ref(false);
  public errorCount = ref(0);

  // 计算属性
  public userName = computed(() => {
    const keys = Object.keys(this.charactersData.value);
    return keys.find(key => key !== '白' && key !== '澪') || 'user';
  });

  public hasAnomalies = computed(() => {
    const anomalies = this.worldData.value.全局信息.异常;
    return !_.isEmpty(anomalies);
  });

  public anomalyCount = computed(() => {
    const anomalies = this.worldData.value.全局信息.异常;
    return Object.keys(anomalies).length;
  });

  public hasSideCharacters = computed(() => {
    return !_.isEmpty(this.sideCharactersData.value);
  });

  private constructor() {
    this.dataService = DataService.getInstance();
  }

  static getInstance(): AppStateManager {
    if (!AppStateManager.instance) {
      AppStateManager.instance = new AppStateManager();
    }
    return AppStateManager.instance;
  }

  /**
   * 初始化应用状态
   */
  async initialize(): Promise<boolean> {
    try {
      if (!this.dataService.isDataAvailable()) {
        console.warn('Data not available, using fallback data');
        this.setFallbackData();
        return false;
      }

      this.loadData();
      this.isInitialized.value = true;
      this.errorCount.value = 0;

      return true;
    } catch (error) {
      console.error('Failed to initialize app state:', error);
      this.errorCount.value++;
      this.setFallbackData();
      return false;
    }
  }

  /**
   * 加载数据
   */
  private loadData(): void {
    this.worldData.value = this.dataService.getWorldData();
    this.charactersData.value = this.dataService.getCharactersData();
    this.specialCharacterData.value = this.dataService.getSpecialCharacterData();
    this.joinedTeamData.value = this.dataService.getJoinedTeamData();
    this.sideCharactersData.value = this.dataService.getSideCharacterData();
  }

  /**
   * 设置回退数据
   */
  private setFallbackData(): void {
    this.worldData.value = {
      全局信息: {
        日期: '未知',
        时间: '未知',
        当前位置: '未知区域',
        天气: '未知',
        异常: {},
      },
      plot_record: {
        剧情进度: 'v1',
        剧情节点记录: ['暂无剧情节点记录'],
      },
    };

    this.charactersData.value = {};
    this.specialCharacterData.value = {};
    this.joinedTeamData.value = {};
    this.sideCharactersData.value = {};
  }

  /**
   * 更新数据
   */
  updateData(): void {
    try {
      if (this.dataService.isDataAvailable()) {
        this.loadData();
      }
    } catch (error) {
      console.warn('Failed to update data:', error);
      this.errorCount.value++;
    }
  }

  /**
   * 获取角色数据
   */
  getCharacter(characterName: string): Character | null {
    return this.charactersData.value[characterName] || null;
  }

  /**
   * 获取特殊角色数据
   */
  getSpecialCharacter(characterName: string): Character | null {
    return this.specialCharacterData.value[characterName] || null;
  }

  /**
   * 检查特殊角色是否已加入队伍
   */
  isSpecialCharacterInTeam(characterName: string): boolean {
    const character = this.specialCharacterData.value[characterName];
    return character?.inTeam === true;
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.dataService.clearCache();
    this.isInitialized.value = false;
  }
}

// 全局状态管理实例
export const appState = AppStateManager.getInstance();
