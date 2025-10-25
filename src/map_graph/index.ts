import { createApp } from 'vue';
import MapContainer from './components/MapContainer.vue';
import { MapParser } from './core/map-parser';

/**
 * 地图图形系统管理器
 */
class MapGraphManager {
  private static instance: MapGraphManager | null = null;
  private readonly activeApps = new Map<string, any>();

  private constructor() {
    this.setupEventListeners();
  }

  public static getInstance(): MapGraphManager {
    this.instance ??= new MapGraphManager();
    return this.instance;
  }

  /**
   * 渲染单条消息中的地图
   */
  public renderMessage = async (messageId: string | number) => {
    try {
      const messages = getChatMessages(parseInt(messageId.toString(), 10));
      if (!messages?.length || !messages[0]?.message) return;

      const message = messages[0].message;

      // 使用地图解析器提取地图文本
      const mapText = MapParser.extractMapFromText(message);
      if (!mapText) return;

      const $mesText = this.findMessageElement(messageId.toString());
      if (!$mesText?.length) return;

      // 清理现有地图
      this.cleanupMessage(messageId.toString());

      // 创建新的地图组件
      this.createMapContainer($mesText, mapText, messageId.toString());
    } catch (error) {
      console.error(`[MapGraph] 渲染消息 ${messageId} 失败:`, error);
    }
  };

  /**
   * 查找消息元素
   */
  private findMessageElement(messageId: string): JQuery<HTMLElement> {
    const selectors = [`.mes[mesid="${messageId}"] .mes_text`, `.mes[mesid="${messageId}"]`];

    for (const selector of selectors) {
      const $element = $(selector, window.parent.document);
      if ($element.length > 0) {
        const $mesText = $element.find('.mes_text');
        return $mesText.length > 0 ? $mesText : $element;
      }
    }

    return $();
  }

  /**
   * 创建地图组件
   */
  private createMapContainer($container: JQuery<HTMLElement>, mapText: string, messageId: string): void {
    try {
      // 使用解析器验证地图数据
      const mapData = MapParser.parseMapData(mapText);
      if (!mapData || mapData.nodes.length === 0) {
        console.warn(`[MapGraph] 地图数据为空或无效: ${messageId}`);
        return;
      }

      // 创建挂载点
      const mountId = `map-mount-${messageId}`;
      const $mountPoint = $(`<div id="${mountId}"></div>`);
      $container.append($mountPoint);

      // 创建Vue应用，传入解析后的地图文本
      const app = createApp(MapContainer, {
        mapText: mapText,
      });

      // 挂载应用
      app.mount($mountPoint[0]);

      // 处理样式注入到酒馆页面 <head>
      setTimeout(() => {
        this.teleportStyle();
      }, 100);

      // 存储应用实例
      this.activeApps.set(messageId, {
        app,
        mountPoint: $mountPoint,
        mapData,
      });
    } catch (error) {
      console.error(`[MapGraph] 创建地图组件失败:`, error);
    }
  }

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

    console.log('[MapGraph] 样式已注入到酒馆页面 <head>');
  }

  /**
   * 从酒馆页面移除样式
   */
  private deteleportStyle(): void {
    $(`head > div[script_id="${getScriptId()}"]`, window.parent.document).remove();
  }

  /**
   * 清理消息中的地图组件
   */
  private cleanupMessage(messageId: string): void {
    const appData = this.activeApps.get(messageId);
    if (appData) {
      try {
        appData.app.unmount();
        appData.mountPoint.remove();
        this.activeApps.delete(messageId);
      } catch (error) {
        console.error(`[MapGraph] 清理组件失败:`, error);
      }
    }
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 监听消息渲染事件
    const handleMessageEvent = _.debounce(async (messageId: number) => {
      await this.renderMessage(messageId);
    }, 500);

    eventOn(tavern_events.MESSAGE_RECEIVED, handleMessageEvent);
    eventOn(tavern_events.MESSAGE_UPDATED, handleMessageEvent);
    eventOn(tavern_events.MESSAGE_SWIPED, handleMessageEvent);
    eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, handleMessageEvent);
  }

  /**
   * 清理所有地图组件
   */
  public cleanup(): void {
    this.activeApps.forEach((_appData, messageId) => {
      this.cleanupMessage(messageId);
    });
    this.activeApps.clear();
    this.deteleportStyle();
  }

  /**
   * 获取活跃的地图统计
   */
  public getStats() {
    return {
      activeApps: this.activeApps.size,
      mapData: Array.from(this.activeApps.values()).map(app => ({
        nodeCount: app.mapData?.nodes?.length || 0,
        edgeCount: app.mapData?.edges?.length || 0,
        movement: app.mapData?.free_movement,
      })),
    };
  }
}

// 全局管理器实例
let mapManager: MapGraphManager;

// 初始化
$(() => {
  mapManager = MapGraphManager.getInstance();

  // 监听应用就绪事件
  eventOn(tavern_events.APP_READY, () => {
    setTimeout(() => {
      mapManager.renderMessage(getLastMessageId());
    }, 1000);
  });

  console.log('[MapGraph] 地图图形系统已初始化');
});

// 页面卸载时清理
$(window).on('pagehide', () => {
  if (mapManager) {
    mapManager.cleanup();
  }
});

// 导出供外部使用
export { MapGraphManager };
