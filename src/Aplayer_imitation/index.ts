import { createPinia } from 'pinia';
import { createApp } from 'vue';
import MusicPlayer from './components/MusicPlayer.vue';
import { DEFAULT_AUDIOS } from './data/default-audios';
import { usePlayerStore } from './stores/player';
import { getDefaultSettings, validateSettings } from './utils/settings';

/**
 * APlayer 管理器 - 单例模式
 * 负责播放器的完整生命周期管理
 */
class APlayerManager {
  private static instance: APlayerManager | null = null;
  private playerApp: any = null;
  private container: JQuery<HTMLElement> | null = null;
  private piniaInstance: any = null;

  private constructor() {
    this.bindGlobalEvents();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): APlayerManager {
    this.instance ??= new APlayerManager();
    return this.instance;
  }

  /**
   * 创建播放器 - 防止重复创建
   */
  public createPlayer = _.once((_audios = DEFAULT_AUDIOS) => {
    try {
      this.cleanup(); // 先清理旧实例
      this.initializeContainer();
      this.createVueApplication();
      this.handleStyleInjection();
      this.applyUserSettings();
      console.log('[APlayer] 播放器创建成功');
    } catch (error) {
      this.handleError('创建播放器', error);
    }
  });

  /**
   * 销毁播放器
   */
  public destroyPlayer(): void {
    this.cleanup();
    this.resetInstance();
    console.log('[APlayer] 播放器已销毁');
  }

  /**
   * 初始化容器元素
   */
  private initializeContainer(): void {
    if (!$('#aplayer-container').length) {
      this.container = $('<div>').attr('id', 'aplayer-container');
      $('body').append(this.container);
    } else {
      this.container = $('#aplayer-container');
    }
  }

  /**
   * 创建 Vue 应用实例
   */
  private createVueApplication(): void {
    this.piniaInstance = createPinia();
    this.playerApp = createApp(MusicPlayer);
    this.playerApp.use(this.piniaInstance);
    this.playerApp.mount(this.container![0]);
  }

  /**
   * 处理样式注入 - 注入到酒馆页面 <head>
   */
  private readonly handleStyleInjection = _.debounce(() => {
    this.teleportStyle();
  }, 150);

  /**
   * 将样式传送到酒馆页面的 <head> 中
   */
  private teleportStyle(): void {
    // 避免重复注入
    if ($(`head > div[script_id="${getScriptId()}"]`, window.parent.document).length) {
      return;
    }

    $(`<div>`)
      .attr('script_id', getScriptId())
      .append($(`head > style`, document).clone())
      .appendTo($('head', window.parent.document));

    console.log('[APlayer] 样式已注入到酒馆页面 <head>');
  }

  /**
   * 从酒馆页面移除样式
   */
  private deteleportStyle(): void {
    $(`head > div[script_id="${getScriptId()}"]`, window.parent.document).remove();
  }

  /**
   * 应用用户设置
   */
  private applyUserSettings(): void {
    try {
      const savedSettings = getVariables({
        type: 'script',
        script_id: getScriptId(),
      });
      const settings = APlayerUtils.processSettings(savedSettings);
      this.applySettingsToStore(settings);
      console.log('[APlayer] 已加载播放器设置:', settings);
    } catch (error) {
      console.warn('[APlayer] 加载播放器设置失败，使用默认设置:', error);
      this.useDefaultSettings();
    }
  }

  /**
   * 将设置应用到 Pinia store
   */
  private applySettingsToStore(settings: any): void {
    if (!this.piniaInstance) {
      this.handleError('应用设置', 'Pinia 实例未初始化');
      return;
    }

    const store = usePlayerStore(this.piniaInstance);
    if (store?.initFromSettings) {
      store.initFromSettings(settings);
    } else {
      this.handleError('应用设置', 'Store 或 initFromSettings 方法不存在');
    }
  }

