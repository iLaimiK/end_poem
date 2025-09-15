import _ from 'lodash';
import type {
  CharacterData,
  SideCharacterData,
  SpecialCharacterData,
  StatData,
  TavernVariables,
  WorldData,
} from '../types/data';

/**
 * 数据服务层 - 负责与酒馆变量系统交互
 */
export class DataService {
  private static instance: DataService;
  private cachedData: StatData | null = null;
  private lastUpdateTime: number = 0;
  private readonly CACHE_DURATION = 1000; // 1秒缓存

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  /**
   * 获取当前消息ID
   */
  private getCurrentMessageId(): string {
    try {
      // @ts-expect-error - 酒馆助手的函数
      return getCurrentMessageId();
    } catch (error) {
      console.warn('Failed to get current message ID:', error);
      return '';
    }
  }

  /**
   * 获取酒馆变量
   */
  private getVariables(params: TavernVariables): any {
    try {
      // @ts-expect-error - 酒馆助手提供的函数
      return getVariables(params);
    } catch (error) {
      console.warn('Failed to get variables:', error);
      return null;
    }
  }

  /**
   * 获取原始统计数据
   */
  private getRawStatData(): StatData | null {
    try {
      const variables = this.getVariables({
        type: 'message',
        message_id: this.getCurrentMessageId(),
      });

      return _.get(variables, 'stat_data', null);
    } catch (error) {
      console.warn('Failed to get raw stat data:', error);
      return null;
    }
  }

  /**
   * 获取完整的统计数据（带缓存）
   */
  getStatData(): StatData | null {
    const now = Date.now();

    // 检查缓存
    if (this.cachedData && now - this.lastUpdateTime < this.CACHE_DURATION) {
      return this.cachedData;
    }

    // 获取新数据
    const rawData = this.getRawStatData();
    if (rawData) {
      this.cachedData = rawData;
      this.lastUpdateTime = now;
    }

    return this.cachedData;
  }

  /**
   * 获取世界数据
   */
  getWorldData(): WorldData {
    const statData = this.getStatData();
    return {
      全局信息: _.get(statData, '全局信息', {
        日期: '',
        时间: '',
        当前位置: '',
        天气: '',
        异常: {},
      }),
      plot_record: _.get(statData, 'plot_record', {
        剧情进度: 'v1',
        剧情节点记录: [],
      }),
    };
  }

  /**
   * 获取主要角色数据
   */
  getCharactersData(): CharacterData {
    const statData = this.getStatData();
    const rawData = _.get(statData, '主要角色', {});
    return DataProcessor.transformCharacterObject(rawData);
  }

  /**
   * 获取特殊角色数据
   */
  getSpecialCharacterData(): SpecialCharacterData {
    const statData = this.getStatData();
    const rawData = _.get(statData, '特殊角色', {});
    const pureCharacterData = _.omit(rawData, '已加入队伍') as SpecialCharacterData;
    return DataProcessor.transformCharacterObject(pureCharacterData);
  }

  /**
   * 获取已入队的特殊角色状态
   */
  getJoinedTeamData(): Record<string, 0 | 1> {
    const statData = this.getStatData();
    return _.get(statData, '特殊角色.已加入队伍', {});
  }

  /**
   * 获取次要角色数据
   */
  getSideCharacterData(): SideCharacterData {
    const statData = this.getStatData();
    const rawData = _.get(statData, '次要角色', {});
    return DataProcessor.transformSideCharacterObject(rawData);
  }

  /**
   * 获取用户名称（排除白和澪的角色名）
   */
  getUserName(charactersData?: CharacterData): string {
    const data = charactersData || this.getCharactersData();
    const keys = Object.keys(data);
    const userName = keys.find(key => key !== '白' && key !== '澪');
    return userName || 'user';
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cachedData = null;
    this.lastUpdateTime = 0;
  }

  /**
   * 检查数据是否可用
   */
  isDataAvailable(): boolean {
    return this.getStatData() !== null;
  }
}

/**
 * 数据处理工具函数
 */
export class DataProcessor {
  /**
   * 处理神秘内容（白角色特殊处理）
   */
  static processMysteriousContent(content: any): any {
    // 递归处理的核心
    if (_.isString(content)) {
      return content.includes('神') ? '？？？' : content;
    }
    if (_.isArray(content)) {
      return content.map(item => DataProcessor.processMysteriousContent(item));
    }
    if (_.isObject(content)) {
      return _.mapValues(content, value => DataProcessor.processMysteriousContent(value));
    }
    return content;
  }

  /**
   * 处理白角色数据
   */
  static processShiroData<T extends Record<string, any>>(data: T): T {
    // 直接对整个对象应用递归处理
    return DataProcessor.processMysteriousContent(data);
  }

  /**
   * 安全获取嵌套属性
   */
  static readonly safeGet = _.curry((path: string, defaultValue: any, obj: any) => {
    return _.get(obj, path, defaultValue);
  });

  /**
   * 验证数据完整性
   */
  static validateData(data: any, requiredFields: string[]): boolean {
    if (!data || !_.isObject(data)) {
      return false;
    }

    return _.every(requiredFields, field => _.has(data, field));
  }

  /**
   * 转义HTML字符
   */
  static escapeHtml(text: string): string {
    return _.escape(text);
  }

  /**
   * 将包含中文键的角色数据对象转换为符合Character接口的英文键对象
   */
  static transformCharacterObject(data: Record<string, any>): any {
    return _.mapValues(data, (char: Record<string, any>, key: string) => {
      if (!_.isObject(char)) return char;

      let newChar: any = {
        roles: char.身份,
        status: char.当前状态,
        theme: char.theme,
        focus: char.关注度,
        affection: char.好感度,
        healingProgress: char.治愈进度,
        factor: char.因子,
        dependency: char.依赖度,
        recognition: char.认可度,
        memeCorruption: char.模因侵蚀率,
        corruption: char.污秽侵蚀度,
        task: char.当前任务,
        items: char.持有物品,
        abilities: char.能力,
        appearance: char.外观,
        posture: char.姿态动作,
        souls: char.可用灵魂,
        visible: char.visible,
      };

      // 如果是“白”，则应用特殊处理
      if (key === '白') {
        newChar = DataProcessor.processShiroData(newChar);
      }

      // 移除所有值为 undefined 的键，确保对象干净
      return _.omitBy(newChar, _.isUndefined);
    });
  }

  /**
   * 将包含中文键的次要角色数据对象转换为符合SideCharacter接口的英文键对象
   */
  static transformSideCharacterObject(data: Record<string, any>): any {
    const cleanedData = DataProcessor.stripMeta(data); // 先移除 $meta
    return _.mapValues(cleanedData, (char: Record<string, any>) => {
      if (!_.isObject(char)) return char;

      const newChar: any = {
        identity: char.身份,
        trustLevel: char.信任值,
        appearance: char.外观,
        posture: char.姿态动作,
        items: char.持有物品,
        abilities: char.能力,
      };

      return _.omitBy(newChar, _.isUndefined);
    });
  }

  /**
   * 递归地移除对象中的 $meta 字段
   */
  static stripMeta(data: any): any {
    if (_.isArray(data)) {
      return data.map(item => DataProcessor.stripMeta(item));
    }
    if (_.isObject(data)) {
      const cleanedData = _.omit(data, ['$meta', '$__META_EXTENSIBLE__$']);
      return _.mapValues(cleanedData, value => DataProcessor.stripMeta(value));
    }
    return data;
  }
}
