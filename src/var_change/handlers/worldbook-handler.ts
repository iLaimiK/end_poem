// 注入提示词的ID，用于管理和移除
const WORLDBOOK_SCAN_PROMPT_ID = 'var-change-worldbook-scan';

/**
 * 处理世界书扫描文本设置
 * @param stat_data - stat_data对象
 */
export function updateWorldbookScanText(stat_data: Record<string, any>): void {
  const scanTexts: string[] = [];

  // 添加当前位置作为扫描文本
  const currentLocation = _.get(stat_data, '全局信息.当前位置', '');
  if (currentLocation && typeof currentLocation === 'string') {
    scanTexts.push(currentLocation.trim());
  }

  // 添加所有次要角色名称作为扫描文本
  const secondaryCharacters = _.get(stat_data, '次要角色', {});
  if (_.isObject(secondaryCharacters) && !Array.isArray(secondaryCharacters)) {
    for (const characterName of Object.keys(secondaryCharacters)) {
      if (characterName && typeof characterName === 'string') {
        // 添加角色名
        scanTexts.push(characterName.trim());
      }
    }
  }

  // 去重并过滤空文本
  const uniqueScanTexts = [...new Set(scanTexts)].filter(text => text.length > 0);

  if (uniqueScanTexts.length > 0) {
    // 先移除之前的注入提示词
    uninjectPrompts([WORLDBOOK_SCAN_PROMPT_ID]);

    // 创建扫描文本内容
    const scanTextString = uniqueScanTexts.join(', ');

    // 使用 injectPrompts 注入世界书扫描文本
    try {
      injectPrompts([
        {
          id: WORLDBOOK_SCAN_PROMPT_ID,
          position: 'none', // 不发给AI，只用来激活世界书
          depth: 0,
          role: 'system',
          content: scanTextString,
          should_scan: true, // 作为欲扫描文本，加入世界书扫描
        },
      ]);

      console.log(`[世界书扫描] 注入扫描文本: ${scanTextString}`);
    } catch (error) {
      console.warn(`[世界书扫描] 注入扫描文本失败:`, error instanceof Error ? error.message : String(error));
    }
  } else {
    // 如果没有扫描文本，移除之前的注入
    uninjectPrompts([WORLDBOOK_SCAN_PROMPT_ID]);
  }
}