  /**
   * 使用默认设置
   */
  private useDefaultSettings(): void {
    const defaultSettings = getDefaultSettings();
    APlayerUtils.saveSettings(defaultSettings);
  }

  /**
   * 清理播放器资源
   */
  private cleanup(): void {
    if (this.playerApp) {
      this.playerApp.unmount();
      this.playerApp = null;
    }

    if (this.container) {
      this.container.remove();
      this.container = null;
    }

    this.piniaInstance = null;
    this.deteleportStyle();
    $(document).off('click.aplayerVue');
  }

  /**
   * 重置单例实例
   */
  private resetInstance(): void {
    APlayerManager.instance = null;
  }

  /**
   * 绑定全局事件
   */
  private bindGlobalEvents(): void {
    $(document).on('click.aplayerVue', this.handleOutsideClick);
    $(window).on('pagehide', () => this.destroyPlayer());
  }

  /**
   * 处理点击外部关闭播放列表
   */
  private readonly handleOutsideClick = (e: JQuery.ClickEvent) => {
    const target = $(e.target);
    if (!target.closest('#aplayer-container .aplayer-menu, #aplayer-container .aplayer-list').length) {
      this.closePlaylistIfOpen();
    }
  };

  /**
   * 关闭播放列表（如果打开的话）
   */
  private closePlaylistIfOpen(): void {
    if (this.playerApp?._instance && this.piniaInstance) {
      try {
        const storeMap = this.piniaInstance._s;
        const store = storeMap?.get('player');
        if (store && !store.listFolded) {
          store.toggleList();
          return;
        }
      } catch (error) {
        console.warn('[APlayer] 通过 store 关闭播放列表失败，使用 DOM 操作:', error);
      }
    }

    // 备用方案：直接操作 DOM
    const listElement = $('#aplayer-container .aplayer-list');
    if (listElement.hasClass('aplayer-list-show')) {
      listElement.removeClass('aplayer-list-show');
    }
  }

  /**
   * 错误处理 - 节流优化
   */
  private readonly handleError = _.throttle((context: string, error: any) => {
    const errorMessage = `[APlayer ${context}]: ${error?.message || error}`;
    console.error(errorMessage);
  }, 2000);
}

/**
 * 工具函数集合
 */
const APlayerUtils = {
  /**
   * 防抖设置保存
   */
  saveSettings: _.debounce((settings: any) => {
    replaceVariables(settings, {
      type: 'script',
      script_id: getScriptId(),
    });
  }, 500),

  /**
   * 设置处理流水线
   */
  processSettings: _.flow([
    (rawSettings: any) => validateSettings(rawSettings),
    (validSettings: any) => {
      APlayerUtils.saveSettings(validSettings);
      return validSettings;
    },
  ]),

  /**
   * 节流错误日志
   */
  logError: _.throttle((message: string, error?: any) => {
    console.error(`[APlayer] ${message}:`, error);
  }, 1000),
};

// 全局管理器实例
let playerManager: APlayerManager;

/**
 * 创建音乐播放器 - 公共接口
 */
const createMusicPlayer = (audios = DEFAULT_AUDIOS) => {
  playerManager = APlayerManager.getInstance();
  playerManager.createPlayer(audios);
};

/**
 * 销毁音乐播放器 - 公共接口
 */
const destroyMusicPlayer = () => {
  if (playerManager) {
    playerManager.destroyPlayer();
  }
};

/**
 * 防抖创建播放器 - 优化防抖逻辑
 */
const debouncedCreatePlayer = _.debounce(
  () => {
    createMusicPlayer();
  },
  1000,
  {
    leading: false,
    trailing: true,
    maxWait: 2000, // 最大等待时间
  },
);

// 初始化
$(() => {
  // 监听酒馆应用就绪事件
  eventOn(tavern_events.APP_READY, debouncedCreatePlayer);
});

// 导出供外部使用
export { createMusicPlayer, destroyMusicPlayer };
