import { CHARACTER_PREFIXES, CHARACTER_THEMES, ROLE_CLASS_NAMES } from './constants';

/**
 * 角色管理工具函数
 */
export class CharacterUtils {
  /**
   * 获取角色前缀
   */
  static getCharacterPrefix(characterKey: string): string {
    if (characterKey !== '澪' && characterKey !== '白') {
      return 'user';
    }
    return CHARACTER_PREFIXES[characterKey] || characterKey.toLowerCase();
  }

  /**
   * 获取角色主题类名
   */
  static getCharacterTheme(characterKey: string): string {
    return CHARACTER_THEMES[characterKey] || '';
  }

  /**
   * 获取角色标签类名
   */
  static getRoleClassName(characterKey: string): string {
    if (characterKey !== '澪' && characterKey !== '白') {
      return ROLE_CLASS_NAMES.default;
    }
    return ROLE_CLASS_NAMES[characterKey] || ROLE_CLASS_NAMES.default;
  }

  /**
   * 检查是否为特殊角色
   */
  static isSpecialCharacter(characterKey: string): boolean {
    return ['Lily', '布施翠', '蛭子小比奈'].includes(characterKey);
  }

  /**
   * 获取特殊角色的角色标签类名
   */
  static getSpecialRoleClassName(characterKey: string): string {
    const classMap: Record<string, string> = {
      Lily: 'role-tag holy',
      布施翠: 'role-tag cursed',
      蛭子小比奈: 'role-tag warrior',
    };
    return classMap[characterKey] || 'role-tag';
  }

  /**
   * 获取进度条百分比文本
   */
  static getProgressText(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
  }

  /**
   * 获取进度条宽度样式
   */
  static getProgressWidth(value: number): string {
    return `${Math.round(value * 100)}%`;
  }
}
