import { Character, SideCharacter } from './character';

// 世界数据接口
export interface WorldData {
  全局信息: GlobalInfo;
  plot_record: PlotRecord;
}

export interface GlobalInfo {
  日期: string;
  时间: string;
  当前位置: string;
  天气: string;
  异常: Record<string, string>;
}

export interface PlotRecord {
  剧情进度: string;
  剧情节点记录: string[];
}

// 角色数据集合接口
export interface CharacterData {
  [characterName: string]: Character;
}

export interface SideCharacterData {
  [sideCharacterName: string]: SideCharacter;
}

export interface SpecialCharacterData {
  [specialCharacterName: string]: Character;
}

// 完整的统计数据接口
export interface StatData {
  全局信息: GlobalInfo;
  plot_record: PlotRecord;
  主要角色: CharacterData;
  特殊角色: SpecialCharacterData & { 已加入队伍?: Record<string, 0 | 1> };
  次要角色: SideCharacterData;
}

// 应用状态接口
export interface AppState {
  worldData: WorldData;
  charactersData: CharacterData;
  specialCharacterData: SpecialCharacterData;
  sideCharactersData: SideCharacterData;
  isInitialized: boolean;
  errorCount: number;
}

// 酒馆变量获取函数类型
export interface TavernVariables {
  type: 'message';
  message_id: string;
}

// 渲染函数类型
export type RenderFunction<T> = (data: T) => HTMLElement[];

// 事件处理函数类型
export type EventHandler = (event: Event) => void;
