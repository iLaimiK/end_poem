import { InteractionState } from '../types';
import { CanvasRenderer } from './canvas-renderer';

/**
 * 地图交互控制器
 * 负责处理所有地图交互事件（缩放、拖拽等）
 */
export class MapInteraction {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: CanvasRenderer;
  private readonly interactionState: InteractionState;

  // 交互配置
  private readonly config = {
    minScale: 0.1,
    maxScale: 5.0,
    zoomSensitivity: 0.001,
    touchZoomSensitivity: 0.005,
    panSensitivity: 1.0,
  };

  constructor(canvas: HTMLCanvasElement, renderer: CanvasRenderer) {
    this.canvas = canvas;
    this.renderer = renderer;

    this.interactionState = {
      isDragging: false,
      lastPointerX: 0,
      lastPointerY: 0,
      lastScale: 1,
    };

    this.setupInteractions();
  }

  /**
   * 设置交互事件监听
   */
  private setupInteractions(): void {
    // 桌面端事件
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    this.canvas.addEventListener('mousedown', this.handlePointerStart.bind(this));
    this.canvas.addEventListener('mousemove', this.handlePointerMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handlePointerEnd.bind(this));
    this.canvas.addEventListener('mouseleave', this.handlePointerEnd.bind(this));

    // 移动端事件
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });

    // 阻止默认的上下文菜单
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  /**
   * 鼠标滚轮缩放
   */
  private handleWheel(event: WheelEvent): void {
    event.preventDefault();

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    this.zoomAt(mouseX, mouseY, -event.deltaY * this.config.zoomSensitivity);
  }

  /**
   * 指针开始事件（鼠标）
   */
  private handlePointerStart(event: MouseEvent): void {
    if (event.button !== 0) return; // 只处理左键

    this.startDrag(event.clientX, event.clientY);
    this.canvas.style.cursor = 'grabbing';
  }

  /**
   * 指针移动事件（鼠标）
   */
  private handlePointerMove(event: MouseEvent): void {
    if (this.interactionState.isDragging) {
      this.updateDrag(event.clientX, event.clientY);
    }
  }

  /**
   * 指针结束事件（鼠标）
   */
  private handlePointerEnd(): void {
    this.endDrag();
    this.canvas.style.cursor = 'grab';
  }

  /**
   * 触摸开始事件
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();

    if (event.touches.length === 1) {
      // 单指拖拽
      const touch = event.touches[0];
      this.startDrag(touch.clientX, touch.clientY);
    } else if (event.touches.length === 2) {
      // 双指缩放
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = this.getTouchDistance(touch1, touch2);

      this.interactionState.startPinchDistance = distance;
      this.interactionState.lastScale = this.renderer.getViewState().scale;

      // 结束拖拽状态
      this.interactionState.isDragging = false;
    }
  }

  /**
   * 触摸移动事件
   */
  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();

    if (event.touches.length === 1 && this.interactionState.isDragging) {
      // 单指拖拽
      const touch = event.touches[0];
      this.updateDrag(touch.clientX, touch.clientY);
    } else if (event.touches.length === 2 && this.interactionState.startPinchDistance) {
      // 双指缩放
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = this.getTouchDistance(touch1, touch2);

      const scaleChange =
        (currentDistance - this.interactionState.startPinchDistance!) * this.config.touchZoomSensitivity;
      const newScale = Math.max(
        this.config.minScale,
        Math.min(this.config.maxScale, this.interactionState.lastScale + scaleChange),
      );

      // 以双指中心点为缩放中心
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      const rect = this.canvas.getBoundingClientRect();

      this.zoomAt(centerX - rect.left, centerY - rect.top, newScale, false);
    }
  }

  /**
   * 触摸结束事件
   */
  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();

    if (event.touches.length === 0) {
      this.endDrag();
      this.interactionState.startPinchDistance = undefined;
    } else if (event.touches.length === 1) {
      // 从双指切换到单指，重新开始拖拽
      this.interactionState.startPinchDistance = undefined;
      const touch = event.touches[0];
      this.startDrag(touch.clientX, touch.clientY);
    }
  }

  /**
   * 开始拖拽
   */
  private startDrag(clientX: number, clientY: number): void {
    this.interactionState.isDragging = true;
    this.interactionState.lastPointerX = clientX;
    this.interactionState.lastPointerY = clientY;
  }

  /**
   * 更新拖拽
   */
  private updateDrag(clientX: number, clientY: number): void {
    if (!this.interactionState.isDragging) return;

    const deltaX = clientX - this.interactionState.lastPointerX;
    const deltaY = clientY - this.interactionState.lastPointerY;

    // 获取当前视图状态
    const viewState = this.renderer.getViewState();

    // 应用拖拽偏移（除以缩放以保持一致的拖拽速度）
    const newOffsetX = viewState.offsetX + (deltaX / viewState.scale) * this.config.panSensitivity;
    const newOffsetY = viewState.offsetY + (deltaY / viewState.scale) * this.config.panSensitivity;

    this.renderer.setViewState({
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    });

    this.interactionState.lastPointerX = clientX;
    this.interactionState.lastPointerY = clientY;
  }

  /**
   * 结束拖拽
   */
  private endDrag(): void {
    this.interactionState.isDragging = false;
  }

  /**
   * 在指定点进行缩放
   */
  private zoomAt(canvasX: number, canvasY: number, deltaScale: number, isRelative: boolean = true): void {
    const viewState = this.renderer.getViewState();
    const oldScale = viewState.scale;
    const newScale = isRelative
      ? Math.max(this.config.minScale, Math.min(this.config.maxScale, oldScale + deltaScale))
      : Math.max(this.config.minScale, Math.min(this.config.maxScale, deltaScale));

    if (newScale === oldScale) return;

    // 计算缩放中心在世界坐标系中的位置
    const rect = this.canvas.getBoundingClientRect();
    const worldX = (canvasX - rect.width / 2) / oldScale - viewState.offsetX;
    const worldY = (canvasY - rect.height / 2) / oldScale - viewState.offsetY;

    // 调整偏移以保持缩放中心不变
    const newOffsetX = (canvasX - rect.width / 2) / newScale - worldX;
    const newOffsetY = (canvasY - rect.height / 2) / newScale - worldY;

    this.renderer.setViewState({
      scale: newScale,
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    });
  }

  /**
   * 计算两个触摸点之间的距离
   */
  private getTouchDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 程序化控制方法
   */
  public zoomIn(): void {
    const viewState = this.renderer.getViewState();
    const newScale = Math.min(this.config.maxScale, viewState.scale * 1.2);
    this.renderer.setViewState({ scale: newScale });
  }

  public zoomOut(): void {
    const viewState = this.renderer.getViewState();
    const newScale = Math.max(this.config.minScale, viewState.scale / 1.2);
    this.renderer.setViewState({ scale: newScale });
  }

  public setScale(scale: number): void {
    const clampedScale = Math.max(this.config.minScale, Math.min(this.config.maxScale, scale));
    this.renderer.setViewState({ scale: clampedScale });
  }

  public resetView(mapBounds?: { minX: number; maxX: number; minY: number; maxY: number }): void {
    if (mapBounds) {
      // 重置到适合地图内容的视图
      const mapWidth = mapBounds.maxX - mapBounds.minX;
      const mapHeight = mapBounds.maxY - mapBounds.minY;
      const rect = this.canvas.getBoundingClientRect();

      if (mapWidth === 0 && mapHeight === 0) {
        this.renderer.setViewState({
          offsetX: -((mapBounds.minX + mapBounds.maxX) / 2),
          offsetY: -((mapBounds.minY + mapBounds.maxY) / 2),
          scale: 1,
        });
      } else {
        let scale = 1;
        if (rect.width > 0 && rect.height > 0) {
          const scaleX = mapWidth > 0 ? (rect.width * 0.8) / mapWidth : 1;
          const scaleY = mapHeight > 0 ? (rect.height * 0.8) / mapHeight : 1;
          scale = Math.min(scaleX, scaleY);
          scale = Math.min(Math.max(scale, this.config.minScale), this.config.maxScale);
        }

        this.renderer.setViewState({
          offsetX: -((mapBounds.minX + mapBounds.maxX) / 2),
          offsetY: -((mapBounds.minY + mapBounds.maxY) / 2),
          scale: scale,
        });
      }
    } else {
      // 简单重置
      this.renderer.setViewState({
        offsetX: 0,
        offsetY: 0,
        scale: 1,
      });
    }
  }

  /**
   * 获取当前交互状态
   */
  public getInteractionState(): InteractionState {
    return { ...this.interactionState };
  }

  /**
   * 清理交互监听器
   */
  public cleanup(): void {
    this.canvas.removeEventListener('wheel', this.handleWheel.bind(this));
    this.canvas.removeEventListener('mousedown', this.handlePointerStart.bind(this));
    this.canvas.removeEventListener('mousemove', this.handlePointerMove.bind(this));
    this.canvas.removeEventListener('mouseup', this.handlePointerEnd.bind(this));
    this.canvas.removeEventListener('mouseleave', this.handlePointerEnd.bind(this));
    this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.canvas.removeEventListener('contextmenu', e => e.preventDefault());
  }
}
