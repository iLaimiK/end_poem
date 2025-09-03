export interface MapData {
  nodes: MapNode[];
  edges: MapEdge[];
  metadata: Record<string, string>;
  currentLocation: string | null;
  free_movement: MovementMode;
}

export interface MapNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  shape: 'r' | 'c'; // rectangle or circle
  characters: string[];
  width?: number;
  height?: number;
  radius?: number;
}

export interface MapEdge {
  from: string;
  to: string;
  type: EdgeType;
}

export type MovementMode = 'F' | 'A' | 'N'; // Free, Adjacent, None

export type EdgeType = 'c' | 'l' | 'ld' | 'lg' | 'lb' | 'lh';

export interface MapCanvasOptions {
  minScale?: number;
  maxScale?: number;
  zoomSensitivity?: number;
  defaultNodeRadius?: number;
  defaultNodeWidth?: number;
  defaultNodeHeight?: number;
}

export interface ViewState {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export interface InteractionState {
  isDragging: boolean;
  lastPointerX: number;
  lastPointerY: number;
  startPinchDistance?: number;
  lastScale: number;
}

export interface PointerEvent {
  x: number;
  y: number;
  id?: number;
  type: 'mouse' | 'touch';
}

export interface MapConfig {
  should_send_directly: boolean;
  init_delay: number;
}