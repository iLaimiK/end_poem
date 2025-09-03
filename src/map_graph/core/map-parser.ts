import { EdgeType, MapData, MapEdge, MapNode } from '../types';

/**
 * 地图数据解析器 - 简化版本
 */
export class MapParser {
  private static readonly MAP_REGEX = /<MapGraph>(.*?)<\/MapGraph>/s;
  private static readonly LOOSE_MAP_REGEX = /<\s*MapGraph\s*>([\s\S]*?)<\s*\/\s*MapGraph\s*>/i;

  /**
   * 从消息文本中提取地图数据
   */
  static extractMapFromText(text: string): string | null {
    const match = this.MAP_REGEX.exec(text) || this.LOOSE_MAP_REGEX.exec(text);
    return match ? match[1] : null;
  }

  /**
   * 解析地图数据
   */
  static parseMapData(text: string): MapData {
    const lines = text.split('\n');
    const mapData: MapData = {
      nodes: [],
      edges: [],
      metadata: {},
      currentLocation: null,
      free_movement: 'A' // Adjacent by default
    };

    const nodeIds = new Set<string>();

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) return;

      // 解析节点 n:id|type|label@characters|x|y|shape|dimensions
      const nodeMatch = /^n:([^|]+)\|([^|]+)\|([^|@]+)(?:@([^|]*))?(?:\|)(\d+)\|(\d+)\|([rc])\|(.*)$/i.exec(trimmedLine);

      if (nodeMatch) {
        const node = this.parseNode(nodeMatch);
        if (node && !nodeIds.has(node.id)) {
          nodeIds.add(node.id);
          mapData.nodes.push(node);

          // 检查当前位置标记
          if (node.characters.includes('current') || node.characters.includes('')) {
            mapData.currentLocation = node.id;
          }
        }
        return;
      }

      // 解析边 e:from|to|type
      const edgeMatch = /^e:([^|]+)\|([^|]+)(?:\|([^|]+))?$/i.exec(trimmedLine);
      if (edgeMatch) {
        const edge = this.parseEdge(edgeMatch);
        if (edge) mapData.edges.push(edge);
        return;
      }

      // 解析元数据 m:key=value
      const metadataMatch = /^m:([^=]+)=(.*)$/i.exec(trimmedLine);
      if (metadataMatch) {
        this.parseMetadata(metadataMatch, mapData);
      }
    });

    // 验证边的有效性
    const validNodeIds = new Set(mapData.nodes.map(n => n.id));
    mapData.edges = mapData.edges.filter(edge =>
      validNodeIds.has(edge.from) && validNodeIds.has(edge.to)
    );

    return mapData;
  }

  private static parseNode(match: RegExpMatchArray): MapNode | null {
    const [, id, type, labelRaw, charactersStr, xStr, yStr, shapeCode, dimensions] = match;

    const x = parseInt(xStr, 10);
    const y = parseInt(yStr, 10);

    if (isNaN(x) || isNaN(y)) return null;

    const node: MapNode = {
      id: id.trim(),
      type: type.trim(),
      label: labelRaw.trim(),
      x,
      y,
      shape: shapeCode.toLowerCase().trim() as 'r' | 'c',
      characters: charactersStr
        ? charactersStr.split(',').map(s => s.trim()).filter(Boolean)
        : []
    };

    // 设置节点尺寸
    if (node.shape === 'r') {
      const sizeMatch = /^(\d+)x(\d+)$/i.exec(dimensions);
      if (sizeMatch) {
        node.width = parseInt(sizeMatch[1], 10);
        node.height = parseInt(sizeMatch[2], 10);
      } else {
        node.width = 40;
        node.height = 30;
      }
    } else if (node.shape === 'c') {
      const radius = parseInt(dimensions, 10);
      node.radius = isNaN(radius) ? 15 : radius;
    }

    return node;
  }

  private static parseEdge(match: RegExpMatchArray): MapEdge | null {
    const [, from, to, typeCode] = match;
    return {
      from: from.trim(),
      to: to.trim(),
      type: (typeCode ? typeCode.trim() : 'c') as EdgeType
    };
  }

  private static parseMetadata(match: RegExpMatchArray, mapData: MapData): void {
    const [, key, value] = match;
    const trimmedKey = key.trim().toLowerCase();

    if (trimmedKey === 'fm') {
      const moveVal = value.trim().toUpperCase();
      if (['F', 'A', 'N'].includes(moveVal)) {
        mapData.free_movement = moveVal as 'F' | 'A' | 'N';
      }
    } else if (trimmedKey === 'desc') {
      mapData.metadata['description'] = value.trim();
    } else {
      mapData.metadata[trimmedKey] = value.trim();
    }
  }
}