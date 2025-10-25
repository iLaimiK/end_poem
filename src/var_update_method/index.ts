/**
 * MVU 更新方式切换脚本
 *
 * 功能：根据 MVU 设置中的更新方式，动态切换世界书条目的启用状态
 */

/** MVU 更新方式枚举 */
const UpdateMethodSchema = z.enum(['额外模型解析', '随AI输出']);
type UpdateMethod = z.infer<typeof UpdateMethodSchema>;

/** 配置 Schema */
const UpdateMethodConfigSchema = z.object({
  /** 世界书名称 */
  worldbookName: z.string(),
  /** 额外模型解析时启用的条目名称列表 */
  extraModelParseEntries: z.array(z.string()),
  /** 随AI输出时启用的条目名称 */
  aiOutputEntry: z.string(),
});
type UpdateMethodConfig = z.infer<typeof UpdateMethodConfigSchema>;

/** MVU 设置 Schema */
const MvuSettingsSchema = z.object({
  更新方式: UpdateMethodSchema.optional(),
});

// 配置
const updateMethodConfig = UpdateMethodConfigSchema.parse({
  worldbookName: '终焉之诗',
  extraModelParseEntries: ['[mvu_update]output_format', '[mvu_plot]output_format'],
  aiOutputEntry: 'output_format',
});

// 工具函数

/**
 * 获取当前 MVU 更新方式
 */
function getMvuUpdateMethod(): UpdateMethod | undefined {
  try {
    const rawMvuSettings = _.get(SillyTavern.extensionSettings, 'mvu_settings', {});
    const parseResult = MvuSettingsSchema.safeParse(rawMvuSettings);

    if (!parseResult.success) {
      console.log('[MVU 更新方式切换] MVU 设置格式错误:', z.prettifyError(parseResult.error));
      return undefined;
    }

    return parseResult.data.更新方式;
  } catch (error) {
    console.log('[MVU 更新方式切换] 获取 MVU 更新方式失败', error);
    return undefined;
  }
}

/**
 * 根据更新方式切换世界书条目开关
 */
async function switchWorldbookEntriesByUpdateMethod(): Promise<void> {
  try {
    // 获取当前更新方式
    const updateMethod = getMvuUpdateMethod();

    if (!updateMethod) {
      console.log('[MVU 更新方式切换] 未找到 MVU 更新方式设置，跳过处理');
      return;
    }

    console.log(`[MVU 更新方式切换] 当前 MVU 更新方式: ${updateMethod}`);

    // 获取世界书
    const worldbook = await getWorldbook(updateMethodConfig.worldbookName);

    if (!worldbook || worldbook.length === 0) {
      console.log(`[MVU 更新方式切换] 世界书 "${updateMethodConfig.worldbookName}" 不存在或为空`);
      toastr.warning(`世界书 "${updateMethodConfig.worldbookName}" 不存在`);
      return;
    }

    // 根据更新方式确定启用/禁用的条目
    let entriesToEnable: string[];
    let entriesToDisable: string[];

    // 使用 switch 替代 if-else，更符合类型安全
    switch (updateMethod) {
      case '额外模型解析':
        entriesToEnable = updateMethodConfig.extraModelParseEntries;
        entriesToDisable = [updateMethodConfig.aiOutputEntry];
        break;
      case '随AI输出':
        entriesToEnable = [updateMethodConfig.aiOutputEntry];
        entriesToDisable = updateMethodConfig.extraModelParseEntries;
        break;
      default: // @ts-expect-error TypeScript 会确保这里不可达（因为 updateMethod 只能是两个值之一）
      {
        const _exhaustiveCheck: never = updateMethod;
        return;
      }
    }

    console.log('[MVU 更新方式切换] 准备更新条目状态', {
      entriesToEnable,
      entriesToDisable,
    });

    // 更新世界书条目
    const updatedWorldbook = worldbook.map(entry => {
      if (entriesToEnable.includes(entry.name)) {
        console.log(`[MVU 更新方式切换] 启用条目: ${entry.name}`);
        return { ...entry, enabled: true };
      } else if (entriesToDisable.includes(entry.name)) {
        console.log(`[MVU 更新方式切换] 禁用条目: ${entry.name}`);
        return { ...entry, enabled: false };
      }
      return entry;
    });

    // 应用更新
    await replaceWorldbook(updateMethodConfig.worldbookName, updatedWorldbook, { render: 'immediate' });

    console.log('[MVU 更新方式切换] 世界书条目状态更新完成');
    toastr.success(`已根据 MVU 更新方式 "${updateMethod}" 切换世界书条目`);
  } catch (error) {
    console.log('[MVU 更新方式切换] 切换世界书条目时发生错误', error);
    toastr.error('切换世界书条目失败');
  }
}

/**
 * 监听 MVU 设置变化
 * 使用 0.5秒 固定间隔轮询
 */
function watchMvuSettingsChange(): void {
  let lastUpdateMethod = getMvuUpdateMethod();

  // 每 0.5秒 检查一次设置变化
  setInterval(async () => {
    const currentUpdateMethod = getMvuUpdateMethod();

    if (currentUpdateMethod && currentUpdateMethod !== lastUpdateMethod) {
      console.log(`[MVU 更新方式切换] 检测到 MVU 更新方式变化: ${lastUpdateMethod} -> ${currentUpdateMethod}`);
      lastUpdateMethod = currentUpdateMethod;

      // 切换世界书条目
      await switchWorldbookEntriesByUpdateMethod();
    }
  }, 500);

  console.log('[MVU 更新方式切换] 已启动轮询监听');
}

// ==================== 主入口点 ====================

/**
 * 脚本主入口
 */
$(() => {
  console.log('[MVU 更新方式切换] MVU 更新方式切换脚本启动中...');

  // 初始化时执行一次切换
  switchWorldbookEntriesByUpdateMethod()
    .then(() => {
      console.log('[MVU 更新方式切换] 初始化世界书条目切换完成');

      // 启动监听
      watchMvuSettingsChange();
      console.log('[MVU 更新方式切换] 已开始监听 MVU 设置变化');
    })
    .catch(error => {
      console.log('[MVU 更新方式切换] 初始化失败', error);
      toastr.error('MVU 更新方式切换脚本启动失败');
    });
});

// ==================== 卸载时清理 ====================

/**
 * 页面卸载时的清理工作
 */
$(window).on('pagehide', () => {
  console.log('[MVU 更新方式切换] MVU 更新方式切换脚本已卸载');
});
