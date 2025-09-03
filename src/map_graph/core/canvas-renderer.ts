import { MapData, MapEdge, MapNode, ViewState } from '../types';

/**
 * 画布渲染器 - 简化版本
 */
export class CanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly viewState: ViewState;
  private mapData: MapData | null = null;

  // 移动端检测
  private get isMobile(): boolean { return window.innerWidth <= 768; }
  private get isSmallMobile(): boolean { return window.innerWidth <= 480; }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取Canvas上下文');
    }
    this.ctx = ctx;

    this.viewState = {
      offsetX: 0,
      offsetY: 0,
      scale: 1
    };

    this.setupCanvas();
  }

  /**
   * 设置画布 - 不强制设置固定尺寸
   */
  private setupCanvas(): void {
    // 让canvas通过CSS样式自然适应容器大小
    this.updateCanvasSize();

    // 优化画布渲染质量
    this.optimizeCanvasQuality();
  }

  /**
   * 优化画布渲染质量
   */
  private optimizeCanvasQuality(): void {
    // 启用抗锯齿和平滑效果
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    // 设置线条连接和端点样式为圆润
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  /**
   * 更新画布尺寸
   */
  private updateCanvasSize(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    // 只有当尺寸真正改变时才更新
    const newWidth = rect.width * dpr;
    const newHeight = rect.height * dpr;

    if (this.canvas.width !== newWidth || this.canvas.height !== newHeight) {
      this.canvas.width = newWidth;
      this.canvas.height = newHeight;

      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';

      this.ctx.setTransform(1, 0, 0, 1, 0, 0);

      // 重新应用画布质量优化
      this.optimizeCanvasQuality();
    }
  }

  /**
   * 设置地图数据
   */
  public setMapData(mapData: MapData): void {
    this.mapData = mapData;
    // 延迟重置视图，确保容器尺寸稳定
    setTimeout(() => {
      this.resetView();
      this.render();
    }, 50);
  }

  /**
   * 重置视图
   */
  private resetView(): void {
    if (!this.mapData || this.mapData.nodes.length === 0) return;

    // 确保Canvas尺寸是最新的
    this.updateCanvasSize();

    // 计算地图边界
    const xs = this.mapData.nodes.map(n => n.x);
    const ys = this.mapData.nodes.map(n => n.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // 计算地图内容的实际尺寸
    const mapWidth = maxX - minX;
    const mapHeight = maxY - minY;

    // 获取当前容器的实际尺寸
    const rect = this.canvas.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;


    // 如果地图内容尺寸为0，使用默认缩放
    if (mapWidth === 0 && mapHeight === 0) {
      this.viewState.offsetX = -((minX + maxX) / 2);
      this.viewState.offsetY = -((minY + maxY) / 2);
      this.viewState.scale = 1;
      return;
    }

    // 计算合适的缩放比例，预留20%边距
    let scale = 1;
    if (containerWidth > 0 && containerHeight > 0) {
      const scaleX = mapWidth > 0 ? (containerWidth * 0.8) / mapWidth : 1;
      const scaleY = mapHeight > 0 ? (containerHeight * 0.8) / mapHeight : 1;
      scale = Math.min(scaleX, scaleY);
      // 设置合理的缩放范围
      scale = Math.min(Math.max(scale, 0.2), 2);
    }


    // 居中显示
    this.viewState.offsetX = -((minX + maxX) / 2);
    this.viewState.offsetY = -((minY + maxY) / 2);
    this.viewState.scale = scale;
  }

  /**
   * 渲染地图
   */
  public render(): void {
    if (!this.mapData) return;

    // 确保画布尺寸是最新的
    this.updateCanvasSize();

    this.clearCanvas();
    this.applyTransform();

    // 绘制边
    this.drawEdges();

    // 绘制节点
    this.drawNodes();

    // 绘制标签
    this.drawLabels();
  }

  private clearCanvas(): void {
    // 保存当前变换状态
    this.ctx.save();
    // 重置到默认变换来清除整个画布
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // 恢复变换状态
    this.ctx.restore();

    // 确保清除后重新应用质量设置
    this.optimizeCanvasQuality();
  }

  private applyTransform(): void {
    const { offsetX, offsetY, scale } = this.viewState;
    const dpr = window.devicePixelRatio || 1;

    // Canvas内部尺寸（考虑DPR）
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    // 正确处理DPR的变换：使用Canvas内部尺寸计算中心点
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // 应用变换：DPR缩放 * 地图缩放
    const finalScale = scale * dpr;

    this.ctx.setTransform(
      finalScale, 0, 0, finalScale,
      centerX + finalScale * offsetX,
      centerY + finalScale * offsetY
    );

    // 重新应用画布质量优化（变换后需要重新设置）
    this.optimizeCanvasQuality();
  }

  private drawEdges(): void {
    if (!this.mapData) return;

    this.mapData.edges.forEach(edge => {
      const fromNode = this.mapData!.nodes.find(n => n.id === edge.from);
      const toNode = this.mapData!.nodes.find(n => n.id === edge.to);

      if (fromNode && toNode) {
        // 计算边缘交点，避免线条穿透节点形状
        const fromEdge = this.getNodeEdgePoint(fromNode, toNode);
        const toEdge = this.getNodeEdgePoint(toNode, fromNode);

        this.drawEdge(edge, fromEdge, toEdge);
      }
    });
  }

  /**
   * 绘制单条边，根据类型设置不同样式
   */
  private drawEdge(edge: MapEdge, from: {x: number, y: number}, to: {x: number, y: number}): void {
    // 优化线条粗细
    const baseLineWidth = this.isSmallMobile ? 0.5 : this.isMobile ? 0.6 : 1.0;

    // 确保在高DPI设备上线条保持合适粗细
    this.ctx.lineWidth = Math.max(0.3, baseLineWidth / this.viewState.scale);

    // 检查边是否连接到不可达节点（仅对普通连接有效）
    const isConnectedToUnreachable = edge.type === 'c' && this.isEdgeConnectedToUnreachableNode(edge);

    // 设置更精细的虚线样式 - 移动端适配
    const dashScale = this.isSmallMobile ? 0.6 : this.isMobile ? 0.7 : Math.max(0.8, 1 / this.viewState.scale);

    switch (edge.type) {
      case 'l': // 基础锁定 - 红色
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.setLineDash([3 * dashScale, 3 * dashScale]);
        break;

      case 'ld': // 门锁 - 金黄色
        this.ctx.strokeStyle = '#fbbf24';
        this.ctx.setLineDash([5 * dashScale, 2 * dashScale]);
        break;

      case 'lg': // 守卫 - 紫色
        this.ctx.strokeStyle = '#8b5cf6';
        this.ctx.setLineDash([6 * dashScale, 1 * dashScale, 1 * dashScale, 1 * dashScale]);
        break;

      case 'lb': // 障碍物 - 品红色
        this.ctx.strokeStyle = '#ec4899';
        this.ctx.setLineDash([2 * dashScale, 2 * dashScale]);
        break;

      case 'lh': // 隐藏入口 - 灰白色
        this.ctx.strokeStyle = '#d1d5db';
        this.ctx.setLineDash([0.8 * dashScale, 2.5 * dashScale]);
        break;

      case 'c':
      default:
        // 如果连接到不可达节点，使用灰色；否则使用蓝色
        this.ctx.strokeStyle = isConnectedToUnreachable ? '#6b7280' : '#4a9eff';
        this.ctx.setLineDash([]);
    }

    // 添加连接线发光效果
    this.ctx.save();
    const glowSize = (this.isSmallMobile ? 2 : this.isMobile ? 3 : 4) / this.viewState.scale;
    this.ctx.shadowColor = this.ctx.strokeStyle;
    this.ctx.shadowBlur = glowSize;

    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
    this.ctx.restore();

    // 重置虚线样式
    this.ctx.setLineDash([]);
  }

  /**
   * 检查边是否应该显示为不可用（灰色）
   */
  private isEdgeConnectedToUnreachableNode(edge: MapEdge): boolean {
    if (!this.mapData?.currentLocation) return false;

    const fromNode = this.mapData.nodes.find(n => n.id === edge.from);
    const toNode = this.mapData.nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return false;

    // 如果连接当前位置，保持正常颜色
    if (fromNode.id === this.mapData.currentLocation || toNode.id === this.mapData.currentLocation) {
      return false;
    }

    // 如果任一节点不可达，则显示为灰色
    return !this.isNodeReachable(fromNode) || !this.isNodeReachable(toNode);
  }

  /**
   * 计算从一个节点指向另一个节点的边缘交点
   */
  private getNodeEdgePoint(node: any, targetNode: any): { x: number; y: number } {
    const dx = targetNode.x - node.x;
    const dy = targetNode.y - node.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return { x: node.x, y: node.y };

    const unitX = dx / distance;
    const unitY = dy / distance;

    if (node.shape === 'r') {
      // 矩形节点边缘交点计算
      const w = (node.width || 40) / 2;
      const h = (node.height || 30) / 2;

      // 计算射线与矩形边缘的交点
      const tTop = -h / unitY;
      const tBottom = h / unitY;
      const tLeft = -w / unitX;
      const tRight = w / unitX;

      // 找到最小的正值t，即最近的交点
      const validTs = [tTop, tBottom, tLeft, tRight].filter(t => t > 0);
      const minT = Math.min(...validTs);

      return {
        x: node.x + unitX * minT,
        y: node.y + unitY * minT
      };
    } else {
      // 圆形节点边缘交点计算
      const radius = node.radius || 15;
      return {
        x: node.x + unitX * radius,
        y: node.y + unitY * radius
      };
    }
  }

  private drawNodes(): void {
    if (!this.mapData) return;

    this.mapData.nodes.forEach((node) => {
      const isCurrent = node.id === this.mapData!.currentLocation;
      const isExit = node.type === 'e';
      const isReachable = this.isNodeReachable(node);

      // 设置节点颜色和发光效果
      let strokeColor: string;
      let fillColor: string;
      let glowColor: string;

      if (isCurrent) {
        strokeColor = '#14b8a6';
        fillColor = '#14b8a640';
        glowColor = '#14b8a6';
      } else if (!isReachable) {
        strokeColor = '#6b7280';
        fillColor = '#6b728040';
        glowColor = '#6b7280';
      } else if (isExit) {
        strokeColor = '#22c55e';
        fillColor = '#22c55e40';
        glowColor = '#22c55e';
      } else {
        strokeColor = '#4a9eff';
        fillColor = '#4a9eff40';
        glowColor = '#4a9eff';
      }

      // 优化节点边框粗细
      const baseLineWidth = this.isSmallMobile ? 0.8 : this.isMobile ? 1.0 : 1.2;
      this.ctx.lineWidth = Math.max(0.4, baseLineWidth / this.viewState.scale);

      // 绘制发光效果
      const glowSize = (this.isSmallMobile ? 4 : this.isMobile ? 5 : 6) / this.viewState.scale;
      this.ctx.save();

      // 设置发光阴影
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = glowSize;
      this.ctx.strokeStyle = strokeColor;
      this.ctx.fillStyle = fillColor;

      this.ctx.beginPath();

      if (node.shape === 'r') {
        const w = node.width || 40;
        const h = node.height || 30;
        this.ctx.rect(node.x - w/2, node.y - h/2, w, h);
      } else {
        const r = node.radius || 15;
        this.ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      }

      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();

      // 绘制出口图标
      if (isExit) {
        this.drawExitIcon(node);
      }
    });
  }

  /**
   * 判断节点是否可达（基于移动模式和边的状态）
   */
  private isNodeReachable(targetNode: MapNode): boolean {
    if (!this.mapData?.currentLocation) return true;

    const currentNode = this.mapData.nodes.find(n => n.id === this.mapData!.currentLocation);
    if (!currentNode) return true;

    // 如果是自由移动模式，所有节点都可达
    if (this.mapData.free_movement === 'F') return true;

    // 如果是禁止移动模式，除了当前位置外都不可达
    if (this.mapData.free_movement === 'N') return targetNode.id === this.mapData.currentLocation;

    // 临近移动模式：只有直接相邻且路径未锁定的节点才可达
    const adjacentEdges = this.mapData.edges.filter(edge =>
      (edge.from === this.mapData!.currentLocation || edge.to === this.mapData!.currentLocation) &&
      edge.type === 'c'
    );

    return adjacentEdges.some(edge => {
      const connectedNodeId = edge.from === this.mapData!.currentLocation ? edge.to : edge.from;
      return connectedNodeId === targetNode.id;
    });
  }

  /**
   * 绘制出口图标
   */
  private drawExitIcon(node: MapNode): void {
    // 移动端优化：调整EXIT图标字体大小
    const baseFontSize = this.isMobile ? 8 : 12;
    const fontSize = baseFontSize / this.viewState.scale;
    const iconY = node.y + (node.shape === 'r' ? (node.height || 30) / 2 : (node.radius || 15)) + fontSize + 6 / this.viewState.scale;

    // 测量文字尺寸以适应背景
    this.ctx.font = `bold ${fontSize}px "Segoe UI", sans-serif`;
    const textMetrics = this.ctx.measureText('EXIT');
    const textWidth = textMetrics.width;
    const textHeight = fontSize;

    // 绘制圆角背景
    const padding = 2 / this.viewState.scale;
    const bgX = node.x - textWidth / 2 - padding;
    const bgY = iconY - textHeight / 2 - 1 / this.viewState.scale;
    const bgWidth = textWidth + padding * 2;
    const bgHeight = textHeight + 2 / this.viewState.scale;
    const cornerRadius = 2 / this.viewState.scale;

    this.ctx.fillStyle = '#22c55e';
    this.ctx.beginPath();
    this.ctx.roundRect(bgX, bgY, bgWidth, bgHeight, cornerRadius);
    this.ctx.fill();

    // 绘制EXIT文字
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('EXIT', node.x, iconY);
  }

  private drawLabels(): void {
    if (!this.mapData) return;

    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // 移动端优化：调整节点标签字体大小
    const baseFontSize = this.isMobile ? 12 : 14;
    const fontSize = baseFontSize / this.viewState.scale;
    this.ctx.font = `${fontSize}px "Segoe UI", sans-serif`;

    this.mapData.nodes.forEach(node => {
      const isCurrent = node.id === this.mapData!.currentLocation;

      // 设置标签颜色
      this.ctx.fillStyle = isCurrent ? '#14b8a6' : '#e8eaf0';

      if (node.label) {
        this.ctx.fillText(node.label, node.x, node.y);
      }

      // 为当前位置添加文字标示
      if (isCurrent) {
        this.ctx.fillStyle = '#14b8a6';
        this.ctx.font = `bold ${fontSize * 0.8}px "Segoe UI", sans-serif`;
        this.ctx.textBaseline = 'top';

        const labelY = node.y + (node.shape === 'r' ? (node.height || 30) / 2 : (node.radius || 15)) + 8 / this.viewState.scale;
        this.ctx.fillText('[当前位置]', node.x, labelY);

        // 重置字体
        this.ctx.font = `${fontSize}px "Segoe UI", sans-serif`;
        this.ctx.textBaseline = 'middle';
      }
    });

    // 绘制边类型信息
    this.drawEdgeTypeInfo();
  }

  /**
   * 在左下角绘制边类型信息
   */
  private drawEdgeTypeInfo(): void {
    if (!this.mapData) return;

    // 收集地图中存在的边类型
    const edgeTypes = new Set(this.mapData.edges.map(edge => edge.type));
    const typeInfos: Array<{type: string, color: string, text: string, pattern: string}> = [];

    if (edgeTypes.has('c')) typeInfos.push({type: 'c', color: '#4a9eff', text: '普通路径', pattern: '────'});
    if (edgeTypes.has('l')) typeInfos.push({type: 'l', color: '#ef4444', text: '锁定路径', pattern: '- - -'});
    if (edgeTypes.has('ld')) typeInfos.push({type: 'ld', color: '#fbbf24', text: '门锁', pattern: '– – –'});
    if (edgeTypes.has('lg')) typeInfos.push({type: 'lg', color: '#8b5cf6', text: '守卫', pattern: '‒ ‒ ‒'});
    if (edgeTypes.has('lb')) typeInfos.push({type: 'lb', color: '#ec4899', text: '障碍', pattern: '··· ···'});
    if (edgeTypes.has('lh')) typeInfos.push({type: 'lh', color: '#d1d5db', text: '隐藏', pattern: '. . . .'});

    if (typeInfos.length === 0) return;

    // 保存当前变换状态并重置为屏幕坐标
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 移动端优化：动态调整图例参数
    const padding = this.isSmallMobile ? 8 : this.isMobile ? 10 : 12;
    const lineHeight = this.isSmallMobile ? 18 : this.isMobile ? 17 : 14;
    const fontSize = this.isSmallMobile ? 16 : this.isMobile ? 14 : 10;
    const lineLength = this.isSmallMobile ? 30 : this.isMobile ? 28 : 20;
    const backgroundWidth = this.isSmallMobile ? 120 : this.isMobile ? 110 : 90;

    const startY = this.canvas.height - padding - typeInfos.length * lineHeight;

    // 绘制半透明背景
    this.ctx.fillStyle = 'rgba(22, 33, 62, 0.3)';
    this.ctx.fillRect(
      padding - 6,
      startY - 10,
      backgroundWidth,
      typeInfos.length * lineHeight + 16
    );

    this.ctx.font = `${fontSize}px "Segoe UI", sans-serif`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    typeInfos.forEach((info, index) => {
      const y = startY + index * lineHeight;

      // 优化图例线条绘制质量 - 移动端更细
      this.ctx.strokeStyle = info.color;
      this.ctx.lineWidth = this.isSmallMobile ? 1.2 : this.isMobile ? 1.4 : 1.5;

      // 设置圆润的线条样式
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      // 根据边类型设置线条样式（移动端适配）
      const dashScale = 1;
      switch (info.type) {
        case 'l':
          this.ctx.setLineDash([3 * dashScale, 3 * dashScale]);
          break;
        case 'ld':
          this.ctx.setLineDash([5 * dashScale, 2 * dashScale]);
          break;
        case 'lg':
          this.ctx.setLineDash([6 * dashScale, 1 * dashScale, 1 * dashScale, 1 * dashScale]);
          break;
        case 'lb':
          this.ctx.setLineDash([2 * dashScale, 2 * dashScale]);
          break;
        case 'lh':
          this.ctx.setLineDash([0.8 * dashScale, 2.5 * dashScale]);
          break;
        default:
          this.ctx.setLineDash([]);
      }

      // 为图例线条添加发光效果
      this.ctx.save();
      this.ctx.shadowColor = info.color;
      this.ctx.shadowBlur = 3;

      this.ctx.beginPath();
      this.ctx.moveTo(padding, y + lineHeight/2);
      this.ctx.lineTo(padding + lineLength, y + lineHeight/2);
      this.ctx.stroke();
      this.ctx.restore();
      this.ctx.setLineDash([]); // 重置

      // 绘制文字说明
      this.ctx.fillStyle = '#e8eaf0';
      this.ctx.fillText(info.text, padding + lineLength + 8, y + 2);
    });

    // 恢复变换状态
    this.ctx.restore();
  }

  /**
   * 获取当前视图状态（供外部访问）
   */
  public getViewState(): ViewState {
    return { ...this.viewState };
  }

  /**
   * 设置视图状态（供外部控制）
   */
  public setViewState(newState: Partial<ViewState>): void {
    Object.assign(this.viewState, newState);
    this.render();
  }

  /**
   * 重置视图到适合的初始状态
   */
  public resetToFit(): void {
    this.resetView();
    this.render();
  }

  /**
   * 获取地图边界（供交互控制器使用）
   */
  public getMapBounds() {
    if (!this.mapData || this.mapData.nodes.length === 0) return null;

    const xs = this.mapData.nodes.map(n => n.x);
    const ys = this.mapData.nodes.map(n => n.y);

    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    };
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    this.mapData = null;
  }
}
